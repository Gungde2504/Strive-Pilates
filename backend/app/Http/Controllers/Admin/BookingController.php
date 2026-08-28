<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Jobs\SendWhatsAppNotification;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    // Semua booking — GET /api/admin/bookings
    public function index(Request $request)
    {
        $bookings = Booking::with(['user', 'schedule.pilatesClass', 'schedule.instructor', 'payment'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->date,   fn($q) => $q->whereHas('schedule', fn($q2) => $q2->whereDate('date', $request->date)))
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data'    => $bookings->map(fn($b) => [
                'id'             => $b->id,
                'booking_code'   => $b->booking_code,
                'member_name'    => $b->user->name,
                'member_phone'   => $b->user->phone_wa,
                'class_name'     => $b->schedule->pilatesClass->name,
                'class_type'     => $b->schedule->pilatesClass->type,
                'date'           => $b->schedule->date->format('Y-m-d'),
                'start_time'     => $b->schedule->start_time,
                'instructor'     => $b->schedule->instructor->name,
                'status'         => $b->status,
                'payment_status' => $b->payment?->status,
                'amount'         => $b->payment?->final_amount,
                'created_at'     => $b->created_at->format('Y-m-d H:i'),
            ]),
            'total' => $bookings->total(),
            'page'  => $bookings->currentPage(),
        ]);
    }

    // Konfirmasi booking manual — PATCH /api/admin/bookings/{id}/confirm
    public function confirm($id)
    {
        $booking = Booking::with(['user', 'schedule.pilatesClass'])->findOrFail($id);

        if ($booking->status !== 'pending_payment') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya booking pending yang dapat dikonfirmasi.',
            ], 422);
        }

        $booking->update(['status' => 'confirmed']);

        // Kirim notifikasi WhatsApp ke member (async)
        $user = $booking->user;
        if ($user && $user->phone_wa) {
            $message = "Halo {$user->name}! ✅\n\n"
                . "Booking kelas Anda telah dikonfirmasi oleh admin:\n\n"
                . "📋 Kelas: {$booking->schedule->pilatesClass->name}\n"
                . "📅 Tanggal: " . $booking->schedule->date->format('d M Y') . "\n"
                . "🎫 Kode Booking: {$booking->booking_code}\n\n"
                . "Sampai jumpa di kelas! 🧘‍♀️\n\nStrive Pilates Bali";

            SendWhatsAppNotification::dispatch($user->id, $user->phone_wa, $message, 'booking_confirmed_admin');
        }

        return response()->json([
            'success' => true,
            'message' => 'Booking berhasil dikonfirmasi.',
        ]);
    }

    // Cancel booking oleh admin — PATCH /api/admin/bookings/{id}/cancel
    public function cancel(Request $request, $id)
    {
        $booking = Booking::with(['user', 'schedule.pilatesClass'])->findOrFail($id);

        if (!in_array($booking->status, ['pending_payment', 'confirmed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Booking tidak dapat dibatalkan.',
            ], 422);
        }

        $booking->update([
            'status'        => 'cancelled',
            'cancel_reason' => $request->reason ?? 'Dibatalkan oleh admin',
            'cancelled_at'  => now(),
        ]);

        // Kembalikan slot
        $booking->schedule->increment('available_slots');

        // Kirim notifikasi WhatsApp ke member (async)
        $user = $booking->user;
        if ($user && $user->phone_wa) {
            $reason = $request->reason ?? 'tanpa keterangan';
            $message = "Halo {$user->name},\n\n"
                . "Mohon maaf, booking kelas Anda dibatalkan oleh admin:\n\n"
                . "📋 Kelas: {$booking->schedule->pilatesClass->name}\n"
                . "📅 Tanggal: " . $booking->schedule->date->format('d M Y') . "\n"
                . "🎫 Kode Booking: {$booking->booking_code}\n"
                . "📝 Alasan: {$reason}\n\n"
                . "Silakan hubungi kami jika ada pertanyaan.\n\nStrive Pilates Bali";

            SendWhatsAppNotification::dispatch($user->id, $user->phone_wa, $message, 'booking_cancelled_admin');
        }

        return response()->json([
            'success' => true,
            'message' => 'Booking berhasil dibatalkan.',
        ]);
    }
}

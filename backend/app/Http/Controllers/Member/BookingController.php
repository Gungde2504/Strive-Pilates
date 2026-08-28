<?php
namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\MemberPackage;
use App\Models\Schedule;
use App\Models\Voucher;
use App\Models\User;
use App\Models\WaitingList;
use App\Jobs\SendWhatsAppNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BookingController extends Controller
{
    // Buat booking baru — POST /api/member/bookings
    public function store(Request $request)
    {
        $validated = $request->validate([
            'schedule_id'       => 'required|exists:schedules,id',
            'member_package_id' => 'nullable|exists:member_packages,id',
            'voucher_code'      => 'nullable|string',
        ]);

        $user = $request->user();

        // Cek voucher di luar lock (read-only check awal, divalidasi ulang di dalam transaction)
        $voucherCode = $validated['voucher_code'] ?? null;

        DB::beginTransaction();
        try {
            // Lock baris schedule untuk mencegah race condition pada available_slots
            $schedule = Schedule::where('id', $validated['schedule_id'])->lockForUpdate()->first();

            if (!$schedule) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Jadwal tidak ditemukan.'], 404);
            }

            if ($schedule->available_slots <= 0) {
                DB::rollBack();
                return response()->json([
                    'success'      => false,
                    'message'      => 'Maaf, slot kelas ini sudah penuh.',
                    'can_waitlist' => true,
                    'schedule_id'  => $schedule->id,
                ], 422);
            }

            $existing = Booking::where('user_id', $user->id)
                ->where('schedule_id', $schedule->id)
                ->whereIn('status', ['pending_payment', 'confirmed'])
                ->first();

            if ($existing) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Kamu sudah memiliki booking untuk kelas ini.'], 422);
            }

            $voucher = null;
            if ($voucherCode) {
                $voucher = Voucher::where('code', $voucherCode)
                    ->lockForUpdate()
                    ->where('is_active', true)
                    ->where(fn($q) => $q->whereNull('expired_at')->orWhere('expired_at', '>', now()))
                    ->first();

                if (!$voucher) {
                    DB::rollBack();
                    return response()->json(['success' => false, 'message' => 'Kode voucher tidak valid atau sudah kadaluarsa.'], 422);
                }

                if ($voucher->quota !== null && $voucher->used_count >= $voucher->quota) {
                    DB::rollBack();
                    return response()->json(['success' => false, 'message' => 'Kuota voucher sudah habis.'], 422);
                }
            }

            $usingPackage = !empty($validated['member_package_id']);
            $packageAlmostEmpty = false;
            $memberPackage = null;

            if ($usingPackage) {
                // Lock baris member_package untuk mencegah sessions_remaining jadi minus
                $memberPackage = MemberPackage::where('id', $validated['member_package_id'])
                    ->where('user_id', $user->id)
                    ->lockForUpdate()
                    ->first();

                if (!$memberPackage) {
                    DB::rollBack();
                    return response()->json(['success' => false, 'message' => 'Paket tidak ditemukan.'], 404);
                }

                if ($memberPackage->sessions_remaining <= 0) {
                    DB::rollBack();
                    return response()->json(['success' => false, 'message' => 'Sesi paket Anda sudah habis.'], 422);
                }
            }

            $booking = Booking::create([
                'user_id'            => $user->id,
                'schedule_id'        => $schedule->id,
                'member_package_id'  => $validated['member_package_id'] ?? null,
                'voucher_id'         => $voucher?->id,
                'booking_code'       => 'STRIVE-' . time() . '-' . $user->id,
                'status'             => $usingPackage ? 'confirmed' : 'pending_payment',
                'payment_expired_at' => $usingPackage ? null : Carbon::now()->addHour(),
            ]);

            if ($usingPackage) {
                $memberPackage->decrement('sessions_remaining');
                $memberPackage->refresh();

                if ($memberPackage->sessions_remaining <= 0) {
                    $memberPackage->update(['status' => 'depleted']);
                } elseif ($memberPackage->sessions_remaining === 2) {
                    $packageAlmostEmpty = true;
                }
            }

            if ($voucher) {
                $voucher->increment('used_count');
            }

            $schedule->decrement('available_slots');
            $schedule->refresh();
            if ($schedule->available_slots <= 0) {
                $schedule->update(['status' => 'full']);
            }

            DB::commit();

            if ($usingPackage && $user->phone_wa) {
                $message = "Halo {$user->name}! 👋\n\n"
                    . "Booking kelas Anda berhasil dikonfirmasi:\n\n"
                    . "📋 Kelas: {$schedule->pilatesClass->name}\n"
                    . "📅 Tanggal: " . $schedule->date->format('d M Y') . "\n"
                    . "⏰ Waktu: " . substr($schedule->start_time, 0, 5) . "\n"
                    . "🎫 Kode Booking: {$booking->booking_code}\n\n"
                    . "Sampai jumpa di kelas! 🧘‍♀️\n\nStrive Pilates Bali";

                SendWhatsAppNotification::dispatch($user->id, $user->phone_wa, $message, 'booking_created');

                $staffMessage = "📋 Booking Baru Dikonfirmasi\n\n"
                    . "Member: {$user->name}\n"
                    . "Kelas: {$schedule->pilatesClass->name}\n"
                    . "Tanggal: " . $schedule->date->format('d M Y') . "\n"
                    . "Waktu: " . substr($schedule->start_time, 0, 5) . "\n"
                    . "Kode Booking: {$booking->booking_code}\n"
                    . "Metode: Paket\n\n"
                    . "Strive Pilates Bali — Sistem Notifikasi";

                $staff = User::whereIn('role', ['owner', 'admin'])->where('is_active', true)->get();
                foreach ($staff as $staffUser) {
                    if ($staffUser->phone_wa) {
                        SendWhatsAppNotification::dispatch($staffUser->id, $staffUser->phone_wa, $staffMessage, 'booking_confirmed_staff');
                    }
                }

                if ($packageAlmostEmpty && $memberPackage) {
                    $packageMessage = "Halo {$user->name}! ⚠️\n\n"
                        . "Paket Anda hampir habis:\n\n"
                        . "📦 Paket: {$memberPackage->package->name}\n"
                        . "🔢 Sisa sesi: {$memberPackage->sessions_remaining} sesi\n"
                        . "📅 Berlaku hingga: " . $memberPackage->expired_at->format('d M Y') . "\n\n"
                        . "Yuk beli paket baru agar tidak terputus! 🧘‍♀️\n\nStrive Pilates Bali";

                    SendWhatsAppNotification::dispatch($user->id, $user->phone_wa, $packageMessage, 'package_almost_empty');
                }
            }

            return response()->json([
                'success' => true,
                'message' => $usingPackage ? 'Booking berhasil dikonfirmasi!' : 'Booking berhasil dibuat! Selesaikan pembayaran dalam 1 jam.',
                'data'    => [
                    'booking_id'         => $booking->id,
                    'booking_code'       => $booking->booking_code,
                    'status'             => $booking->status,
                    'member_package_id'  => $booking->member_package_id,
                    'payment_expired_at' => $booking->payment_expired_at,
                    'schedule'           => [
                        'class_name'  => $schedule->pilatesClass->name,
                        'date'        => $schedule->date->format('Y-m-d'),
                        'start_time'  => $schedule->start_time,
                        'instructor'  => $schedule->instructor->name,
                    ],
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Booking store error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan. Silakan coba lagi.'], 500);
        }
    }

    // Daftar booking member — GET /api/member/bookings
    public function index(Request $request)
    {
        $bookings = Booking::with(['schedule.pilatesClass', 'schedule.instructor', 'payment'])
            ->where('user_id', $request->user()->id)
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->orderByDesc('created_at')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data'    => $bookings->map(fn($b) => [
                'id'             => $b->id,
                'booking_code'   => $b->booking_code,
                'status'         => $b->status,
                'class_name'     => $b->schedule->pilatesClass->name,
                'class_type'     => $b->schedule->pilatesClass->type,
                'date'           => $b->schedule->date->format('Y-m-d'),
                'start_time'     => $b->schedule->start_time,
                'end_time'       => $b->schedule->end_time,
                'instructor'     => $b->schedule->instructor->name,
                'payment_status' => $b->payment?->status,
                'created_at'     => $b->created_at->format('Y-m-d H:i'),
            ]),
            'total' => $bookings->total(),
            'page'  => $bookings->currentPage(),
        ]);
    }

    // Detail booking — GET /api/member/bookings/{id}
    public function show(Request $request, $id)
    {
        $booking = Booking::with(['schedule.pilatesClass', 'schedule.instructor', 'payment'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => [
                'id'                 => $booking->id,
                'booking_code'       => $booking->booking_code,
                'status'             => $booking->status,
                'payment_expired_at' => $booking->payment_expired_at,
                'class_name'         => $booking->schedule->pilatesClass->name,
                'class_type'         => $booking->schedule->pilatesClass->type,
                'price'              => $booking->schedule->pilatesClass->price,
                'date'               => $booking->schedule->date->format('Y-m-d'),
                'start_time'         => $booking->schedule->start_time,
                'end_time'           => $booking->schedule->end_time,
                'instructor'         => $booking->schedule->instructor->name,
                'payment'            => $booking->payment ? [
                    'order_id' => $booking->payment->order_id,
                    'amount'   => $booking->payment->final_amount,
                    'method'   => $booking->payment->payment_method,
                    'status'   => $booking->payment->status,
                    'paid_at'  => $booking->payment->paid_at?->format('Y-m-d H:i'),
                ] : null,
            ],
        ]);
    }

    // Cancel booking — PATCH /api/member/bookings/{id}/cancel
    public function cancel(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $booking = Booking::where('user_id', $request->user()->id)->lockForUpdate()->findOrFail($id);

            if (!in_array($booking->status, ['pending_payment', 'confirmed'])) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Booking tidak dapat dibatalkan.'], 422);
            }

            if ($booking->status === 'confirmed') {
                $scheduleDate = Carbon::parse($booking->schedule->date->format('Y-m-d') . ' ' . $booking->schedule->start_time);
                if (abs($scheduleDate->diffInHours(now())) < 24) {
                    DB::rollBack();
                    return response()->json(['success' => false, 'message' => 'Booking hanya dapat dibatalkan minimal H-1 sebelum kelas.'], 422);
                }
            }

            $booking->update([
                'status'        => 'cancelled',
                'cancel_reason' => $request->reason ?? 'Dibatalkan oleh member',
                'cancelled_at'  => now(),
            ]);

            $schedule = Schedule::where('id', $booking->schedule_id)->lockForUpdate()->first();
            $schedule->increment('available_slots');
            $schedule->refresh();
            if ($schedule->status === 'full') {
                $schedule->update(['status' => 'available']);
            }

            if ($booking->member_package_id) {
                $memberPackage = MemberPackage::where('id', $booking->member_package_id)->lockForUpdate()->first();
                if ($memberPackage) {
                    $memberPackage->increment('sessions_remaining');
                    if ($memberPackage->status === 'depleted') {
                        $memberPackage->update(['status' => 'active']);
                    }
                }
            }

            DB::commit();

            $user = $request->user();
            if ($user->phone_wa) {
                $message = "Halo {$user->name},\n\n"
                    . "Booking kelas Anda telah dibatalkan:\n\n"
                    . "📋 Kelas: {$booking->schedule->pilatesClass->name}\n"
                    . "📅 Tanggal: " . $booking->schedule->date->format('d M Y') . "\n\n"
                    . "Jika ini bukan permintaan Anda, hubungi kami segera.\n\nStrive Pilates Bali";

                SendWhatsAppNotification::dispatch($user->id, $user->phone_wa, $message, 'booking_cancelled_member');
            }

            $this->promoteFromWaitingList($schedule);

            return response()->json(['success' => true, 'message' => 'Booking berhasil dibatalkan.']);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Booking cancel error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan saat membatalkan booking.'], 500);
        }
    }

    // Reschedule booking — PATCH /api/member/bookings/{id}/reschedule
    public function reschedule(Request $request, $id)
    {
        $validated = $request->validate([
            'new_schedule_id' => 'required|exists:schedules,id',
        ]);

        DB::beginTransaction();
        try {
            $booking = Booking::where('user_id', $request->user()->id)->lockForUpdate()->findOrFail($id);

            if ($booking->status !== 'confirmed') {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Hanya booking yang sudah dikonfirmasi yang dapat di-reschedule.'], 422);
            }

            $oldScheduleDate = Carbon::parse($booking->schedule->date->format('Y-m-d') . ' ' . $booking->schedule->start_time);
            if (abs($oldScheduleDate->diffInHours(now())) < 24) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Reschedule hanya dapat dilakukan minimal H-1 sebelum kelas.'], 422);
            }

            if ($validated['new_schedule_id'] === $booking->schedule_id) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Jadwal baru tidak boleh sama dengan jadwal sebelumnya.'], 422);
            }

            // Lock kedua schedule (lama & baru) untuk cegah race condition
            $oldSchedule = Schedule::where('id', $booking->schedule_id)->lockForUpdate()->first();
            $newSchedule = Schedule::where('id', $validated['new_schedule_id'])->lockForUpdate()->first();

            if (!$newSchedule) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Jadwal tujuan tidak ditemukan.'], 404);
            }

            if ($newSchedule->available_slots <= 0) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Maaf, slot kelas tujuan sudah penuh.'], 422);
            }

            $existing = Booking::where('user_id', $booking->user_id)
                ->where('schedule_id', $newSchedule->id)
                ->whereIn('status', ['pending_payment', 'confirmed'])
                ->first();

            if ($existing) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Kamu sudah memiliki booking untuk jadwal tujuan tersebut.'], 422);
            }

            $oldSchedule->increment('available_slots');
            $oldSchedule->refresh();
            if ($oldSchedule->status === 'full') {
                $oldSchedule->update(['status' => 'available']);
            }

            $newSchedule->decrement('available_slots');
            $newSchedule->refresh();
            if ($newSchedule->available_slots <= 0) {
                $newSchedule->update(['status' => 'full']);
            }

            $booking->update(['schedule_id' => $newSchedule->id]);
            $booking->refresh();

            DB::commit();

            $user = $request->user();
            if ($user->phone_wa) {
                $message = "Halo {$user->name}! 🔄\n\n"
                    . "Booking Anda berhasil di-reschedule:\n\n"
                    . "📋 Kelas: {$newSchedule->pilatesClass->name}\n"
                    . "📅 Tanggal baru: " . $newSchedule->date->format('d M Y') . "\n"
                    . "⏰ Waktu baru: " . substr($newSchedule->start_time, 0, 5) . "\n"
                    . "🎫 Kode Booking: {$booking->booking_code}\n\n"
                    . "Sampai jumpa di kelas! 🧘‍♀️\n\nStrive Pilates Bali";

                SendWhatsAppNotification::dispatch($user->id, $user->phone_wa, $message, 'booking_rescheduled');
            }

            $this->promoteFromWaitingList($oldSchedule);

            return response()->json([
                'success' => true,
                'message' => 'Booking berhasil di-reschedule.',
                'data'    => [
                    'booking_code' => $booking->booking_code,
                    'new_schedule' => [
                        'class_name' => $newSchedule->pilatesClass->name,
                        'date'       => $newSchedule->date->format('Y-m-d'),
                        'start_time' => $newSchedule->start_time,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Reschedule error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan saat reschedule.'], 500);
        }
    }

    // Gabung waiting list — POST /api/member/bookings/waitlist
    public function joinWaitlist(Request $request)
    {
        $validated = $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
        ]);

        $user     = $request->user();
        $schedule = Schedule::findOrFail($validated['schedule_id']);

        $existing = WaitingList::where('user_id', $user->id)
            ->where('schedule_id', $schedule->id)
            ->where('status', 'waiting')
            ->first();

        if ($existing) {
            return response()->json(['success' => false, 'message' => 'Kamu sudah berada di waiting list untuk kelas ini.'], 422);
        }

        $existingBooking = Booking::where('user_id', $user->id)
            ->where('schedule_id', $schedule->id)
            ->whereIn('status', ['pending_payment', 'confirmed'])
            ->first();

        if ($existingBooking) {
            return response()->json(['success' => false, 'message' => 'Kamu sudah memiliki booking untuk kelas ini.'], 422);
        }

        DB::beginTransaction();
        try {
            $lastPosition = WaitingList::where('schedule_id', $schedule->id)
                ->where('status', 'waiting')
                ->lockForUpdate()
                ->max('position') ?? 0;

            $waitingList = WaitingList::create([
                'user_id'     => $user->id,
                'schedule_id' => $schedule->id,
                'position'    => $lastPosition + 1,
                'status'      => 'waiting',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Kamu berhasil masuk waiting list di posisi ke-' . $waitingList->position . '.',
                'data'    => ['position' => $waitingList->position],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan. Silakan coba lagi.'], 500);
        }
    }

    // Daftar waiting list member — GET /api/member/bookings/waitlist
    public function myWaitlist(Request $request)
    {
        $waitlist = WaitingList::with(['schedule.pilatesClass', 'schedule.instructor'])
            ->where('user_id', $request->user()->id)
            ->where('status', 'waiting')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $waitlist->map(fn($w) => [
                'id'          => $w->id,
                'position'    => $w->position,
                'class_name'  => $w->schedule->pilatesClass->name,
                'date'        => $w->schedule->date->format('Y-m-d'),
                'start_time'  => $w->schedule->start_time,
                'instructor'  => $w->schedule->instructor->name,
            ]),
        ]);
    }

    // Batal waiting list — DELETE /api/member/bookings/waitlist/{id}
    public function leaveWaitlist(Request $request, $id)
    {
        $waitingList = WaitingList::where('user_id', $request->user()->id)
            ->where('status', 'waiting')
            ->findOrFail($id);

        $waitingList->update(['status' => 'cancelled']);

        return response()->json(['success' => true, 'message' => 'Berhasil keluar dari waiting list.']);
    }

    /**
     * Cek dan promosikan member pertama dari waiting list ke booking confirmed,
     * jika slot tersedia di schedule terkait. Dipanggil setelah commit booking cancel/reschedule.
     * Method ini membuka transaction barunya sendiri agar lock terpisah dari transaction pemanggil.
     */
    private function promoteFromWaitingList(Schedule $schedule): void
    {
        DB::beginTransaction();
        try {
            $lockedSchedule = Schedule::where('id', $schedule->id)->lockForUpdate()->first();
            if (!$lockedSchedule || $lockedSchedule->available_slots <= 0) {
                DB::rollBack();
                return;
            }

            $next = WaitingList::with(['user'])
                ->where('schedule_id', $lockedSchedule->id)
                ->where('status', 'waiting')
                ->lockForUpdate()
                ->orderBy('position')
                ->first();

            if (!$next) {
                DB::rollBack();
                return;
            }

            $booking = Booking::create([
                'user_id'      => $next->user_id,
                'schedule_id'  => $lockedSchedule->id,
                'booking_code' => 'STRIVE-' . time() . '-' . $next->user_id,
                'status'       => 'pending_payment',
                'payment_expired_at' => Carbon::now()->addHour(),
            ]);

            $lockedSchedule->decrement('available_slots');
            $lockedSchedule->refresh();
            if ($lockedSchedule->available_slots <= 0) {
                $lockedSchedule->update(['status' => 'full']);
            }

            $next->update(['status' => 'promoted', 'promoted_at' => now()]);

            DB::commit();

            $user = $next->user;
            if ($user && $user->phone_wa) {
                $message = "Halo {$user->name}! 🎉\n\n"
                    . "Kabar baik! Slot kelas yang Anda tunggu sekarang tersedia:\n\n"
                    . "📋 Kelas: {$lockedSchedule->pilatesClass->name}\n"
                    . "📅 Tanggal: " . $lockedSchedule->date->format('d M Y') . "\n"
                    . "⏰ Waktu: " . substr($lockedSchedule->start_time, 0, 5) . "\n"
                    . "🎫 Kode Booking: {$booking->booking_code}\n\n"
                    . "Segera selesaikan pembayaran dalam 1 jam untuk konfirmasi booking Anda! 🧘‍♀️\n\nStrive Pilates Bali";

                SendWhatsAppNotification::dispatch($user->id, $user->phone_wa, $message, 'waiting_list_promoted');
            }

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Gagal promosikan dari waiting list: ' . $e->getMessage());
        }
    }
}

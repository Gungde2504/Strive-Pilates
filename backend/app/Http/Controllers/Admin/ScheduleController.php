<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\PilatesClass;
use App\Models\User;
use App\Jobs\SendWhatsAppNotification;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    // Daftar jadwal — GET /api/admin/schedules
    public function index(Request $request)
    {
        $schedules = Schedule::with(['pilatesClass', 'instructor'])
            ->when($request->date, fn($q) => $q->whereDate('date', $request->date))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->type, fn($q) => $q->whereHas('pilatesClass', fn($q2) => $q2->where('type', $request->type)))
            ->orderBy('date')
            ->orderBy('start_time')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $schedules->map(fn($s) => [
                'id'              => $s->id,
                'class_name'      => $s->pilatesClass->name,
                'class_type'      => $s->pilatesClass->type,
                'instructor_name' => $s->instructor->name,
                'date'            => $s->date->format('Y-m-d'),
                'start_time'      => $s->start_time,
                'end_time'        => $s->end_time,
                'capacity'        => $s->capacity,
                'available_slots' => $s->available_slots,
                'status'          => $s->status,
            ]),
            'total' => $schedules->total(),
        ]);
    }

    // Tambah jadwal — POST /api/admin/schedules
    public function store(Request $request)
    {
        $validated = $request->validate([
            'class_id'      => 'required|exists:classes,id',
            'instructor_id' => 'required|exists:users,id',
            'date'          => 'required|date|after_or_equal:today',
            'start_time'    => 'required|date_format:H:i',
            'capacity'      => [
                'required',
                'integer',
                'min:1',
                function ($attribute, $value, $fail) use ($request) {
                    $class = \App\Models\PilatesClass::find($request->class_id);
                    if ($class && $value > $class->capacity) {
                        $fail("Kapasitas jadwal tidak boleh melebihi kapasitas kelas ({$class->capacity} orang).");
                    }
                },
            ],
        ]);

        $endTime = Carbon::createFromFormat('H:i', $validated['start_time'])
            ->addMinutes(50)->format('H:i');

        $schedule = Schedule::create([
            ...$validated,
            'end_time'        => $endTime,
            'available_slots' => $validated['capacity'],
            'status'          => 'available',
        ]);

        // Notifikasi WhatsApp ke instruktur — jadwal baru di-assign (async)
        $instructor = User::find($validated['instructor_id']);
        $pilatesClass = PilatesClass::find($validated['class_id']);
        if ($instructor && $instructor->phone_wa) {
            $message = "Halo {$instructor->name}! 📅\n\n"
                . "Anda mendapat jadwal mengajar baru:\n\n"
                . "📋 Kelas: {$pilatesClass->name}\n"
                . "📅 Tanggal: " . Carbon::parse($validated['date'])->format('d M Y') . "\n"
                . "⏰ Waktu: {$validated['start_time']} - {$endTime}\n"
                . "👥 Kapasitas: {$validated['capacity']} orang\n\n"
                . "Strive Pilates Bali";

            SendWhatsAppNotification::dispatch($instructor->id, $instructor->phone_wa, $message, 'instructor_schedule_assigned');
        }

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil ditambahkan.',
            'data'    => ['id' => $schedule->id],
        ], 201);
    }

    // Update jadwal — PUT /api/admin/schedules/{id}
    public function update(Request $request, $id)
    {
        $schedule  = Schedule::with(['pilatesClass', 'instructor'])->findOrFail($id);
        $validated = $request->validate([
            'instructor_id' => 'sometimes|exists:users,id',
            'date'          => 'sometimes|date',
            'start_time'    => 'sometimes|date_format:H:i',
            'capacity'      => 'sometimes|integer|min:1',
            'note'          => 'nullable|string',
        ]);

        if (isset($validated['start_time'])) {
            $validated['end_time'] = Carbon::createFromFormat('H:i', $validated['start_time'])
                ->addMinutes(50)->format('H:i');
        }

        $oldInstructorId = $schedule->instructor_id;

        $schedule->update($validated);
        $schedule->refresh();

        // Notifikasi WhatsApp ke instruktur — jadwal diperbarui (async)
        // Kirim ke instruktur yang sekarang ditugaskan (baik tetap sama atau baru ditugaskan)
        $instructor = $schedule->instructor;
        if ($instructor && $instructor->phone_wa) {
            $message = "Halo {$instructor->name}! 🔄\n\n"
                . "Jadwal mengajar Anda telah diperbarui:\n\n"
                . "📋 Kelas: {$schedule->pilatesClass->name}\n"
                . "📅 Tanggal: " . $schedule->date->format('d M Y') . "\n"
                . "⏰ Waktu: " . substr($schedule->start_time, 0, 5) . " - " . substr($schedule->end_time, 0, 5) . "\n\n"
                . "Mohon cek detail terbaru di portal instruktur.\n\nStrive Pilates Bali";

            SendWhatsAppNotification::dispatch($instructor->id, $instructor->phone_wa, $message, 'instructor_schedule_updated');
        }

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil diperbarui.',
        ]);
    }

    // Cancel jadwal — PATCH /api/admin/schedules/{id}/cancel
    public function cancel(Request $request, $id)
    {
        $schedule = Schedule::with(['pilatesClass', 'instructor'])->findOrFail($id);

        if ($schedule->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal sudah dibatalkan.',
            ], 422);
        }

        $reason = $request->reason ?? 'Dibatalkan oleh admin';

        $schedule->update([
            'status' => 'cancelled',
            'note'   => $reason,
        ]);

        // Ambil booking yang terdampak SEBELUM di-update, untuk notifikasi
        $affectedBookings = $schedule->bookings()
            ->with('user')
            ->whereIn('status', ['pending_payment', 'confirmed'])
            ->get();

        // Cancel semua booking yang terkait
        $schedule->bookings()
            ->whereIn('status', ['pending_payment', 'confirmed'])
            ->update([
                'status'        => 'cancelled',
                'cancel_reason' => 'Jadwal dibatalkan oleh admin',
                'cancelled_at'  => now(),
            ]);

        // Notifikasi WhatsApp ke setiap member yang terdampak (async)
        foreach ($affectedBookings as $booking) {
            $user = $booking->user;
            if ($user && $user->phone_wa) {
                $message = "Halo {$user->name},\n\n"
                    . "Mohon maaf, jadwal kelas berikut dibatalkan oleh studio:\n\n"
                    . "📋 Kelas: {$schedule->pilatesClass->name}\n"
                    . "📅 Tanggal: " . $schedule->date->format('d M Y') . "\n"
                    . "⏰ Waktu: " . substr($schedule->start_time, 0, 5) . "\n"
                    . "📝 Alasan: {$reason}\n\n"
                    . "Sesi/saldo Anda akan dikembalikan. Mohon maaf atas ketidaknyamanannya.\n\nStrive Pilates Bali";

                SendWhatsAppNotification::dispatch($user->id, $user->phone_wa, $message, 'schedule_cancelled_member');
            }
        }

        // Notifikasi WhatsApp ke instruktur — jadwal dibatalkan (async)
        $instructor = $schedule->instructor;
        if ($instructor && $instructor->phone_wa) {
            $message = "Halo {$instructor->name},\n\n"
                . "Jadwal mengajar berikut telah dibatalkan:\n\n"
                . "📋 Kelas: {$schedule->pilatesClass->name}\n"
                . "📅 Tanggal: " . $schedule->date->format('d M Y') . "\n"
                . "⏰ Waktu: " . substr($schedule->start_time, 0, 5) . "\n"
                . "📝 Alasan: {$reason}\n\n"
                . "Strive Pilates Bali";

            SendWhatsAppNotification::dispatch($instructor->id, $instructor->phone_wa, $message, 'instructor_schedule_cancelled');
        }

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil dibatalkan.',
        ]);
    }
}

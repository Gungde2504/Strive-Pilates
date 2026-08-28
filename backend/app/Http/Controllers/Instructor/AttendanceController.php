<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Booking;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    // Ambil data peserta untuk input kehadiran — GET /api/instructor/attendance/{scheduleId}
    public function show(Request $request, $scheduleId)
    {
        $schedule = Schedule::with(['pilatesClass', 'instructor'])
            ->where('instructor_id', $request->user()->id)
            ->findOrFail($scheduleId);

        $bookings = Booking::with(['user', 'attendance'])
            ->where('schedule_id', $schedule->id)
            ->whereIn('status', ['confirmed', 'attended', 'completed', 'no_show'])
            ->get()
            ->map(fn($b) => [
                'id'           => $b->id,
                'member_name'  => $b->user->name,
                'booking_code' => $b->booking_code,
                'status'       => $b->status,
            ]);

        return response()->json([
            'success' => true,
            'data'    => [
                'schedule' => [
                    'class_name' => $schedule->pilatesClass->name,
                    'date'       => $schedule->date->format('Y-m-d'),
                    'start_time' => $schedule->start_time,
                    'end_time'   => $schedule->end_time,
                    'status'     => $schedule->status,
                ],
                'bookings' => $bookings,
            ],
        ]);
    }

    // Simpan kehadiran — POST /api/instructor/attendance/{scheduleId}
    public function store(Request $request, $scheduleId)
    {
        $request->validate([
            'attendances'              => 'required|array',
            'attendances.*.booking_id' => 'required|exists:bookings,id',
            'attendances.*.attended'   => 'required|boolean',
        ]);

        $schedule = Schedule::where('instructor_id', $request->user()->id)
            ->findOrFail($scheduleId);

        DB::beginTransaction();
        try {
            foreach ($request->attendances as $item) {
                $booking = Booking::where('schedule_id', $schedule->id)
                    ->findOrFail($item['booking_id']);

                $status = $item['attended'] ? 'present' : 'absent';

                Attendance::updateOrCreate(
                    ['booking_id' => $booking->id],
                    [
                        'instructor_id' => $request->user()->id,
                        'status'        => $status,
                        'checked_at'    => now(),
                    ]
                );

                $booking->update(['status' => $item['attended'] ? 'attended' : 'no_show']);
            }

            $schedule->update(['status' => 'completed']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Kehadiran berhasil disimpan.',
                'total'   => count($request->attendances),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Attendance store error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}

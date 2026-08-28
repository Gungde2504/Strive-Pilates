<?php
namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Booking;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    // Jadwal mingguan instruktur — GET /api/instructor/schedule
    public function index(Request $request)
    {
        $user  = $request->user();
        $date  = $request->get('date', Carbon::today()->format('Y-m-d'));
        $start = Carbon::parse($date)->startOfWeek(Carbon::MONDAY);
        $end   = $start->copy()->endOfWeek(Carbon::SUNDAY);

        $schedules = Schedule::with(['pilatesClass'])
            ->where('instructor_id', $user->id)
            ->whereBetween('date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->where('status', '!=', 'cancelled')
            ->orderBy('date')
            ->orderBy('start_time')
            ->get()
            ->map(function ($s) {
                // Hitung booked_count dari booking aktual supaya akurat
                $bookedCount = Booking::where('schedule_id', $s->id)
                    ->whereIn('status', ['confirmed', 'attended', 'pending', 'pending_payment'])
                    ->count();

                $dateStr = $s->date instanceof \Carbon\Carbon
                    ? $s->date->format('Y-m-d')
                    : (string) $s->date;

                return [
                    'id'          => $s->id,
                    'class_name'  => $s->pilatesClass->name,
                    'class_type'  => $s->pilatesClass->type,
                    'date'        => $dateStr,
                    'start_time'  => $s->start_time,
                    'end_time'    => $s->end_time,
                    'booked_count'=> $bookedCount,
                    'booked'      => $bookedCount,
                    'capacity'    => $s->capacity,
                    'status'      => $s->status,
                ];
            });

        return response()->json([
            'success'    => true,
            'week_start' => $start->format('Y-m-d'),
            'week_end'   => $end->format('Y-m-d'),
            'data'       => $schedules,
        ]);
    }

    // Detail sesi + daftar peserta — GET /api/instructor/schedule/{id}
    public function show(Request $request, $id)
    {
        $schedule = Schedule::with(['pilatesClass'])
            ->where('instructor_id', $request->user()->id)
            ->findOrFail($id);

        $bookedCount = Booking::where('schedule_id', $schedule->id)
            ->whereIn('status', ['confirmed', 'attended', 'pending', 'pending_payment'])
            ->count();

        $dateStr = $schedule->date instanceof \Carbon\Carbon
            ? $schedule->date->format('Y-m-d')
            : (string) $schedule->date;

        $peserta = Booking::with(['user', 'attendance'])
            ->where('schedule_id', $schedule->id)
            ->whereIn('status', ['confirmed', 'completed', 'attended'])
            ->get()
            ->map(fn($b) => [
                'booking_id'        => $b->id,
                'booking_code'      => $b->booking_code,
                'member_name'       => $b->user->name,
                'member_phone'      => $b->user->phone_wa,
                'attendance_status' => $b->attendance?->status ?? 'belum_input',
                'checked_at'        => $b->attendance?->checked_at?->format('H:i'),
            ]);

        return response()->json([
            'success' => true,
            'data'    => [
                'id'          => $schedule->id,
                'class_name'  => $schedule->pilatesClass->name,
                'class_type'  => $schedule->pilatesClass->type,
                'date'        => $dateStr,
                'start_time'  => $schedule->start_time,
                'end_time'    => $schedule->end_time,
                'capacity'    => $schedule->capacity,
                'booked_count'=> $bookedCount,
                'booked'      => $bookedCount,
                'status'      => $schedule->status,
                'peserta'     => $peserta,
            ],
        ]);
    }
}
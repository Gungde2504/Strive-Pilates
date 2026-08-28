<?php
namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user      = $request->user();
        $today     = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $now       = Carbon::now();

        // ── Jadwal hari ini ───────────────────────────────────────────────
        $todaySchedules = Schedule::with(['pilatesClass', 'bookings'])
            ->where('instructor_id', $user->id)
            ->whereDate('date', $today)
            ->where('status', '!=', 'cancelled')
            ->orderBy('start_time')
            ->get()
            ->map(fn($s) => [
                'id'          => $s->id,
                'class_name'  => $s->pilatesClass->name,
                'class_type'  => $s->pilatesClass->type,
                'start_time'  => $s->start_time,
                'end_time'    => $s->end_time,
                'capacity'    => $s->capacity,
                'booked_count'=> $s->capacity - $s->available_slots,
                'booked'      => $s->capacity - $s->available_slots,
                'available_slots' => $s->available_slots,
                'status'      => $s->status,
                'date'        => $s->date,
            ]);

        // ── Jadwal mendatang (7 hari ke depan, exclude hari ini) ──────────
        $upcomingSchedules = Schedule::with(['pilatesClass'])
            ->where('instructor_id', $user->id)
            ->whereBetween('date', [$today->copy()->addDay(), $today->copy()->addDays(7)])
            ->where('status', '!=', 'cancelled')
            ->orderBy('date')
            ->orderBy('start_time')
            ->get()
            ->map(fn($s) => [
                'id'          => $s->id,
                'class_name'  => $s->pilatesClass->name,
                'start_time'  => $s->start_time,
                'end_time'    => $s->end_time,
                'capacity'    => $s->capacity,
                'booked_count'=> $s->capacity - $s->available_slots,
                'date'        => $s->date,
                'status'      => $s->status,
            ]);

        // ── KPI hari ini ──────────────────────────────────────────────────
        $todaySessions = $todaySchedules->count();
        $todayStudents = $todaySchedules->sum('booked_count');

        // ── KPI bulan ini ─────────────────────────────────────────────────
        $monthSessions = Schedule::where('instructor_id', $user->id)
            ->whereBetween('date', [$thisMonth, $now])
            ->where('status', '!=', 'cancelled')
            ->count();

        $monthStudents = Booking::whereHas('schedule', fn($q) =>
                $q->where('instructor_id', $user->id)
                  ->whereBetween('date', [$thisMonth, $now])
            )
            ->whereIn('status', ['confirmed', 'attended'])
            ->count();

        $totalAttendance = \App\Models\Attendance::whereHas('booking.schedule', fn($q) =>
                $q->where('instructor_id', $user->id)
                  ->whereBetween('date', [$thisMonth, $now])
            )
            ->where('status', 'present')
            ->count()
            ?? 0;

        $attendanceRate = $monthStudents > 0
            ? round(($totalAttendance / $monthStudents) * 100) : 0;

        return response()->json([
            'success' => true,
            'data'    => [
                'instructor'         => ['id' => $user->id, 'name' => $user->name],
                'today_schedules'    => $todaySchedules,
                'upcoming_schedules' => $upcomingSchedules,
                'kpi'                => [
                    // Field yang dipakai InstructorDashboardPage
                    'today_sessions'  => $todaySessions,
                    'today_students'  => $todayStudents,
                    'month_sessions'  => $monthSessions,
                    'month_students'  => $monthStudents,
                    // Field tambahan
                    'total_sessions'  => $monthSessions,
                    'total_peserta'   => $monthStudents,
                    'attendance_rate' => $attendanceRate,
                ],
            ],
        ]);
    }
}
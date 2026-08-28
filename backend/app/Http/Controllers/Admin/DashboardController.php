<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();

        // ── KPI ──────────────────────────────────────────────────────────
        // Booking berdasarkan tanggal jadwal (bukan created_at)
        $bookingsToday  = Booking::whereHas('schedule', fn($q) => $q->whereDate('date', $today))->count();
        $confirmedToday = Booking::whereHas('schedule', fn($q) => $q->whereDate('date', $today))->where('status', 'confirmed')->count();
        $pendingToday   = Booking::whereHas('schedule', fn($q) => $q->whereDate('date', $today))->whereIn('status', ['pending', 'pending_payment'])->count();
        $attendedToday  = Booking::whereHas('schedule', fn($q) => $q->whereDate('date', $today))->where('status', 'attended')->count();
        $cancelledToday = Booking::whereHas('schedule', fn($q) => $q->whereDate('date', $today))->where('status', 'cancelled')->count();
        $revenueToday   = Payment::whereDate('paid_at', $today)->where('status', 'settlement')->sum('final_amount');
        $totalMembers   = User::where('role', 'member')->where('is_active', true)->count();
        $sessionsToday  = Schedule::whereDate('date', $today)->where('status', '!=', 'cancelled')->count();

        // ── Chart 7 hari terakhir (berdasarkan tanggal jadwal) ────────────
        $last7Days = collect(range(6, 0))->map(function ($i) {
            $date = Carbon::today()->subDays($i);
            return [
                'date'  => $date->format('Y-m-d'),
                'label' => $date->isoFormat('dd'), // Mon, Tue, dst
                'count' => Booking::whereHas('schedule', fn($q) => $q->whereDate('date', $date))
                    ->whereNotIn('status', ['cancelled'])
                    ->count(),
            ];
        });

        // ── Booking hari ini (berdasarkan tanggal jadwal) ─────────────────
        $todayBookings = Booking::with(['schedule.pilatesClass', 'schedule.instructor', 'user'])
            ->whereHas('schedule', fn($q) => $q->whereDate('date', $today))
            ->orderByDesc('created_at')
            ->take(10)
            ->get()
            ->map(fn($b) => [
                'id'           => $b->id,
                'booking_code' => $b->booking_code,
                'member_name'  => $b->user->name ?? '-',
                'class_name'   => $b->schedule->pilatesClass->name ?? '-',
                'start_time'   => $b->schedule->start_time,
                'instructor'   => $b->schedule->instructor->name ?? '-',
                'status'       => $b->status,
            ]);

        // ── Jadwal hari ini ───────────────────────────────────────────────
        $todaySchedules = Schedule::with(['pilatesClass'])
            ->whereDate('date', $today)
            ->where('status', '!=', 'cancelled')
            ->orderBy('start_time')
            ->get()
            ->map(fn($s) => [
                'id'          => $s->id,
                'class_name'  => $s->pilatesClass->name ?? '-',
                'start_time'  => $s->start_time,
                'end_time'    => $s->end_time,
                'capacity'    => $s->capacity,
                'booked_count'=> $s->booked_count ?? 0,
                'status'      => $s->status,
            ]);

        return response()->json([
            'success' => true,
            'data'    => [
                'kpi' => [
                    'bookings_today'  => $bookingsToday,
                    'confirmed_today' => $confirmedToday,
                    'pending_today'   => $pendingToday,
                    'attended_today'  => $attendedToday,
                    'cancelled_today' => $cancelledToday,
                    'revenue_today'   => (float) $revenueToday,
                    'total_members'   => $totalMembers,
                    'sessions_today'  => $sessionsToday,
                ],
                'chart_7days'     => $last7Days,
                'today_bookings'  => $todayBookings,
                'today_schedules' => $todaySchedules,
            ],
        ]);
    }
}

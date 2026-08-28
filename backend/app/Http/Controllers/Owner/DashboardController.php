<?php
namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
use App\Models\Schedule;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $now          = Carbon::now();
        $today        = Carbon::today();
        $thisMonth    = Carbon::now()->startOfMonth();
        $lastMonth    = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

        // ── KPI ──────────────────────────────────────────────────────────
        $revenueThisMonth = Payment::where('status', 'settlement')
            ->whereBetween('paid_at', [$thisMonth, $now])
            ->sum('final_amount');

        $revenueLastMonth = Payment::where('status', 'settlement')
            ->whereBetween('paid_at', [$lastMonth, $lastMonthEnd])
            ->sum('final_amount');

        $revenueDelta = $revenueLastMonth > 0
            ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1)
            : 0;

        $revenueToday = Payment::where('status', 'settlement')
            ->whereDate('paid_at', $today)
            ->sum('final_amount');

        $bookingsThisMonth = Booking::whereBetween('created_at', [$thisMonth, $now])->count();
        $bookingsLastMonth = Booking::whereBetween('created_at', [$lastMonth, $lastMonthEnd])->count();
        $bookingsDelta     = $bookingsLastMonth > 0
            ? round((($bookingsThisMonth - $bookingsLastMonth) / $bookingsLastMonth) * 100, 1)
            : 0;

        $totalMembers     = User::where('role', 'member')->where('is_active', true)->count();
        $newMembers       = User::where('role', 'member')->whereBetween('created_at', [$thisMonth, $now])->count();
        $totalInstructors = User::where('role', 'instructor')->where('is_active', true)->count();

        // ── Chart pendapatan 12 bulan — label + revenue ───────────────────
        $chart = collect(range(11, 0))->map(function ($i) {
            $month   = Carbon::now()->subMonths($i);
            $revenue = Payment::where('status', 'settlement')
                ->whereYear('paid_at', $month->year)
                ->whereMonth('paid_at', $month->month)
                ->sum('final_amount');
            return [
                'label'   => $month->isoFormat('MMM'),
                'month'   => $month->format('M Y'),
                'revenue' => (float) $revenue,
                'count'   => (int) Payment::where('status', 'settlement')
                    ->whereYear('paid_at', $month->year)
                    ->whereMonth('paid_at', $month->month)
                    ->count(),
            ];
        });

        // ── Recent transactions (10 terbaru) ─────────────────────────────
        $recentTransactions = Payment::with(['booking.user', 'booking.schedule.pilatesClass'])
            ->where('status', 'settlement')
            ->orderByDesc('paid_at')
            ->limit(10)
            ->get()
            ->map(fn($p) => [
                'id'          => $p->id,
                'member_name' => $p->booking?->user?->name ?? '-',
                'class_name'  => $p->booking?->schedule?->pilatesClass?->name ?? '-',
                'amount'      => (float) $p->final_amount,
                'status'      => 'paid',
                'created_at'  => $p->paid_at?->toISOString(),
            ]);

        // ── Top classes berdasarkan booking bulan ini ─────────────────────
        $topClasses = Booking::with('schedule.pilatesClass')
            ->whereBetween('created_at', [$thisMonth, $now])
            ->whereNotIn('status', ['cancelled'])
            ->get()
            ->groupBy(fn($b) => $b->schedule?->pilatesClass?->name ?? 'Lainnya')
            ->map(fn($group, $name) => [
                'class_name'     => $name,
                'total_bookings' => $group->count(),
            ])
            ->sortByDesc('total_bookings')
            ->values()
            ->take(5);

        // ── Pie chart tipe kelas ──────────────────────────────────────────
        $classPie = Booking::where('status', 'confirmed')
            ->whereBetween('created_at', [$thisMonth, $now])
            ->with('schedule.pilatesClass')
            ->get()
            ->groupBy(fn($b) => $b->schedule?->pilatesClass?->type ?? 'other')
            ->map(fn($group, $type) => [
                'type'  => $type,
                'count' => $group->count(),
            ])->values();

        return response()->json([
            'success' => true,
            'data'    => [
                'kpi' => [
                    // Field yang dipakai OwnerDashboardPage
                    'total_revenue'        => (float) $revenueThisMonth,
                    'today_revenue'        => (float) $revenueToday,
                    'total_bookings'       => $bookingsThisMonth,
                    'total_members'        => $totalMembers,
                    // Field tambahan
                    'revenue_last_month'   => (float) $revenueLastMonth,
                    'revenue_delta'        => $revenueDelta,
                    'bookings_last_month'  => $bookingsLastMonth,
                    'bookings_delta'       => $bookingsDelta,
                    'new_members'          => $newMembers,
                    'total_instructors'    => $totalInstructors,
                ],
                'chart'               => $chart,         // untuk OwnerDashboardPage
                'chart_12_months'     => $chart,         // alias lama
                'recent_transactions' => $recentTransactions,
                'top_classes'         => $topClasses,
                'class_pie'           => $classPie,
            ],
        ]);
    }
}
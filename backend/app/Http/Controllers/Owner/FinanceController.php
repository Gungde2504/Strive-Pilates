<?php
namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class FinanceController extends Controller
{
    // Laporan keuangan — GET /api/owner/finance
    public function index(Request $request)
    {
        $period = $request->get('period', 'monthly');
        $year   = (int) $request->get('year', now()->year);
        $month  = (int) $request->get('month', now()->month);

        if ($period === 'yearly') {
            $start = Carbon::create($year, 1, 1)->startOfYear();
            $end   = Carbon::create($year, 12, 31)->endOfYear();
        } else {
            $start = Carbon::create($year, $month, 1)->startOfMonth();
            $end   = Carbon::create($year, $month, 1)->endOfMonth();
        }

        $totalRevenue = Payment::where('status', 'settlement')
            ->whereBetween('paid_at', [$start, $end])
            ->sum('final_amount');

        $totalTransactionsAll = Payment::whereBetween('created_at', [$start, $end])->count();
        $totalSuccess = Payment::where('status', 'settlement')
            ->whereBetween('paid_at', [$start, $end])
            ->count();

        $daysInPeriod = max($start->diffInDays($end) + 1, 1);
        $avgDaily = $totalRevenue / $daysInPeriod;

        $successRate = $totalTransactionsAll > 0
            ? round(($totalSuccess / $totalTransactionsAll) * 100, 1)
            : 0;

        $transactions = Payment::with(['booking.user', 'booking.schedule.pilatesClass'])
            ->where('status', 'settlement')
            ->whereBetween('paid_at', [$start, $end])
            ->orderByDesc('paid_at')
            ->limit(50)
            ->get()
            ->map(fn($p) => [
                'id'           => $p->id,
                'member_name'  => $p->booking->user->name ?? '-',
                'class_name'   => $p->booking->schedule->pilatesClass->name ?? '-',
                'amount'       => (float) $p->final_amount,
                'payment_method' => $p->payment_method ?? 'Midtrans',
                'paid_at'      => $p->paid_at?->format('Y-m-d H:i'),
            ]);

        $byClass = Payment::with(['booking.schedule.pilatesClass'])
            ->where('status', 'settlement')
            ->whereBetween('paid_at', [$start, $end])
            ->get()
            ->groupBy(fn($p) => $p->booking->schedule->pilatesClass->name ?? 'Lainnya')
            ->map(fn($group, $className) => [
                'class_name'     => $className,
                'revenue'        => (float) $group->sum('final_amount'),
                'total_bookings' => $group->count(),
            ])
            ->values()
            ->sortByDesc('revenue')
            ->values();

        return response()->json([
            'success' => true,
            'data'    => [
                'summary' => [
                    'total_revenue'      => (float) $totalRevenue,
                    'total_transactions' => $totalSuccess,
                    'avg_daily'          => round($avgDaily, 0),
                    'success_rate'       => $successRate,
                ],
                'transactions' => $transactions,
                'by_class'     => $byClass,
            ],
        ]);
    }

    // Laporan komparatif — GET /api/owner/finance/compare
    public function compare(Request $request)
    {
        $yearA  = (int) $request->get('year_a', now()->year);
        $monthA = (int) $request->get('month_a', now()->month);
        $yearB  = (int) $request->get('year_b', now()->month === 1 ? now()->year - 1 : now()->year);
        $monthB = (int) $request->get('month_b', now()->month === 1 ? 12 : now()->month - 1);

        $getStats = function ($year, $month) {
            $start = Carbon::create($year, $month, 1)->startOfMonth();
            $end   = Carbon::create($year, $month, 1)->endOfMonth();

            $revenue = Payment::where('status', 'settlement')
                ->whereBetween('paid_at', [$start, $end])
                ->sum('final_amount');

            $bookings = Booking::whereBetween('created_at', [$start, $end])->count();

            $cancelledBookings = Booking::where('status', 'cancelled')
                ->whereBetween('created_at', [$start, $end])
                ->count();

            $newMembers = User::where('role', 'member')
                ->whereBetween('created_at', [$start, $end])
                ->count();

            $daysInPeriod = max($start->diffInDays($end) + 1, 1);

            return [
                'total_revenue'      => (float) $revenue,
                'total_bookings'     => $bookings,
                'new_members'        => $newMembers,
                'avg_daily_revenue'  => round($revenue / $daysInPeriod, 0),
                'cancelled_bookings' => $cancelledBookings,
            ];
        };

        $a = $getStats($yearA, $monthA);
        $b = $getStats($yearB, $monthB);

        $delta = fn($valA, $valB) => $valB > 0 ? round((($valA - $valB) / $valB) * 100, 1) : null;

        return response()->json([
            'success' => true,
            'data'    => [
                'period_a'   => $a,
                'period_b'   => $b,
                'difference' => [
                    'total_revenue'      => $delta($a['total_revenue'], $b['total_revenue']),
                    'total_bookings'     => $delta($a['total_bookings'], $b['total_bookings']),
                    'new_members'        => $delta($a['new_members'], $b['new_members']),
                    'avg_daily_revenue'  => $delta($a['avg_daily_revenue'], $b['avg_daily_revenue']),
                    'cancelled_bookings' => $delta($a['cancelled_bookings'], $b['cancelled_bookings']),
                ],
            ],
        ]);
    }
}

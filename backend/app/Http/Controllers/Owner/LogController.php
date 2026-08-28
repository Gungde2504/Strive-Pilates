<?php
namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\NotificationLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LogController extends Controller
{
    // Log notifikasi WhatsApp — GET /api/owner/notification-logs
    public function notificationLogs(Request $request)
    {
        $query = NotificationLog::with('user')
            ->orderByDesc('created_at');

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('phone_wa', 'like', "%{$request->search}%")
                  ->orWhere('event_type', 'like', "%{$request->search}%");
            });
        }

        $logs = $query->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data'    => $logs->items(),
            'total'   => $logs->total(),
            'page'    => $logs->currentPage(),
        ]);
    }

    // Audit trail — GET /api/owner/audit-trail
    public function auditTrail(Request $request)
    {
        $query = DB::table('activity_log')
            ->orderByDesc('created_at');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('description', 'like', "%{$request->search}%")
                  ->orWhere('subject_type', 'like', "%{$request->search}%");
            });
        }

        $perPage = $request->per_page ?? 20;
        $page    = $request->page ?? 1;
        $total   = $query->count();
        $logs    = $query->offset(($page - 1) * $perPage)->limit($perPage)->get();

        return response()->json([
            'success' => true,
            'data'    => $logs,
            'total'   => $total,
            'page'    => (int) $page,
        ]);
    }
}

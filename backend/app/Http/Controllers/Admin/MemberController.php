<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    // Daftar semua member — GET /api/admin/members
    public function index(Request $request)
    {
        $members = User::where('role', 'member')
            ->when($request->search, fn($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
            )
            ->when($request->is_active !== null, fn($q) =>
                $q->where('is_active', $request->is_active)
            )
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data'    => $members->map(fn($m) => [
                'id'         => $m->id,
                'name'       => $m->name,
                'email'      => $m->email,
                'phone_wa'   => $m->phone_wa,
                'is_active'  => $m->is_active,
                'created_at' => $m->created_at->format('Y-m-d'),
                'total_bookings' => $m->bookings()->count(),
            ]),
            'total' => $members->total(),
        ]);
    }

    // Detail member — GET /api/admin/members/{id}
    public function show($id)
    {
        $member = User::where('role', 'member')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => [
                'id'             => $member->id,
                'name'           => $member->name,
                'email'          => $member->email,
                'phone_wa'       => $member->phone_wa,
                'is_active'      => $member->is_active,
                'created_at'     => $member->created_at->format('Y-m-d'),
                'total_bookings' => $member->bookings()->count(),
                'confirmed_bookings' => $member->bookings()->where('status', 'confirmed')->count(),
            ],
        ]);
    }

    // Toggle aktif/nonaktif — PATCH /api/admin/members/{id}/toggle
    public function toggle($id)
    {
        $member = User::where('role', 'member')->findOrFail($id);
        $member->update(['is_active' => !$member->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Status member berhasil diubah.',
            'is_active' => $member->is_active,
        ]);
    }
}
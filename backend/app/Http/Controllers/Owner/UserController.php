<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function admins()
    {
        return response()->json(['success' => true, 'data' => User::where('role', 'admin')->orderBy('name')->get()]);
    }

    public function storeAdmin(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'phone_wa' => 'required|string|max:20',
            'password' => 'required|string|min:8',
        ]);
        $user = User::create([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'phone_wa'  => $data['phone_wa'],
            'password'  => Hash::make($data['password']),
            'role'      => 'admin',
            'is_active' => true,
        ]);
        return response()->json(['success' => true, 'message' => 'Admin berhasil ditambahkan.', 'data' => $user], 201);
    }

    public function toggleUser($id)
    {
        $user = User::whereIn('role', ['admin', 'instructor', 'member'])->findOrFail($id);
        $user->update(['is_active' => !$user->is_active]);
        return response()->json(['success' => true, 'message' => 'Status user berhasil diubah.', 'data' => $user->fresh()]);
    }

    public function allMembers(Request $request)
    {
        $members = User::where('role', 'member')
            ->when($request->search, fn($q) => $q->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('email', 'like', '%' . $request->search . '%'))
            ->withCount('bookings')
            ->orderByDesc('created_at')
            ->paginate(20);
        return response()->json(['success' => true, 'data' => $members]);
    }

    public function updateAdmin(Request $request, $id)
    {
        $user = User::where('role', 'admin')->findOrFail($id);
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'phone_wa' => 'nullable|string|max:20',
        ]);
        $user->update($data);
        return response()->json(['success' => true, 'message' => 'Admin berhasil diperbarui.', 'data' => $user->fresh()]);
    }

    public function destroyAdmin($id)
    {
        $user = User::where('role', 'admin')->findOrFail($id);
        $user->delete();
        return response()->json(['success' => true, 'message' => 'Admin berhasil dihapus.']);
    }
}

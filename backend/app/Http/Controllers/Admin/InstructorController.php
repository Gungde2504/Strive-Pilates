<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class InstructorController extends Controller
{
    public function index(Request $request)
    {
        $instructors = User::where('role', 'instructor')
            ->when($request->search, fn($q) => $q->where('name', 'like', '%'.$request->search.'%'))
            ->orderBy('name')->get();
        return response()->json(['success' => true, 'data' => $instructors]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'phone_wa' => 'required|string|max:20',
            'password' => 'required|string|min:8',
            'bio'      => 'nullable|string',
            'photo'    => 'nullable|string',
        ]);
        $user = User::create([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'phone_wa'  => $data['phone_wa'],
            'password'  => Hash::make($data['password']),
            'role'      => 'instructor',
            'is_active' => true,
        ]);
        return response()->json(['success' => true, 'message' => 'Instruktur berhasil ditambahkan.', 'data' => $user], 201);
    }

    public function show($id)
    {
        $instructor = User::where('role', 'instructor')->findOrFail($id);
        return response()->json(['success' => true, 'data' => $instructor]);
    }

    public function update(Request $request, $id)
    {
        $instructor = User::where('role', 'instructor')->findOrFail($id);
        $data = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'phone_wa' => 'sometimes|string|max:20',
            'bio'      => 'nullable|string',
            'photo'    => 'nullable|string',
        ]);
        $instructor->update($data);
        return response()->json(['success' => true, 'message' => 'Instruktur berhasil diperbarui.', 'data' => $instructor->fresh()]);
    }

    public function toggle($id)
    {
        $instructor = User::where('role', 'instructor')->findOrFail($id);
        $instructor->update(['is_active' => !$instructor->is_active]);
        return response()->json(['success' => true, 'message' => 'Status instruktur berhasil diubah.', 'data' => $instructor->fresh()]);
    }

    public function resetPassword(Request $request, $id)
    {
        $instructor = User::where('role', 'instructor')->findOrFail($id);
        $request->validate(['password' => 'required|string|min:8']);
        $instructor->update(['password' => Hash::make($request->password)]);
        return response()->json(['success' => true, 'message' => 'Password instruktur berhasil direset.']);
    }
}

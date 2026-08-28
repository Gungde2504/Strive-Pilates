<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\PilatesClass;
use Illuminate\Http\Request;

class ClassController extends Controller
{
    public function index(Request $request)
    {
        $classes = PilatesClass::when($request->search, fn($q) => $q->where('name', 'like', '%'.$request->search.'%'))
            ->when($request->type, fn($q, $v) => $q->where('type', $v))
            ->orderBy('name')->get();
        return response()->json(['success' => true, 'data' => $classes]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'type'        => 'required|in:mat,reformer',
            'description' => 'nullable|string',
            'duration'    => 'required|integer|min:30|max:120',
            'capacity'    => 'required|integer|min:1|max:20',
            'price'       => 'required|numeric|min:0',
            'is_active'   => 'boolean',
        ]);
        $class = PilatesClass::create($data);
        return response()->json(['success' => true, 'message' => 'Kelas berhasil ditambahkan.', 'data' => $class], 201);
    }

    public function show($id)
    {
        return response()->json(['success' => true, 'data' => PilatesClass::findOrFail($id)]);
    }

    public function update(Request $request, $id)
    {
        $class = PilatesClass::findOrFail($id);
        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'type'        => 'sometimes|in:mat,reformer',
            'description' => 'nullable|string',
            'duration'    => 'sometimes|integer|min:30|max:120',
            'capacity'    => 'sometimes|integer|min:1|max:20',
            'price'       => 'sometimes|numeric|min:0',
            'is_active'   => 'boolean',
        ]);
        $class->update($data);
        return response()->json(['success' => true, 'message' => 'Kelas berhasil diperbarui.', 'data' => $class->fresh()]);
    }

    public function destroy($id)
    {
        $class = PilatesClass::findOrFail($id);
        $class->delete();
        return response()->json(['success' => true, 'message' => 'Kelas berhasil dihapus.']);
    }

    public function toggleActive($id)
    {
        $class = PilatesClass::findOrFail($id);
        $class->update(['is_active' => !$class->is_active]);
        return response()->json(['success' => true, 'message' => 'Status kelas berhasil diubah.', 'data' => $class->fresh()]);
    }
}

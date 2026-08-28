<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    public function index()
    {
        return response()->json(['success' => true, 'data' => Package::orderBy('price')->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'          => 'required|string|max:255',
            'session_count' => 'required|integer|min:1',
            'validity_days' => 'required|integer|min:1',
            'price'         => 'required|numeric|min:0',
            'description'   => 'nullable|string',
            'benefits'      => 'nullable|array',
            'is_featured'   => 'boolean',
            'is_active'     => 'boolean',
        ]);
        $package = Package::create($data);
        return response()->json(['success' => true, 'message' => 'Paket berhasil ditambahkan.', 'data' => $package], 201);
    }

    public function update(Request $request, $id)
    {
        $package = Package::findOrFail($id);
        $data = $request->validate([
            'name'          => 'sometimes|string|max:255',
            'session_count' => 'sometimes|integer|min:1',
            'validity_days' => 'sometimes|integer|min:1',
            'price'         => 'sometimes|numeric|min:0',
            'description'   => 'nullable|string',
            'benefits'      => 'nullable|array',
            'is_featured'   => 'boolean',
            'is_active'     => 'boolean',
        ]);
        $package->update($data);
        return response()->json(['success' => true, 'message' => 'Paket berhasil diperbarui.', 'data' => $package->fresh()]);
    }

    public function destroy($id)
    {
        Package::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Paket berhasil dihapus.']);
    }
}

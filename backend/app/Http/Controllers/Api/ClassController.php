<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PilatesClass;
use Illuminate\Http\Request;

class ClassController extends Controller
{
    // Semua kelas aktif — GET /api/classes
    public function index(Request $request)
    {
        $query = PilatesClass::where('is_active', true);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('focus_area')) {
            $query->where('focus_area', $request->focus_area);
        }

        $classes = $query->orderBy('id')->get()
            ->map(fn($c) => [
                'id'          => $c->id,
                'name'        => $c->name,
                'type'        => $c->type,
                'focus_area'  => $c->focus_area,
                'description' => $c->description,
                'photo'       => $c->photo,
                'price'       => $c->price,
                'capacity'    => $c->capacity,
            ]);

        return response()->json([
            'success' => true,
            'data'    => $classes,
        ]);
    }

    // Detail kelas — GET /api/classes/{id}
    public function show($id)
    {
        $class = PilatesClass::where('is_active', true)->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => [
                'id'          => $class->id,
                'name'        => $class->name,
                'type'        => $class->type,
                'focus_area'  => $class->focus_area,
                'description' => $class->description,
                'photo'       => $class->photo,
                'price'       => $class->price,
                'capacity'    => $class->capacity,
            ],
        ]);
    }

    // Paket harga publik — GET /api/packages
    public function packages()
    {
        $packages = \App\Models\Package::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn($p) => [
                'id'            => $p->id,
                'name'          => $p->name,
                'session_count' => $p->session_count,
                'price'         => $p->price,
                'validity_days' => $p->validity_days,
                'description'   => $p->description,
                'benefits'      => $p->benefits,
                'is_featured'   => $p->is_featured,
            ]);

        return response()->json([
            'success' => true,
            'data'    => $packages,
        ]);
    }
    public function packageDetail($id)
    {
        $package = \App\Models\Package::findOrFail($id);
        return response()->json(['success' => true, 'data' => $package]);
    }
}

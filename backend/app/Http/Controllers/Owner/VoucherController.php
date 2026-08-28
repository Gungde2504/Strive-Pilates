<?php
namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;

class VoucherController extends Controller
{
    // Daftar voucher — GET /api/owner/vouchers
    public function index(Request $request)
    {
        $vouchers = Voucher::orderByDesc('created_at')->get();

        return response()->json([
            'success' => true,
            'data'    => $vouchers,
        ]);
    }

    // Tambah voucher — POST /api/owner/vouchers
    public function store(Request $request)
    {
        $data = $request->validate([
            'code'           => 'required|string|max:50|unique:vouchers,code',
            'name'           => 'required|string|max:255',
            'discount_type'  => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'min_purchase'   => 'nullable|numeric|min:0',
            'max_discount'   => 'nullable|numeric|min:0',
            'quota'          => 'nullable|integer|min:1',
            'started_at'     => 'nullable|date',
            'expired_at'     => 'nullable|date|after_or_equal:started_at',
            'is_active'      => 'boolean',
        ]);

        $data['code'] = strtoupper($data['code']);

        $voucher = Voucher::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Voucher berhasil dibuat.',
            'data'    => $voucher,
        ], 201);
    }

    // Update voucher — PUT /api/owner/vouchers/{id}
    public function update(Request $request, $id)
    {
        $voucher = Voucher::findOrFail($id);

        $data = $request->validate([
            'code'           => 'sometimes|string|max:50|unique:vouchers,code,' . $id,
            'name'           => 'sometimes|string|max:255',
            'discount_type'  => 'sometimes|in:percentage,fixed',
            'discount_value' => 'sometimes|numeric|min:0',
            'min_purchase'   => 'nullable|numeric|min:0',
            'max_discount'   => 'nullable|numeric|min:0',
            'quota'          => 'nullable|integer|min:1',
            'started_at'     => 'nullable|date',
            'expired_at'     => 'nullable|date|after_or_equal:started_at',
            'is_active'      => 'boolean',
        ]);

        if (isset($data['code'])) {
            $data['code'] = strtoupper($data['code']);
        }

        $voucher->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Voucher berhasil diperbarui.',
            'data'    => $voucher->fresh(),
        ]);
    }

    // Toggle aktif/nonaktif — PATCH /api/owner/vouchers/{id}/toggle
    public function toggle($id)
    {
        $voucher = Voucher::findOrFail($id);
        $voucher->update(['is_active' => !$voucher->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Status voucher berhasil diubah.',
            'data'    => $voucher->fresh(),
        ]);
    }

    // Hapus voucher — DELETE /api/owner/vouchers/{id}
    public function destroy($id)
    {
        $voucher = Voucher::findOrFail($id);

        if ($voucher->used_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Voucher yang sudah pernah digunakan tidak dapat dihapus. Nonaktifkan saja.',
            ], 422);
        }

        $voucher->delete();

        return response()->json([
            'success' => true,
            'message' => 'Voucher berhasil dihapus.',
        ]);
    }
}

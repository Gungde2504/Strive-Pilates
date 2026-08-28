<?php
namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use App\Models\Booking;
use Illuminate\Http\Request;

class VoucherController extends Controller
{
    // Validasi voucher — POST /api/member/vouchers/validate
    public function validate(Request $request)
    {
        $request->validate([
            'code'       => 'required|string',
            'booking_id' => 'required|integer',
        ]);

        $booking = Booking::with('schedule.pilatesClass')
            ->where('user_id', $request->user()->id)
            ->findOrFail($request->booking_id);

        // Ambil harga booking — load relasi dulu
        $booking->loadMissing(['schedule.pilatesClass']);
        $baseAmount = (float) ($booking->schedule?->pilatesClass?->price ?? 0);

        if ($baseAmount <= 0) {
            return response()->json(['success' => false, 'message' => 'Gagal membaca harga booking.'], 422);
        }

        $voucher = Voucher::where('code', strtoupper($request->code))
            ->where('is_active', true)
            ->first();

        if (!$voucher) {
            return response()->json(['success' => false, 'message' => 'Voucher tidak ditemukan atau tidak aktif.'], 422);
        }

        // Cek started_at
        if ($voucher->started_at && $voucher->started_at > now()) {
            return response()->json(['success' => false, 'message' => 'Voucher belum berlaku.'], 422);
        }

        // Cek expired
        if ($voucher->expired_at && $voucher->expired_at < now()) {
            return response()->json(['success' => false, 'message' => 'Voucher sudah kedaluwarsa.'], 422);
        }

        // Cek quota
        if ($voucher->quota && $voucher->used_count >= $voucher->quota) {
            return response()->json(['success' => false, 'message' => 'Voucher sudah mencapai batas penggunaan.'], 422);
        }

        // Cek minimum pembelian
        if ($voucher->min_purchase > 0 && $baseAmount < $voucher->min_purchase) {
            return response()->json([
                'success' => false,
                'message' => 'Minimum pembelian Rp ' . number_format($voucher->min_purchase, 0, ',', '.') . ' untuk voucher ini. Harga kelas Rp ' . number_format($baseAmount, 0, ',', '.') . '.',
            ], 422);
        }

        // Hitung diskon
        $discountAmount = 0;
        if ($voucher->discount_type === 'percentage') {
            $discountAmount = round($baseAmount * ($voucher->discount_value / 100));
            // Terapkan max_discount jika ada
            if ($voucher->max_discount && $discountAmount > $voucher->max_discount) {
                $discountAmount = (float) $voucher->max_discount;
            }
        } else {
            $discountAmount = min((float) $voucher->discount_value, $baseAmount);
        }

        $finalAmount = max($baseAmount - $discountAmount, 0);

        return response()->json([
            'success' => true,
            'data'    => [
                'code'            => $voucher->code,
                'name'            => $voucher->name,
                'discount_type'   => $voucher->discount_type,
                'discount_value'  => $voucher->discount_value,
                'discount_amount' => $discountAmount,
                'base_amount'     => $baseAmount,
                'final_amount'    => $finalAmount,
            ],
        ]);
    }
}

<?php
namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\MemberPackage;
use App\Models\Package;
use App\Models\Payment;
use App\Jobs\SendWhatsAppNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PackageController extends Controller
{
    // Daftar semua paket member — GET /api/member/packages
    public function index(Request $request)
    {
        $packages = MemberPackage::where('user_id', $request->user()->id)
            ->with('package')
            ->orderByDesc('created_at')
            ->get();
        return response()->json(['success' => true, 'data' => $packages]);
    }

    // Paket aktif member — GET /api/member/packages/active
    public function active(Request $request)
    {
        $package = MemberPackage::where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->where('expired_at', '>', now())
            ->where('sessions_remaining', '>', 0)
            ->with('package')
            ->first();
        return response()->json(['success' => true, 'data' => $package]);
    }

    // Inisiasi pembelian paket via Midtrans — POST /api/member/packages/purchase
    public function purchase(Request $request)
    {
        $data    = $request->validate(['package_id' => 'required|exists:packages,id']);
        $package = Package::findOrFail($data['package_id']);
        $user    = $request->user();

        $orderId = 'PKG-' . time() . '-' . $user->id;

        // Setup Midtrans
        \Midtrans\Config::$serverKey        = config('services.midtrans.server_key');
        \Midtrans\Config::$isProduction     = config('services.midtrans.is_production');
        \Midtrans\Config::$isSanitized      = true;
        \Midtrans\Config::$is3ds            = true;
        \Midtrans\Config::$overrideNotifUrl = config('services.midtrans.notification_url');

        $params = [
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => (int) $package->price,
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone_wa,
            ],
            'item_details' => [[
                'id'       => $package->id,
                'price'    => (int) $package->price,
                'quantity' => 1,
                'name'     => $package->name,
            ]],
            'callbacks' => [
                'finish'   => config('services.midtrans.finish_url'),
                'unfinish' => config('services.midtrans.unfinish_url'),
                'error'    => config('services.midtrans.error_url'),
            ],
        ];

        try {
            $snapToken = \Midtrans\Snap::getSnapToken($params);

            // Buat member_package dengan status pending dulu
            $memberPackage = MemberPackage::create([
                'user_id'            => $user->id,
                'package_id'         => $package->id,
                'sessions_total'     => $package->session_count,
                'sessions_remaining' => $package->session_count,
                'status'             => 'pending',
                'purchased_at'       => now(),
                'expired_at'         => now()->addDays($package->validity_days),
            ]);

            // Simpan payment record
            Payment::create([
                'member_package_id' => $memberPackage->id,
                'payment_type'      => 'package',
                'order_id'          => $orderId,
                'amount'            => $package->price,
                'discount_amount'   => 0,
                'final_amount'      => $package->price,
                'status'            => 'pending',
                'midtrans_token'    => $snapToken,
            ]);

            return response()->json([
                'success'           => true,
                'snap_token'        => $snapToken,
                'order_id'          => $orderId,
                'amount'            => $package->price,
                'member_package_id' => $memberPackage->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Midtrans package error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghubungi payment gateway. Coba lagi.',
            ], 500);
        }
    }
}
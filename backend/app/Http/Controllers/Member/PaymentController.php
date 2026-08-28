<?php
namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\MemberPackage;
use App\Models\Payment;
use App\Models\User;
use App\Jobs\SendWhatsAppNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    // Inisiasi pembayaran booking Midtrans — POST /api/member/payments/{bookingId}/initiate
    public function initiate(Request $request, $bookingId)
    {
        $booking = Booking::with(['schedule.pilatesClass', 'user'])
            ->where('user_id', $request->user()->id)
            ->where('status', 'pending_payment')
            ->findOrFail($bookingId);

        if ($booking->payment_expired_at < now()) {
            $booking->update(['status' => 'cancelled']);
            return response()->json([
                'success' => false,
                'message' => 'Waktu pembayaran telah habis. Silakan booking ulang.',
            ], 422);
        }

        $price = $booking->schedule->pilatesClass->price;
        $user  = $booking->user;

        $existingPayment = Payment::where('booking_id', $booking->id)
            ->where('status', 'pending')
            ->whereNotNull('midtrans_token')
            ->first();

        if ($existingPayment && $existingPayment->midtrans_token) {
            return response()->json([
                'success'    => true,
                'snap_token' => $existingPayment->midtrans_token,
                'order_id'   => $existingPayment->order_id,
                'amount'     => $price,
            ]);
        }

        $orderId = $booking->booking_code . '-' . time();

        \Midtrans\Config::$serverKey        = config('services.midtrans.server_key');
        \Midtrans\Config::$isProduction     = config('services.midtrans.is_production');
        \Midtrans\Config::$isSanitized      = true;
        \Midtrans\Config::$is3ds            = true;
        \Midtrans\Config::$overrideNotifUrl = config('services.midtrans.notification_url');

        $params = [
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => (int) $price,
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone_wa,
            ],
            'item_details' => [[
                'id'       => $booking->schedule->class_id,
                'price'    => (int) $price,
                'quantity' => 1,
                'name'     => $booking->schedule->pilatesClass->name,
            ]],
            'callbacks' => [
                'finish'   => config('services.midtrans.finish_url'),
                'unfinish' => config('services.midtrans.unfinish_url'),
                'error'    => config('services.midtrans.error_url'),
            ],
        ];

        try {
            $snapToken = \Midtrans\Snap::getSnapToken($params);

            Payment::updateOrCreate(
                ['booking_id' => $booking->id],
                [
                    'payment_type'    => 'booking',
                    'order_id'        => $orderId,
                    'amount'          => $price,
                    'discount_amount' => 0,
                    'final_amount'    => $price,
                    'status'          => 'pending',
                    'midtrans_token'  => $snapToken,
                ]
            );

            return response()->json([
                'success'    => true,
                'snap_token' => $snapToken,
                'order_id'   => $orderId,
                'amount'     => $price,
            ]);

        } catch (\Exception $e) {
            Log::error('Midtrans error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghubungi payment gateway. Coba lagi.',
            ], 500);
        }
    }

    // Webhook Midtrans — POST /api/payment/notification
    public function notification(Request $request)
    {
        $payload = $request->all();

        $orderId     = $payload['order_id']     ?? '';
        $statusCode  = $payload['status_code']  ?? '';
        $grossAmount = $payload['gross_amount'] ?? '';
        $serverKey   = config('services.midtrans.server_key');

        $signature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        if ($signature !== ($payload['signature_key'] ?? '')) {
            Log::warning('Invalid Midtrans signature for order: ' . $orderId);
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $transactionStatus = $payload['transaction_status'] ?? '';
        $fraudStatus       = $payload['fraud_status']       ?? '';

        $payment = Payment::where('order_id', $orderId)->first();
        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        if ($payment->status === 'settlement') {
            return response()->json(['message' => 'Already processed']);
        }

        DB::beginTransaction();
        try {
            if ($transactionStatus === 'capture' && $fraudStatus === 'accept') {
                $this->handleSuccess($payment);
            } elseif ($transactionStatus === 'settlement') {
                $this->handleSuccess($payment);
            } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                $this->handleFailed($payment, $transactionStatus);
            } elseif ($transactionStatus === 'pending') {
                $payment->update(['status' => 'pending']);
            }

            $payment->update([
                'payment_method'    => $payload['payment_type'] ?? null,
                'midtrans_response' => $payload,
            ]);

            DB::commit();
            return response()->json(['message' => 'OK']);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Webhook error: ' . $e->getMessage());
            return response()->json(['message' => 'Error'], 500);
        }
    }

    private function handleSuccess(Payment $payment): void
    {
        $payment->update([
            'status'  => 'settlement',
            'paid_at' => now(),
        ]);

        if ($payment->payment_type === 'package') {
            // Aktifkan paket
            $memberPackage = MemberPackage::find($payment->member_package_id);
            if ($memberPackage) {
                $memberPackage->update(['status' => 'active']);
            }

            // Notifikasi WA ke member saja
            try {
                $memberPackage->load(['user', 'package']);
                $user = $memberPackage->user;
                if ($user && $user->phone_wa) {
                    $amountFormatted = number_format((float) $payment->final_amount, 0, ',', '.');
                    $message = "Halo {$user->name}! 🎉\n\n"
                        . "Pembayaran paket Anda berhasil:\n\n"
                        . "📦 Paket: {$memberPackage->package->name}\n"
                        . "💰 Jumlah: Rp {$amountFormatted}\n"
                        . "🔢 Sesi: {$memberPackage->sessions_total} sesi\n"
                        . "📅 Berlaku hingga: " . $memberPackage->expired_at->format('d M Y') . "\n\n"
                        . "Yuk segera booking kelas pertamamu! 🧘‍♀️\n\nStrive Pilates Bali";

                    SendWhatsAppNotification::dispatch($user->id, $user->phone_wa, $message, 'package_purchased');
                }
            } catch (\Exception $e) {
                Log::error('Gagal dispatch WA konfirmasi paket: ' . $e->getMessage());
            }

        } else {
            // Pembayaran booking
            $payment->booking->update(['status' => 'confirmed']);

            // Notifikasi WA ke member saja
            try {
                $booking = $payment->booking()->with(['user', 'schedule.pilatesClass'])->first();
                $user    = $booking->user;

                if ($user && $user->phone_wa) {
                    $amountFormatted = number_format((float) $payment->final_amount, 0, ',', '.');
                    $message = "Halo {$user->name}! ✅\n\n"
                        . "Pembayaran Anda telah berhasil dikonfirmasi:\n\n"
                        . "💰 Jumlah: Rp {$amountFormatted}\n"
                        . "📋 Kelas: {$booking->schedule->pilatesClass->name}\n"
                        . "📅 Tanggal: " . $booking->schedule->date->format('d M Y') . "\n"
                        . "⏰ Waktu: " . substr($booking->schedule->start_time, 0, 5) . "\n"
                        . "🎫 Kode Booking: {$booking->booking_code}\n\n"
                        . "Sampai jumpa di kelas! 🧘‍♀️\n\nStrive Pilates Bali";

                    SendWhatsAppNotification::dispatch($user->id, $user->phone_wa, $message, 'payment_success');
                }
            } catch (\Exception $e) {
                Log::error('Gagal dispatch WA konfirmasi pembayaran booking: ' . $e->getMessage());
            }
        }
    }

    private function handleFailed(Payment $payment, string $status): void
    {
        $payment->update(['status' => $status]);

        if ($payment->payment_type === 'package') {
            if ($payment->member_package_id) {
                MemberPackage::where('id', $payment->member_package_id)
                    ->where('status', 'pending')
                    ->update(['status' => 'expired']);
            }
        } else {
            $payment->booking->update([
                'status'       => 'cancelled',
                'cancelled_at' => now(),
            ]);
            $payment->booking->schedule->increment('available_slots');

            try {
                $booking = $payment->booking()->with(['user', 'schedule.pilatesClass'])->first();
                $user    = $booking->user;
                if ($user && $user->phone_wa) {
                    $statusLabel = $status === 'expire' ? 'kedaluwarsa' : 'dibatalkan';
                    $message = "Halo {$user->name},\n\n"
                        . "Pembayaran untuk booking berikut {$statusLabel}:\n\n"
                        . "📋 Kelas: {$booking->schedule->pilatesClass->name}\n"
                        . "🎫 Kode Booking: {$booking->booking_code}\n\n"
                        . "Silakan booking ulang jika masih ingin mengikuti kelas ini.\n\nStrive Pilates Bali";

                    $eventType = $status === 'expire' ? 'payment_expired' : 'payment_rejected';
                    SendWhatsAppNotification::dispatch($user->id, $user->phone_wa, $message, $eventType);
                }
            } catch (\Exception $e) {
                Log::error('Gagal dispatch WA pembayaran gagal: ' . $e->getMessage());
            }
        }
    }

    // Cek status pembayaran booking — GET /api/member/payments/{bookingId}/status
    public function status(Request $request, $bookingId)
    {
        $booking = Booking::where('user_id', $request->user()->id)
            ->findOrFail($bookingId);

        return response()->json([
            'success' => true,
            'data'    => [
                'booking_status'  => $booking->status,
                'payment_status'  => $booking->payment?->status,
                'booking_code'    => $booking->booking_code,
                'expired_at'      => $booking->payment_expired_at,
            ],
        ]);
    }
}

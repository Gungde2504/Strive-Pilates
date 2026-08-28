<?php
namespace App\Services\Notification;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FonnteService
{
    protected string $token;
    protected string $endpoint;

    public function __construct()
    {
        $this->token = config('services.fonnte.token');
        $this->endpoint = config('services.fonnte.url', 'https://api.fonnte.com/send');
    }

    /**
     * Normalisasi nomor: 08xxx -> 628xxx
     */
    protected function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        }
        return $phone;
    }

    /**
     * Kirim pesan WhatsApp via Fonnte (synchronous, dipakai oleh Job).
     * Mengembalikan array detail untuk logging.
     *
     * @return array{success: bool, response: mixed}
     */
    public function sendRaw(string $phone, string $message): array
    {
        if (empty($this->token)) {
            Log::warning('Fonnte token belum diset, pesan tidak dikirim.');
            return ['success' => false, 'response' => ['error' => 'Token tidak diset']];
        }

        $normalizedPhone = $this->normalizePhone($phone);

        try {
            $response = Http::withHeaders([
                'Authorization' => $this->token,
            ])->asForm()->post($this->endpoint, [
                'target'  => $normalizedPhone,
                'message' => $message,
            ]);

            $body = $response->json() ?? ['raw' => $response->body()];
            $fonnteStatus = $body['status'] ?? false;

            if ($response->successful() && $fonnteStatus) {
                Log::info('Fonnte WA terkirim', ['phone' => $normalizedPhone]);
                return ['success' => true, 'response' => $body];
            }

            Log::error('Fonnte WA gagal', ['phone' => $normalizedPhone, 'response' => $body]);
            return ['success' => false, 'response' => $body];

        } catch (\Exception $e) {
            Log::error('Fonnte WA exception: ' . $e->getMessage());
            return ['success' => false, 'response' => ['error' => $e->getMessage()]];
        }
    }

    /**
     * Kirim pesan WhatsApp langsung (synchronous, untuk backward compatibility / testing).
     */
    public function send(string $phone, string $message): bool
    {
        return $this->sendRaw($phone, $message)['success'];
    }

    /**
     * Notifikasi booking berhasil dibuat.
     */
    public function sendBookingConfirmation(string $phone, string $name, string $className, string $date, string $time, string $bookingCode): bool
    {
        $message = "Halo {$name}! 👋\n\n"
            . "Booking kelas Anda berhasil dikonfirmasi:\n\n"
            . "📋 Kelas: {$className}\n"
            . "📅 Tanggal: {$date}\n"
            . "⏰ Waktu: {$time}\n"
            . "🎫 Kode Booking: {$bookingCode}\n\n"
            . "Sampai jumpa di kelas! 🧘‍♀️\n\n"
            . "Strive Pilates Bali";

        return $this->send($phone, $message);
    }

    /**
     * Notifikasi pembayaran berhasil.
     */
    public function sendPaymentConfirmation(string $phone, string $name, string $amount, string $bookingCode): bool
    {
        $message = "Halo {$name}! ✅\n\n"
            . "Pembayaran Anda telah berhasil dikonfirmasi:\n\n"
            . "💰 Jumlah: Rp " . number_format((float)$amount, 0, ',', '.') . "\n"
            . "🎫 Kode Booking: {$bookingCode}\n\n"
            . "Terima kasih telah memilih Strive Pilates Bali! 🙏";

        return $this->send($phone, $message);
    }

    /**
     * Notifikasi pembatalan booking.
     */
    public function sendCancellationNotice(string $phone, string $name, string $className, string $date): bool
    {
        $message = "Halo {$name},\n\n"
            . "Booking kelas Anda telah dibatalkan:\n\n"
            . "📋 Kelas: {$className}\n"
            . "📅 Tanggal: {$date}\n\n"
            . "Jika ini bukan permintaan Anda, hubungi kami segera.\n\n"
            . "Strive Pilates Bali";

        return $this->send($phone, $message);
    }
}

<?php
namespace App\Jobs;

use App\Models\NotificationLog;
use App\Services\Notification\FonnteService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWhatsAppNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = 10; // detik antar retry

    protected ?int $userId;
    protected string $phone;
    protected string $message;
    protected string $eventType;

    /**
     * @param int|null $userId ID user penerima (untuk relasi log), boleh null
     * @param string $phone Nomor WhatsApp tujuan
     * @param string $message Isi pesan
     * @param string $eventType Kode event, misal: 'booking_created', 'payment_success', dst (untuk audit/log)
     */
    public function __construct(?int $userId, string $phone, string $message, string $eventType)
    {
        $this->userId    = $userId;
        $this->phone     = $phone;
        $this->message   = $message;
        $this->eventType = $eventType;
    }

    public function handle(): void
    {
        $fonnte = new FonnteService();

        $log = NotificationLog::create([
            'user_id'      => $this->userId,
            'phone_wa'     => $this->phone,
            'event_type'   => $this->eventType,
            'message_sent' => $this->message,
            'status'       => 'pending',
            'attempt_count'=> $this->attempts(),
        ]);

        try {
            $result = $fonnte->sendRaw($this->phone, $this->message);

            $log->update([
                'status'        => $result['success'] ? 'sent' : 'failed',
                'response_raw'  => json_encode($result['response']),
                'sent_at'       => $result['success'] ? now() : null,
                'attempt_count' => $this->attempts(),
            ]);

            if (!$result['success']) {
                Log::warning('WA gagal terkirim', ['event' => $this->eventType, 'phone' => $this->phone, 'response' => $result['response']]);
            }

        } catch (\Exception $e) {
            $log->update([
                'status'        => 'failed',
                'response_raw'  => $e->getMessage(),
                'attempt_count' => $this->attempts(),
            ]);
            Log::error('WA job exception: ' . $e->getMessage());
            throw $e; // biar di-retry oleh queue
        }
    }
}

<?php
namespace App\Console\Commands;

use App\Models\MemberPackage;
use App\Jobs\SendWhatsAppNotification;
use Illuminate\Console\Command;

class CheckExpiredPackages extends Command
{
    protected $signature = 'notify:check-expired-packages';
    protected $description = 'Cek paket member yang sudah expired, update status, dan kirim notifikasi WhatsApp';

    public function handle(): int
    {
        $expiredPackages = MemberPackage::with(['user', 'package'])
            ->where('status', 'active')
            ->where('expired_at', '<=', now())
            ->get();

        $count = 0;
        foreach ($expiredPackages as $memberPackage) {
            $memberPackage->update(['status' => 'expired']);

            $user = $memberPackage->user;
            if ($user && $user->phone_wa) {
                $message = "Halo {$user->name},\n\n"
                    . "Paket Anda telah kedaluwarsa:\n\n"
                    . "📦 Paket: {$memberPackage->package->name}\n"
                    . "🔢 Sisa sesi yang hangus: {$memberPackage->sessions_remaining} sesi\n\n"
                    . "Yuk beli paket baru untuk lanjut booking kelas! 🧘‍♀️\n\nStrive Pilates Bali";

                SendWhatsAppNotification::dispatch($user->id, $user->phone_wa, $message, 'package_expired');
                $count++;
            }
        }

        $this->info("{$count} paket expired diproses dan notifikasi dikirim.");
        return self::SUCCESS;
    }
}

<?php
namespace App\Console\Commands;

use App\Models\User;
use App\Models\Booking;
use App\Models\Payment;
use App\Jobs\SendWhatsAppNotification;
use Illuminate\Console\Command;
use Carbon\Carbon;

class SendDailyReport extends Command
{
    protected $signature = 'notify:daily-report';
    protected $description = 'Kirim laporan ringkasan harian ke Owner & Admin jam 22:00';

    public function handle(): int
    {
        $today = Carbon::today();

        $totalBookings = Booking::whereDate('created_at', $today)->count();
        $confirmedBookings = Booking::whereDate('created_at', $today)->where('status', 'confirmed')->count();
        $cancelledBookings = Booking::whereDate('created_at', $today)->where('status', 'cancelled')->count();

        $totalRevenue = Payment::where('status', 'settlement')
            ->whereDate('paid_at', $today)
            ->sum('final_amount');

        $totalTransactions = Payment::where('status', 'settlement')
            ->whereDate('paid_at', $today)
            ->count();

        $revenueFormatted = number_format((float) $totalRevenue, 0, ',', '.');
        $dateLabel = $today->format('d M Y');

        $message = "📊 Laporan Harian — {$dateLabel}\n\n"
            . "📋 Total Booking: {$totalBookings}\n"
            . "✅ Dikonfirmasi: {$confirmedBookings}\n"
            . "❌ Dibatalkan: {$cancelledBookings}\n\n"
            . "💰 Total Pendapatan: Rp {$revenueFormatted}\n"
            . "💳 Total Transaksi: {$totalTransactions}\n\n"
            . "Strive Pilates Bali — Laporan Otomatis";

        $staff = User::whereIn('role', ['owner', 'admin'])->where('is_active', true)->get();

        $count = 0;
        foreach ($staff as $staffUser) {
            if ($staffUser->phone_wa) {
                SendWhatsAppNotification::dispatch($staffUser->id, $staffUser->phone_wa, $message, 'daily_report');
                $count++;
            }
        }

        $this->info("Laporan harian dikirim ke {$count} staff (Owner & Admin).");
        return self::SUCCESS;
    }
}

<?php
namespace App\Console\Commands;

use App\Models\Booking;
use App\Jobs\SendWhatsAppNotification;
use Illuminate\Console\Command;
use Carbon\Carbon;

class SendBookingReminders extends Command
{
    protected $signature = 'notify:booking-reminders {type : h1 atau h0}';
    protected $description = 'Kirim reminder WhatsApp ke member untuk booking H-1 (jam 19:00) atau H-0 (2 jam sebelum kelas)';

    public function handle(): int
    {
        $type = $this->argument('type');

        if ($type === 'h1') {
            $this->sendH1Reminders();
        } elseif ($type === 'h0') {
            $this->sendH0Reminders();
        } else {
            $this->error('Tipe tidak valid. Gunakan: h1 atau h0');
            return self::FAILURE;
        }

        return self::SUCCESS;
    }

    /**
     * Reminder H-1: dikirim jam 19:00, untuk semua booking confirmed besok.
     */
    private function sendH1Reminders(): void
    {
        $tomorrow = Carbon::tomorrow()->format('Y-m-d');

        $bookings = Booking::with(['user', 'schedule.pilatesClass'])
            ->where('status', 'confirmed')
            ->whereHas('schedule', fn($q) => $q->whereDate('date', $tomorrow))
            ->get();

        $count = 0;
        foreach ($bookings as $booking) {
            $user = $booking->user;
            if (!$user || !$user->phone_wa) continue;

            $message = "Halo {$user->name}! ⏰\n\n"
                . "Pengingat untuk kelas Anda besok:\n\n"
                . "📋 Kelas: {$booking->schedule->pilatesClass->name}\n"
                . "📅 Tanggal: " . $booking->schedule->date->format('d M Y') . "\n"
                . "⏰ Waktu: " . substr($booking->schedule->start_time, 0, 5) . "\n"
                . "🎫 Kode Booking: {$booking->booking_code}\n\n"
                . "Sampai jumpa besok! 🧘‍♀️\n\nStrive Pilates Bali";

            SendWhatsAppNotification::dispatch($user->id, $user->phone_wa, $message, 'reminder_h1_member');
            $count++;
        }

        $this->info("Reminder H-1 dikirim ke {$count} member.");
    }

    /**
     * Reminder H-0: dikirim 2 jam sebelum kelas dimulai, dijalankan tiap jam.
     */
    private function sendH0Reminders(): void
    {
        $now = Carbon::now();
        $targetTime = $now->copy()->addHours(2);

        $bookings = Booking::with(['user', 'schedule.pilatesClass'])
            ->where('status', 'confirmed')
            ->whereHas('schedule', function ($q) use ($targetTime) {
                $q->whereDate('date', $targetTime->format('Y-m-d'))
                  ->whereTime('start_time', '>=', $targetTime->copy()->subMinutes(30)->format('H:i:s'))
                  ->whereTime('start_time', '<=', $targetTime->copy()->addMinutes(30)->format('H:i:s'));
            })
            ->get();

        $count = 0;
        foreach ($bookings as $booking) {
            $user = $booking->user;
            if (!$user || !$user->phone_wa) continue;

            $message = "Halo {$user->name}! ⏰\n\n"
                . "Kelas Anda dimulai 2 jam lagi:\n\n"
                . "📋 Kelas: {$booking->schedule->pilatesClass->name}\n"
                . "⏰ Waktu: " . substr($booking->schedule->start_time, 0, 5) . "\n"
                . "🎫 Kode Booking: {$booking->booking_code}\n\n"
                . "Jangan sampai terlambat! 🧘‍♀️\n\nStrive Pilates Bali";

            SendWhatsAppNotification::dispatch($user->id, $user->phone_wa, $message, 'reminder_h0_member');
            $count++;
        }

        $this->info("Reminder H-0 dikirim ke {$count} member.");
    }
}

<?php
namespace App\Console\Commands;

use App\Models\Schedule;
use App\Jobs\SendWhatsAppNotification;
use Illuminate\Console\Command;
use Carbon\Carbon;

class SendInstructorReminders extends Command
{
    protected $signature = 'notify:instructor-reminders {type : h1 atau h0}';
    protected $description = 'Kirim reminder WhatsApp ke instruktur untuk jadwal mengajar H-1 (jam 19:00) atau H-0 (1 jam sebelum kelas)';

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
     * Reminder H-1: dikirim jam 19:00, untuk semua jadwal mengajar besok.
     */
    private function sendH1Reminders(): void
    {
        $tomorrow = Carbon::tomorrow()->format('Y-m-d');

        $schedules = Schedule::with(['instructor', 'pilatesClass'])
            ->where('status', '!=', 'cancelled')
            ->whereDate('date', $tomorrow)
            ->get();

        $count = 0;
        foreach ($schedules as $schedule) {
            $instructor = $schedule->instructor;
            if (!$instructor || !$instructor->phone_wa) continue;

            $message = "Halo {$instructor->name}! ⏰\n\n"
                . "Pengingat jadwal mengajar Anda besok:\n\n"
                . "📋 Kelas: {$schedule->pilatesClass->name}\n"
                . "📅 Tanggal: " . $schedule->date->format('d M Y') . "\n"
                . "⏰ Waktu: " . substr($schedule->start_time, 0, 5) . "\n"
                . "👥 Peserta terdaftar: " . ($schedule->capacity - $schedule->available_slots) . "/{$schedule->capacity}\n\n"
                . "Strive Pilates Bali";

            SendWhatsAppNotification::dispatch($instructor->id, $instructor->phone_wa, $message, 'reminder_h1_instructor');
            $count++;
        }

        $this->info("Reminder H-1 dikirim ke {$count} instruktur.");
    }

    /**
     * Reminder H-0: dikirim 1 jam sebelum kelas dimulai, dijalankan tiap jam.
     */
    private function sendH0Reminders(): void
    {
        $now = Carbon::now();
        $targetTime = $now->copy()->addHour();

        $schedules = Schedule::with(['instructor', 'pilatesClass'])
            ->where('status', '!=', 'cancelled')
            ->whereDate('date', $targetTime->format('Y-m-d'))
            ->whereTime('start_time', '>=', $targetTime->copy()->subMinutes(30)->format('H:i:s'))
            ->whereTime('start_time', '<=', $targetTime->copy()->addMinutes(30)->format('H:i:s'))
            ->get();

        $count = 0;
        foreach ($schedules as $schedule) {
            $instructor = $schedule->instructor;
            if (!$instructor || !$instructor->phone_wa) continue;

            $message = "Halo {$instructor->name}! ⏰\n\n"
                . "Kelas Anda dimulai 1 jam lagi:\n\n"
                . "📋 Kelas: {$schedule->pilatesClass->name}\n"
                . "⏰ Waktu: " . substr($schedule->start_time, 0, 5) . "\n"
                . "👥 Peserta: " . ($schedule->capacity - $schedule->available_slots) . "/{$schedule->capacity}\n\n"
                . "Strive Pilates Bali";

            SendWhatsAppNotification::dispatch($instructor->id, $instructor->phone_wa, $message, 'reminder_h0_instructor');
            $count++;
        }

        $this->info("Reminder H-0 dikirim ke {$count} instruktur.");
    }
}

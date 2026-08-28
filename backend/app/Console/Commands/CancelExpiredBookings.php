<?php
namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\WaitingList;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CancelExpiredBookings extends Command
{
    protected $signature = 'booking:cancel-expired';
    protected $description = 'Batalkan otomatis booking pending_payment yang sudah lewat batas waktu pembayaran, dan kembalikan slot';

    public function handle(): int
    {
        $expiredBookings = Booking::with('schedule')
            ->where('status', 'pending_payment')
            ->where('payment_expired_at', '<', now())
            ->get();

        $count = 0;
        foreach ($expiredBookings as $booking) {
            DB::beginTransaction();
            try {
                // Lock booking & schedule untuk konsistensi dengan logic locking lainnya
                $lockedBooking = Booking::where('id', $booking->id)
                    ->where('status', 'pending_payment')
                    ->lockForUpdate()
                    ->first();

                if (!$lockedBooking) {
                    DB::rollBack();
                    continue;
                }

                $lockedBooking->update([
                    'status'        => 'cancelled',
                    'cancel_reason' => 'Dibatalkan otomatis - waktu pembayaran habis',
                    'cancelled_at'  => now(),
                ]);

                $schedule = \App\Models\Schedule::where('id', $lockedBooking->schedule_id)->lockForUpdate()->first();
                if ($schedule) {
                    $schedule->increment('available_slots');
                    $schedule->refresh();
                    if ($schedule->status === 'full') {
                        $schedule->update(['status' => 'available']);
                    }
                }

                DB::commit();
                $count++;

                // Promosikan waiting list jika ada (di luar transaction utama, sesuai pola yang sudah ada)
                if ($schedule) {
                    $this->promoteFromWaitingList($schedule);
                }

            } catch (\Exception $e) {
                DB::rollBack();
                \Log::error('Gagal cancel expired booking #' . $booking->id . ': ' . $e->getMessage());
            }
        }

        $this->info("{$count} booking expired berhasil dibatalkan otomatis.");
        return self::SUCCESS;
    }

    private function promoteFromWaitingList($schedule): void
    {
        DB::beginTransaction();
        try {
            $lockedSchedule = \App\Models\Schedule::where('id', $schedule->id)->lockForUpdate()->first();
            if (!$lockedSchedule || $lockedSchedule->available_slots <= 0) {
                DB::rollBack();
                return;
            }

            $next = WaitingList::with(['user'])
                ->where('schedule_id', $lockedSchedule->id)
                ->where('status', 'waiting')
                ->lockForUpdate()
                ->orderBy('position')
                ->first();

            if (!$next) {
                DB::rollBack();
                return;
            }

            $newBooking = Booking::create([
                'user_id'      => $next->user_id,
                'schedule_id'  => $lockedSchedule->id,
                'booking_code' => 'STRIVE-' . time() . '-' . $next->user_id,
                'status'       => 'pending_payment',
                'payment_expired_at' => now()->addHour(),
            ]);

            $lockedSchedule->decrement('available_slots');
            $lockedSchedule->refresh();
            if ($lockedSchedule->available_slots <= 0) {
                $lockedSchedule->update(['status' => 'full']);
            }

            $next->update(['status' => 'promoted', 'promoted_at' => now()]);

            DB::commit();

            $user = $next->user;
            if ($user && $user->phone_wa) {
                $message = "Halo {$user->name}! 🎉\n\n"
                    . "Kabar baik! Slot kelas yang Anda tunggu sekarang tersedia:\n\n"
                    . "📋 Kelas: {$lockedSchedule->pilatesClass->name}\n"
                    . "📅 Tanggal: " . $lockedSchedule->date->format('d M Y') . "\n"
                    . "⏰ Waktu: " . substr($lockedSchedule->start_time, 0, 5) . "\n"
                    . "🎫 Kode Booking: {$newBooking->booking_code}\n\n"
                    . "Segera selesaikan pembayaran dalam 1 jam untuk konfirmasi booking Anda! 🧘‍♀️\n\nStrive Pilates Bali";

                \App\Jobs\SendWhatsAppNotification::dispatch($user->id, $user->phone_wa, $message, 'waiting_list_promoted');
            }

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Gagal promosikan waiting list dari expired job: ' . $e->getMessage());
        }
    }
}

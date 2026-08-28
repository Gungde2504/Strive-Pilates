<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\NotificationTemplate;

class NotificationTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            ['event_type' => 'booking_created',      'recipient_role' => 'member',   'template_text' => "Halo [Nama]! 👋\n\nBooking kamu berhasil dibuat!\n\n📋 *Detail Booking:*\n• Kelas: [Nama Kelas] ([Tipe])\n• Tanggal: [Tanggal]\n• Jam: [Jam]\n• Instruktur: [Instruktur]\n• Kode Booking: *[Kode Booking]*\n\n⏰ Selesaikan pembayaran sebelum [Waktu Expired].\n\nTerima kasih! 🌿\n*Strive Pilates Bali*"],
            ['event_type' => 'payment_success',      'recipient_role' => 'member',   'template_text' => "Halo [Nama]! ✅\n\nPembayaran kamu *berhasil*!\n\n💳 Metode: [Metode Bayar]\n💰 Nominal: Rp [Nominal]\n📋 Kode Booking: *[Kode Booking]*\n🗓 Kelas: [Nama Kelas] - [Tanggal] [Jam]\n\nSampai jumpa di studio! 🏃‍♀️\n*Strive Pilates Bali*"],
            ['event_type' => 'payment_expired',      'recipient_role' => 'member',   'template_text' => "Halo [Nama],\n\nSayang sekali, pembayaran untuk booking [Nama Kelas] pada [Tanggal] [Jam] telah *kadaluarsa*.\n\nBooking otomatis dibatalkan. Kamu bisa booking ulang kapan saja di website kami.\n\n*Strive Pilates Bali*"],
            ['event_type' => 'payment_failed',       'recipient_role' => 'member',   'template_text' => "Halo [Nama],\n\nMohon maaf, pembayaran kamu *gagal diproses*.\n\nSilakan coba lagi atau hubungi kami jika butuh bantuan.\n\n📞 Admin: [No Admin]\n\n*Strive Pilates Bali*"],
            ['event_type' => 'reminder_h1',          'recipient_role' => 'member',   'template_text' => "Halo [Nama]! 🌟\n\nPengingat: Kelas kamu *besok*!\n\n🗓 [Nama Kelas] ([Tipe])\n⏰ [Tanggal], [Jam] - [Jam Selesai]\n👤 Instruktur: [Instruktur]\n📍 Studio Utama\n\nJangan lupa hadir ya! 💪\n*Strive Pilates Bali*"],
            ['event_type' => 'reminder_h0',          'recipient_role' => 'member',   'template_text' => "Halo [Nama]! ⏰\n\nKelas kamu *2 jam lagi*!\n\n🧘 [Nama Kelas] - [Jam]\n📍 Strive Pilates Bali\n\nSiapkan diri kamu. Sampai jumpa! 🌿"],
            ['event_type' => 'booking_cancelled_admin','recipient_role'=>'member',   'template_text' => "Halo [Nama],\n\nMohon maaf, kelas *[Nama Kelas]* pada [Tanggal] [Jam] terpaksa *dibatalkan* oleh admin.\n\nAlasan: [Alasan]\n\nBooking kamu akan dikembalikan. Hubungi kami untuk info lebih lanjut.\n\n*Strive Pilates Bali*"],
            ['event_type' => 'waitinglist_promoted', 'recipient_role' => 'member',   'template_text' => "Halo [Nama]! 🎉\n\nKabar baik! Kamu naik dari *waiting list*!\n\nSlot tersedia untuk kelas *[Nama Kelas]* pada [Tanggal] [Jam].\n\nSegera selesaikan booking dalam 1 jam sebelum slot diberikan ke member lain.\n\n*Strive Pilates Bali*"],
            ['event_type' => 'booking_rescheduled',  'recipient_role' => 'member',   'template_text' => "Halo [Nama]! 🔄\n\nBooking kamu berhasil di-reschedule!\n\n❌ Jadwal lama: [Tanggal Lama] [Jam Lama]\n✅ Jadwal baru: [Tanggal Baru] [Jam Baru]\n📋 Kode: *[Kode Booking]*\n\n*Strive Pilates Bali*"],
            ['event_type' => 'booking_cancelled_member','recipient_role'=>'member',  'template_text' => "Halo [Nama],\n\nBooking kelas *[Nama Kelas]* [Tanggal] [Jam] berhasil *dibatalkan*.\n\nRefund (jika ada) akan diproses 3-7 hari kerja.\n\n*Strive Pilates Bali*"],
            ['event_type' => 'package_low',          'recipient_role' => 'member',   'template_text' => "Halo [Nama]! ⚠️\n\nSisa sesi paket kamu tinggal *[Sisa Sesi] sesi*.\n\nSegera beli paket baru agar tidak terputus latihannya.\n\n👉 Cek paket di: [URL Paket]\n\n*Strive Pilates Bali*"],
            ['event_type' => 'package_expired',      'recipient_role' => 'member',   'template_text' => "Halo [Nama],\n\nPaket *[Nama Paket]* kamu telah *kadaluarsa* hari ini.\n\nYuk beli paket baru dan lanjutkan perjalanan pilates kamu! 💪\n\n*Strive Pilates Bali*"],
            ['event_type' => 'register_success',     'recipient_role' => 'member',   'template_text' => "Halo [Nama]! 👋\n\nSelamat datang di *Strive Pilates Bali*! 🌿\n\nAkun kamu berhasil dibuat. Mulai booking kelas pertamamu sekarang!\n\n👉 [URL Website]\n\nSampai jumpa di studio! 💪"],
            ['event_type' => 'instructor_schedule_new','recipient_role'=>'instructor','template_text' => "Halo [Nama Instruktur]! 📋\n\nJadwal mengajar baru telah ditambahkan:\n\n🧘 Kelas: [Nama Kelas]\n📅 Tanggal: [Tanggal]\n⏰ Jam: [Jam]\n👥 Kapasitas: [Kapasitas]\n\n*Strive Pilates Bali*"],
            ['event_type' => 'instructor_schedule_updated','recipient_role'=>'instructor','template_text' => "Halo [Nama Instruktur]! 🔄\n\nJadwal mengajar kamu *diperbarui*:\n\n🧘 [Nama Kelas] - [Tanggal] [Jam]\n\nPerubahan: [Detail Perubahan]\n\n*Strive Pilates Bali*"],
            ['event_type' => 'instructor_schedule_cancelled','recipient_role'=>'instructor','template_text' => "Halo [Nama Instruktur],\n\nJadwal mengajar *[Nama Kelas]* pada [Tanggal] [Jam] telah *dibatalkan*.\n\nAlasan: [Alasan]\n\n*Strive Pilates Bali*"],
            ['event_type' => 'instructor_reminder_h1','recipient_role'=>'instructor','template_text' => "Halo [Nama Instruktur]! 🌟\n\nPengingat: Kamu mengajar *besok*!\n\n🧘 [Nama Kelas] - [Tanggal] [Jam]\n👥 [Jumlah Peserta] peserta terdaftar\n\nSampai besok! 💪\n*Strive Pilates Bali*"],
            ['event_type' => 'instructor_reminder_h0','recipient_role'=>'instructor','template_text' => "Halo [Nama Instruktur]! ⏰\n\nKamu mengajar *1 jam lagi*!\n\n🧘 [Nama Kelas] - [Jam]\n👥 [Jumlah Peserta] peserta\n\nSiap mengajar! 🌿"],
            ['event_type' => 'new_payment_admin',    'recipient_role' => 'admin',    'template_text' => "💳 *Pembayaran Baru Masuk!*\n\nMember: [Nama Member]\nKelas: [Nama Kelas] - [Tanggal] [Jam]\nMetode: [Metode Bayar]\nNominal: Rp [Nominal]\n\n*Strive Pilates Bali Admin*"],
            ['event_type' => 'new_booking_admin',    'recipient_role' => 'admin',    'template_text' => "🎟 *Booking Baru Dikonfirmasi!*\n\nMember: [Nama Member]\nKelas: [Nama Kelas]\nTanggal: [Tanggal] [Jam]\nKode: [Kode Booking]\n\n*Strive Pilates Bali Admin*"],
            ['event_type' => 'daily_report_owner',   'recipient_role' => 'owner',    'template_text' => "📊 *Laporan Harian Strive Pilates*\n\n📅 [Tanggal]\n\n💰 Pendapatan: Rp [Total Pendapatan]\n🎟 Booking: [Total Booking]\n👥 Member Baru: [Member Baru]\n✅ Kehadiran: [Kehadiran]%\n\n*Strive Pilates Bali*"],
        ];

        foreach ($templates as $template) {
            NotificationTemplate::create($template);
        }
    }
}
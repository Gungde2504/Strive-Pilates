<?php
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ── Reminder Booking Member ──────────────────────────
// H-1: setiap hari jam 19:00, untuk booking besok
Schedule::command('notify:booking-reminders h1')
    ->dailyAt('19:00')
    ->name('reminder-member-h1')
    ->withoutOverlapping();

// H-0: setiap jam, cek booking yang mulai dalam 2 jam
Schedule::command('notify:booking-reminders h0')
    ->hourly()
    ->name('reminder-member-h0')
    ->withoutOverlapping();

// ── Reminder Mengajar Instruktur ─────────────────────
// H-1: setiap hari jam 19:00, untuk jadwal mengajar besok
Schedule::command('notify:instructor-reminders h1')
    ->dailyAt('19:00')
    ->name('reminder-instructor-h1')
    ->withoutOverlapping();

// H-0: setiap jam, cek jadwal yang mulai dalam 1 jam
Schedule::command('notify:instructor-reminders h0')
    ->hourly()
    ->name('reminder-instructor-h0')
    ->withoutOverlapping();

// ── Paket Expired ─────────────────────────────────────
// Cek setiap hari jam 01:00 dini hari
Schedule::command('notify:check-expired-packages')
    ->dailyAt('01:00')
    ->name('check-expired-packages')
    ->withoutOverlapping();

// ── Laporan Harian ────────────────────────────────────
// Setiap hari jam 22:00
Schedule::command('notify:daily-report')
    ->dailyAt('22:00')
    ->name('daily-report')
    ->withoutOverlapping();

// ── Auto-cancel Booking Expired ──────────────────────
Schedule::command('booking:cancel-expired')
    ->everyFiveMinutes()
    ->name('cancel-expired-bookings')
    ->withoutOverlapping();

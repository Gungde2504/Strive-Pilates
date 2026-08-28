<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// ── Midtrans redirect handler ─────────────────────────────────────────────────
// Midtrans redirect browser ke sini setelah pembayaran, lalu diteruskan ke React
Route::get('/finish', function () {
    return redirect(env('FRONTEND_URL', 'http://localhost:3001') . '/member/packages?payment=success');
});

Route::get('/unfinish', function () {
    return redirect(env('FRONTEND_URL', 'http://localhost:3001') . '/member/packages?payment=pending');
});

Route::get('/error-payment', function () {
    return redirect(env('FRONTEND_URL', 'http://localhost:3001') . '/member/packages?payment=error');
});
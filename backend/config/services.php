<?php

return [

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key'    => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel'              => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // ── Midtrans Payment Gateway ──────────────────────
    'midtrans' => [
        'server_key'       => env('MIDTRANS_SERVER_KEY'),
        'client_key'       => env('MIDTRANS_CLIENT_KEY'),
        'is_production'    => env('MIDTRANS_IS_PRODUCTION', false),
        'is_sanitized'     => env('MIDTRANS_IS_SANITIZED', true),
        'is_3ds'           => env('MIDTRANS_IS_3DS', true),
        'notification_url' => env('MIDTRANS_NOTIFICATION_URL'),
        'finish_url'       => env('MIDTRANS_FINISH_URL'),
        'unfinish_url'     => env('MIDTRANS_UNFINISH_URL'),
        'error_url'        => env('MIDTRANS_ERROR_URL'),
    ],

    // ── Fonnte WhatsApp API ───────────────────────────
    'fonnte' => [
        'token'  => env('FONNTE_TOKEN'),
        'url'    => env('FONNTE_URL', 'https://api.fonnte.com/send'),
        'sender' => env('FONNTE_SENDER'),
    ],

];
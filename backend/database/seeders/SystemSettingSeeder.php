<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SystemSetting;

class SystemSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // Studio info
            ['key' => 'studio_name',       'value' => 'Strive Pilates Bali',           'group' => 'studio'],
            ['key' => 'studio_address',    'value' => 'Seminyak, Bali 80361',           'group' => 'studio'],
            ['key' => 'studio_phone',      'value' => '+62 812-3456-7890',              'group' => 'studio'],
            ['key' => 'studio_email',      'value' => 'hello@strivepilates.bali',       'group' => 'studio'],
            ['key' => 'studio_instagram',  'value' => '@strivepilatesbali',             'group' => 'studio'],
            ['key' => 'studio_whatsapp',   'value' => '6281234567890',                  'group' => 'studio'],

            // Jam operasional
            ['key' => 'open_time',         'value' => '07:00',                          'group' => 'schedule'],
            ['key' => 'close_time',        'value' => '19:00',                          'group' => 'schedule'],
            ['key' => 'break_start',       'value' => '12:00',                          'group' => 'schedule'],
            ['key' => 'break_end',         'value' => '14:00',                          'group' => 'schedule'],
            ['key' => 'session_duration',  'value' => '50',                             'group' => 'schedule'],

            // Kebijakan booking
            ['key' => 'payment_expiry_minutes',   'value' => '60',                      'group' => 'booking'],
            ['key' => 'cancel_min_hours',          'value' => '24',                     'group' => 'booking'],
            ['key' => 'reschedule_min_hours',      'value' => '24',                     'group' => 'booking'],
            ['key' => 'max_booking_per_day',       'value' => '3',                      'group' => 'booking'],

            // Branding
            ['key' => 'logo',              'value' => null,                             'group' => 'branding'],
            ['key' => 'favicon',           'value' => null,                             'group' => 'branding'],
            ['key' => 'primary_color',     'value' => '#8B6914',                        'group' => 'branding'],
        ];

        foreach ($settings as $setting) {
            SystemSetting::create($setting);
        }
    }
}
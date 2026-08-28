<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Owner
        User::create([
            'name'              => 'Owner Strive Pilates',
            'email'             => 'owner@strivepilates.bali',
            'phone_wa'          => '6281234560001',
            'password'          => Hash::make('password'),
            'role'              => 'owner',
            'is_active'         => true,
            'email_verified_at' => now(),
        ]);

        // Admin
        User::create([
            'name'              => 'Admin Strive Pilates',
            'email'             => 'admin@strivepilates.bali',
            'phone_wa'          => '6281234560002',
            'password'          => Hash::make('password'),
            'role'              => 'admin',
            'is_active'         => true,
            'email_verified_at' => now(),
        ]);

        // Instruktur 1
        $instr1 = User::create([
            'name'              => 'Ani Wijayanti',
            'email'             => 'ani@strivepilates.bali',
            'phone_wa'          => '6281234560003',
            'password'          => Hash::make('password'),
            'role'              => 'instructor',
            'is_active'         => true,
            'email_verified_at' => now(),
        ]);
        \App\Models\Instructor::create([
            'user_id'          => $instr1->id,
            'bio'              => 'Instruktur pilates bersertifikat dengan pengalaman 5 tahun.',
            'specialty'        => 'Full Body & Core',
            'certifications'   => ['Pilates Method Alliance', 'BASI Pilates'],
            'experience_years' => 5,
            'sort_order'       => 1,
            'is_visible'       => true,
            'is_active'        => true,
        ]);

        // Instruktur 2
        $instr2 = User::create([
            'name'              => 'Bima Santoso',
            'email'             => 'bima@strivepilates.bali',
            'phone_wa'          => '6281234560004',
            'password'          => Hash::make('password'),
            'role'              => 'instructor',
            'is_active'         => true,
            'email_verified_at' => now(),
        ]);
        \App\Models\Instructor::create([
            'user_id'          => $instr2->id,
            'bio'              => 'Spesialis Reformer Pilates dengan fokus pada Core dan Glutes.',
            'specialty'        => 'Reformer Specialist',
            'certifications'   => ['Stott Pilates', 'ACE Certified'],
            'experience_years' => 4,
            'sort_order'       => 2,
            'is_visible'       => true,
            'is_active'        => true,
        ]);

        // Instruktur 3
        $instr3 = User::create([
            'name'              => 'Citra Pertiwi',
            'email'             => 'citra@strivepilates.bali',
            'phone_wa'          => '6281234560005',
            'password'          => Hash::make('password'),
            'role'              => 'instructor',
            'is_active'         => true,
            'email_verified_at' => now(),
        ]);
        \App\Models\Instructor::create([
            'user_id'          => $instr3->id,
            'bio'              => 'Instruktur pilates dengan keahlian Glutes dan Reformer.',
            'specialty'        => 'Glutes & Reformer',
            'certifications'   => ['Polestar Pilates'],
            'experience_years' => 3,
            'sort_order'       => 3,
            'is_visible'       => true,
            'is_active'        => true,
        ]);

        // Instruktur 4
        $instr4 = User::create([
            'name'              => 'Deni Rahayu',
            'email'             => 'deni@strivepilates.bali',
            'phone_wa'          => '6281234560006',
            'password'          => Hash::make('password'),
            'role'              => 'instructor',
            'is_active'         => true,
            'email_verified_at' => now(),
        ]);
        \App\Models\Instructor::create([
            'user_id'          => $instr4->id,
            'bio'              => 'Instruktur pilates Full Body dengan pendekatan holistik.',
            'specialty'        => 'Full Body Reformer',
            'certifications'   => ['BASI Pilates', 'Yoga Alliance'],
            'experience_years' => 6,
            'sort_order'       => 4,
            'is_visible'       => true,
            'is_active'        => true,
        ]);

        // Member
        User::create([
            'name'              => 'Sarah Amelia',
            'email'             => 'member@strivepilates.bali',
            'phone_wa'          => '6281234560007',
            'password'          => Hash::make('password'),
            'role'              => 'member',
            'is_active'         => true,
            'email_verified_at' => now(),
        ]);
    }
}
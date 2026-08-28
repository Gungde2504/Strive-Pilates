<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Package;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            [
                'name'          => 'Single Class',
                'session_count' => 1,
                'price'         => 120000,
                'validity_days' => 7,
                'description'   => 'Satu sesi pilihan bebas Mat atau Reformer.',
                'benefits'      => ['1 sesi pilihan', 'Mat atau Reformer', 'Semua level'],
                'is_featured'   => false,
                'sort_order'    => 1,
                'is_active'     => true,
            ],
            [
                'name'          => 'Paket 5x',
                'session_count' => 5,
                'price'         => 550000,
                'validity_days' => 30,
                'description'   => 'Paket 5 sesi hemat 8% dari harga normal.',
                'benefits'      => ['5 sesi pilihan', 'Berlaku 30 hari', 'Mix Mat & Reformer'],
                'is_featured'   => false,
                'sort_order'    => 2,
                'is_active'     => true,
            ],
            [
                'name'          => 'Paket 10x',
                'session_count' => 10,
                'price'         => 1200000,
                'validity_days' => 60,
                'description'   => 'Paket terpopuler! 10 sesi hemat lebih dari 16%.',
                'benefits'      => ['10 sesi pilihan', 'Berlaku 60 hari', 'Mix semua kelas', 'Prioritas booking'],
                'is_featured'   => true,
                'sort_order'    => 3,
                'is_active'     => true,
            ],
            [
                'name'          => 'Unlimited',
                'session_count' => 999,
                'price'         => 2000000,
                'validity_days' => 30,
                'description'   => 'Tidak terbatas selama 30 hari. Latihan sepuasnya!',
                'benefits'      => ['Tidak terbatas', 'Berlaku 30 hari', 'Semua kelas', 'Gratis 1x private'],
                'is_featured'   => false,
                'sort_order'    => 4,
                'is_active'     => true,
            ],
        ];

        foreach ($packages as $package) {
            Package::create($package);
        }
    }
}
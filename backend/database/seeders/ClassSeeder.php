<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PilatesClass;

class ClassSeeder extends Seeder
{
    public function run(): void
    {
        $classes = [
            [
                'name'        => 'Full Body MAT',
                'type'        => 'mat',
                'focus_area'  => 'full_body',
                'description' => 'Kelas pilates Mat yang fokus pada penguatan seluruh tubuh. Cocok untuk semua level.',
                'price'       => 120000,
                'capacity'    => 12,
                'is_active'   => true,
            ],
            [
                'name'        => 'Full Body Reformer',
                'type'        => 'reformer',
                'focus_area'  => 'full_body',
                'description' => 'Kelas Reformer untuk penguatan menyeluruh dengan mesin reformer premium.',
                'price'       => 150000,
                'capacity'    => 8,
                'is_active'   => true,
            ],
            [
                'name'        => 'Core Reformer',
                'type'        => 'reformer',
                'focus_area'  => 'core',
                'description' => 'Kelas Reformer fokus penguatan otot inti (core) untuk postur lebih baik.',
                'price'       => 150000,
                'capacity'    => 8,
                'is_active'   => true,
            ],
            [
                'name'        => 'Glutes Reformer',
                'type'        => 'reformer',
                'focus_area'  => 'glutes',
                'description' => 'Kelas Reformer fokus penguatan otot glutes, paha, dan bokong.',
                'price'       => 150000,
                'capacity'    => 8,
                'is_active'   => true,
            ],
        ];

        foreach ($classes as $class) {
            PilatesClass::create($class);
        }
    }
}
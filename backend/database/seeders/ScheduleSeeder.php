<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Schedule;
use App\Models\PilatesClass;
use App\Models\User;
use Carbon\Carbon;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $matClass          = PilatesClass::where('type', 'mat')->where('focus_area', 'full_body')->first();
        $fullBodyReformer  = PilatesClass::where('type', 'reformer')->where('focus_area', 'full_body')->first();
        $coreReformer      = PilatesClass::where('type', 'reformer')->where('focus_area', 'core')->first();
        $glutesReformer    = PilatesClass::where('type', 'reformer')->where('focus_area', 'glutes')->first();

        $instructors = User::where('role', 'instructor')->get();
        $instr = [
            $instructors[0]->id,
            $instructors[1]->id,
            $instructors[2]->id,
            $instructors[3]->id,
        ];

        // MAT slots: 07:00, 09:00, 11:00, 15:00, 17:00 — semua hari Full Body MAT
        $matSlots = ['07:00', '09:00', '11:00', '15:00', '17:00'];

        // REFORMER slots: 08:00, 10:00, 16:00, 18:00, 19:00 — fokus per hari
        // MON(0)/THU(3)/SUN(6) = Full Body, TUE(1)/FRI(4) = Core, WED(2)/SAT(5) = Glutes
        $reformerSlots = ['08:00', '10:00', '16:00', '18:00', '19:00'];
        $reformerFocus = [
            0 => $fullBodyReformer,  // Senin
            1 => $coreReformer,      // Selasa
            2 => $glutesReformer,    // Rabu
            3 => $fullBodyReformer,  // Kamis
            4 => $coreReformer,      // Jumat
            5 => $glutesReformer,    // Sabtu
            6 => $fullBodyReformer,  // Minggu
        ];

        // Generate jadwal untuk 2 minggu ke depan
        $startDate = Carbon::today();
        $endDate   = Carbon::today()->addWeeks(2);

        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            $dayOfWeek = $date->dayOfWeek; // 0=Sunday, 1=Monday, ... 6=Saturday
            // Konversi ke format kita (0=Monday)
            $dayIndex = $dayOfWeek === 0 ? 6 : $dayOfWeek - 1;

            // MAT slots
            foreach ($matSlots as $i => $slot) {
                Schedule::create([
                    'class_id'        => $matClass->id,
                    'instructor_id'   => $instr[$i % 4],
                    'date'            => $date->format('Y-m-d'),
                    'start_time'      => $slot,
                    'end_time'        => Carbon::createFromFormat('H:i', $slot)->addMinutes(50)->format('H:i'),
                    'capacity'        => 12,
                    'available_slots' => 12,
                    'status'          => 'available',
                ]);
            }

            // REFORMER slots
            $reformerClass = $reformerFocus[$dayIndex];
            foreach ($reformerSlots as $i => $slot) {
                Schedule::create([
                    'class_id'        => $reformerClass->id,
                    'instructor_id'   => $instr[($i + 1) % 4],
                    'date'            => $date->format('Y-m-d'),
                    'start_time'      => $slot,
                    'end_time'        => Carbon::createFromFormat('H:i', $slot)->addMinutes(50)->format('H:i'),
                    'capacity'        => 8,
                    'available_slots' => 8,
                    'status'          => 'available',
                ]);
            }
        }
    }
}
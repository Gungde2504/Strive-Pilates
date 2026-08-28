<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    // Jadwal mingguan — GET /api/schedules?date=2025-05-19
    public function index(Request $request)
    {
        $date = $request->get('date', Carbon::today()->format('Y-m-d'));
        $startOfWeek = Carbon::parse($date)->startOfWeek(Carbon::MONDAY);
        $endOfWeek   = $startOfWeek->copy()->endOfWeek(Carbon::SUNDAY);

        $schedules = Schedule::with(['pilatesClass', 'instructor'])
            ->whereBetween('date', [
                $startOfWeek->format('Y-m-d'),
                $endOfWeek->format('Y-m-d')
            ])
            ->where('status', '!=', 'cancelled')
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        // Group by date
        $grouped = $schedules->groupBy(fn($s) => $s->date->format('Y-m-d'))
            ->map(fn($daySchedules) => $daySchedules->map(fn($s) => [
                'id'              => $s->id,
                'class_id'        => $s->class_id,
                'class_name'      => $s->pilatesClass->name,
                'class_type'      => $s->pilatesClass->type,
                'class_focus'     => $s->pilatesClass->focus_area,
                'instructor_name' => $s->instructor->name,
                'start_time'      => $s->start_time,
                'end_time'        => $s->end_time,
                'capacity'        => $s->capacity,
                'available_slots' => $s->available_slots,
                'status'          => $s->status,
                'status_label'    => $this->statusLabel($s->available_slots, $s->capacity),
            ]));

        return response()->json([
            'success'      => true,
            'week_start'   => $startOfWeek->format('Y-m-d'),
            'week_end'     => $endOfWeek->format('Y-m-d'),
            'data'         => $grouped,
        ]);
    }

    // Jadwal hari ini — GET /api/schedules/today
    public function today()
    {
        $schedules = Schedule::with(['pilatesClass', 'instructor'])
            ->whereDate('date', Carbon::today())
            ->where('status', '!=', 'cancelled')
            ->orderBy('start_time')
            ->get()
            ->map(fn($s) => [
                'id'              => $s->id,
                'class_name'      => $s->pilatesClass->name,
                'class_type'      => $s->pilatesClass->type,
                'instructor_name' => $s->instructor->name,
                'start_time'      => $s->start_time,
                'end_time'        => $s->end_time,
                'available_slots' => $s->available_slots,
                'capacity'        => $s->capacity,
                'status_label'    => $this->statusLabel($s->available_slots, $s->capacity),
                'price'           => $s->pilatesClass->price,
            ]);

        return response()->json([
            'success' => true,
            'date'    => Carbon::today()->format('Y-m-d'),
            'data'    => $schedules,
        ]);
    }

    // Detail satu jadwal — GET /api/schedules/{id}
    public function show($id)
    {
        $schedule = Schedule::with(['pilatesClass', 'instructor'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => [
                'id'              => $schedule->id,
                'class_name'      => $schedule->pilatesClass->name,
                'class_type'      => $schedule->pilatesClass->type,
                'class_focus'     => $schedule->pilatesClass->focus_area,
                'class_price'     => $schedule->pilatesClass->price,
                'instructor_name' => $schedule->instructor->name,
                'date'            => $schedule->date->format('Y-m-d'),
                'start_time'      => $schedule->start_time,
                'end_time'        => $schedule->end_time,
                'capacity'        => $schedule->capacity,
                'available_slots' => $schedule->available_slots,
                'status'          => $schedule->status,
            ],
        ]);
    }

    private function statusLabel(int $available, int $capacity): string
    {
        if ($available === 0) return 'full';
        if ($available <= 3)  return 'almost_full';
        return 'available';
    }
}
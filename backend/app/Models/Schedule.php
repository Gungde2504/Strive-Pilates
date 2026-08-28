<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = [
        'class_id', 'instructor_id', 'date', 'start_time',
        'end_time', 'capacity', 'available_slots', 'status', 'note',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function pilatesClass()
    {
        return $this->belongsTo(PilatesClass::class, 'class_id');
    }

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function waitingLists()
    {
        return $this->hasMany(WaitingList::class);
    }
}
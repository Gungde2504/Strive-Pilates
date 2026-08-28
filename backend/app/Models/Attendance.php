<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Attendance extends Model
{
    protected $table = 'attendance';

    protected $fillable = [
        'booking_id', 'instructor_id', 'status', 'checked_at', 'note',
    ];
    protected $casts = [
        'checked_at' => 'datetime',
    ];
    public function booking()    { return $this->belongsTo(Booking::class); }
    public function instructor() { return $this->belongsTo(User::class, 'instructor_id'); }
}
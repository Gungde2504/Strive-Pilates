<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'schedule_id', 'member_package_id', 'voucher_id',
        'booking_code', 'status', 'payment_expired_at',
        'cancel_reason', 'cancelled_at',
    ];

    protected $casts = [
        'payment_expired_at' => 'datetime',
        'cancelled_at'       => 'datetime',
    ];

    public function user()     { return $this->belongsTo(User::class); }
    public function schedule() { return $this->belongsTo(Schedule::class); }
    public function payment()  { return $this->hasOne(Payment::class); }
    public function attendance(){ return $this->hasOne(Attendance::class); }
}
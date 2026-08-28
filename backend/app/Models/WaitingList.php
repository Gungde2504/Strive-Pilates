<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaitingList extends Model
{
    protected $fillable = [
        'user_id', 'schedule_id', 'position', 'status', 'promoted_at',
    ];

    protected $casts = [
        'promoted_at' => 'datetime',
    ];

    public function user()     { return $this->belongsTo(User::class); }
    public function schedule() { return $this->belongsTo(Schedule::class); }
}
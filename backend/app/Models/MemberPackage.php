<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MemberPackage extends Model
{
    protected $fillable = [
        'user_id', 'package_id', 'payment_id', 'sessions_total',
        'sessions_remaining', 'purchased_at', 'expired_at', 'status',
    ];

    protected $casts = [
        'purchased_at' => 'datetime',
        'expired_at'   => 'datetime',
    ];

    public function user()    { return $this->belongsTo(User::class); }
    public function package() { return $this->belongsTo(Package::class); }
}
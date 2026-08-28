<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name', 'email', 'phone_wa', 'password',
        'role', 'photo', 'is_active', 'email_verified_at',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'is_active'         => 'boolean',
    ];

    public function instructor()
    {
        return $this->hasOne(Instructor::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function memberPackages()
    {
        return $this->hasMany(MemberPackage::class);
    }

    public function isOwner()      { return $this->role === 'owner'; }
    public function isAdmin()      { return $this->role === 'admin'; }
    public function isInstructor() { return $this->role === 'instructor'; }
    public function isMember()     { return $this->role === 'member'; }
}
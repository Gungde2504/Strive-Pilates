<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PilatesClass extends Model
{
    protected $table = 'classes';

    protected $fillable = [
        'name', 'type', 'focus_area', 'description',
        'photo', 'price', 'capacity', 'is_active',
    ];

    protected $casts = [
        'price'     => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'class_id');
    }
}
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Instructor extends Model
{
    protected $fillable = [
        'user_id', 'bio', 'photo', 'specialty',
        'certifications', 'experience_years',
        'sort_order', 'is_visible', 'is_active',
    ];

    protected $casts = [
        'certifications' => 'array',
        'is_visible'     => 'boolean',
        'is_active'      => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
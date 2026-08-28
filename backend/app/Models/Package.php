<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $fillable = [
        'name', 'session_count', 'price', 'validity_days',
        'description', 'benefits', 'is_featured', 'sort_order', 'is_active',
    ];

    protected $casts = [
        'benefits'    => 'array',
        'price'       => 'decimal:2',
        'is_featured' => 'boolean',
        'is_active'   => 'boolean',
    ];
}
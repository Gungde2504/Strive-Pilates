<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    protected $fillable = [
        'member_name', 'photo', 'content', 'rating', 'is_visible', 'sort_order',
    ];

    protected $casts = ['is_visible' => 'boolean', 'rating' => 'integer'];
}
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $fillable = [
        'photo', 'title', 'description', 'cta_link',
        'cta_text', 'sort_order', 'is_active', 'created_by',
    ];

    protected $casts = ['is_active' => 'boolean'];
}
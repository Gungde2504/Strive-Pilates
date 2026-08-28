<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $fillable = [
        'code', 'name', 'discount_type', 'discount_value',
        'min_purchase', 'max_discount', 'quota', 'used_count',
        'started_at', 'expired_at', 'is_active',
    ];

    protected $casts = [
        'started_at'     => 'datetime',
        'expired_at'     => 'datetime',
        'discount_value' => 'decimal:2',
        'is_active'      => 'boolean',
    ];
}
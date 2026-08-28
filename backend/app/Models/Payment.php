<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'booking_id', 'member_package_id', 'payment_type',
        'order_id', 'amount', 'discount_amount',
        'final_amount', 'payment_method', 'status',
        'midtrans_token', 'midtrans_redirect_url',
        'midtrans_response', 'paid_at',
    ];

    protected $casts = [
        'midtrans_response' => 'array',
        'paid_at'           => 'datetime',
        'amount'            => 'decimal:2',
        'final_amount'      => 'decimal:2',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function memberPackage()
    {
        return $this->belongsTo(MemberPackage::class);
    }
}

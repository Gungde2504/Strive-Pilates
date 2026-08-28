<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('schedule_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('member_package_id')->nullable();
            $table->unsignedBigInteger('voucher_id')->nullable();
            $table->string('booking_code')->unique();
            $table->enum('status', ['pending_payment', 'confirmed', 'cancelled', 'completed'])->default('pending_payment');
            $table->timestamp('payment_expired_at')->nullable();
            $table->text('cancel_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }
    public function down(): void { Schema::dropIfExists('bookings'); }
};
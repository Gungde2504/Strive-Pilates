<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('member_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('package_id')->constrained()->onDelete('cascade');
            $table->foreignId('payment_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('sessions_total');
            $table->integer('sessions_remaining');
            $table->timestamp('purchased_at')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->enum('status', ['active', 'expired', 'depleted'])->default('active');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('member_packages'); }
};
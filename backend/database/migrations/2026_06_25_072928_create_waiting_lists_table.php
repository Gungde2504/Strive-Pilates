<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('waiting_lists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('schedule_id')->constrained()->onDelete('cascade');
            $table->integer('position');
            $table->enum('status', ['waiting', 'promoted', 'cancelled'])->default('waiting');
            $table->timestamp('promoted_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'schedule_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('waiting_lists'); }
};
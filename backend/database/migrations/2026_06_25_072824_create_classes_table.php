<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['mat', 'reformer']);
            $table->enum('focus_area', ['full_body', 'core', 'glutes']);
            $table->text('description')->nullable();
            $table->string('photo')->nullable();
            $table->decimal('price', 10, 2);
            $table->integer('capacity')->default(12);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('classes'); }
};
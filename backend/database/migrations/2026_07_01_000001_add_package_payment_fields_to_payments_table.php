<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Jadikan booking_id nullable supaya bisa dipakai untuk pembayaran paket
            $table->foreignId('booking_id')->nullable()->change();
            // Tambah relasi ke member_packages untuk pembayaran paket
            $table->foreignId('member_package_id')->nullable()->after('booking_id')->constrained('member_packages')->nullOnDelete();
            // Tambah tipe pembayaran (booking atau package)
            $table->enum('payment_type', ['booking', 'package'])->default('booking')->after('member_package_id');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('member_package_id');
            $table->dropColumn('payment_type');
            $table->foreignId('booking_id')->nullable(false)->change();
        });
    }
};

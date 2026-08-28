<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Jobs\SendWhatsAppNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'phone_wa' => 'required|string|max:20',
            'password' => 'required|string|min:8|confirmed',
        ]);
        $user = User::create([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'phone_wa'  => $data['phone_wa'],
            'password'  => Hash::make($data['password']),
            'role'      => 'member',
            'is_active' => true,
        ]);
        $token = $user->createToken('auth_token')->plainTextToken;

        if ($user->phone_wa) {
            $message = "Halo {$user->name}! 🎉\n\n"
                . "Selamat datang di Strive Pilates Bali!\n\n"
                . "Akun Anda berhasil didaftarkan dengan email {$user->email}.\n\n"
                . "Yuk mulai jelajahi jadwal kelas dan booking sesi pertamamu! 🧘‍♀️\n\n"
                . "Strive Pilates Bali";

            SendWhatsAppNotification::dispatch($user->id, $user->phone_wa, $message, 'registration_success');
        }

        return response()->json(['success' => true, 'message' => 'Registrasi berhasil!', 'data' => ['user' => $user, 'token' => $token]], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);
        $user = User::where('email', $data['email'])->first();
        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => ['Email atau password salah.']]);
        }
        if (!$user->is_active) {
            return response()->json(['success' => false, 'message' => 'Akun Anda tidak aktif.'], 403);
        }
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json(['success' => true, 'message' => 'Login berhasil!', 'data' => ['user' => $user, 'token' => $token]]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['success' => true, 'message' => 'Logout berhasil.']);
    }

    public function me(Request $request)
    {
        return response()->json(['success' => true, 'data' => $request->user()]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'phone_wa' => 'sometimes|string|max:20',
            'photo'    => 'sometimes|string|nullable',
        ]);
        $user->update($data);
        return response()->json(['success' => true, 'message' => 'Profil berhasil diperbarui.', 'data' => $user->fresh()]);
    }

    public function changePassword(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'Password saat ini tidak sesuai.'], 422);
        }
        $user->update(['password' => Hash::make($request->password)]);
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json(['success' => true, 'message' => 'Password berhasil diubah.', 'data' => ['token' => $token]]);
    }

    // Step 1 — Minta link reset password, dikirim via WhatsApp — POST /api/auth/forgot-password
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Email tidak ditemukan.'], 404);
        }

        if (!$user->phone_wa) {
            return response()->json(['success' => false, 'message' => 'Akun ini belum memiliki nomor WhatsApp terdaftar. Hubungi admin untuk reset password.'], 422);
        }

        // Generate token reset, simpan ke tabel password_reset_tokens
        $token = Str::random(64);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        // Frontend URL untuk reset password
        $frontendUrl = config('app.frontend_url', 'http://localhost:3001');
        $resetLink = "{$frontendUrl}/reset-password?token={$token}&email=" . urlencode($user->email);

        $message = "Halo {$user->name},\n\n"
            . "Kami menerima permintaan reset password untuk akun Anda.\n\n"
            . "Klik link berikut untuk membuat password baru (berlaku 60 menit):\n"
            . "{$resetLink}\n\n"
            . "Jika Anda tidak meminta ini, abaikan pesan ini.\n\n"
            . "Strive Pilates Bali";

        SendWhatsAppNotification::dispatch($user->id, $user->phone_wa, $message, 'password_reset_request');

        return response()->json([
            'success' => true,
            'message' => 'Instruksi reset password telah dikirim via WhatsApp ke nomor terdaftar.',
        ]);
    }

    // Step 2 — Reset password menggunakan token dari WhatsApp — POST /api/auth/reset-password
    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'token'    => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $data['email'])->first();

        if (!$record) {
            return response()->json(['success' => false, 'message' => 'Token reset tidak valid atau sudah digunakan.'], 422);
        }

        // Token berlaku 60 menit
        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $data['email'])->delete();
            return response()->json(['success' => false, 'message' => 'Token reset sudah kedaluwarsa. Silakan minta ulang.'], 422);
        }

        if (!Hash::check($data['token'], $record->token)) {
            return response()->json(['success' => false, 'message' => 'Token reset tidak valid.'], 422);
        }

        $user = User::where('email', $data['email'])->first();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Akun tidak ditemukan.'], 404);
        }

        $user->update(['password' => Hash::make($data['password'])]);
        $user->tokens()->delete();
        DB::table('password_reset_tokens')->where('email', $data['email'])->delete();

        if ($user->phone_wa) {
            $message = "Halo {$user->name},\n\n"
                . "Password akun Anda berhasil diubah.\n\n"
                . "Jika Anda tidak melakukan ini, segera hubungi kami.\n\n"
                . "Strive Pilates Bali";

            SendWhatsAppNotification::dispatch($user->id, $user->phone_wa, $message, 'password_reset_success');
        }

        return response()->json(['success' => true, 'message' => 'Password berhasil direset. Silakan login dengan password baru.']);
    }
}
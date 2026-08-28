<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\ClassController;
use App\Http\Controllers\Api\CmsController;

use App\Http\Controllers\Member\BookingController;
use App\Http\Controllers\Member\PaymentController;
use App\Http\Controllers\Member\PackageController as MemberPackage;
use App\Http\Controllers\Member\VoucherController as MemberVoucherController;

use App\Http\Controllers\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\Admin\ScheduleController as AdminSchedule;
use App\Http\Controllers\Admin\BookingController as AdminBooking;
use App\Http\Controllers\Admin\MemberController as AdminMember;
use App\Http\Controllers\Admin\ClassController as AdminClass;
use App\Http\Controllers\Admin\PackageController as AdminPackage;
use App\Http\Controllers\Admin\InstructorController as AdminInstructor;
use App\Http\Controllers\Admin\CmsController as AdminCms;

use App\Http\Controllers\Owner\DashboardController as OwnerDashboard;
use App\Http\Controllers\Owner\FinanceController as OwnerFinance;
use App\Http\Controllers\Owner\UserController as OwnerUser;
use App\Http\Controllers\Owner\VoucherController as OwnerVoucher;
use App\Http\Controllers\Owner\LogController as OwnerLog;

use App\Http\Controllers\Instructor\DashboardController as InstrDashboard;
use App\Http\Controllers\Instructor\ScheduleController as InstrSchedule;
use App\Http\Controllers\Instructor\AttendanceController as InstrAttendance;


// Health check
Route::get('/health', fn() => response()->json(['status' => 'ok', 'service' => 'Strive Pilates API', 'version' => '1.0.0']));

// Auth public
Route::prefix('auth')->group(function () {
    Route::post('/register',        [AuthController::class, 'register']);
    Route::post('/login',           [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password',  [AuthController::class, 'resetPassword']);
});

// Public routes
Route::get('/schedules/today', [ScheduleController::class, 'today']);
Route::get('/schedules/{id}',  [ScheduleController::class, 'show']);
Route::get('/schedules',       [ScheduleController::class, 'index']);
Route::get('/classes',         [ClassController::class, 'index']);
Route::get('/classes/{id}',    [ClassController::class, 'show']);
Route::get('/packages',        [ClassController::class, 'packages']);
Route::get('/packages/{id}',   [ClassController::class, 'packageDetail']);

// Public CMS
Route::prefix('cms')->group(function () {
    Route::get('/banners',      [CmsController::class, 'banners']);
    Route::get('/testimonials', [CmsController::class, 'testimonials']);
    Route::get('/faqs',         [CmsController::class, 'faqs']);
    Route::get('/gallery',      [CmsController::class, 'gallery']);
    Route::get('/settings',     [CmsController::class, 'settings']);
});

// ── Midtrans ──────────────────────────────────────────────────────────────────
// Webhook: dipanggil Midtrans setelah pembayaran (via ngrok)
Route::post('/payment/notification', [PaymentController::class, 'notification']);

// Redirect handler: Midtrans redirect browser ke sini, lalu diteruskan ke React
// Deteksi tipe payment dari order_id: PKG- = paket, selainnya = booking
Route::get('/finish', function (\Illuminate\Http\Request $request) {
    $orderId  = $request->query('order_id', '');
    $frontend = env('FRONTEND_URL', 'http://localhost:3001');
    $base     = str_starts_with($orderId, 'PKG-') ? '/member/packages' : '/member/bookings';
    return redirect($frontend . $base . '?payment=success&order_id=' . $orderId);
});

Route::get('/unfinish', function (\Illuminate\Http\Request $request) {
    $orderId  = $request->query('order_id', '');
    $frontend = env('FRONTEND_URL', 'http://localhost:3001');
    $base     = str_starts_with($orderId, 'PKG-') ? '/member/packages' : '/member/bookings';
    return redirect($frontend . $base . '?payment=pending&order_id=' . $orderId);
});

Route::get('/error-payment', function (\Illuminate\Http\Request $request) {
    $orderId  = $request->query('order_id', '');
    $frontend = env('FRONTEND_URL', 'http://localhost:3001');
    $base     = str_starts_with($orderId, 'PKG-') ? '/member/packages' : '/member/bookings';
    return redirect($frontend . $base . '?payment=error&order_id=' . $orderId);
});

// Protected
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout',          [AuthController::class, 'logout']);
        Route::get('/me',               [AuthController::class, 'me']);
        Route::put('/profile',          [AuthController::class, 'updateProfile']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
    });

    // Member
    Route::middleware('role:member')->prefix('member')->group(function () {
        Route::get('/bookings',                       [BookingController::class, 'index']);
        Route::post('/bookings',                      [BookingController::class, 'store']);
        Route::post('/bookings/waitlist',              [BookingController::class, 'joinWaitlist']);
        Route::get('/bookings/waitlist',               [BookingController::class, 'myWaitlist']);
        Route::delete('/bookings/waitlist/{id}',       [BookingController::class, 'leaveWaitlist']);
        Route::get('/bookings/{id}',                  [BookingController::class, 'show']);
        Route::patch('/bookings/{id}/cancel',         [BookingController::class, 'cancel']);
        Route::patch('/bookings/{id}/reschedule',     [BookingController::class, 'reschedule']);
        Route::post('/payments/{bookingId}/initiate', [PaymentController::class, 'initiate']);
        Route::get('/payments/{bookingId}/status',    [PaymentController::class, 'status']);
        Route::get('/packages',                       [MemberPackage::class, 'index']);
        Route::get('/packages/active',                [MemberPackage::class, 'active']);
        Route::post('/packages/purchase',             [MemberPackage::class, 'purchase']);
        Route::post('/vouchers/validate', [MemberVoucherController::class, 'validate']);
    });

    // Admin + Owner
    Route::middleware('role:admin,owner')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboard::class, 'index']);

        // Schedules
        Route::get('/schedules',               [AdminSchedule::class, 'index']);
        Route::post('/schedules',              [AdminSchedule::class, 'store']);
        Route::put('/schedules/{id}',          [AdminSchedule::class, 'update']);
        Route::patch('/schedules/{id}/cancel', [AdminSchedule::class, 'cancel']);
        Route::delete('/schedules/{id}',       [AdminSchedule::class, 'destroy']);

        // Bookings
        Route::get('/bookings',                [AdminBooking::class, 'index']);
        Route::patch('/bookings/{id}/confirm', [AdminBooking::class, 'confirm']);
        Route::patch('/bookings/{id}/cancel',  [AdminBooking::class, 'cancel']);

        // Members
        Route::get('/members',               [AdminMember::class, 'index']);
        Route::get('/members/{id}',          [AdminMember::class, 'show']);
        Route::patch('/members/{id}/toggle', [AdminMember::class, 'toggle']);

        // Classes
        Route::get('/classes',               [AdminClass::class, 'index']);
        Route::post('/classes',              [AdminClass::class, 'store']);
        Route::get('/classes/{id}',          [AdminClass::class, 'show']);
        Route::put('/classes/{id}',          [AdminClass::class, 'update']);
        Route::delete('/classes/{id}',       [AdminClass::class, 'destroy']);
        Route::patch('/classes/{id}/toggle', [AdminClass::class, 'toggleActive']);

        // Packages
        Route::get('/packages',          [AdminPackage::class, 'index']);
        Route::post('/packages',         [AdminPackage::class, 'store']);
        Route::put('/packages/{id}',     [AdminPackage::class, 'update']);
        Route::delete('/packages/{id}',  [AdminPackage::class, 'destroy']);

        // Instructors
        Route::get('/instructors',                      [AdminInstructor::class, 'index']);
        Route::post('/instructors',                     [AdminInstructor::class, 'store']);
        Route::get('/instructors/{id}',                 [AdminInstructor::class, 'show']);
        Route::put('/instructors/{id}',                 [AdminInstructor::class, 'update']);
        Route::patch('/instructors/{id}/toggle',        [AdminInstructor::class, 'toggle']);
        Route::post('/instructors/{id}/reset-password', [AdminInstructor::class, 'resetPassword']);

        // CMS
        Route::prefix('cms')->group(function () {
            Route::get('/banners',              [AdminCms::class, 'bannerIndex']);
            Route::post('/banners',             [AdminCms::class, 'bannerStore']);
            Route::put('/banners/{id}',         [AdminCms::class, 'bannerUpdate']);
            Route::delete('/banners/{id}',      [AdminCms::class, 'bannerDestroy']);

            Route::get('/testimonials',         [AdminCms::class, 'testimonialIndex']);
            Route::post('/testimonials',        [AdminCms::class, 'testimonialStore']);
            Route::put('/testimonials/{id}',    [AdminCms::class, 'testimonialUpdate']);
            Route::delete('/testimonials/{id}', [AdminCms::class, 'testimonialDestroy']);

            Route::get('/faqs',                 [AdminCms::class, 'faqIndex']);
            Route::post('/faqs',                [AdminCms::class, 'faqStore']);
            Route::put('/faqs/{id}',            [AdminCms::class, 'faqUpdate']);
            Route::delete('/faqs/{id}',         [AdminCms::class, 'faqDestroy']);

            Route::get('/gallery',              [AdminCms::class, 'galleryIndex']);
            Route::post('/gallery',             [AdminCms::class, 'galleryStore']);
            Route::delete('/gallery/{id}',      [AdminCms::class, 'galleryDestroy']);

            Route::get('/settings',             [AdminCms::class, 'settingsIndex']);
            Route::post('/settings',            [AdminCms::class, 'settingsUpdate']);
        });
    });

    // Owner only
    Route::middleware('role:owner')->prefix('owner')->group(function () {
        Route::get('/dashboard',              [OwnerDashboard::class, 'index']);
        Route::get('/finance',                [OwnerFinance::class, 'index']);
        Route::get('/finance/compare',        [OwnerFinance::class, 'compare']);
        Route::get('/admins',                 [OwnerUser::class, 'admins']);
        Route::post('/admins',                [OwnerUser::class, 'storeAdmin']);
        Route::put('/admins/{id}',            [OwnerUser::class, 'updateAdmin']);
        Route::delete('/admins/{id}',         [OwnerUser::class, 'destroyAdmin']);
        Route::patch('/admins/{id}/toggle',   [OwnerUser::class, 'toggleUser']);
        Route::patch('/users/{id}/toggle',    [OwnerUser::class, 'toggleUser']);
        Route::get('/members',                [OwnerUser::class, 'allMembers']);
        Route::patch('/members/{id}/toggle',  [OwnerUser::class, 'toggleUser']);
        Route::get('/vouchers',               [OwnerVoucher::class, 'index']);
        Route::post('/vouchers',              [OwnerVoucher::class, 'store']);
        Route::put('/vouchers/{id}',          [OwnerVoucher::class, 'update']);
        Route::patch('/vouchers/{id}/toggle', [OwnerVoucher::class, 'toggle']);
        Route::delete('/vouchers/{id}',       [OwnerVoucher::class, 'destroy']);
        Route::get('/notification-logs',      [OwnerLog::class, 'notificationLogs']);
        Route::get('/audit-trail',            [OwnerLog::class, 'auditTrail']);
    });

    // Instructor
    Route::middleware('role:instructor')->prefix('instructor')->group(function () {
        Route::get('/dashboard',                [InstrDashboard::class, 'index']);
        Route::get('/schedule',                 [InstrSchedule::class, 'index']);
        Route::get('/schedule/{id}',            [InstrSchedule::class, 'show']);
        Route::post('/attendance/{scheduleId}', [InstrAttendance::class, 'store']);
        Route::get('/attendance/{scheduleId}',  [InstrAttendance::class, 'show']);
    });
});

Route::get('/test-fonnte', function () {
    $fonnte = new \App\Services\Notification\FonnteService();
    $result = $fonnte->send('087760051619', 'Test notifikasi dari Strive Pilates Bali 🧘‍♀️');
    return response()->json(['sent' => $result]);
});
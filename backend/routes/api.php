<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\JobCardController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\DailyClosingController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\Api\POSController;
use App\Http\Controllers\Api\ProductController;

/*
|--------------------------------------------------------------------------
| API Routes — PerfectService Auto POS
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api (from bootstrap config).
| Authentication uses Laravel Sanctum token-based auth.
|
*/

// ── Public Auth ────────────────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);

// ── Authenticated Routes ───────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Global Search
    Route::get('/search', [SearchController::class, 'search']);

    // Vehicles
    Route::get('/vehicle-makes', [VehicleController::class, 'index']);
    Route::get('/vehicle-makes/{vehicleMake}/models', [VehicleController::class, 'models']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Services (read by all, manage by manager)
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/categories', [ServiceController::class, 'categories']);
    Route::get('/services/{service}', [ServiceController::class, 'show']);
    Route::middleware('role:manager')->group(function () {
        Route::post('/services', [ServiceController::class, 'store']);
        Route::put('/services/{service}', [ServiceController::class, 'update']);
        Route::delete('/services/{service}', [ServiceController::class, 'destroy']);
    });

    // Job Cards
    Route::get('/job-cards', [JobCardController::class, 'index']);
    Route::get('/job-cards/invoiceable', [JobCardController::class, 'invoiceable']);
    Route::get('/job-cards/{jobCard}', [JobCardController::class, 'show']);
    Route::get('/job-cards/{jobCard}/pdf', [JobCardController::class, 'downloadPdf']);
    Route::middleware('role:service_advisor,manager')->group(function () {
        Route::post('/job-cards', [JobCardController::class, 'store']);
        Route::put('/job-cards/{jobCard}', [JobCardController::class, 'update']);
        Route::patch('/job-cards/{jobCard}/status', [JobCardController::class, 'updateStatus']);

    });
    Route::post('/job-cards/{jobCard}/feedback', [JobCardController::class, 'addFeedback'])
        ->middleware('role:manager');

    // Invoices
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::get('/invoices/{invoice}', [InvoiceController::class, 'show']);
    Route::get('/invoices/{invoice}/pdf', [InvoiceController::class, 'downloadPdf']);
    Route::get('/invoices/{invoice}/receipt-pdf', [InvoiceController::class, 'downloadReceiptPdf']);
    Route::get('/invoices/{invoice}/receipt', [InvoiceController::class, 'receipt']);
    Route::middleware('role:cash_officer,manager')->group(function () {
        Route::post('/invoices', [InvoiceController::class, 'store']);
        Route::post('/invoices/{invoice}/payments', [InvoiceController::class, 'recordPayment']);
    });
    Route::middleware('role:manager')->group(function () {
        Route::post('/invoices/{invoice}/void', [InvoiceController::class, 'void']);
        Route::post('/invoices/{invoice}/discount', [InvoiceController::class, 'applyDiscount']);
    });

    // Daily Closings
    Route::get('/daily-closings', [DailyClosingController::class, 'index']);
    Route::get('/daily-closings/{dailyClosing}', [DailyClosingController::class, 'show']);
    Route::middleware('role:cash_officer,manager')->group(function () {
        Route::post('/daily-closings', [DailyClosingController::class, 'store']);
        Route::post('/daily-closings/{dailyClosing}/finalize', [DailyClosingController::class, 'finalize']);
    });
    Route::post('/daily-closings/{dailyClosing}/resolve', [DailyClosingController::class, 'resolve'])
        ->middleware('role:manager');

    // Audit Logs (Manager only)
    Route::middleware('role:manager')->group(function () {
        Route::get('/audit-logs', [AuditLogController::class, 'index']);
        Route::get('/audit-logs/{auditLog}', [AuditLogController::class, 'show']);
        Route::get('/audit-logs/entity/{entityType}/{entityId}', [AuditLogController::class, 'forEntity']);
    });

    // Customers
    // Read: Manager, Service Advisor, Cash Officer
    Route::middleware('role:manager,service_advisor,cash_officer')->group(function () {
        Route::get('/customers', [CustomerController::class, 'index']);
        Route::get('/customers/{customer}', [CustomerController::class, 'show']);
    });
    // Write: Manager, Service Advisor
    Route::middleware('role:manager,service_advisor')->group(function () {
        Route::post('/customers', [CustomerController::class, 'store']);
        Route::put('/customers/{customer}', [CustomerController::class, 'update']);
        // Delete: Manager only
    });
    Route::middleware('role:manager')->group(function () {
        Route::delete('/customers/{customer}', [CustomerController::class, 'destroy']);
    });

    // Settings
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::put('/settings', [SettingsController::class, 'update'])
        ->middleware('role:manager');
    Route::post('/settings/logo', [SettingsController::class, 'uploadLogo'])
        ->middleware('role:manager');

    // POS — retail store (all staff except technician)
    Route::middleware('role:manager,cash_officer,service_advisor')->group(function () {
        Route::post('/pos/checkout', [POSController::class, 'checkout']);
        Route::get('/pos/sales', [POSController::class, 'sales']);
        Route::get('/pos/summary', [POSController::class, 'todaySummary']);
    });

    // Products — read by all staff, manage by manager
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/categories', [ProductController::class, 'categories']);
    Route::middleware('role:manager')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    });

    // Staff Management (Manager only)
    Route::middleware('role:manager')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/roles', [UserController::class, 'roles']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
    });
});

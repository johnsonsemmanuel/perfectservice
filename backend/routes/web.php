<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Redirect root to login or dashboard
Route::get('/', function () {
    return redirect()->route('login');
});

// Auth routes (served by Inertia)
Route::get('/login', function () {
    return Inertia::render('Auth/Login');
})->name('login')->middleware('guest');

// Web login — session based for Inertia pages
Route::post('/web-login', function (\Illuminate\Http\Request $request) {
    $credentials = $request->validate([
        'email'    => 'required|email',
        'password' => 'required|string',
    ]);

    $user = \App\Models\User::where('email', $credentials['email'])->first();

    if (!$user || !\Illuminate\Support\Facades\Hash::check($credentials['password'], $user->password)) {
        return back()->withErrors(['email' => 'Invalid credentials.']);
    }

    if (!$user->is_active) {
        return back()->withErrors(['email' => 'Account is deactivated.']);
    }

    \Illuminate\Support\Facades\Auth::login($user);
    $request->session()->regenerate();

    return redirect()->intended('/dashboard');
})->name('web-login')->middleware('guest');

// Web logout
Route::post('/web-logout', function (\Illuminate\Http\Request $request) {
    \Illuminate\Support\Facades\Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return redirect('/login');
})->name('web-logout')->middleware('auth');

// All dashboard routes — session auth for Inertia (same-domain)
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard/Index');
    })->name('dashboard');

    Route::get('/dashboard/job-cards', function () {
        return Inertia::render('Dashboard/JobCards/Index');
    })->name('job-cards.index');

    // IMPORTANT: /create must come before /{id}
    Route::get('/dashboard/job-cards/create', function () {
        return Inertia::render('Dashboard/JobCards/Create');
    })->name('job-cards.create');

    Route::get('/dashboard/job-cards/{id}', function ($id) {
        return Inertia::render('Dashboard/JobCards/Show', ['id' => $id]);
    })->name('job-cards.show');

    Route::get('/dashboard/customers', function () {
        return Inertia::render('Dashboard/Customers/Index');
    })->name('customers.index');

    Route::get('/dashboard/invoices', function () {
        return Inertia::render('Dashboard/Invoices/Index');
    })->name('invoices.index');

    Route::get('/dashboard/invoices/create', function () {
        return Inertia::render('Dashboard/Invoices/Create');
    })->name('invoices.create');

    Route::get('/dashboard/invoices/{id}', function ($id) {
        return Inertia::render('Dashboard/Invoices/Show', ['id' => $id]);
    })->name('invoices.show');

    Route::get('/dashboard/services', function () {
        return Inertia::render('Dashboard/Services/Index');
    })->name('services.index');

    Route::get('/dashboard/daily-closing', function () {
        return Inertia::render('Dashboard/DailyClosing/Index');
    })->name('daily-closing.index');

    Route::get('/dashboard/audit-logs', function () {
        return Inertia::render('Dashboard/AuditLogs/Index');
    })->name('audit-logs.index');

    Route::get('/dashboard/staff', function () {
        return Inertia::render('Dashboard/Staff/Index');
    })->name('staff.index');

    Route::get('/dashboard/settings', function () {
        return Inertia::render('Dashboard/Settings/Index');
    })->name('settings.index');

    // POS — direct sale terminal
    Route::get('/dashboard/pos', function () {
        return Inertia::render('Dashboard/POS/Index');
    })->name('pos.index');
});

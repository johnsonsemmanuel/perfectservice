<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\JobCard;
use App\Models\Payment;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $user = Auth::user();
        $role = $user->role?->name;

        if ($role === 'service_advisor') {
            return $this->serviceAdvisorStats();
        }

        if ($role === 'cash_officer') {
            return $this->cashOfficerStats();
        }

        if ($role === 'technician') {
            return $this->technicianStats();
        }

        // Default to Manager/Admin stats
        return $this->managerStats();
    }

    private function technicianStats(): JsonResponse
    {
        $today = today();
        $user = Auth::user();

        // Jobs assigned to this technician
        $myJobsQuery = JobCard::where('technician', $user->name);

        return response()->json([
            'role' => 'technician',
            'counts' => [
                'active_jobs' => (clone $myJobsQuery)->whereIn('status', ['open', 'in_progress'])->count(),
                'completed_today' => (clone $myJobsQuery)->where('status', 'completed')->whereDate('updated_at', $today)->count(),
                'total_completed' => (clone $myJobsQuery)->where('status', 'completed')->count(),
            ],
            'recent_job_cards' => (clone $myJobsQuery)
                ->whereIn('status', ['open', 'in_progress'])
                ->with(['items.service', 'customer', 'vehicleType'])
                ->orderByDesc('created_at')
                ->get(),
        ]);
    }

    private function serviceAdvisorStats(): JsonResponse
    {
        $today = today();
        $userId = Auth::id();

        return response()->json([
            'role' => 'service_advisor',
            'counts' => [
                'today_jobs' => JobCard::whereDate('created_at', $today)->count(),
                'in_progress' => JobCard::where('status', 'in_progress')->count(),
                'completed_pending_invoice' => JobCard::where('status', 'completed')->doesntHave('invoice')->count(),
                'my_active_jobs' => JobCard::where('technician', Auth::user()->name)->whereIn('status', ['open', 'in_progress'])->count(),
            ],
            'recent_job_cards' => JobCard::with('creator')
                ->orderByDesc('created_at')
                ->limit(10)
                ->get(),
        ]);
    }

    private function cashOfficerStats(): JsonResponse
    {
        $today = today();

        $todayCash = Payment::whereDate('created_at', $today)->cash()->sum('amount');
        $todayMomo = Payment::whereDate('created_at', $today)->momo()->sum('amount');

        return response()->json([
            'role' => 'cash_officer',
            'today' => [
                'revenue' => (float) ($todayCash + $todayMomo),
                'cash' => (float) $todayCash,
                'momo' => (float) $todayMomo,
                'invoices_count' => Invoice::whereDate('created_at', $today)->count(),
            ],
            'pending_payments' => Invoice::unpaid()->count(),
            'recent_invoices' => Invoice::with(['jobCard', 'creator'])
                ->orderByDesc('created_at')
                ->limit(10)
                ->get(),
        ]);
    }

    private function managerStats(): JsonResponse
    {
        $today = today();
        $monthStart = now()->startOfMonth();

        // Today's stats
        $todayCash = Payment::whereDate('created_at', $today)->cash()->sum('amount');
        $todayMomo = Payment::whereDate('created_at', $today)->momo()->sum('amount');
        $todayRevenue = $todayCash + $todayMomo;
        $todayInvoices = Invoice::whereDate('created_at', $today)->active()->count();
        $todayJobCards = JobCard::whereDate('created_at', $today)->count();

        // Monthly stats
        $monthRevenue = Payment::where('created_at', '>=', $monthStart)->sum('amount');
        $monthInvoices = Invoice::where('created_at', '>=', $monthStart)->active()->count();
        $monthJobCards = JobCard::where('created_at', '>=', $monthStart)->count();

        // Outstanding
        $outstandingBalance = Invoice::unpaid()->sum('balance_due');
        $openJobCards = JobCard::whereNotIn('status', ['invoiced', 'cancelled'])->count();

        // Recent activity
        $recentInvoices = Invoice::with(['jobCard', 'creator'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        $recentJobCards = JobCard::with('creator')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        // Critical audit items
        $criticalAlerts = [];
        if (Auth::user()->isManager()) {
            $criticalAlerts = AuditLog::critical()
                ->with('user')
                ->orderByDesc('created_at')
                ->limit(5)
                ->get();
        }

        // Revenue chart data (last 7 days)
        $revenueChart = collect(range(6, 0))->map(function ($daysAgo) {
            $date = today()->subDays($daysAgo);
            $cash = Payment::whereDate('created_at', $date)->cash()->sum('amount');
            $momo = Payment::whereDate('created_at', $date)->momo()->sum('amount');
            return [
                'date' => $date->format('M d'),
                'cash' => (float) $cash,
                'momo' => (float) $momo,
                'total' => (float) ($cash + $momo),
            ];
        })->values();

        return response()->json([
            'role' => 'manager',
            'today' => [
                'revenue' => (float) $todayRevenue,
                'cash' => (float) $todayCash,
                'momo' => (float) $todayMomo,
                'invoices' => $todayInvoices,
                'job_cards' => $todayJobCards,
            ],
            'month' => [
                'revenue' => (float) $monthRevenue,
                'invoices' => $monthInvoices,
                'job_cards' => $monthJobCards,
            ],
            'outstanding' => [
                'balance' => (float) $outstandingBalance,
                'open_job_cards' => $openJobCards,
            ],
            'recent_invoices' => $recentInvoices,
            'recent_job_cards' => $recentJobCards,
            'critical_alerts' => $criticalAlerts,
            'revenue_chart' => $revenueChart,
        ]);
    }
}

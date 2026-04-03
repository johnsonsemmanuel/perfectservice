<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\JobCard;
use App\Models\Payment;
use App\Models\PosSale;
use App\Models\Product;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $role = Auth::user()->role?->name;

        return match ($role) {
            'service_advisor' => $this->serviceAdvisorStats(),
            'cash_officer'    => $this->cashOfficerStats(),
            'technician'      => $this->technicianStats(),
            default           => $this->managerStats($request),
        };
    }

    // ── Technician ────────────────────────────────────────────────────────────
    private function technicianStats(): JsonResponse
    {
        $user = Auth::user();
        $today = today();
        $q = JobCard::where('technician', $user->name);

        return response()->json([
            'role' => 'technician',
            'counts' => [
                'active_jobs'      => (clone $q)->whereIn('status', ['open', 'in_progress'])->count(),
                'completed_today'  => (clone $q)->where('status', 'completed')->whereDate('updated_at', $today)->count(),
                'total_completed'  => (clone $q)->where('status', 'completed')->count(),
            ],
            'recent_job_cards' => (clone $q)
                ->whereIn('status', ['open', 'in_progress'])
                ->with(['items.service', 'customer'])
                ->orderByDesc('created_at')
                ->get(),
        ]);
    }

    // ── Service Advisor ───────────────────────────────────────────────────────
    private function serviceAdvisorStats(): JsonResponse
    {
        $today = today();

        return response()->json([
            'role' => 'service_advisor',
            'counts' => [
                'today_jobs'                 => JobCard::whereDate('created_at', $today)->count(),
                'in_progress'                => JobCard::where('status', 'in_progress')->count(),
                'completed_pending_invoice'  => JobCard::where('status', 'completed')->doesntHave('invoice')->count(),
                'my_active_jobs'             => JobCard::where('technician', Auth::user()->name)
                                                    ->whereIn('status', ['open', 'in_progress'])->count(),
            ],
            'recent_job_cards' => JobCard::with('creator')
                ->orderByDesc('created_at')
                ->limit(10)
                ->get(),
        ]);
    }

    // ── Cash Officer ──────────────────────────────────────────────────────────
    private function cashOfficerStats(): JsonResponse
    {
        $today = today();

        $todayCash = Payment::whereDate('created_at', $today)->cash()->sum('amount');
        $todayMomo = Payment::whereDate('created_at', $today)->momo()->sum('amount');
        $posCash   = PosSale::whereDate('created_at', $today)->where('status', 'completed')->sum('total');

        return response()->json([
            'role' => 'cash_officer',
            'today' => [
                'revenue'        => (float) ($todayCash + $todayMomo + $posCash),
                'cash'           => (float) ($todayCash + $posCash),   // service cash + POS cash
                'service_cash'   => (float) $todayCash,
                'pos_cash'       => (float) $posCash,
                'momo'           => (float) $todayMomo,
                'invoices_count' => Invoice::whereDate('created_at', $today)->count(),
                'pos_sales'      => PosSale::whereDate('created_at', $today)->where('status', 'completed')->count(),
            ],
            'pending_payments' => Invoice::unpaid()->count(),
            'recent_invoices'  => Invoice::with(['jobCard', 'creator'])
                ->orderByDesc('created_at')
                ->limit(10)
                ->get(),
        ]);
    }

    // ── Manager ───────────────────────────────────────────────────────────────
    private function managerStats(Request $request): JsonResponse
    {
        $today      = today();
        $monthStart = now()->startOfMonth();

        // Revenue range for chart (default 7 days, supports ?range=30)
        $chartDays = in_array((int) $request->range, [7, 30]) ? (int) $request->range : 7;

        // Service revenue
        $todayCash = Payment::whereDate('created_at', $today)->cash()->sum('amount');
        $todayMomo = Payment::whereDate('created_at', $today)->momo()->sum('amount');

        // POS retail revenue
        $todayPos  = PosSale::whereDate('created_at', $today)->where('status', 'completed')->sum('total');

        $todayRevenue = $todayCash + $todayMomo + $todayPos;

        // Month totals
        $monthServiceRevenue = Payment::where('created_at', '>=', $monthStart)->sum('amount');
        $monthPosRevenue     = PosSale::where('created_at', '>=', $monthStart)->where('status', 'completed')->sum('total');
        $monthRevenue        = $monthServiceRevenue + $monthPosRevenue;

        // Outstanding
        $outstandingBalance = Invoice::unpaid()->sum('balance_due');
        $openJobCards       = JobCard::whereNotIn('status', ['invoiced', 'cancelled'])->count();

        // Low stock products
        $lowStockProducts = Product::where('is_active', true)
            ->whereRaw('stock <= low_stock_alert')
            ->orderBy('stock')
            ->limit(5)
            ->get(['id', 'name', 'stock', 'low_stock_alert']);

        // Staff performance (this month)
        $techPerformance = JobCard::where('created_at', '>=', $monthStart)
            ->where('status', 'completed')
            ->whereNotNull('technician')
            ->select('technician', DB::raw('COUNT(*) as jobs_completed'))
            ->groupBy('technician')
            ->orderByDesc('jobs_completed')
            ->limit(5)
            ->get();

        $advisorPerformance = JobCard::where('created_at', '>=', $monthStart)
            ->whereNotNull('created_by')
            ->select('created_by', DB::raw('COUNT(*) as jobs_created'))
            ->groupBy('created_by')
            ->orderByDesc('jobs_created')
            ->limit(5)
            ->with('creator:id,name')
            ->get()
            ->map(fn($j) => ['name' => $j->creator?->name ?? 'Unknown', 'jobs_created' => $j->jobs_created]);

        // Critical alerts
        $criticalAlerts = AuditLog::critical()
            ->with('user')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        // Revenue chart (service + POS combined per day)
        $revenueChart = collect(range($chartDays - 1, 0))->map(function ($daysAgo) {
            $date    = today()->subDays($daysAgo);
            $cash    = Payment::whereDate('created_at', $date)->cash()->sum('amount');
            $momo    = Payment::whereDate('created_at', $date)->momo()->sum('amount');
            $pos     = PosSale::whereDate('created_at', $date)->where('status', 'completed')->sum('total');
            return [
                'date'    => $date->format('M d'),
                'service' => (float) ($cash + $momo),
                'pos'     => (float) $pos,
                'total'   => (float) ($cash + $momo + $pos),
            ];
        })->values();

        // Service breakdown
        $serviceBreakdown = DB::table('payments')
            ->join('invoices', 'payments.invoice_id', '=', 'invoices.id')
            ->join('invoice_items', 'invoice_items.invoice_id', '=', 'invoices.id')
            ->join('services', 'invoice_items.service_id', '=', 'services.id')
            ->where('payments.created_at', '>=', $monthStart)
            ->whereNull('payments.deleted_at')
            ->select('services.category as name', DB::raw('SUM(invoice_items.line_total) as value'))
            ->groupBy('services.category')
            ->get()
            ->toArray();

        return response()->json([
            'role' => 'manager',
            'today' => [
                'revenue'         => (float) $todayRevenue,
                'service_revenue' => (float) ($todayCash + $todayMomo),
                'pos_revenue'     => (float) $todayPos,
                'cash'            => (float) ($todayCash + $todayPos),
                'momo'            => (float) $todayMomo,
                'invoices'        => Invoice::whereDate('created_at', $today)->active()->count(),
                'job_cards'       => JobCard::whereDate('created_at', $today)->count(),
                'pos_sales'       => PosSale::whereDate('created_at', $today)->where('status', 'completed')->count(),
            ],
            'month' => [
                'revenue'         => (float) $monthRevenue,
                'service_revenue' => (float) $monthServiceRevenue,
                'pos_revenue'     => (float) $monthPosRevenue,
                'invoices'        => Invoice::where('created_at', '>=', $monthStart)->active()->count(),
                'job_cards'       => JobCard::where('created_at', '>=', $monthStart)->count(),
            ],
            'outstanding' => [
                'balance'       => (float) $outstandingBalance,
                'open_job_cards'=> $openJobCards,
            ],
            'low_stock'          => $lowStockProducts,
            'tech_performance'   => $techPerformance,
            'advisor_performance'=> $advisorPerformance,
            'recent_invoices'    => Invoice::with(['jobCard', 'creator'])->orderByDesc('created_at')->limit(5)->get(),
            'recent_job_cards'   => JobCard::with('creator')->orderByDesc('created_at')->limit(5)->get(),
            'critical_alerts'    => $criticalAlerts,
            'revenue_chart'      => $revenueChart,
            'service_breakdown'  => $serviceBreakdown,
            'chart_days'         => $chartDays,
        ]);
    }
}

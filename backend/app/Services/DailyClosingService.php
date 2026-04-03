<?php

namespace App\Services;

use App\Models\DailyClosing;
use App\Models\Payment;
use App\Models\Invoice;
use App\Models\JobCard;
use App\Models\PosSale;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class DailyClosingService
{
    public function __construct(
        private AuditService $auditService,
    ) {}

    public function generateClosing(\DateTimeInterface $date): DailyClosing
    {
        $dateStr = $date->format('Y-m-d');

        $existing = DailyClosing::where('closing_date', $dateStr)->first();
        if ($existing && $existing->status === 'closed') {
            throw new \InvalidArgumentException("Daily closing for {$dateStr} is already finalized.");
        }

        return DB::transaction(function () use ($dateStr, $existing) {
            // Service invoice payments
            $cashTotal = Payment::whereDate('created_at', $dateStr)->cash()->sum('amount');
            $momoTotal = Payment::whereDate('created_at', $dateStr)->momo()->sum('amount');

            // POS retail sales (cash only)
            $posCashTotal = PosSale::whereDate('created_at', $dateStr)
                ->where('status', 'completed')
                ->sum('total');

            $expectedTotal = $cashTotal + $momoTotal + $posCashTotal;

            $totalInvoices  = Invoice::whereDate('created_at', $dateStr)->active()->count();
            $totalJobCards  = JobCard::whereDate('created_at', $dateStr)->count();
            $totalPosSales  = PosSale::whereDate('created_at', $dateStr)->where('status', 'completed')->count();

            // Service breakdown
            $serviceBreakdown = DB::table('payments')
                ->join('invoices', 'payments.invoice_id', '=', 'invoices.id')
                ->join('invoice_items', 'invoice_items.invoice_id', '=', 'invoices.id')
                ->join('services', 'invoice_items.service_id', '=', 'services.id')
                ->whereDate('payments.created_at', $dateStr)
                ->whereNull('payments.deleted_at')
                ->select('services.category', DB::raw('SUM(invoice_items.line_total) as total'))
                ->groupBy('services.category')
                ->pluck('total', 'category')
                ->toArray();

            $data = [
                'closing_date'    => $dateStr,
                'cash_total'      => $cashTotal + $posCashTotal, // combined cash
                'momo_total'      => $momoTotal,
                'expected_total'  => $expectedTotal,
                'total_invoices'  => $totalInvoices,
                'total_job_cards' => $totalJobCards,
                'service_breakdown' => array_merge($serviceBreakdown, [
                    'POS Retail' => (float) $posCashTotal,
                    '_pos_transactions' => $totalPosSales,
                ]),
                'status' => 'open',
            ];

            if ($existing) {
                $existing->update($data);
                return $existing->fresh();
            }

            return DailyClosing::create($data);
        });
    }

    public function finalize(DailyClosing $closing, float $actualCash, float $actualMomo, ?string $notes = null): DailyClosing
    {
        if ($closing->status === 'closed') {
            throw new \InvalidArgumentException('This daily closing is already finalized.');
        }

        return DB::transaction(function () use ($closing, $actualCash, $actualMomo, $notes) {
            $actualTotal = $actualCash + $actualMomo;
            $discrepancy = $actualTotal - (float) $closing->expected_total;
            $hasDiscrepancy = abs($discrepancy) > 0.01;

            $status    = $hasDiscrepancy ? 'flagged' : 'closed';
            $flagReason = $hasDiscrepancy ? sprintf(
                'Discrepancy of GH₵%.2f detected. Expected: GH₵%.2f, Actual: GH₵%.2f',
                $discrepancy, (float) $closing->expected_total, $actualTotal
            ) : null;

            $closing->update([
                'actual_cash'  => $actualCash,
                'actual_momo'  => $actualMomo,
                'discrepancy'  => $discrepancy,
                'status'       => $status,
                'flag_reason'  => $flagReason,
                'notes'        => $notes,
                'closed_by'    => Auth::id(),
                'closed_at'    => now(),
            ]);

            $this->auditService->log(
                AuditLog::ACTION_DAILY_CLOSING, 'daily_closing', $closing->id,
                ['status' => 'open'],
                ['status' => $status, 'expected' => (float) $closing->expected_total, 'actual' => $actualTotal, 'discrepancy' => $discrepancy],
                $flagReason,
                $hasDiscrepancy ? 'warning' : 'info'
            );

            return $closing->fresh();
        });
    }

    public function resolve(DailyClosing $closing, string $resolution): DailyClosing
    {
        if ($closing->status !== 'flagged') {
            throw new \InvalidArgumentException('Only flagged closings can be resolved.');
        }

        $closing->update([
            'status' => 'closed',
            'notes'  => ($closing->notes ? $closing->notes . "\n\n" : '') . "Resolution: " . $resolution,
        ]);

        $this->auditService->log(
            AuditLog::ACTION_DAILY_CLOSING, 'daily_closing', $closing->id,
            ['status' => 'flagged'], ['status' => 'closed', 'resolution' => $resolution], $resolution
        );

        return $closing->fresh();
    }
}

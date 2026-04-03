<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\JobCard;
use App\Models\AuditLog;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

/**
 * SECURITY: Invoice creation REQUIRES a job_card_id.
 * All financial operations wrapped in DB transactions.
 * No ghost invoices — every invoice traces back to a real job card.
 */
class InvoiceService
{
    public function __construct(
        private AuditService $auditService,
    ) {
    }

    /**
     * Create an invoice from a completed job card.
     * HARD REQUIREMENT: job_card_id must exist and be in 'completed' status.
     *
     * @throws \InvalidArgumentException if job card requirements not met
     */
    public function createFromJobCard(int $jobCardId): Invoice
    {
        $jobCard = JobCard::with('items.service')->find($jobCardId);

        if (!$jobCard) {
            throw new \InvalidArgumentException('Job card not found.');
        }

        if (!$jobCard->canBeInvoiced()) {
            throw new \InvalidArgumentException(
                "Job card '{$jobCard->job_number}' cannot be invoiced. " .
                "Current status: {$jobCard->status}. Required: completed."
            );
        }

        if ($jobCard->items->isEmpty()) {
            throw new \InvalidArgumentException(
                "Job card '{$jobCard->job_number}' has no service items."
            );
        }

        return DB::transaction(function () use ($jobCard) {
            $taxPercent = (float) SystemSetting::getValue('default_tax_percent', 0);

            // Calculate totals from job card items
            $subtotal = $jobCard->items->sum(function ($item) {
                return (float) $item->agreed_price * $item->quantity;
            });

            $taxAmount = $subtotal * ($taxPercent / 100);
            $total = $subtotal + $taxAmount;

            $invoice = Invoice::create([
                'invoice_number' => Invoice::generateInvoiceNumber(),
                'job_card_id' => $jobCard->id,
                'subtotal' => $subtotal,
                'discount_percent' => 0,
                'discount_amount' => 0,
                'tax_percent' => $taxPercent,
                'tax_amount' => $taxAmount,
                'total' => $total,
                'amount_paid' => 0,
                'balance_due' => $total,
                'status' => 'issued',
                'created_by' => Auth::id(),
                'issued_at' => now(),
            ]);

            // Copy job card items to invoice items
            foreach ($jobCard->items as $jcItem) {
                $invoice->items()->create([
                    'service_id' => $jcItem->service_id,
                    'description' => $jcItem->service->name,
                    'quantity' => $jcItem->quantity,
                    'unit_price' => $jcItem->agreed_price,
                ]);
            }

            // Mark job card as invoiced
            $jobCard->update(['status' => 'invoiced']);

            $this->auditService->log(
                AuditLog::ACTION_INVOICE_CREATED,
                'invoice',
                $invoice->id,
                null,
                [
                    'invoice_number' => $invoice->invoice_number,
                    'job_card' => $jobCard->job_number,
                    'subtotal' => $subtotal,
                    'total' => $total,
                    'items_count' => $jobCard->items->count(),
                ]
            );

            return $invoice->load('items.service', 'jobCard', 'creator');
        });
    }

    /**
     * Void an invoice. REQUIRES Manager role.
     *
     * @throws \InvalidArgumentException
     */
    public function voidInvoice(Invoice $invoice, string $reason): Invoice
    {
        if ($invoice->isVoided()) {
            throw new \InvalidArgumentException('Invoice is already voided.');
        }

        if (empty($reason)) {
            throw new \InvalidArgumentException('A reason is required to void an invoice.');
        }

        return DB::transaction(function () use ($invoice, $reason) {
            $oldStatus = $invoice->status;

            $invoice->update([
                'status' => 'void',
                'voided_by' => Auth::id(),
                'void_reason' => $reason,
                'voided_at' => now(),
            ]);

            // Revert job card status to completed so it can be re-invoiced
            if ($invoice->jobCard) {
                $invoice->jobCard->update(['status' => 'completed']);
            }

            $this->auditService->log(
                AuditLog::ACTION_INVOICE_VOIDED,
                'invoice',
                $invoice->id,
                ['status' => $oldStatus, 'total' => $invoice->total],
                ['status' => 'void', 'reason' => $reason],
                $reason,
                'critical'
            );

            return $invoice->fresh();
        });
    }
}

<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class PaymentService
{
    public function __construct(
        private AuditService $auditService,
    ) {
    }

    /**
     * Record a payment against an invoice.
     * Validates payment amount doesn't exceed outstanding balance.
     * Updates invoice status accordingly.
     */
    public function recordPayment(Invoice $invoice, array $data): Payment
    {
        if (!$invoice->canAcceptPayment()) {
            throw new \InvalidArgumentException(
                "Invoice '{$invoice->invoice_number}' cannot accept payments. " .
                "Status: {$invoice->status}."
            );
        }

        $amount = (float) $data['amount'];
        $balanceDue = (float) $invoice->balance_due;

        if ($amount <= 0) {
            throw new \InvalidArgumentException('Payment amount must be greater than zero.');
        }

        if ($amount > $balanceDue + 0.01) {
            throw new \InvalidArgumentException(
                "Payment amount (GH₵{$amount}) exceeds outstanding balance (GH₵{$balanceDue})."
            );
        }

        // For MoMo payments, reference is required
        if (($data['method'] ?? '') === 'momo' && empty($data['reference'])) {
            throw new \InvalidArgumentException('MoMo transaction reference is required.');
        }

        return DB::transaction(function () use ($invoice, $data, $amount) {
            $payment = Payment::create([
                'invoice_id' => $invoice->id,
                'amount' => $amount,
                'method' => $data['method'],
                'reference' => $data['reference'] ?? null,
                'momo_phone' => $data['momo_phone'] ?? null,
                'received_by' => Auth::id(),
                'notes' => $data['notes'] ?? null,
            ]);

            // Update invoice amounts
            $newAmountPaid = (float) $invoice->amount_paid + $amount;
            $newBalanceDue = (float) $invoice->total - $newAmountPaid;
            $newStatus = $newBalanceDue <= 0.01 ? 'paid' : 'partial';

            $invoice->update([
                'amount_paid' => $newAmountPaid,
                'balance_due' => max(0, $newBalanceDue),
                'status' => $newStatus,
                'paid_at' => $newStatus === 'paid' ? now() : null,
            ]);

            $this->auditService->log(
                AuditLog::ACTION_PAYMENT_RECEIVED,
                'payment',
                $payment->id,
                ['invoice_balance' => (float) $invoice->balance_due],
                [
                    'amount' => $amount,
                    'method' => $data['method'],
                    'new_balance' => max(0, $newBalanceDue),
                    'invoice_status' => $newStatus,
                ]
            );

            return $payment->load('invoice', 'receiver');
        });
    }
}

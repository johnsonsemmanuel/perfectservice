<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\AuditLog;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

/**
 * SECURITY: Discount & Override system.
 * - Default discount = 0%
 * - Max discount = 10% (system-locked setting)
 * - Requires Manager PIN verification
 * - All discounts are audit-logged
 */
class DiscountService
{
    public function __construct(
        private AuditService $auditService,
    ) {
    }

    /**
     * Apply a discount to an invoice.
     * REQUIRES: Manager PIN + Reason + Discount within max limit.
     *
     * @param Invoice $invoice
     * @param float $discountPercent
     * @param string $managerPin
     * @param string $reason
     * @param int|null $managerId If null, uses current authenticated user
     * @return Invoice
     */
    public function applyDiscount(
        Invoice $invoice,
        float $discountPercent,
        string $managerPin,
        string $reason,
        ?int $managerId = null
    ): Invoice {
        // Validate discount reason
        if (empty(trim($reason))) {
            throw new \InvalidArgumentException('A reason is required for applying a discount.');
        }

        // Get max allowed discount from system settings
        $maxDiscount = (float) SystemSetting::getValue('max_discount_percent', 10);

        if ($discountPercent <= 0) {
            throw new \InvalidArgumentException('Discount percentage must be greater than 0.');
        }

        if ($discountPercent > $maxDiscount) {
            $this->auditService->log(
                AuditLog::ACTION_DISCOUNT_REJECTED,
                'invoice',
                $invoice->id,
                null,
                [
                    'attempted_discount' => $discountPercent,
                    'max_allowed' => $maxDiscount,
                ],
                "Discount {$discountPercent}% exceeds maximum {$maxDiscount}%",
                'warning'
            );

            throw new \InvalidArgumentException(
                "Discount {$discountPercent}% exceeds the maximum allowed ({$maxDiscount}%)."
            );
        }

        // Verify manager credentials
        $manager = $managerId ? User::find($managerId) : Auth::user();

        if (!$manager || !$manager->isManager()) {
            $this->auditService->logUnauthorizedAttempt(
                'apply_discount',
                'invoice',
                $invoice->id
            );
            throw new \InvalidArgumentException('Only managers can authorize discounts.');
        }

        if (!$manager->verifyPin($managerPin)) {
            $this->auditService->log(
                AuditLog::ACTION_DISCOUNT_REJECTED,
                'invoice',
                $invoice->id,
                null,
                ['reason' => 'Invalid manager PIN'],
                'Failed PIN verification for discount',
                'critical'
            );
            throw new \InvalidArgumentException('Invalid manager PIN.');
        }

        // Verify invoice can accept discount
        if ($invoice->isVoided()) {
            throw new \InvalidArgumentException('Cannot apply discount to a voided invoice.');
        }

        return DB::transaction(function () use ($invoice, $discountPercent, $reason) {
            $oldDiscount = (float) $invoice->discount_percent;
            $subtotal = (float) $invoice->subtotal;

            $discountAmount = $subtotal * ($discountPercent / 100);
            $afterDiscount = $subtotal - $discountAmount;
            $taxAmount = $afterDiscount * ((float) $invoice->tax_percent / 100);
            $total = $afterDiscount + $taxAmount;
            $balanceDue = $total - (float) $invoice->amount_paid;

            $invoice->update([
                'discount_percent' => $discountPercent,
                'discount_amount' => $discountAmount,
                'tax_amount' => $taxAmount,
                'total' => $total,
                'balance_due' => max(0, $balanceDue),
                'status' => $balanceDue <= 0.01 ? 'paid' : $invoice->status,
            ]);

            $this->auditService->log(
                AuditLog::ACTION_DISCOUNT_APPLIED,
                'invoice',
                $invoice->id,
                [
                    'discount_percent' => $oldDiscount,
                    'total' => (float) $invoice->getOriginal('total'),
                ],
                [
                    'discount_percent' => $discountPercent,
                    'discount_amount' => $discountAmount,
                    'new_total' => $total,
                ],
                $reason,
                'warning'
            );

            return $invoice->fresh();
        });
    }
}

<?php

namespace App\Services;

use App\Models\Service;
use App\Models\AuditLog;
use App\Models\VehicleType;
use App\Models\User;
use App\Exceptions\PriceOutOfRangeException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

/**
 * SECURITY: Authoritative pricing validation engine.
 * ALL price checks MUST go through this service — never trust the frontend.
 * This is the single source of truth for pricing rules.
 */
class PricingValidationService
{
    public function __construct(
        private AuditService $auditService
    ) {
    }

    /**
     * Validate a price against a service's MIN–MAX range.
     * Supports vehicle-specific pricing and manager overrides.
     *
     * @throws PriceOutOfRangeException if price is outside allowed range and no valid override provided
     */
    public function validatePrice(
        Service $service,
        float $price,
        ?VehicleType $vehicleType = null,
        ?string $overridePin = null,
        ?string $overrideReason = null
    ): void {
        if (!$service->is_active) {
            throw new \InvalidArgumentException("Service '{$service->name}' is not active.");
        }

        // Determine pricing rules
        $minPrice = (float) $service->min_price;
        $maxPrice = (float) $service->max_price;
        $fixedPrice = $service->fixed_price ? (float) $service->fixed_price : null;
        $isFixed = $service->is_fixed;

        // Apply vehicle-specific rules if available
        if ($vehicleType) {
            $pricing = $service->pricing()->where('vehicle_type_id', $vehicleType->id)->first();
            if ($pricing) {
                $minPrice = (float) $pricing->min_price;
                $maxPrice = (float) $pricing->max_price;
                $fixedPrice = $pricing->fixed_price ? (float) $pricing->fixed_price : null;
                $isFixed = $pricing->is_fixed;
            }
        }

        $violation = null;

        // Check Fixed Price
        if ($isFixed) {
            if (abs($price - $fixedPrice) > 0.01) {
                $violation = "Fixed price mismatch. Expected: GH₵{$fixedPrice}, Attempted: GH₵{$price}.";
            }
        }
        // Check Range
        elseif ($price < $minPrice || $price > $maxPrice) {
            $violation = "Price GH₵{$price} is outside allowed range (GH₵{$minPrice} – GH₵{$maxPrice}).";
        }

        if ($violation) {
            // Check for valid override
            if ($this->verifyOverride($overridePin)) {
                $this->auditService->log(
                    AuditLog::ACTION_PRICE_OVERRIDE,
                    'service',
                    $service->id,
                    ['expected' => $isFixed ? $fixedPrice : "$minPrice - $maxPrice"],
                    ['actual' => $price, 'reason' => $overrideReason],
                    "Price override authorized: $violation",
                    'warning'
                );
                return; // Allow
            }

            // Log fatal violation
            $this->auditService->logPricingViolation('service', $service->id, [
                'service' => $service->name,
                'vehicle_type' => $vehicleType?->name ?? 'N/A',
                'attempted_price' => $price,
                'min' => $minPrice,
                'max' => $maxPrice,
                'fixed' => $fixedPrice,
                'violation' => $violation
            ]);

            throw new PriceOutOfRangeException(
                "{$violation} Manager approval required.",
                $service,
                $price
            );
        }
    }

    /**
     * Verify if a PIN belongs to any active Manager.
     * Rate-limited to 5 attempts per user per 15 minutes.
     */
    private function verifyOverride(?string $pin): bool
    {
        if (empty($pin))
            return false;

        $userId = Auth::id() ?? 'guest';
        $cacheKey = "pin_attempts_{$userId}";
        $attempts = (int) Cache::get($cacheKey, 0);

        if ($attempts >= 5) {
            throw new \RuntimeException('Too many PIN attempts. Please wait 15 minutes before trying again.');
        }

        $managers = User::whereHas('role', function ($q) {
            $q->where('name', 'manager');
        })->whereNotNull('pin')->get();

        foreach ($managers as $manager) {
            if ($manager->verifyPin($pin)) {
                // Reset on success
                Cache::forget($cacheKey);
                return true;
            }
        }

        // Increment failure count, expire after 15 minutes
        Cache::put($cacheKey, $attempts + 1, now()->addMinutes(15));
        return false;
    }

    /**
     * Validate multiple service-price pairs.
     */
    public function validateMultiple(array $items, ?VehicleType $vehicleType = null): array
    {
        $errors = [];

        foreach ($items as $index => $item) {
            $service = Service::find($item['service_id'] ?? null);

            if (!$service) {
                $errors[$index] = "Service not found.";
                continue;
            }

            try {
                $this->validatePrice(
                    $service,
                    (float) ($item['price'] ?? $item['agreed_price'] ?? 0),
                    $vehicleType,
                    $item['override_pin'] ?? null,
                    $item['override_reason'] ?? null
                );
            } catch (PriceOutOfRangeException $e) {
                $errors[$index] = $e->getMessage();
            }
        }

        return $errors;
    }
}

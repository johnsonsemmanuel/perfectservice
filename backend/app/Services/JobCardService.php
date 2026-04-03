<?php

namespace App\Services;

use App\Models\JobCard;
use App\Models\JobCardItem;
use App\Models\Service;
use App\Models\VehicleModel;
use App\Models\VehicleType;
use App\Models\AuditLog;
use App\Exceptions\PriceOutOfRangeException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class JobCardService
{
    public function __construct(
        private PricingValidationService $pricingService,
        private AuditService $auditService,
        private PdfService $pdfService
    ) {
    }

    /**
     * Create a new job card with validated service items.
     * All prices are validated against the pricing engine.
     *
     * @param array $data Job card data
     * @param array $items Array of [{service_id, agreed_price, quantity?, notes?}]
     * @return JobCard
     * @throws PriceOutOfRangeException
     */
    public function create(array $data, array $items): JobCard
    {
        // 1. Resolve Vehicle Type Context
        $vehicleTypeId = $data['vehicle_type_id'] ?? null;

        if (!$vehicleTypeId && !empty($data['vehicle_model'])) {
            $vehicleModel = VehicleModel::where('name', $data['vehicle_model'])->first();
            $vehicleTypeId = $vehicleModel?->vehicle_type_id;
        }

        $vehicleType = $vehicleTypeId ? VehicleType::find($vehicleTypeId) : null;

        // 2. Validate all service prices with context
        $errors = $this->pricingService->validateMultiple($items, $vehicleType);

        if (!empty($errors)) {
            throw new \InvalidArgumentException(
                'Pricing validation failed: ' . json_encode($errors)
            );
        }

        return DB::transaction(function () use ($data, $items, $vehicleTypeId) {
            // 3. Sync Customer Data
            $customerId = $data['customer_id'] ?? null;

            if (!$customerId) {
                // Try to find by phone (primary) or email
                $query = \App\Models\Customer::where('phone', $data['customer_phone']);
                if (!empty($data['customer_email'])) {
                    $query->orWhere('email', $data['customer_email']);
                }
                $existingCustomer = $query->first();

                if ($existingCustomer) {
                    $customerId = $existingCustomer->id;
                    // Optional: Update customer details if changed? 
                    // For now, we assume existing record is source of truth, 
                    // but we could update email/name if missing.
                } else {
                    // Create new customer
                    $newCustomer = \App\Models\Customer::create([
                        'name' => $data['customer_name'],
                        'phone' => $data['customer_phone'],
                        'email' => $data['customer_email'] ?? null,
                    ]);
                    $customerId = $newCustomer->id;
                }
            }

            $jobCard = JobCard::create([
                'job_number' => JobCard::generateJobNumber(),
                'vehicle_number' => $data['vehicle_number'],
                'vehicle_make' => $data['vehicle_make'] ?? null,
                'vehicle_model' => $data['vehicle_model'] ?? null,
                'vehicle_type_id' => $vehicleTypeId,
                'vehicle_year' => $data['vehicle_year'] ?? null,
                'vehicle_color' => $data['vehicle_color'] ?? null,
                'mileage' => $data['mileage'] ?? null,
                'customer_id' => $customerId, // Linked
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'customer_email' => $data['customer_email'] ?? null,
                'technician' => $data['technician'],
                'status' => 'open',
                'notes' => $data['notes'] ?? null,
                'diagnosis' => $data['diagnosis'] ?? null,
                'created_by' => Auth::id(),
            ]);

            foreach ($items as $item) {
                $jobCard->items()->create([
                    'service_id' => $item['service_id'],
                    'agreed_price' => $item['agreed_price'],
                    'quantity' => $item['quantity'] ?? 1,
                    'notes' => $item['notes'] ?? null,
                ]);
            }

            $this->auditService->log(
                AuditLog::ACTION_JOB_CARD_CREATED,
                'job_card',
                $jobCard->id,
                null,
                [
                    'job_number' => $jobCard->job_number,
                    'vehicle' => $jobCard->vehicle_number,
                    'items_count' => count($items),
                    'total' => $jobCard->fresh()->getTotal(),
                ]
            );

            return $jobCard->load('items.service', 'creator');
        });
    }

    /**
     * Update job card status with validation.
     */
    public function updateStatus(JobCard $jobCard, string $newStatus): JobCard
    {
        $validTransitions = [
            'open' => ['in_progress', 'cancelled'],
            'in_progress' => ['completed', 'cancelled'],
            'completed' => ['invoiced', 'in_progress'], // Added 'in_progress' to allow reopen
            'invoiced' => [],
            'cancelled' => [],
        ];

        $allowed = $validTransitions[$jobCard->status] ?? [];

        if (!in_array($newStatus, $allowed) && $jobCard->status !== $newStatus) {
            throw new \InvalidArgumentException(
                "Cannot transition from '{$jobCard->status}' to '{$newStatus}'."
            );
        }

        $oldStatus = $jobCard->status;

        $jobCard->update(['status' => $newStatus]);

        if ($newStatus === 'completed' && Auth::user()?->isManager()) {
            $jobCard->update([
                'approved_by' => Auth::id(),
                'approved_at' => now(),
            ]);
        }

        $this->auditService->log(
            AuditLog::ACTION_JOB_CARD_STATUS,
            'job_card',
            $jobCard->id,
            ['status' => $oldStatus],
            ['status' => $newStatus]
        );

        return $jobCard->fresh();
    }

    public function generatePdf(JobCard $jobCard)
    {
        return $this->pdfService->generateJobCard($jobCard);
    }
}

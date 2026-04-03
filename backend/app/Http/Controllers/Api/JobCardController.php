<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobCard;
use App\Services\JobCardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobCardController extends Controller
{
    public function __construct(
        private JobCardService $jobCardService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $query = JobCard::with(['items.service', 'creator', 'customer']);

        if ($request->has('status')) {
            $query->status($request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('job_number', 'like', "%{$search}%")
                    ->orWhere('vehicle_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        $jobCards = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        return response()->json($jobCards);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'vehicle_number' => 'required|string|max:20',
            'vehicle_make' => 'nullable|string|max:100',
            'vehicle_model' => 'nullable|string|max:100',
            'vehicle_type_id' => 'nullable|exists:vehicle_types,id',
            'vehicle_year' => 'nullable|string|max:4',
            'vehicle_color' => 'nullable|string|max:50',
            'mileage' => 'nullable|integer|min:0',
            'customer_id' => 'nullable|exists:customers,id',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_email' => 'nullable|email',
            'technician' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'diagnosis' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.service_id' => 'required|exists:services,id',
            'items.*.agreed_price' => 'required|numeric|min:0',
            'items.*.quantity' => 'nullable|integer|min:1',
            'items.*.notes' => 'nullable|string',
            'items.*.override_pin' => 'nullable|string',
            'items.*.override_reason' => 'nullable|string',
        ]);

        try {
            $jobCard = $this->jobCardService->create(
                $request->except('items'),
                $request->input('items')
            );

            return response()->json($jobCard, 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show(JobCard $jobCard): JsonResponse
    {
        $jobCard->load(['items.service', 'creator', 'approver', 'customer', 'vehicleType']);
        return response()->json($jobCard);
    }

    public function addFeedback(Request $request, JobCard $jobCard): JsonResponse
    {
        $request->validate([
            'feedback' => 'required|string|max:1000',
        ]);

        $jobCard->update([
            'manager_feedback' => $request->feedback,
        ]);

        return response()->json($jobCard);
    }


    public function update(Request $request, JobCard $jobCard): JsonResponse
    {
        if (in_array($jobCard->status, ['invoiced', 'cancelled'])) {
            return response()->json([
                'message' => 'Cannot edit a job card that is invoiced or cancelled.',
            ], 422);
        }

        $data = $request->validate([
            'vehicle_number' => 'sometimes|string|max:20',
            'vehicle_make' => 'nullable|string|max:100',
            'vehicle_model' => 'nullable|string|max:100',
            'vehicle_year' => 'nullable|string|max:4',
            'vehicle_color' => 'nullable|string|max:50',
            'mileage' => 'nullable|integer|min:0',
            'customer_name' => 'sometimes|string|max:255',
            'customer_phone' => 'sometimes|string|max:20',
            'customer_email' => 'nullable|email',
            'technician' => 'sometimes|string|max:255',
            'notes' => 'nullable|string',
            'diagnosis' => 'nullable|string',
        ]);

        $jobCard->update($data);

        return response()->json($jobCard->fresh()->load('items.service'));
    }

    public function updateStatus(Request $request, JobCard $jobCard): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:in_progress,completed,cancelled',
        ]);

        try {
            $jobCard = $this->jobCardService->updateStatus($jobCard, $request->status);
            return response()->json($jobCard);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Get job cards that are ready to be invoiced.
     */
    public function invoiceable(): JsonResponse
    {
        $jobCards = JobCard::invoiceable()
            ->with(['items.service', 'creator'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($jobCards);
    }

    public function downloadPdf(JobCard $jobCard): \Illuminate\Http\Response
    {
        $pdf = $this->jobCardService->generatePdf($jobCard);
        return $pdf->download("job-card-{$jobCard->job_number}.pdf");
    }
}

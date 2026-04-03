<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Service;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function __construct(private AuditService $auditService) {}
    public function index(Request $request): JsonResponse
    {
        $query = Service::query();

        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        if ($request->boolean('active_only', true)) {
            $query->active();
        }

        $services = $query->orderBy('category')->orderBy('name')->get();

        return response()->json($services);
    }

    public function show(Service $service): JsonResponse
    {
        return response()->json($service);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'min_price' => 'required|numeric|min:0',
            'max_price' => 'required|numeric|gte:min_price',
            'fixed_price' => 'nullable|numeric|min:0',
            'is_fixed' => 'boolean',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
        ]);

        // If fixed, set min = max = fixed_price
        if (!empty($data['is_fixed']) && isset($data['fixed_price'])) {
            $data['min_price'] = $data['fixed_price'];
            $data['max_price'] = $data['fixed_price'];
        }

        $service = Service::create($data);

        return response()->json($service, 201);
    }

    public function update(Request $request, Service $service): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'category' => 'sometimes|string|max:255',
            'min_price' => 'sometimes|numeric|min:0',
            'max_price' => 'sometimes|numeric|gte:min_price',
            'fixed_price' => 'nullable|numeric|min:0',
            'is_fixed' => 'boolean',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
        ]);

        if (!empty($data['is_fixed']) && isset($data['fixed_price'])) {
            $data['min_price'] = $data['fixed_price'];
            $data['max_price'] = $data['fixed_price'];
        }

        $service->update($data);

        return response()->json($service->fresh());
    }

    public function destroy(Service $service): JsonResponse
    {
        $this->auditService->log(
            AuditLog::ACTION_DELETE,
            'service',
            $service->id,
            ['name' => $service->name, 'category' => $service->category],
            null,
            'Service soft-deleted',
            'warning'
        );
        $service->delete();

        return response()->json(['message' => 'Service deactivated.']);
    }

    /**
     * Get unique service categories.
     */
    public function categories(): JsonResponse
    {
        $categories = Service::active()
            ->select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return response()->json($categories);
    }
}

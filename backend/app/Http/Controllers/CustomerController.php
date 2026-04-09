<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CustomerVehicle;
use App\Models\Invoice;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return $query->withCount('jobCards')->latest()->paginate(15);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'nullable|email|max:255',
            'phone'   => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'notes'   => 'nullable|string',
        ]);

        return response()->json(Customer::create($validated), 201);
    }

    public function show(Customer $customer)
    {
        $customer->load([
            'vehicles',
            'jobCards' => fn ($q) => $q->with(['items.service', 'invoice'])->latest()->limit(20),
        ]);

        $totalSpent = Invoice::whereIn('job_card_id', $customer->jobCards()->select('id'))
            ->where('status', 'paid')
            ->sum('total');

        $lastVisit = $customer->jobCards()->latest()->value('created_at');

        return response()->json([
            'customer' => $customer,
            'stats' => [
                'total_spent'  => (float) $totalSpent,
                'total_visits' => $customer->jobCards()->count(),
                'last_visit'   => $lastVisit,
                'open_jobs'    => $customer->jobCards()->whereIn('status', ['open', 'in_progress'])->count(),
            ],
        ]);
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name'    => 'sometimes|required|string|max:255',
            'email'   => 'nullable|email|max:255',
            'phone'   => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'notes'   => 'nullable|string',
        ]);

        $customer->update($validated);
        return response()->json($customer);
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();
        return response()->noContent();
    }

    // ── Vehicle sub-resource ──────────────────────────────────────

    public function storeVehicle(Request $request, Customer $customer)
    {
        $data = $request->validate([
            'registration' => 'required|string|max:20',
            'make'         => 'nullable|string|max:100',
            'model'        => 'nullable|string|max:100',
            'year'         => 'nullable|string|max:4',
            'color'        => 'nullable|string|max:50',
            'vin'          => 'nullable|string|max:50|unique:customer_vehicles,vin',
            'notes'        => 'nullable|string',
        ]);

        $vehicle = $customer->vehicles()->create($data);
        return response()->json($vehicle, 201);
    }

    public function updateVehicle(Request $request, Customer $customer, CustomerVehicle $vehicle)
    {
        abort_if($vehicle->customer_id !== $customer->id, 404);

        $data = $request->validate([
            'registration' => 'sometimes|string|max:20',
            'make'         => 'nullable|string|max:100',
            'model'        => 'nullable|string|max:100',
            'year'         => 'nullable|string|max:4',
            'color'        => 'nullable|string|max:50',
            'vin'          => "nullable|string|max:50|unique:customer_vehicles,vin,{$vehicle->id}",
            'notes'        => 'nullable|string',
        ]);

        $vehicle->update($data);
        return response()->json($vehicle);
    }

    public function destroyVehicle(Customer $customer, CustomerVehicle $vehicle)
    {
        abort_if($vehicle->customer_id !== $customer->id, 404);
        $vehicle->delete();
        return response()->noContent();
    }
}

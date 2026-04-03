<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\JobCard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $query = $request->input('q');

        if (!$query || strlen($query) < 2) {
            return response()->json([]);
        }

        $jobCards = JobCard::query()
            ->where('vehicle_number', 'like', "%{$query}%")
            ->orWhere('customer_name', 'like', "%{$query}%")
            ->orWhere('customer_phone', 'like', "%{$query}%")
            ->with(['customer'])
            ->limit(5)
            ->get()
            ->map(function ($job) {
                return [
                    'type' => 'job_card',
                    'id' => $job->id,
                    'title' => $job->vehicle_number,
                    'subtitle' => $job->customer_name . ' - ' . $job->status,
                    'url' => "/dashboard/job-cards/{$job->id}",
                ];
            });

        $customers = Customer::query()
            ->where('name', 'like', "%{$query}%")
            ->orWhere('phone', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->limit(5)
            ->get()
            ->map(function ($customer) {
                return [
                    'type' => 'customer',
                    'id' => $customer->id,
                    'title' => $customer->name,
                    'subtitle' => $customer->phone,
                    'url' => "/dashboard/customers/{$customer->id}",
                ];
            });

        $invoices = Invoice::query()
            ->where('invoice_number', 'like', "%{$query}%")
            ->limit(3)
            ->get()
            ->map(function ($invoice) {
                return [
                    'type' => 'invoice',
                    'id' => $invoice->id,
                    'title' => $invoice->invoice_number,
                    'subtitle' => 'GH₵' . number_format((float) $invoice->total, 2),
                    'url' => "/dashboard/invoices/{$invoice->id}",
                ];
            });

        // Merge and return
        return response()->json([
            'results' => $jobCards->concat($customers)->concat($invoices),
        ]);
    }
}

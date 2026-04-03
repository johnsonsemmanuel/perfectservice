<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Services\InvoiceService;
use App\Services\PaymentService;
use App\Services\DiscountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function __construct(
        private InvoiceService $invoiceService,
        private PaymentService $paymentService,
        private DiscountService $discountService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $query = Invoice::with(['jobCard', 'creator']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                    ->orWhereHas('jobCard', function ($q2) use ($search) {
                        $q2->where('customer_name', 'like', "%{$search}%")
                            ->orWhere('vehicle_number', 'like', "%{$search}%");
                    });
            });
        }

        $invoices = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        return response()->json($invoices);
    }

    /**
     * Create invoice from a completed job card.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'job_card_id' => 'required|exists:job_cards,id',
        ]);

        try {
            $invoice = $this->invoiceService->createFromJobCard($request->job_card_id);
            return response()->json($invoice, 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show(Invoice $invoice): JsonResponse
    {
        $invoice->load(['items.service', 'jobCard.items.service', 'payments.receiver', 'creator']);

        return response()->json($invoice);
    }

    /**
     * Void an invoice. Manager only.
     */
    public function void(Request $request, Invoice $invoice): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|min:10',
        ]);

        try {
            $invoice = $this->invoiceService->voidInvoice($invoice, $request->reason);
            return response()->json($invoice);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Record a payment against an invoice.
     */
    public function recordPayment(Request $request, Invoice $invoice): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|in:cash,momo',
            'reference' => 'nullable|string',
            'momo_phone' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        try {
            $payment = $this->paymentService->recordPayment($invoice, $request->all());
            return response()->json($payment, 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Apply a discount. Requires Manager PIN.
     */
    public function applyDiscount(Request $request, Invoice $invoice): JsonResponse
    {
        $request->validate([
            'discount_percent' => 'required|numeric|min:0.01',
            'manager_pin' => 'required|string',
            'reason' => 'required|string|min:5',
            'manager_id' => 'nullable|exists:users,id',
        ]);

        try {
            $invoice = $this->discountService->applyDiscount(
                $invoice,
                $request->discount_percent,
                $request->manager_pin,
                $request->reason,
                $request->manager_id,
            );
            return response()->json($invoice);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Get receipt data including locked footer.
     */
    public function receipt(Invoice $invoice): JsonResponse
    {
        $invoice->load(['items.service', 'jobCard', 'payments', 'creator']);

        $settings = \App\Models\SystemSetting::whereIn('key', [
            'business_name',
            'business_phone',
            'business_address',
            'business_email',
            'receipt_footer_line_1',
            'receipt_footer_line_2',
            'receipt_footer_line_3',
            'currency_symbol',
        ])->pluck('value', 'key');

        return response()->json([
            'invoice' => $invoice,
            'business' => [
                'name' => $settings['business_name'] ?? '',
                'phone' => $settings['business_phone'] ?? '',
                'address' => $settings['business_address'] ?? '',
                'email' => $settings['business_email'] ?? '',
            ],
            'footer' => [
                $settings['receipt_footer_line_1'] ?? '',
                $settings['receipt_footer_line_2'] ?? '',
                $settings['receipt_footer_line_3'] ?? '',
            ],
            'currency_symbol' => $settings['currency_symbol'] ?? 'GH₵',
        ]);
    }

    public function downloadPdf(Invoice $invoice, \App\Services\PdfService $pdfService): \Illuminate\Http\Response
    {
        $pdf = $pdfService->generateInvoice($invoice);
        return $pdf->download("invoice-{$invoice->invoice_number}.pdf");
    }

    public function downloadReceiptPdf(Invoice $invoice, \App\Services\PdfService $pdfService): \Illuminate\Http\Response
    {
        $pdf = $pdfService->generateReceipt($invoice);
        return $pdf->stream("receipt-{$invoice->invoice_number}.pdf");
    }
}

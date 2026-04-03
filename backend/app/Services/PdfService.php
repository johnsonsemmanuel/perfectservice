<?php

namespace App\Services;

use App\Models\JobCard;
use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\SystemSetting;

class PdfService
{
    public function generateJobCard(JobCard $jobCard)
    {
        $jobCard->load(['customer', 'items.service', 'creator', 'vehicleType']);
        $settings = $this->getSettings();

        // Custom paper size or A4
        $pdf = Pdf::loadView('pdfs.job-card', compact('jobCard', 'settings'));
        return $pdf;
    }

    public function generateInvoice(Invoice $invoice)
    {
        $invoice->load(['jobCard.customer', 'jobCard.vehicleType', 'items']);
        $settings = $this->getSettings();

        $pdf = Pdf::loadView('pdfs.invoice', compact('invoice', 'settings'));
        return $pdf;
    }

    public function generateReceipt(Invoice $invoice)
    {
        $invoice->load(['jobCard.customer']);
        $settings = $this->getSettings();

        // Receipt might be small format (80mm)
        $pdf = Pdf::loadView('pdfs.receipt', compact('invoice', 'settings'));
        $pdf->setPaper([0, 0, 226.77, 500], 'portrait'); // ~80mm width
        return $pdf;
    }

    private function getSettings()
    {
        return SystemSetting::all()->mapWithKeys(function ($item) {
            return [$item->key => $item->value];
        });
    }
}

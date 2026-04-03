@extends('pdfs.layout')

@section('content')
    <div style="margin-bottom: 20px;">
        <h2 class="section-title">INVOICE <span
                style="float: right; font-weight: normal; font-size: 14px; color: #666;">#{{ $invoice->invoice_number }}</span>
        </h2>
        <div style="text-align: right; font-size: 12px;">
            Status: <span
                class="badge badge-{{ $invoice->status === 'paid' ? 'success' : ($invoice->status === 'pending' ? 'warning' : 'danger') }}">{{ strtoupper($invoice->status) }}</span><br>
            Date: {{ $invoice->created_at->format('d M Y') }}<br>
            Due Date: {{ $invoice->issued_at ? $invoice->issued_at->addDays(30)->format('d M Y') : '-' }}
        </div>
    </div>

    <table style="width: 100%; margin-bottom: 30px;">
        <tr>
            <td style="width: 50%; vertical-align: top;">
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                    <strong>BILL TO</strong><br><br>
                    {{ $invoice->jobCard->customer_name }}<br>
                    {{ $invoice->jobCard->customer_phone }}<br>
                    @if($invoice->jobCard->customer_email){{ $invoice->jobCard->customer_email }}<br>@endif
                </div>
            </td>
            <td style="width: 50%; vertical-align: top;">
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                    <strong>VEHICLE DETAILS</strong><br><br>
                    <strong>{{ $invoice->jobCard->vehicle_number }}</strong><br>
                    {{ $invoice->jobCard->vehicle_make }} {{ $invoice->jobCard->vehicle_model }}
                </div>
            </td>
        </tr>
    </table>

    <table style="width: 100%; margin-bottom: 30px;">
        <thead>
            <tr>
                <th style="width: 50%">DESCRIPTION</th>
                <th style="width: 15%; text-align: center;">QTY</th>
                <th style="width: 15%; text-align: right;">UNIT PRICE</th>
                <th style="width: 20%; text-align: right;">TOTAL</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->items as $item)
                <tr style="border-bottom: 1px solid #eee;">
                    <td>
                        {{ $item->description }}
                    </td>
                    <td style="text-align: center;">{{ $item->quantity }}</td>
                    <td style="text-align: right;">{{ number_format($item->unit_price, 2) }}</td>
                    <td style="text-align: right;">{{ number_format($item->line_total, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div style="width: 100%; overflow: hidden;">
        <div style="width: 40%; float: right;">
            <table style="width: 100%">
                <tr>
                    <td style="padding: 5px; text-align: right;">Subtotal:</td>
                    <td style="padding: 5px; text-align: right;">GH₵ {{ number_format($invoice->subtotal, 2) }}</td>
                </tr>
                @if($invoice->tax_amount > 0)
                    <tr>
                        <td style="padding: 5px; text-align: right;">Tax ({{ $settings['tax_rate'] ?? 0 }}%):</td>
                        <td style="padding: 5px; text-align: right;">GH₵ {{ number_format($invoice->tax_amount, 2) }}</td>
                    </tr>
                @endif
                @if($invoice->discount_amount > 0)
                    <tr>
                        <td style="padding: 5px; text-align: right; color: green;">Discount:</td>
                        <td style="padding: 5px; text-align: right; color: green;">- GH₵
                            {{ number_format($invoice->discount_amount, 2) }}</td>
                    </tr>
                @endif
                <tr style="font-weight: bold; font-size: 16px; background: #eee;">
                    <td style="padding: 10px; text-align: right; border-top: 2px solid #333;">TOTAL:</td>
                    <td style="padding: 10px; text-align: right; border-top: 2px solid #333;">GH₵
                        {{ number_format($invoice->total, 2) }}</td>
                </tr>
            </table>
        </div>
    </div>

    <div style="margin-top: 50px;">
        <strong>PAYMENT DETAILS:</strong><br>
        <div style="border: 1px solid #eee; padding: 15px; margin-top: 5px;">
            {{ $settings['payment_instructions'] ?? "Please pay via Mobile Money or Cash at the desk." }}
        </div>
    </div>
@endsection
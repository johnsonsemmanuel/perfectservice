<!DOCTYPE html>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Receipt</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            margin: 0;
            padding: 10px;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .bold {
            font-weight: bold;
        }

        .line {
            border-bottom: 1px dashed #000;
            margin: 5px 0;
        }

        table {
            width: 100%;
        }

        td {
            vertical-align: top;
        }
    </style>
</head>

<body>
    <div class="text-center">
        <strong style="font-size: 16px;">{{ $settings['company_name'] ?? 'PERFECT SERVICE' }}</strong><br>
        {{ $settings['company_phone'] ?? '' }}<br>
        {{ $settings['company_address'] ?? '' }}
    </div>

    <div class="line"></div>

    <div>
        Receipt #: {{ $invoice->invoice_number }}<br>
        Date: {{ now()->format('d/m/Y H:i') }}<br>
        Customer: {{ $invoice->jobCard->customer_name }}
    </div>

    <div class="line"></div>

    <table>
        @foreach($invoice->items as $item)
            <tr>
                <td colspan="2">{{ $item->description }}</td>
            </tr>
            <tr>
                <td class="text-right">{{ $item->quantity }} x {{ number_format($item->unit_price, 2) }}</td>
                <td class="text-right">{{ number_format($item->line_total, 2) }}</td>
            </tr>
        @endforeach
    </table>

    <div class="line"></div>

    <table>
        <tr>
            <td>Subtotal:</td>
            <td class="text-right">{{ number_format($invoice->subtotal, 2) }}</td>
        </tr>
        @if($invoice->tax_amount > 0)
            <tr>
                <td>Tax:</td>
                <td class="text-right">{{ number_format($invoice->tax_amount, 2) }}</td>
            </tr>
        @endif
        @if($invoice->discount_amount > 0)
            <tr>
                <td>Discount:</td>
                <td class="text-right">-{{ number_format($invoice->discount_amount, 2) }}</td>
            </tr>
        @endif
        <tr class="bold" style="font-size: 14px;">
            <td>TOTAL:</td>
            <td class="text-right">GH₵ {{ number_format($invoice->total, 2) }}</td>
        </tr>
    </table>

    <div class="line"></div>

    <div class="text-center" style="margin-top: 10px;">
        THANK YOU FOR YOUR BUSINESS!<br>
        Software by PerfectService
    </div>
</body>

</html>
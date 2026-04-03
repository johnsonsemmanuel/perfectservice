@extends('pdfs.layout')

@section('content')
    <div style="margin-bottom: 20px;">
        <h2 class="section-title">JOB CARD <span
                style="float: right; font-weight: normal; font-size: 14px; color: #666;">#{{ $jobCard->job_number }}</span>
        </h2>
    </div>

    <table style="width: 100%; margin-bottom: 30px;">
        <tr>
            <td style="width: 50%; vertical-align: top;">
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                    <strong>CUSTOMER DETAILS</strong><br><br>
                    {{ $jobCard->customer_name }}<br>
                    {{ $jobCard->customer_phone }}<br>
                    {{ $jobCard->customer_email }}
                </div>
            </td>
            <td style="width: 50%; vertical-align: top;">
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                    <strong>VEHICLE DETAILS</strong><br><br>
                    <strong>{{ $jobCard->vehicle_number }}</strong><br>
                    {{ $jobCard->vehicle_make }} {{ $jobCard->vehicle_model }} ({{ $jobCard->vehicle_year }})<br>
                    Mileage: {{ number_format($jobCard->mileage) }} km
                </div>
            </td>
        </tr>
    </table>

    <table style="width: 100%; margin-bottom: 30px;">
        <thead>
            <tr>
                <th style="width: 50%">SERVICE / DESCRIPTION</th>
                <th style="width: 30%">NOTES</th>
                <th style="width: 20%; text-align: right;">EST. COST</th>
            </tr>
        </thead>
        <tbody>
            @foreach($jobCard->items as $item)
                <tr style="border-bottom: 1px solid #eee;">
                    <td>
                        <strong>{{ $item->service->name }}</strong>
                        @if($item->service->category)<br><span
                        style="font-size: 10px; color: #888;">{{ $item->service->category }}</span>@endif
                    </td>
                    <td>{{ $item->notes }}</td>
                    <td style="text-align: right;">
                        @if($item->agreed_price > 0)
                            GH₵ {{ number_format($item->agreed_price, 2) }}
                        @else
                            -
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="2" style="text-align: right; padding-top: 10px;"><strong>TOTAL ESTIMATE:</strong></td>
                <td style="text-align: right; padding-top: 10px; font-weight: bold;">GH₵
                    {{ number_format($jobCard->items->sum('agreed_price'), 2) }}</td>
            </tr>
        </tfoot>
    </table>

    @if($jobCard->diagnosis)
        <div style="margin-bottom: 30px;">
            <strong>DIAGNOSIS / INSTRUCTIONS:</strong><br>
            <div style="border: 1px solid #eee; padding: 10px; margin-top: 5px; min-height: 50px;">
                {{ $jobCard->diagnosis }}
            </div>
        </div>
    @endif

    <div style="position: absolute; bottom: 150px; width: 100%;">
        <table style="width: 100%">
            <tr>
                <td style="width: 50%; padding-right: 20px;">
                    <strong>CUSTOMER AUTHORIZATION:</strong><br><br>
                    I hereby authorize the above repair work to be done along with the necessary material and agree that you
                    are not responsible for loss or damage to vehicle or articles left in vehicle in case of fire, theft or
                    any other cause beyond your control.
                    <br><br><br>
                    ____________________________________<br>
                    Signature
                </td>
                <td style="width: 50%; padding-left: 20px;">
                    <strong>TECHNICIAN ACCEPTANCE:</strong><br><br>
                    Assigned to: <strong>{{ $jobCard->technician }}</strong><br>
                    Date: {{ $jobCard->created_at->format('d M Y') }}
                    <br><br><br><br>
                    ____________________________________<br>
                    Signature
                </td>
            </tr>
        </table>
    </div>
@endsection
<!DOCTYPE html>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Document</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 14px;
            color: #333;
        }

        .header {
            width: 100%;
            border-bottom: 2px solid #eee;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .logo {
            max-height: 80px;
            max-width: 200px;
        }

        .company-info {
            float: right;
            text-align: right;
            font-size: 12px;
            color: #666;
        }

        .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #000;
            margin-bottom: 5px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            padding: 10px;
            text-align: left;
        }

        th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #555;
        }

        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            text-align: center;
            font-size: 10px;
            color: #aaa;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }

        .page-break {
            page-break-after: always;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .font-bold {
            font-weight: bold;
        }

        .text-sm {
            font-size: 12px;
        }

        .text-xs {
            font-size: 10px;
        }

        .badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .badge-success {
            background: #dcfce7;
            color: #166534;
        }

        .badge-warning {
            background: #fef9c3;
            color: #854d0e;
        }

        .badge-danger {
            background: #fee2e2;
            color: #991b1b;
        }

        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 10px;
            color: #111;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
        }
    </style>
</head>

<body>
    <div class="header">
        <table style="width: 100%">
            <tr>
                <td style="vertical-align: top; padding: 0;">
                    @if(isset($settings['company_logo']))
                        <img src="{{ public_path($settings['company_logo']) }}" class="logo" alt="Logo">
                    @else
                        <h1 style="margin: 0; color: #2563eb;">PerfectService</h1>
                    @endif
                </td>
                <td style="vertical-align: top; padding: 0; text-align: right;">
                    <div class="company-name">{{ $settings['company_name'] ?? 'Perfect Service Auto' }}</div>
                    <div class="company-info">
                        {{ $settings['company_address'] ?? '123 Main Street' }}<br>
                        {{ $settings['company_phone'] ?? '024 123 4567' }} | {{ $settings['company_email'] ??
                        'info@perfectservice.com' }}<br>
                        {{ $settings['company_website'] ?? 'www.perfectservice.com' }}
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <div class="content">
        @yield('content')
    </div>

    <div class="footer">
        Generated on {{ now()->format('d M Y, h:i A') }} | {{ $settings['company_name'] ?? 'Perfect Service Auto' }}
        <br>
        {{ $settings['terms_conditions'] ?? 'Thank you for your business.' }}
    </div>
</body>

</html>
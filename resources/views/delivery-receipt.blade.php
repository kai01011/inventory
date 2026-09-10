<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Delivery Receipt - {{ $receipt_no ?? 'N/A' }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            color: #000;
            background: #d0d0d0;
            position: relative;
            min-height: 11in;
        }

        @page {
            size: letter portrait;
            margin: 0;
        }

        @media print {
            body { background: white; }
            .print-buttons { display: none !important; }
            .page {
                box-shadow: none !important;
                margin: 0 !important;
                width: 100% !important;
                height: 100vh !important;
            }
        }

        /* Full letter page — uses a table so footer is pinned to the bottom */
        .page {
            width: 8.5in;
            height: 11in;
            margin: 20px auto;
            background: white;
            box-shadow: 0 2px 20px rgba(0,0,0,0.2);
            /* inner layout via a single full-height table */
            display: table;
            table-layout: fixed;
        }

        .page-inner {
            display: table-cell;
            vertical-align: top;
            padding: 0.55in 0.65in 0.4in 0.65in;
            height: 100%;
            position: relative;
        }

        /* We'll use a wrapper that fills height */
        .content-wrap {
            display: flex;
            flex-direction: column;
            height: 100%;
            min-height: calc(11in - 1.95in); /* Account for top and bottom padding */
        }

        .body-content {
            flex: 1;
        }

        /* ─── HEADER: logo left, address right ─── */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }
        .header-table td { vertical-align: top; padding: 0; }
        .logo-cell { width: 160px; }
        .logo-cell img { width: 150px; height: auto; display: block; }
        .addr-cell {
            text-align: right;
            font-size: 12px;
            line-height: 1.4;
            font-weight: bold;
        }

        /* ─── COMPANY NAME ─── */
        .company-name {
            font-size: 18px;
            padding-top: 6px;
            margin-bottom: 4px;
        }

        /* ─── TITLE ─── */
        .title {
            font-size: 24px;
            font-weight: bold;
            font-style: italic;
            display: inline-block;
            border-bottom: 2px solid #000;
            padding-bottom: 1px;
            margin-bottom: 12px;
        }

        /* ─── NO / DATE: right-aligned two-row table ─── */
        .meta-table {
            border-collapse: collapse;
            margin-left: auto;
            margin-bottom: 12px;
        }
        .meta-table td {
            padding: 0;
            vertical-align: baseline;
            font-size: 14px;
            white-space: nowrap;
        }
        .meta-table tr:first-child td {
            padding-bottom: 2px;
        }
        .meta-label-cell {
            font-weight: normal;
        }
        .meta-val-cell {
            font-weight: bold;
            padding-left: 8px;
        }

        /* ─── DELIVERY FIELDS ─── */
        .delivery-section { margin-bottom: 12px; font-size: 14px; }

        /* field-row: label + value inline. width matches print's
           .field-label { min-width: 78px } */
        .field-row-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2px;
        }
        .field-row-table td { padding: 0; vertical-align: baseline; }
        .f-label { white-space: nowrap; width: 80px; font-weight: normal; }
        .f-val { text-decoration: underline; font-weight: bold; padding-left: 8px; }

        /* inline row: Tin / Bus.Style / Terms */
        .inline-row-table {
            border-collapse: collapse;
            margin-bottom: 2px;
        }
        .inline-row-table td { padding: 0; vertical-align: baseline; white-space: nowrap; }
        .inline-gap { width: 20px; }

        /* ─── ITEMS TABLE ─── */
        .items-table {
            border-collapse: collapse;
            margin: 6px 0 12px 0;
            font-size: 12px;
        }
        .items-table th {
            border: 1px solid #000;
            padding: 3px 5px;
            text-align: center;
            font-weight: bold;
            background-color: #efefef;
        }
        .items-table td {
            border: 1px solid #000;
            padding: 3px 5px;
            text-align: center;
        }
        .col-no   { width: 40px; }
        .col-qty  { width: 50px; }
        .col-unit { width: 60px; }
        .col-desc { width: 300px; }
        .items-table td.col-desc { text-align: left; }

        /* ─── RECEIVED & SIGNATURE ─── */
        .received-text { font-size: 14px; margin-bottom: 20px; }
        .signature-line {
            border-top: 1px solid #000;
            width: 280px;
            padding-top: 3px;
            font-size: 12px;
            font-style: italic;
        }

        /* ── FOOTER — pinned to bottom within page ── */
        .footer-section {
            display: flex;
            align-items: flex-start;
            gap: 0;
            font-size: 11px;
            font-weight: bold;
            line-height: 1.3;
            padding-top: 20px;
            text-transform: uppercase;
            margin-top: auto;
        }

        .footer-left {
            flex-shrink: 0;
            border: 2px dashed #000;
            padding: 3px 6px;
            white-space: nowrap;
            font-size: 11px;
            font-weight: bold;
        }

        .footer-right {
            padding-left: 8px;
            flex: 1;
            white-space: normal;
            font-size: 11px;
        }

        /* ── PRINT BUTTON ── */
        .print-buttons {
            text-align: center;
            margin: 14px 0 30px;
            display: flex;
            gap: 10px;
            justify-content: center;
        }

        .print-buttons button {
            padding: 9px 22px;
            font-size: 13px;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }

        .btn-print { background: #dc2626; }
        .btn-close { background: #6b7280; }
    </style>
</head>
<body>

<div class="page">
  <div class="page-inner">
    <div class="content-wrap">
      <div class="body-content">

        {{-- HEADER --}}
        <table class="header-table">
            <tr>
                <td class="logo-cell">
                    <img src="{{ asset('images/cravelogo.png') }}" alt="CRAVE Logo">
                </td>
                <td class="addr-cell">
                    JS Building, Galo-Lacson Sts.<br>
                    Bacolod City<br>
                    MABELLE A. YEE - Proprietor<br>
                    Tel. No. (034) 708-0328<br>
                    VAT Reg. TIN 931-643-930-000
                </td>
            </tr>
        </table>

        {{-- COMPANY NAME --}}
        <div class="company-name">CRAVE DIGITAL ADVERTISING SUPPLIES AND SERVICES</div>

        {{-- TITLE --}}
        <div class="title">DELIVERY RECEIPT</div>

        {{-- NO / DATE --}}
        <table class="meta-table">
            <tr>
                <td class="meta-label-cell">No.&nbsp;&nbsp;</td>
                <td class="meta-val-cell">{{ $receipt_no ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td class="meta-label-cell">Date:&nbsp;&nbsp;</td>
                <td class="meta-val-cell">{{ !empty($date) ? $date : date('F d, Y') }}</td>
            </tr>
        </table>

        {{-- DELIVERY DETAILS --}}
        <div class="delivery-section">

            <table class="field-row-table">
                <tr>
                    <td class="f-label">Delivered to:</td>
                    <td class="f-val">{{ $stockOut?->customer?->customer_name ?? 'N/A' }}</td>
                </tr>
            </table>

            <table class="field-row-table">
                <tr>
                    <td class="f-label">Address:</td>
                    <td class="f-val">{{ $stockOut?->address ?? 'N/A' }}</td>
                </tr>
            </table>

            <table class="inline-row-table">
                <tr>
                    <td class="f-label">Tin:</td>
                    <td class="f-val" style="min-width:90px;">{{ $stockOut?->tin ?? 'N/A' }}</td>
                    <td class="inline-gap"></td>
                    <td class="f-label">Bus. Style:</td>
                    <td class="f-val" style="min-width:70px;">{{ $stockOut?->business_style ?? 'N/A' }}</td>
                    <td class="inline-gap"></td>
                    <td class="f-label">Terms:</td>
                    <td class="f-val" style="min-width:30px;">0</td>
                </tr>
            </table>

        </div>

        {{-- ITEMS TABLE --}}
        <table class="items-table">
            <thead>
                <tr>
                    <th class="col-no">No.</th>
                    <th class="col-qty">Qty</th>
                    <th class="col-unit">Unit</th>
                    <th class="col-desc">Description</th>
                </tr>
            </thead>
            <tbody>
                @if($items && count($items) > 0)
                    @foreach($items as $index => $item)
                        <tr>
                            <td class="col-no">{{ $index + 1 }}</td>
                            <td class="col-qty">{{ $item->stock_out_quantity ?? 0 }}</td>
                            <td class="col-unit">{{ $item->product?->unit ?? 'Pcs' }}</td>
                            <td class="col-desc">{{ $item->product?->product_name ?? 'Unknown Product' }}</td>
                        </tr>
                    @endforeach
                @else
                    <tr>
                        <td colspan="4" style="text-align:center;">No items</td>
                    </tr>
                @endif
            </tbody>
        </table>

        {{-- RECEIVED TEXT --}}
        <div class="received-text">Received the following goods and articles in good condition.</div>

        {{-- SIGNATURE --}}
        <div class="signature-line">Customer's Signature Over Printed Name</div>

      </div>{{-- /body-content --}}

      {{-- FOOTER pinned to bottom via flex --}}
      <div class="footer-section">
          <div class="footer-left">
              THIS DOCUMENT IS NOT VALID FOR CLAIM OF INPUT TAXES.
          </div>
          <div class="footer-right">
              THIS DELIVERY RECEIPT SHALL BE VALID FOR FIVE<br>(5) YEARS FROM THE DATE OF ATP
          </div>
      </div>

    </div>{{-- /content-wrap --}}
  </div>{{-- /page-inner --}}
</div>{{-- /page --}}

<div class="print-buttons">
    <button class="btn-print" onclick="window.print()">Print Receipt</button>
</div>

</body>
</html>

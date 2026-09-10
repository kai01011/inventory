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
    position: relative;
    min-height: 11in;
}

/* ─── OUTER PAGE: simplified structure with absolute footer ─── */
.page-container {
    padding: 0.55in 0.65in 2in 0.65in;
}

/* ─── HEADER: logo left, address right ─── */
.header-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10px;
}
.header-table td { vertical-align: top; padding: 0; }
.logo-cell { width: 220px; }
.logo-cell img { width: 210px; height: auto; display: block; }
.addr-cell {
    text-align: right;
    font-size: 18px;
    line-height: 1.6;
    font-weight: bold;
}

/* ─── COMPANY NAME ─── */
.company-name {
    font-size: 28px;
    padding-top: 8px;
    margin-bottom: 6px;
}

/* ─── TITLE ─── */
.title {
    font-size: 38px;
    font-weight: bold;
    font-style: italic;
    display: inline-block;
    border-bottom: 4px solid #000;
    padding-bottom: 2px;
    margin-bottom: 18px;
}

/* ─── NO / DATE: right-aligned two-row table ─── */
.meta-table {
    border-collapse: collapse;
    margin-left: auto;
    margin-bottom: 16px;
}
.meta-table td {
    padding: 0;
    vertical-align: baseline;
    font-size: 20px;
    white-space: nowrap;
}
.meta-table tr:first-child td {
    padding-bottom: 3px;
}
.meta-label-cell {
    font-weight: normal;
}
.meta-val-cell {
    font-weight: bold;
    padding-left: 10px;
}
/* ─── DELIVERY FIELDS ─── */
.delivery-section { margin-bottom: 18px; font-size: 20px; }



/* field-row: label + value inline. width matches print's
   .field-label { min-width: 78px } */
.field-row-table {
    border-collapse: collapse;
    table-layout: fixed;
    margin-bottom: 3px;
}
.field-row-table td { padding: 0; vertical-align: baseline; white-space: nowrap; }
.f-label { width: 110px; font-weight: normal; }
.f-val { text-decoration: underline; font-weight: bold; padding-left: 16px; }

.inline-row-table {
    border-collapse: collapse;
    table-layout: fixed;
    margin-bottom: 3px;
}
.inline-row-table td { padding: 0; vertical-align: baseline; white-space: nowrap; }
.inline-gap { width: 30px; }

/* ─── ITEMS TABLE ─── */
.items-table {
    border-collapse: collapse;
    margin: 8px 0 18px 0;
    font-size: 20px;
}
.items-table th {
    border: 1px solid #000;
    padding: 4px 6px;
    text-align: center;
    font-weight: bold;
    background-color: #efefef;
}
.items-table td {
    border: 1px solid #000;
    padding: 4px 6px;
    text-align: center;
}
.items-table th, .items-table td { padding: 6px 8px; }
.col-no   { width: 50px; }
.col-qty  { width: 60px; }
.col-unit { width: 75px; }
.col-desc { width: 500px; }
.items-table td.col-desc { text-align: left; }

/* ─── RECEIVED & SIGNATURE ─── */
.received-text { font-size: 20px; margin-bottom: 28px; }
.signature-line {
    border-top: 1px solid #000;
    width: 390px;
    padding-top: 4px;
    font-size: 20px;
    font-style: italic;
}

/* ─── FOOTER ───
   Position footer absolutely at the bottom of the page */
.footer-container {
    position: absolute;
    bottom: 0.4in;
    left: 0.65in;
    right: 0.65in;
    font-size: 16px;
    font-weight: bold;
    line-height: 1.4;
    text-transform: uppercase;
}
.footer-table {
    width: 100%;
    border-collapse: collapse;
}
.footer-table td {
    vertical-align: top;
    padding: 0;
}
.footer-table td.footer-left {
    border: 2px dashed #000;
    padding: 5px 9px;
    white-space: nowrap;
    font-size: 16px;
    font-weight: bold;
    width: 1%;
}
.footer-table td.footer-right {
    padding-left: 10px;
    white-space: nowrap;
    font-size: 16px;
}
</style>
</head>
<body>

<div class="page-container">

    {{-- HEADER --}}
    <table class="header-table">
        <tr>
            <td class="logo-cell">
                <img src="{{ 'file://' . str_replace('\\', '/', public_path('images/cravelogo.png')) }}" alt="CRAVE Logo">
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
        <td class="f-label" style="width:110px;">Tin:</td>
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
                <tr><td colspan="4" style="text-align:center;">No items</td></tr>
            @endif
        </tbody>
    </table>

    {{-- RECEIVED TEXT --}}
    <div class="received-text">Received the following goods and articles in good condition.</div>

    {{-- SIGNATURE --}}
    <div class="signature-line">Customer's Signature Over Printed Name</div>

</div>

{{-- FOOTER - ABSOLUTELY POSITIONED AT BOTTOM --}}
<div class="footer-container">
    <table class="footer-table">
        <tr>
            <td class="footer-left">THIS DOCUMENT IS NOT VALID FOR CLAIM OF INPUT TAXES.</td>
            <td class="footer-right">THIS DELIVERY RECEIPT SHALL BE VALID FOR FIVE<br>(5) YEARS FROM THE DATE OF ATP</td>
        </tr>
    </table>
</div>

</body>
</html>
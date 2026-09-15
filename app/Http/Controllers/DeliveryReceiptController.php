<?php

namespace App\Http\Controllers;

use App\Models\StockOut;
use Barryvdh\DomPDF\Facade\Pdf;

class DeliveryReceiptController extends Controller
{
    /**
     * Generate delivery receipt PDF for stock out
     */
    public function generateReceipt($id)
    {
        $stockOut = StockOut::with('customer', 'items.product')->findOrFail($id);
        
        // Authorization: admin or requester can download
        $isAdmin = auth()->user()->role->role_name === 'Admin';
        $isRequester = $stockOut->requested_by_id === auth()->id();
        
        if (!$isAdmin && !$isRequester) {
            abort(403, 'You are not authorized to access this delivery receipt.');
        }

        $data = [
            'receipt_no' => $stockOut->delivery_no,
            'date'       => $stockOut->created_at->format('F d, Y'),
            'stockOut'   => $stockOut,
            'items'      => $stockOut->items ?? [],
        ];

        $pdf = Pdf::loadView('delivery-receipt-pdf', $data);
        $pdf->setPaper('letter', 'portrait');
        $pdf->setOptions([
            'isRemoteEnabled'  => true,
            'isLocalEnabled'   => true,
            'isLocalCssOnly'   => false,
            'defaultFont'      => 'Arial',
            'dpi'              => 150,
            'chroot'           => public_path(),
        ]);

        return $pdf->download('delivery-receipt-' . $stockOut->delivery_no . '.pdf');
    }

    /**
     * View delivery receipt
     */
    public function view($id)
    {
        $stockOut = StockOut::with('customer', 'items.product')->findOrFail($id);
        
        // Authorization: admin or requester can view
        $isAdmin = auth()->user()->role->role_name === 'Admin';
        $isRequester = $stockOut->requested_by_id === auth()->id();
        
        if (!$isAdmin && !$isRequester) {
            abort(403, 'You are not authorized to access this delivery receipt.');
        }

        $companyInfo = [
            'name' => 'CRAVE DIGITAL ADVERTISING SUPPLIES AND SERVICES',
            'address' => 'JS Building, Galo-Lacson Sts.',
            'city' => 'Bacolod City',
            'proprietor' => 'MABELLE A. YEE - Proprietor',
            'tel' => '(034) 708-0328',
            'vat_reg' => 'TIN 931-643-930-000',
        ];

        $data = [
            'company' => $companyInfo,
            'receipt_no' => $stockOut->delivery_no,
            'date' => $stockOut->created_at->format('F d, Y'),
            'stockOut' => $stockOut,
            'items' => $stockOut->items ?? [],
        ];

        // Return HTML view instead of PDF (user can print to PDF using browser)
        return view('delivery-receipt', $data);
    }
}

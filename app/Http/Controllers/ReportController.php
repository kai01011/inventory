<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\StockIn;
use App\Models\StockOut;
use App\Models\StockInItem;
use App\Models\StockOutItem;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function monthlyReport(Request $request)
    {
        $year = $request->get('year', Carbon::now()->year);
        $month = $request->get('month', Carbon::now()->month);

        // Create date range for the selected month
        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth();

        // Get Stock In statistics
        $stockInStats = $this->getStockInStats($startDate, $endDate);
        
        // Get Stock Out statistics  
        $stockOutStats = $this->getStockOutStats($startDate, $endDate);

        // Get monthly breakdown for the year
        $monthlyBreakdown = $this->getMonthlyBreakdown($year);

        return Inertia::render('Reports/MonthlyReport', [
            'year' => $year,
            'month' => $month,
            'monthName' => $startDate->format('F'),
            'stockInStats' => $stockInStats,
            'stockOutStats' => $stockOutStats,
            'monthlyBreakdown' => $monthlyBreakdown,
        ]);
    }

    private function getStockInStats($startDate, $endDate)
    {
        // Count approved stock in transactions
        $transactionCount = StockIn::where('status', 'approved')
            ->whereBetween('approved_at', [$startDate, $endDate])
            ->count();

        // Get total items added (sum of quantities)
        $totalItemsAdded = StockInItem::join('stock_in', 'stock_in_items.stock_in_id', '=', 'stock_in.id')
            ->where('stock_in.status', 'approved')
            ->whereBetween('stock_in.approved_at', [$startDate, $endDate])
            ->sum('stock_in_items.stock_in_quantity');

        // Get total value of items added
        $totalValue = StockInItem::join('stock_in', 'stock_in_items.stock_in_id', '=', 'stock_in.id')
            ->where('stock_in.status', 'approved')
            ->whereBetween('stock_in.approved_at', [$startDate, $endDate])
            ->sum(DB::raw('stock_in_items.stock_in_quantity * stock_in_items.unit_price'));

        // Get unique product count (based on product_name since it's stored as text)
        $uniqueProducts = StockInItem::join('stock_in', 'stock_in_items.stock_in_id', '=', 'stock_in.id')
            ->where('stock_in.status', 'approved')
            ->whereBetween('stock_in.approved_at', [$startDate, $endDate])
            ->whereNotNull('stock_in_items.product_name')
            ->where('stock_in_items.product_name', '!=', '')
            ->distinct('stock_in_items.product_name')
            ->count('stock_in_items.product_name');

        return [
            'transactionCount' => $transactionCount,
            'totalItemsAdded' => $totalItemsAdded ?: 0,
            'totalValue' => $totalValue ?: 0,
            'uniqueProducts' => $uniqueProducts,
        ];
    }

    private function getStockOutStats($startDate, $endDate)
    {
        // Count approved/shipped/delivered stock out transactions
        $transactionCount = StockOut::whereIn('status', ['approved', 'shipped', 'delivered'])
            ->whereBetween('approved_at', [$startDate, $endDate])
            ->count();

        // Get total items removed (sum of quantities)
        $totalItemsOut = StockOutItem::join('stock_out', 'stock_out_items.stock_out_id', '=', 'stock_out.id')
            ->whereIn('stock_out.status', ['approved', 'shipped', 'delivered'])
            ->whereBetween('stock_out.approved_at', [$startDate, $endDate])
            ->sum('stock_out_items.stock_out_quantity');

        // Get total value of items removed (using unit_price from stock_out_items)
        $totalValue = StockOutItem::join('stock_out', 'stock_out_items.stock_out_id', '=', 'stock_out.id')
            ->whereIn('stock_out.status', ['approved', 'shipped', 'delivered'])
            ->whereBetween('stock_out.approved_at', [$startDate, $endDate])
            ->sum(DB::raw('stock_out_items.stock_out_quantity * stock_out_items.unit_price'));

        // Get unique product count
        $uniqueProducts = StockOutItem::join('stock_out', 'stock_out_items.stock_out_id', '=', 'stock_out.id')
            ->whereIn('stock_out.status', ['approved', 'shipped', 'delivered'])
            ->whereBetween('stock_out.approved_at', [$startDate, $endDate])
            ->distinct('stock_out_items.product_id')
            ->count('stock_out_items.product_id');

        return [
            'transactionCount' => $transactionCount,
            'totalItemsOut' => $totalItemsOut ?: 0,
            'totalValue' => $totalValue ?: 0,
            'uniqueProducts' => $uniqueProducts,
        ];
    }

    private function getMonthlyBreakdown($year)
    {
        $breakdown = [];

        for ($month = 1; $month <= 12; $month++) {
            $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
            $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth();

            // Stock In for this month
            $stockInCount = StockIn::where('status', 'approved')
                ->whereBetween('approved_at', [$startDate, $endDate])
                ->count();

            $stockInItems = StockInItem::join('stock_in', 'stock_in_items.stock_in_id', '=', 'stock_in.id')
                ->where('stock_in.status', 'approved')
                ->whereBetween('stock_in.approved_at', [$startDate, $endDate])
                ->sum('stock_in_items.stock_in_quantity');

            // Stock Out for this month
            $stockOutCount = StockOut::whereIn('status', ['approved', 'shipped', 'delivered'])
                ->whereBetween('approved_at', [$startDate, $endDate])
                ->count();

            $stockOutItems = StockOutItem::join('stock_out', 'stock_out_items.stock_out_id', '=', 'stock_out.id')
                ->whereIn('stock_out.status', ['approved', 'shipped', 'delivered'])
                ->whereBetween('stock_out.approved_at', [$startDate, $endDate])
                ->sum('stock_out_items.stock_out_quantity');

            $breakdown[] = [
                'month' => $month,
                'monthName' => $startDate->format('M'),
                'stockIn' => [
                    'transactions' => $stockInCount,
                    'items' => $stockInItems ?: 0,
                ],
                'stockOut' => [
                    'transactions' => $stockOutCount,
                    'items' => $stockOutItems ?: 0,
                ],
            ];
        }

        return $breakdown;
    }
}
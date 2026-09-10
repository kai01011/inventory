<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\TableViewController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\UserController;

use App\Http\Controllers\StockInController;
use App\Http\Controllers\StockOutController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeliveryReceiptController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ApiController;
use Illuminate\Support\Facades\Route;

// Redirect root to login
Route::get('/', fn() => redirect()->route('login'))->name('welcome');

// Auth routes
Route::get('/login', [LoginController::class, 'create'])->name('login');
Route::post('/login', [LoginController::class, 'store']);

Route::get('/register', [RegisterController::class, 'create'])->name('register');
Route::post('/register', [RegisterController::class, 'store']);

Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // Master Data routes
    Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers.index');
    Route::post('/suppliers', [SupplierController::class, 'store'])->name('suppliers.store');
    Route::put('/suppliers/{id}', [SupplierController::class, 'update'])->name('suppliers.update');
    Route::delete('/suppliers/{id}', [SupplierController::class, 'destroy'])->name('suppliers.destroy');
    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{id}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])->name('categories.destroy');
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::put('/products/{id}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{id}', [ProductController::class, 'destroy'])->name('products.destroy');
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::post('/customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::put('/customers/{id}', [CustomerController::class, 'update'])->name('customers.update');
    Route::delete('/customers/{id}', [CustomerController::class, 'destroy'])->name('customers.destroy');    
    // User Management routes (Admin only)
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{id}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('users.destroy');
    
    // Stock Management routes
    Route::get('/stock-in', [StockInController::class, 'index'])->name('stock-in.index');
    Route::get('/stock-out', [StockOutController::class, 'index'])->name('stock-out.index');
    // History routes
    Route::get('/history', [HistoryController::class, 'index'])->name('history.index');
    Route::get('/history/stock-in/{id}/details', [HistoryController::class, 'viewStockInDetails'])->name('history.stock-in.details');
    Route::get('/history/stock-out/{id}/details', [HistoryController::class, 'viewStockOutDetails'])->name('history.stock-out.details');
    
    // Stock In - Both Admin and Staff can create/delete
    Route::post('/stock-in', [StockInController::class, 'store'])->name('stock-in.store');
    Route::delete('/stock-in/{id}', [StockInController::class, 'destroy'])->name('stock-in.destroy');
    
    // Stock Out - Creation only (no delete)
    Route::post('/stock-out', [StockOutController::class, 'store'])->name('stock-out.store');
    Route::get('/stock-out/debug', [StockOutController::class, 'debug'])->name('stock-out.debug');
    
    // Table viewer routes
    Route::get('/tables/{table}', [TableViewController::class, 'show'])->name('tables.show');

    // Notification routes
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount'])->name('notifications.unread-count');
    Route::get('/notifications/recent', [NotificationController::class, 'getRecent'])->name('notifications.recent');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');

    // Approval routes
    Route::post('/stock-in/{id}/approve', [ApprovalController::class, 'approveStockIn'])->name('stock-in.approve');
    Route::post('/stock-in/{id}/reject', [ApprovalController::class, 'rejectStockIn'])->name('stock-in.reject');
    Route::post('/stock-out/{id}/approve', [ApprovalController::class, 'approveStockOut'])->name('stock-out.approve');
    Route::post('/stock-out/{id}/reject', [ApprovalController::class, 'rejectStockOut'])->name('stock-out.reject');
    
    // Delivery receipt routes
    Route::get('/delivery-receipt/{id}/download', [DeliveryReceiptController::class, 'generateReceipt'])->name('delivery-receipt.download');
    Route::get('/delivery-receipt/{id}/view', [DeliveryReceiptController::class, 'view'])->name('delivery-receipt.view');
    
    // API routes for pending counts
    Route::get('/api/pending-counts', [ApiController::class, 'getPendingCounts'])->name('api.pending-counts');
    
    // Report routes
    Route::get('/reports/monthly', [ReportController::class, 'monthlyReport'])->name('reports.monthly');
    
    // Calendar demo route
    Route::get('/calendar-demo', fn() => \Inertia\Inertia::render('CalendarDemo'))->name('calendar-demo');
});

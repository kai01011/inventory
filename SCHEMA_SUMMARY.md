# Database Schema - Quick Summary

## ✅ Schema Implementation Complete

All 12 tables have been created with proper relationships, constraints, and Eloquent models.

---

## Database Tables (12 Total)

### Core System
1. **roles** - User roles (Admin, Manager, Staff)
2. **users** - System users with role_id FK
3. **suppliers** - Product suppliers
4. **categories** - Product categories (soft deletable)
5. **products** - Inventory products (soft deletable)
6. **customers** - Customers for orders

### Stock Management
7. **stock_in** - Incoming stock requests
8. **stock_in_items** - Line items for stock in
9. **stock_out** - Outgoing stock deliveries  
10. **stock_out_items** - Line items for stock out

### Additional
11. **cart_items** - Shopping cart (React useState optional)
12. **history** - Historical records

---

## Eloquent Models Created (12 Total)

```
✅ app/Models/Role.php
✅ app/Models/User.php
✅ app/Models/Supplier.php
✅ app/Models/Category.php
✅ app/Models/Product.php
✅ app/Models/Customer.php
✅ app/Models/StockIn.php
✅ app/Models/StockInItem.php
✅ app/Models/StockOut.php
✅ app/Models/StockOutItem.php
✅ app/Models/CartItem.php
✅ app/Models/History.php
```

---

## Key Relationships

### One-to-Many
- `Role` → `User` (1 role to many users)
- `Supplier` → `Product` (1 supplier to many products)
- `Category` → `Product` (1 category to many products)
- `User` → `StockIn` (1 user requested many stock ins)
- `User` → `StockOut` (1 user requested many stock outs)
- `Customer` → `StockOut` (1 customer received many deliveries)
- `Customer` → `CartItem` (1 customer has many cart items)
- `Product` → `StockInItem` (1 product in many stock ins)
- `Product` → `StockOutItem` (1 product in many stock outs)
- `Product` → `CartItem` (1 product in many carts)
- `StockIn` → `StockInItem` (1 stock in has many items)
- `StockOut` → `StockOutItem` (1 stock out has many items)

### Many-to-One
- `User` ← `Role`
- `Product` ← `Category`
- `Product` ← `Supplier`
- `StockIn` ← `User`
- `StockOut` ← `User`
- `StockOut` ← `Customer`
- `StockInItem` ← `StockIn`
- `StockInItem` ← `Product`
- `StockOutItem` ← `StockOut`
- `StockOutItem` ← `Product`
- `CartItem` ← `Customer`
- `CartItem` ← `Product`

---

## Features Implemented

### ✅ Soft Deletes
- `categories` - Can be soft deleted without losing data
- `products` - Can be soft deleted without losing data

### ✅ Foreign Key Constraints
- ON DELETE CASCADE - Auto-delete related records
- ON DELETE SET NULL - Keep records but null the foreign key
- All relationships properly constrained

### ✅ Unique Constraints
- `role_name` - Only one role with this name
- `supplier_name` - Only one supplier with this name
- `category_name` - Only one category with this name
- `barcode` - Product barcodes are unique
- `serial_no` - Product serial numbers are unique
- `delivery_no` - Delivery numbers are unique

### ✅ Status Enums
- **Stock In**: pending → approved → rejected / completed
- **Stock Out**: pending → approved → shipped → delivered

### ✅ Proper Data Types
- Prices use DECIMAL(10,2) for accuracy
- IDs use BIGINT for scalability
- Timestamps on all tables
- Soft delete timestamps

### ✅ Indexes
- Primary keys (auto)
- Foreign keys (auto)
- Unique constraints (auto)

---

## Migration Status

```
✅ 2026_08_03_024118 - create_roles_table
✅ 2026_08_03_024123 - create_suppliers_table
✅ 2026_08_03_024129 - create_categories_table
✅ 2026_08_03_024134 - create_products_table
✅ 2026_08_03_024139 - create_customers_table
✅ 0001_01_01_000000 - create_users_table (modified)
✅ 2026_08_03_024150 - create_stock_in_table
✅ 2026_08_03_024155 - create_stock_in_items_table
✅ 2026_08_03_024200 - create_stock_out_table
✅ 2026_08_03_024205 - create_stock_out_items_table
✅ 2026_08_03_024210 - create_cart_items_table
✅ 2026_08_03_024218 - create_history_table
```

All migrations have been **successfully run** ✅

---

## File Structure

```
database/
├── migrations/
│   ├── 0001_01_01_000000_create_users_table.php (updated)
│   ├── 2026_08_03_024118_create_roles_table.php
│   ├── 2026_08_03_024123_create_suppliers_table.php
│   ├── 2026_08_03_024129_create_categories_table.php
│   ├── 2026_08_03_024134_create_products_table.php
│   ├── 2026_08_03_024139_create_customers_table.php
│   ├── 2026_08_03_024150_create_stock_in_table.php
│   ├── 2026_08_03_024155_create_stock_in_items_table.php
│   ├── 2026_08_03_024200_create_stock_out_table.php
│   ├── 2026_08_03_024205_create_stock_out_items_table.php
│   ├── 2026_08_03_024210_create_cart_items_table.php
│   └── 2026_08_03_024218_create_history_table.php

app/
└── Models/
    ├── Role.php
    ├── User.php
    ├── Supplier.php
    ├── Category.php
    ├── Product.php
    ├── Customer.php
    ├── StockIn.php
    ├── StockInItem.php
    ├── StockOut.php
    ├── StockOutItem.php
    ├── CartItem.php
    └── History.php
```

---

## Example Queries

### Get Product with All Details
```php
$product = Product::with(['category', 'supplier'])->find(1);
echo $product->product_name;
echo $product->category->category_name;
echo $product->supplier->supplier_name;
```

### Get Stock In with Items
```php
$stockIn = StockIn::with(['requestedBy', 'items.product'])->find(1);
foreach($stockIn->items as $item) {
    echo $item->product->product_name;
    echo $item->stock_in_quantity;
    echo $item->unit_price;
}
```

### Get Stock Out Delivery
```php
$stockOut = StockOut::with(['requestedBy', 'deliveredTo', 'items.product'])->find(1);
echo $stockOut->delivery_no;
echo $stockOut->deliveredTo->customer_name;
echo $stockOut->requestedBy->name;
```

### Get Customer Cart
```php
$customer = Customer::find(1);
$cartItems = $customer->cartItems()->with('product')->get();
$total = $cartItems->sum(function($item) {
    return $item->product->price * $item->cart_quantity;
});
```

---

## Next Steps

### 1. Create Factories (Optional)
```bash
php artisan make:factory RoleFactory
php artisan make:factory ProductFactory
# ... etc
```

### 2. Create Seeders (Optional)
```bash
php artisan make:seeder RoleSeeder
php artisan make:seeder SupplierSeeder
# ... etc
```

### 3. Create Controllers
```bash
php artisan make:controller ProductController
php artisan make:controller StockInController
# ... etc
```

### 4. Create API Routes
Create endpoints in `routes/api.php` for:
- Products (CRUD)
- StockIn (create, list, update status)
- StockOut (create, list, update status)
- Customers
- Users
- Analytics

### 5. Create React Components
- Product list page
- Stock in form/list
- Stock out form/list
- Customer management
- Dashboard with charts

---

## Database Commands

```bash
# Run migrations
php artisan migrate

# Rollback all migrations
php artisan migrate:rollback

# Refresh database (rollback + migrate)
php artisan migrate:refresh

# Seed database
php artisan db:seed

# Reset and seed
php artisan migrate:refresh --seed

# Check migration status
php artisan migrate:status

# Create new migration
php artisan make:migration table_name

# Tinker REPL
php artisan tinker
```

---

## Useful Tinker Commands

```php
// In php artisan tinker

// Create a role
Role::create(['role_name' => 'Admin']);

// Create a user with role
User::create(['name' => 'John', 'email' => 'john@example.com', 'password' => bcrypt('pass'), 'role_id' => 1]);

// Get user with role
User::with('role')->first();

// Create supplier
Supplier::create(['supplier_name' => 'Acme']);

// Create category
Category::create(['category_name' => 'Electronics']);

// Create product
Product::create([
    'category_id' => 1,
    'supplier_id' => 1,
    'product_name' => 'Laptop',
    'price' => 999.99,
    'barcode' => '1234567890123',
    'unit' => 'pcs',
    'serial_no' => 'SN-12345',
    'warranty_date' => now()->addYears(2),
]);

// Get product with relationships
Product::with(['category', 'supplier'])->first();
```

---

## Performance Tips

1. **Always eager load relationships**
   ```php
   // Good
   $products = Product::with(['category', 'supplier'])->get();
   
   // Bad - causes N+1 queries
   $products = Product::all();
   ```

2. **Index frequently queried columns**
   - Status fields (already done)
   - Foreign keys (auto-indexed)
   - Frequently filtered fields

3. **Use pagination for large datasets**
   ```php
   $products = Product::paginate(15);
   ```

4. **Use `select()` to limit columns**
   ```php
   $products = Product::select('id', 'product_name', 'price')->get();
   ```

5. **Cache results when appropriate**
   ```php
   $suppliers = Cache::remember('suppliers', 3600, function() {
       return Supplier::all();
   });
   ```

---

## Documentation Files

1. **DATABASE_SCHEMA.md** - Complete schema documentation
2. **MODEL_RELATIONSHIPS.md** - Detailed model relationships and usage
3. **SCHEMA_SUMMARY.md** - This file (quick reference)

---

## Status: ✅ Complete

All 12 tables have been created with:
- ✅ Proper relationships
- ✅ Foreign key constraints
- ✅ Unique constraints
- ✅ Soft deletes where needed
- ✅ Proper data types
- ✅ All Eloquent models
- ✅ All migrations tested and working

Ready for development! 🚀

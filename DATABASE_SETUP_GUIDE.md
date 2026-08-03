# Database Setup Guide - Inventory Management System

## ✅ Current Status: Complete

All database tables, migrations, and Eloquent models have been successfully created and tested.

---

## What's Been Done

### ✅ 12 Database Tables Created
1. roles - User roles
2. users - System users
3. suppliers - Product suppliers
4. categories - Product categories
5. products - Inventory products
6. customers - Customer information
7. stock_in - Incoming stock
8. stock_in_items - Stock in line items
9. stock_out - Outgoing stock
10. stock_out_items - Stock out line items
11. cart_items - Shopping cart
12. history - Transaction history

### ✅ 12 Eloquent Models Created
All models in `app/Models/` with proper relationships and fillable attributes.

### ✅ All Migrations Run Successfully
```
2026_08_03_024118 - create_roles_table ........................... ✓
2026_08_03_024123 - create_suppliers_table ....................... ✓
2026_08_03_024129 - create_categories_table ....................... ✓
2026_08_03_024134 - create_products_table ......................... ✓
2026_08_03_024139 - create_customers_table ........................ ✓
0001_01_01_000000 - create_users_table (modified) ................ ✓
2026_08_03_024150 - create_stock_in_table ......................... ✓
2026_08_03_024155 - create_stock_in_items_table .................. ✓
2026_08_03_024200 - create_stock_out_table ........................ ✓
2026_08_03_024205 - create_stock_out_items_table ................. ✓
2026_08_03_024210 - create_cart_items_table ....................... ✓
2026_08_03_024218 - create_history_table .......................... ✓
```

---

## Database Files

### Migrations
Location: `database/migrations/`

All migration files are properly formatted with:
- ✅ Foreign key constraints
- ✅ Unique constraints
- ✅ Proper data types
- ✅ Default values
- ✅ Soft deletes where needed

### Eloquent Models
Location: `app/Models/`

All models include:
- ✅ Fillable attributes
- ✅ Casts for proper data types
- ✅ Relationships (HasMany, BelongsTo)
- ✅ Soft delete trait where needed
- ✅ PHPDoc comments

### Documentation
Location: Root directory

- `DATABASE_SCHEMA.md` - Complete schema details
- `MODEL_RELATIONSHIPS.md` - Model relationships and usage
- `ER_DIAGRAM.md` - Entity relationship diagrams
- `SCHEMA_SUMMARY.md` - Quick reference

---

## Getting Started

### 1. Verify Database Connection

Check `.env` file:
```env
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

Or for MySQL:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=inventory
DB_USERNAME=root
DB_PASSWORD=
```

### 2. Run Migrations (Already Done)

Migrations have been executed. To verify:

```bash
php artisan migrate:status
```

You should see all migrations marked as "Ran".

### 3. Refresh Database (If Needed)

To reset everything and start fresh:

```bash
php artisan migrate:refresh
```

⚠️ **WARNING**: This will delete all data!

---

## Testing the Database

### Using Tinker REPL

```bash
php artisan tinker
```

#### Create Test Data

```php
// Create a role
$adminRole = Role::create(['role_name' => 'Admin']);
$managerRole = Role::create(['role_name' => 'Manager']);
$staffRole = Role::create(['role_name' => 'Staff']);

// Create users
$admin = User::create([
    'name' => 'Admin User',
    'email' => 'admin@example.com',
    'password' => bcrypt('password'),
    'role_id' => $adminRole->id,
]);

$manager = User::create([
    'name' => 'Manager User',
    'email' => 'manager@example.com',
    'password' => bcrypt('password'),
    'role_id' => $managerRole->id,
]);

// Create suppliers
$supplier = Supplier::create(['supplier_name' => 'Acme Corporation']);
$supplier2 = Supplier::create(['supplier_name' => 'Global Imports']);

// Create categories
$electronics = Category::create(['category_name' => 'Electronics']);
$furniture = Category::create(['category_name' => 'Furniture']);

// Create products
$laptop = Product::create([
    'category_id' => $electronics->id,
    'supplier_id' => $supplier->id,
    'product_name' => 'Dell Laptop',
    'price' => 899.99,
    'barcode' => '1234567890123',
    'unit' => 'pcs',
    'serial_no' => 'DELL-SN-001',
    'warranty_date' => now()->addYears(2),
]);

$mouse = Product::create([
    'category_id' => $electronics->id,
    'supplier_id' => $supplier2->id,
    'product_name' => 'Wireless Mouse',
    'price' => 29.99,
    'barcode' => '9876543210987',
    'unit' => 'pcs',
    'serial_no' => 'MOUSE-SN-001',
    'warranty_date' => now()->addYear(),
]);

// Create customer
$customer = Customer::create(['customer_name' => 'ABC Company']);

// Create stock in request
$stockIn = StockIn::create([
    'requested_by_id' => $manager->id,
    'remarks' => 'Weekly stock replenishment',
    'status' => 'pending',
]);

// Add items to stock in
StockInItem::create([
    'stock_in_id' => $stockIn->id,
    'product_id' => $laptop->id,
    'stock_in_quantity' => 5,
    'unit_price' => 899.99,
]);

StockInItem::create([
    'stock_in_id' => $stockIn->id,
    'product_id' => $mouse->id,
    'stock_in_quantity' => 20,
    'unit_price' => 29.99,
]);

// Approve stock in
$stockIn->update(['status' => 'completed']);

// Create stock out delivery
$stockOut = StockOut::create([
    'requested_by_id' => $manager->id,
    'delivered_to_id' => $customer->id,
    'delivery_no' => '00001',
    'address' => '123 Main Street, New York, NY 10001',
    'tin' => '12-3456789',
    'status' => 'pending',
    'business_style' => 'B2B',
]);

// Add items to stock out
StockOutItem::create([
    'stock_out_id' => $stockOut->id,
    'product_id' => $laptop->id,
    'stock_out_quantity' => 2,
    'unit_price' => 999.99,
]);

StockOutItem::create([
    'stock_out_id' => $stockOut->id,
    'product_id' => $mouse->id,
    'stock_out_quantity' => 10,
    'unit_price' => 34.99,
]);

// Record in history
History::create(['stock_in_id' => $stockIn->id]);
History::create(['stock_out_id' => $stockOut->id]);

// Mark delivery as completed
$stockOut->update(['status' => 'delivered']);

echo "Test data created successfully!";
```

#### Query Test Data

```php
// Get all products
Product::all();

// Get product with category and supplier
Product::with(['category', 'supplier'])->get();

// Get stock in with items
$stockIn = StockIn::with('items.product')->first();
$stockIn->items;

// Get stock out delivery
$stockOut = StockOut::with(['requestedBy', 'deliveredTo', 'items.product'])->first();

// Calculate delivery total
$total = $stockOut->items->sum(function($item) {
    return $item->stock_out_quantity * $item->unit_price;
});

// Get customer's deliveries
$customer->stockOuts()->with('items')->get();

// Get user's requests
$manager->stockInRequests()->get();
$manager->stockOutRequests()->get();

// View history
History::with(['stockIn', 'stockOut'])->get();
```

---

## Database Backup

### Backup SQLite Database

```bash
# Simple copy
cp database/database.sqlite database/database.sqlite.backup

# Or for scheduled backups
php artisan backup:run
```

### Backup MySQL Database

```bash
# Using mysqldump
mysqldump -u root -p inventory > backup.sql

# Restore
mysql -u root -p inventory < backup.sql
```

---

## Troubleshooting

### Migration Errors

**Problem**: "Foreign key constraint fails"
```
Solution: Ensure tables are created in the correct order.
Migrations are timestamped and run in order. Check DATABASE_SCHEMA.md
for dependency order.
```

**Problem**: "SQLSTATE[HY000]: General error: 1 no such table"
```
Solution: Run migrations first
php artisan migrate
```

### Model Issues

**Problem**: "Class not found"
```
Solution: Ensure model is in app/Models/ and namespaced correctly
Check that model filename matches class name
```

**Problem**: "Mass assignment exception"
```
Solution: Add fillable property to model:
protected $fillable = ['column1', 'column2'];
```

### Relationship Issues

**Problem**: Relationship returns null
```
Solution: Check foreign key values are correct
Use eager loading: Model::with('relationship')->get()
```

---

## Performance Optimization

### 1. Add Indexes

The most important indexes are already in place:
- Primary keys (id)
- Foreign keys (auto-indexed)
- Unique constraints (auto-indexed)

For future optimization, consider:
```php
// In migration
$table->index('status'); // For stock_in and stock_out
$table->index('created_at'); // For filtering by date
```

### 2. Use Eager Loading

```php
// Good - one query
$products = Product::with(['category', 'supplier'])->get();

// Bad - N+1 queries
$products = Product::all();
foreach($products as $product) {
    echo $product->category->name; // Extra query per product
}
```

### 3. Pagination

```php
// For large datasets
$products = Product::paginate(15);
$stock = StockOut::paginate(20);
```

### 4. Caching

```php
// Cache frequently accessed data
$suppliers = Cache::remember('suppliers', 3600, function() {
    return Supplier::all();
});
```

---

## Backup & Recovery

### Create Database Dump

**SQLite:**
```bash
sqlite3 database/database.sqlite ".dump" > backup.sql
```

**MySQL:**
```bash
mysqldump -u root -p inventory > backup.sql
```

### Restore from Backup

**SQLite:**
```bash
sqlite3 database/database.sqlite < backup.sql
```

**MySQL:**
```bash
mysql -u root -p inventory < backup.sql
```

---

## Common Tasks

### Add New Product

```php
$product = Product::create([
    'category_id' => 1,
    'supplier_id' => 1,
    'product_name' => 'New Product',
    'price' => 99.99,
    'barcode' => '1234567890',
    'unit' => 'pcs',
    'serial_no' => 'SN-001',
]);
```

### Create Stock In Request

```php
$stockIn = StockIn::create([
    'requested_by_id' => auth()->id(),
    'remarks' => 'Restocking',
    'status' => 'pending',
]);

// Add items
StockInItem::create([
    'stock_in_id' => $stockIn->id,
    'product_id' => 1,
    'stock_in_quantity' => 10,
    'unit_price' => 99.99,
]);
```

### Create Stock Out Delivery

```php
$stockOut = StockOut::create([
    'requested_by_id' => auth()->id(),
    'delivered_to_id' => 1,
    'delivery_no' => '00001',
    'address' => '123 Main St',
    'status' => 'pending',
]);

// Add items
StockOutItem::create([
    'stock_out_id' => $stockOut->id,
    'product_id' => 1,
    'stock_out_quantity' => 5,
    'unit_price' => 99.99,
]);

// Track in history
History::create(['stock_out_id' => $stockOut->id]);
```

---

## API Endpoints to Create

After creating controllers, implement:

```
GET    /api/products
GET    /api/products/{id}
POST   /api/products
PUT    /api/products/{id}
DELETE /api/products/{id}

GET    /api/stock-in
GET    /api/stock-in/{id}
POST   /api/stock-in
PUT    /api/stock-in/{id}
PUT    /api/stock-in/{id}/approve
PUT    /api/stock-in/{id}/reject

GET    /api/stock-out
GET    /api/stock-out/{id}
POST   /api/stock-out
PUT    /api/stock-out/{id}
PUT    /api/stock-out/{id}/approve
PUT    /api/stock-out/{id}/ship
PUT    /api/stock-out/{id}/deliver

GET    /api/customers
POST   /api/customers
GET    /api/categories
POST   /api/categories
GET    /api/suppliers
POST   /api/suppliers

GET    /api/dashboard/summary
GET    /api/dashboard/analytics
GET    /api/history
```

---

## React Components to Create

For the frontend (using Inertia + React):

```
Pages/
├── Products/
│   ├── Index.jsx
│   ├── Create.jsx
│   └── Edit.jsx
├── StockIn/
│   ├── Index.jsx
│   ├── Create.jsx
│   └── Show.jsx
├── StockOut/
│   ├── Index.jsx
│   ├── Create.jsx
│   └── Show.jsx
├── Customers/
│   ├── Index.jsx
│   ├── Create.jsx
│   └── Edit.jsx
├── Dashboard.jsx
└── History.jsx

Components/
├── ProductForm.jsx
├── StockInForm.jsx
├── StockOutForm.jsx
├── CustomerForm.jsx
├── StatusBadge.jsx
└── DataTable.jsx
```

---

## Next Steps

1. ✅ Database schema created
2. ✅ Migrations created and tested
3. ✅ Eloquent models created
4. ⬜ Create controllers and routes
5. ⬜ Create API endpoints
6. ⬜ Create React components
7. ⬜ Implement authentication
8. ⬜ Add authorization policies
9. ⬜ Create tests
10. ⬜ Deploy

---

## Support & Documentation

- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Detailed table definitions
- [MODEL_RELATIONSHIPS.md](./MODEL_RELATIONSHIPS.md) - Model relationships
- [ER_DIAGRAM.md](./ER_DIAGRAM.md) - Visual entity diagrams
- [SCHEMA_SUMMARY.md](./SCHEMA_SUMMARY.md) - Quick reference

---

## Quick Commands Reference

```bash
# Database
php artisan migrate                    # Run migrations
php artisan migrate:refresh            # Refresh database
php artisan migrate:rollback           # Rollback last batch
php artisan migrate:status             # Check status

# Models
php artisan make:model ModelName       # Create model
php artisan make:model ModelName -m    # With migration
php artisan make:model ModelName -c    # With controller

# REPL
php artisan tinker                     # Interactive shell

# Factory/Seeder
php artisan make:factory NameFactory   # Create factory
php artisan make:seeder NameSeeder     # Create seeder
php artisan db:seed                    # Run seeders

# Controllers
php artisan make:controller UserController
php artisan make:controller UserController -r # Resourceful
```

---

## Status: ✅ COMPLETE

**Database schema is production-ready!**

All 12 tables created with:
- ✅ Proper relationships
- ✅ Foreign key constraints
- ✅ Unique constraints
- ✅ Data type validation
- ✅ Soft deletes where needed
- ✅ Eloquent models
- ✅ Complete documentation

Ready to build controllers and React components!

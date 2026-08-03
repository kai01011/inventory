# Eloquent Models & Relationships

This document describes all Eloquent models and their relationships for the inventory management system.

---

## Models Overview

### Core Models
1. **Role** - User roles (Admin, Manager, Staff)
2. **User** - System users
3. **Supplier** - Product suppliers
4. **Category** - Product categories
5. **Product** - Inventory products

### Transaction Models
6. **StockIn** - Incoming stock requests
7. **StockInItem** - Items in stock in requests
8. **StockOut** - Outgoing stock deliveries
9. **StockOutItem** - Items in stock out deliveries
10. **History** - Historical records

### Other Models
11. **Customer** - Customers who receive stock
12. **CartItem** - Shopping cart items

---

## Model Details & Usage

### Role Model

**File:** `app/Models/Role.php`

**Database Table:** `roles`

**Attributes:**
- `id` - Primary key
- `role_name` - Role name (Admin, Manager, Staff)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Relationships:**

```php
// Get all users with this role
$role->users() // HasMany relationship
```

**Usage Examples:**

```php
// Create a new role
$adminRole = Role::create(['role_name' => 'Admin']);

// Get all users in a role
$adminUsers = Role::where('role_name', 'Admin')->first()->users;

// Access role from user
$user = User::first();
$role = $user->role;
```

---

### User Model

**File:** `app/Models/User.php`

**Database Table:** `users`

**Attributes:**
- `id` - Primary key
- `name` - User's full name
- `email` - Email address
- `email_verified_at` - Email verification timestamp
- `password` - Hashed password
- `role_id` - Foreign key to roles
- `remember_token` - Authentication token
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Relationships:**

```php
// Get the role of this user
$user->role() // BelongsTo relationship

// Get all stock in requests created by this user
$user->stockInRequests() // HasMany relationship

// Get all stock out requests created by this user
$user->stockOutRequests() // HasMany relationship
```

**Usage Examples:**

```php
// Create a new user
$user = User::create([
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'password' => bcrypt('password'),
    'role_id' => 1,
]);

// Get user with their role
$user = User::with('role')->first();
echo $user->role->role_name; // 'Admin'

// Get all stock in requests created by user
$stockInRequests = $user->stockInRequests()->get();

// Get stock out requests with items
$stockOutRequests = $user->stockOutRequests()->with('items')->get();
```

---

### Supplier Model

**File:** `app/Models/Supplier.php`

**Database Table:** `suppliers`

**Attributes:**
- `id` - Primary key
- `supplier_name` - Supplier company name
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Relationships:**

```php
// Get all products from this supplier
$supplier->products() // HasMany relationship
```

**Usage Examples:**

```php
// Create a new supplier
$supplier = Supplier::create(['supplier_name' => 'Acme Corporation']);

// Get all products from a supplier
$products = $supplier->products;

// Get supplier with their products
$supplier = Supplier::with('products')->first();
```

---

### Category Model

**File:** `app/Models/Category.php`

**Database Table:** `categories`

**Features:**
- Uses soft deletes (`deleted_at`)

**Attributes:**
- `id` - Primary key
- `category_name` - Category name
- `deleted_at` - Soft delete timestamp
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Relationships:**

```php
// Get all products in this category
$category->products() // HasMany relationship
```

**Usage Examples:**

```php
// Create a new category
$category = Category::create(['category_name' => 'Electronics']);

// Get all products in a category
$products = $category->products;

// Soft delete a category
$category->delete();

// Get only deleted categories
$deletedCategories = Category::onlyTrashed()->get();

// Restore a deleted category
$category->restore();

// Get all categories including deleted ones
$allCategories = Category::withTrashed()->get();
```

---

### Product Model

**File:** `app/Models/Product.php`

**Database Table:** `products`

**Features:**
- Uses soft deletes (`deleted_at`)
- Price and warranty_date use proper casting

**Attributes:**
- `id` - Primary key
- `category_id` - Foreign key to categories
- `supplier_id` - Foreign key to suppliers
- `product_name` - Product name
- `price` - Unit price (nullable)
- `barcode` - Product barcode (unique, nullable)
- `unit` - Unit of measurement
- `serial_no` - Serial number (unique)
- `warranty_date` - Warranty expiry date (nullable)
- `deleted_at` - Soft delete timestamp
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Relationships:**

```php
// Get the category this product belongs to
$product->category() // BelongsTo relationship

// Get the supplier of this product
$product->supplier() // BelongsTo relationship

// Get all stock in items for this product
$product->stockInItems() // HasMany relationship

// Get all stock out items for this product
$product->stockOutItems() // HasMany relationship

// Get all cart items for this product
$product->cartItems() // HasMany relationship
```

**Usage Examples:**

```php
// Create a new product
$product = Product::create([
    'category_id' => 1,
    'supplier_id' => 1,
    'product_name' => 'Laptop',
    'price' => 999.99,
    'barcode' => '1234567890123',
    'unit' => 'pcs',
    'serial_no' => 'SN-12345',
    'warranty_date' => now()->addYears(2),
]);

// Get product with category and supplier
$product = Product::with(['category', 'supplier'])->find(1);
echo $product->category->category_name;
echo $product->supplier->supplier_name;

// Get products by category
$products = Product::where('category_id', 1)->get();

// Get products within price range
$products = Product::whereBetween('price', [100, 1000])->get();

// Soft delete a product
$product->delete();

// Get only deleted products
$deletedProducts = Product::onlyTrashed()->get();

// Get all stock in history for a product
$stockInHistory = $product->stockInItems()->with('stockIn')->get();

// Get all stock out history for a product
$stockOutHistory = $product->stockOutItems()->with('stockOut')->get();
```

---

### Customer Model

**File:** `app/Models/Customer.php`

**Database Table:** `customers`

**Attributes:**
- `id` - Primary key
- `customer_name` - Customer name
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Relationships:**

```php
// Get all stock out deliveries for this customer
$customer->stockOuts() // HasMany relationship

// Get all cart items for this customer
$customer->cartItems() // HasMany relationship
```

**Usage Examples:**

```php
// Create a new customer
$customer = Customer::create(['customer_name' => 'ABC Company']);

// Get all deliveries to a customer
$deliveries = $customer->stockOuts;

// Get deliveries with status
$pendingDeliveries = $customer->stockOuts()
    ->where('status', 'pending')
    ->get();

// Get customer's shopping cart
$cartItems = $customer->cartItems()->with('product')->get();
```

---

### StockIn Model

**File:** `app/Models/StockIn.php`

**Database Table:** `stock_in`

**Attributes:**
- `id` - Primary key
- `requested_by_id` - Foreign key to users
- `remarks` - Additional notes
- `status` - Enum: pending, approved, rejected, completed
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Status Values:**
- `pending` - Request created, awaiting approval
- `approved` - Approved for receiving
- `rejected` - Request rejected
- `completed` - Stock received and processed

**Relationships:**

```php
// Get the user who requested this stock in
$stockIn->requestedBy() // BelongsTo relationship

// Get all items in this stock in request
$stockIn->items() // HasMany relationship

// Get history records for this stock in
$stockIn->histories() // HasMany relationship
```

**Usage Examples:**

```php
// Create a stock in request
$stockIn = StockIn::create([
    'requested_by_id' => 1,
    'remarks' => 'Weekly stock replenishment',
    'status' => 'pending',
]);

// Get stock in with user and items
$stockIn = StockIn::with(['requestedBy', 'items.product'])
    ->find(1);

// Get all pending stock in requests
$pendingRequests = StockIn::where('status', 'pending')->get();

// Update stock in status
$stockIn->update(['status' => 'approved']);

// Get all items in a stock in request
$items = $stockIn->items()->with('product')->get();

// Get stock in history
$history = $stockIn->histories;
```

---

### StockInItem Model

**File:** `app/Models/StockInItem.php`

**Database Table:** `stock_in_items`

**Attributes:**
- `id` - Primary key
- `stock_in_id` - Foreign key to stock_in
- `product_id` - Foreign key to products
- `stock_in_quantity` - Quantity received
- `unit_price` - Purchase price per unit
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Relationships:**

```php
// Get the stock in request this item belongs to
$item->stockIn() // BelongsTo relationship

// Get the product for this item
$item->product() // BelongsTo relationship
```

**Usage Examples:**

```php
// Create a stock in item
$item = StockInItem::create([
    'stock_in_id' => 1,
    'product_id' => 5,
    'stock_in_quantity' => 10,
    'unit_price' => 99.99,
]);

// Get item with related data
$item = StockInItem::with(['stockIn', 'product'])->find(1);

// Calculate total for this item
$total = $item->stock_in_quantity * $item->unit_price; // 999.90
```

---

### StockOut Model

**File:** `app/Models/StockOut.php`

**Database Table:** `stock_out`

**Attributes:**
- `id` - Primary key
- `requested_by_id` - Foreign key to users
- `delivered_to_id` - Foreign key to customers
- `delivery_no` - Unique delivery number (auto-increment)
- `address` - Delivery address
- `tin` - Tax identification number
- `status` - Enum: pending, approved, shipped, delivered
- `business_style` - Business classification
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Status Values:**
- `pending` - Delivery request created
- `approved` - Approved for shipping
- `shipped` - Items shipped
- `delivered` - Delivery confirmed

**Relationships:**

```php
// Get the user who requested this stock out
$stockOut->requestedBy() // BelongsTo relationship

// Get the customer this delivery is for
$stockOut->deliveredTo() // BelongsTo relationship

// Get all items in this stock out delivery
$stockOut->items() // HasMany relationship

// Get history records for this stock out
$stockOut->histories() // HasMany relationship
```

**Usage Examples:**

```php
// Create a stock out delivery
$stockOut = StockOut::create([
    'requested_by_id' => 1,
    'delivered_to_id' => 3,
    'delivery_no' => '00001',
    'address' => '123 Main St, City, Country',
    'tin' => '12345678901',
    'status' => 'pending',
    'business_style' => 'B2B',
]);

// Get stock out with all related data
$stockOut = StockOut::with(['requestedBy', 'deliveredTo', 'items.product'])->find(1);

// Get all pending deliveries
$pendingDeliveries = StockOut::where('status', 'pending')->get();

// Get all delivered stock outs
$completedDeliveries = StockOut::where('status', 'delivered')->get();

// Update delivery status
$stockOut->update(['status' => 'shipped']);

// Get all items in a delivery
$items = $stockOut->items()->with('product')->get();

// Calculate delivery total
$total = $stockOut->items()->sum(function($item) {
    return $item->stock_out_quantity * $item->unit_price;
});
```

---

### StockOutItem Model

**File:** `app/Models/StockOutItem.php`

**Database Table:** `stock_out_items`

**Attributes:**
- `id` - Primary key
- `stock_out_id` - Foreign key to stock_out
- `product_id` - Foreign key to products
- `stock_out_quantity` - Quantity shipped
- `unit_price` - Sale price per unit
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Relationships:**

```php
// Get the stock out delivery this item belongs to
$item->stockOut() // BelongsTo relationship

// Get the product for this item
$item->product() // BelongsTo relationship
```

**Usage Examples:**

```php
// Create a stock out item
$item = StockOutItem::create([
    'stock_out_id' => 1,
    'product_id' => 5,
    'stock_out_quantity' => 5,
    'unit_price' => 150.00,
]);

// Get item with related data
$item = StockOutItem::with(['stockOut', 'product'])->find(1);

// Calculate line total
$lineTotal = $item->stock_out_quantity * $item->unit_price; // 750.00
```

---

### CartItem Model

**File:** `app/Models/CartItem.php`

**Database Table:** `cart_items`

**Note:** Can also be managed with React useState for client-side only

**Attributes:**
- `id` - Primary key
- `customer_id` - Foreign key to customers
- `product_id` - Foreign key to products
- `cart_quantity` - Quantity in cart
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Relationships:**

```php
// Get the customer this cart belongs to
$item->customer() // BelongsTo relationship

// Get the product in this cart item
$item->product() // BelongsTo relationship
```

**Usage Examples:**

```php
// Add item to cart
$cartItem = CartItem::create([
    'customer_id' => 1,
    'product_id' => 5,
    'cart_quantity' => 3,
]);

// Get customer's cart
$cart = CartItem::where('customer_id', 1)
    ->with('product')
    ->get();

// Update cart item quantity
$cartItem->update(['cart_quantity' => 5]);

// Remove item from cart
$cartItem->delete();

// Clear entire cart for customer
CartItem::where('customer_id', 1)->delete();

// Calculate cart total
$cartTotal = CartItem::where('customer_id', 1)
    ->with('product')
    ->get()
    ->sum(function($item) {
        return $item->product->price * $item->cart_quantity;
    });
```

---

### History Model

**File:** `app/Models/History.php`

**Database Table:** `history`

**Purpose:** Tracks all stock movements and transactions

**Attributes:**
- `id` - Primary key
- `stock_in_id` - Foreign key to stock_in (nullable)
- `stock_out_id` - Foreign key to stock_out (nullable)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Relationships:**

```php
// Get the stock in record for this history entry
$history->stockIn() // BelongsTo relationship

// Get the stock out record for this history entry
$history->stockOut() // BelongsTo relationship
```

**Usage Examples:**

```php
// Create history record for stock in
$history = History::create(['stock_in_id' => 1]);

// Create history record for stock out
$history = History::create(['stock_out_id' => 1]);

// Get all stock movements
$allHistory = History::all();

// Get all stock in movements
$inMovements = History::whereNotNull('stock_in_id')
    ->with('stockIn.items')
    ->get();

// Get all stock out movements
$outMovements = History::whereNotNull('stock_out_id')
    ->with('stockOut.items')
    ->get();

// Get stock history for a specific product
// (through stock in/out items)
```

---

## Querying with Relationships

### Eager Loading (Recommended)

Load related models efficiently:

```php
// Single relationship
$users = User::with('role')->get();

// Multiple relationships
$products = Product::with(['category', 'supplier'])->get();

// Nested relationships
$stockOuts = StockOut::with('items.product', 'requestedBy', 'deliveredTo')->get();

// Conditional loading
$users = User::with(['role' => function($query) {
    $query->where('role_name', 'Admin');
}])->get();
```

### Lazy Loading

Load relationships only when needed (can cause N+1 problem):

```php
$user = User::find(1);
$role = $user->role; // Loads on access
```

### Filtering with Relationships

```php
// Products in specific category
$products = Product::where('category_id', 1)->get();

// Stock in pending requests
$pending = StockIn::where('status', 'pending')
    ->with('requestedBy')
    ->get();

// Deliveries to specific customer
$deliveries = StockOut::where('delivered_to_id', 1)->get();

// Using whereHas to filter by relationship existence
$users = User::whereHas('stockInRequests', function($q) {
    $q->where('status', 'completed');
})->get();
```

### Aggregating with Relationships

```php
// Count items in a stock in
$itemCount = $stockIn->items()->count();

// Sum quantities in stock out
$totalQuantity = $stockOut->items()->sum('stock_out_quantity');

// Average price in stock in items
$avgPrice = $stockIn->items()->avg('unit_price');

// Calculate total value
$totalValue = $stockOut->items()->sum(function($item) {
    return $item->stock_out_quantity * $item->unit_price;
});
```

---

## Best Practices

1. **Always use eager loading** - Prevent N+1 queries
   ```php
   // Good
   $users = User::with('role')->get();
   
   // Bad - causes N+1 query
   $users = User::all();
   foreach($users as $user) {
       echo $user->role->role_name; // Extra query each iteration
   }
   ```

2. **Use Fillable for mass assignment**
   ```php
   // Models have $fillable defined for security
   $product = Product::create($validatedData);
   ```

3. **Cast attributes properly**
   ```php
   // Decimal fields cast to decimal:2
   $price = $product->price; // Returns decimal object
   ```

4. **Use soft deletes for audit trails**
   ```php
   $category->delete(); // Soft delete
   $category->restore(); // Restore
   Category::onlyTrashed()->get(); // Get deleted
   ```

5. **Index foreign keys and status fields**
   - Already done in migrations
   - Improves query performance

---

## Common Queries

### Dashboard Analytics

```php
// Total products
$totalProducts = Product::count();

// Products by category
$productsByCategory = Product::selectRaw('category_id, count(*) as total')
    ->groupBy('category_id')
    ->with('category')
    ->get();

// Stock in summary
$stockInSummary = StockIn::selectRaw('status, count(*) as total')
    ->groupBy('status')
    ->get();

// Total stock out value
$totalOutValue = StockOutItem::selectRaw('SUM(stock_out_quantity * unit_price) as total')
    ->first();

// Recent deliveries
$recentDeliveries = StockOut::with(['deliveredTo', 'requestedBy'])
    ->latest()
    ->limit(10)
    ->get();
```

---

## Testing Models

```php
// In tests, you can factory relationships
$user = User::factory()->create();
$product = Product::factory()
    ->for(Category::factory())
    ->for(Supplier::factory())
    ->create();
```

---

For more information, see:
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Table structure
- [Laravel Eloquent Documentation](https://laravel.com/docs/eloquent)

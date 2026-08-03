# Entity Relationship Diagram

## Visual Representation

### Core System Tables

```
┌─────────────────────────────────────────────────────┐
│                     DATABASE                        │
│                   RELATIONSHIPS                     │
└─────────────────────────────────────────────────────┘

ROLES TABLE
┌─────────────────────┐
│      roles          │
├─────────────────────┤
│ id (PK)             │
│ role_name (UNIQUE)  │
│ created_at          │
│ updated_at          │
└──────────┬──────────┘
           │ 1:N
           │
           ▼
┌─────────────────────┐
│      users          │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ email (UNIQUE)      │
│ password            │
│ role_id (FK) ◄──────┤
│ created_at          │
│ updated_at          │
└──────┬──────┬───────┘
       │ 1:N  │ 1:N
       │      │
   ┌───┘      └─────────┐
   │                     │
   ▼                     ▼
STOCK_IN REQUEST    STOCK_OUT DELIVERY


SUPPLIERS TABLE
┌─────────────────────┐
│    suppliers        │
├─────────────────────┤
│ id (PK)             │
│ supplier_name       │
│  (UNIQUE)           │
│ created_at          │
│ updated_at          │
└──────────┬──────────┘
           │ 1:N
           │
           ▼
┌─────────────────────┐
│    products         │
├─────────────────────┤
│ id (PK)             │
│ category_id (FK)◄───┼───────┐
│ supplier_id (FK)◄───┤       │
│ product_name        │       │
│ price (NULLABLE)    │       │
│ barcode (UNIQUE)    │       │
│ unit                │       │
│ serial_no (UNIQUE)  │       │
│ warranty_date       │       │
│ deleted_at          │       │
│ created_at          │       │
│ updated_at          │       │
└──────┬──────────────┘       │
       │                      │
       │ 1:N                  │
       │            ┌─────────┘
       │            │
       │            ▼
       │      ┌─────────────────────┐
       │      │   categories        │
       │      ├─────────────────────┤
       │      │ id (PK)             │
       │      │ category_name       │
       │      │  (UNIQUE)           │
       │      │ deleted_at          │
       │      │ created_at          │
       │      │ updated_at          │
       │      └─────────────────────┘
       │
       ├─────────────────┬─────────────────┐
       │ 1:N             │ 1:N             │ 1:N
       │                 │                 │
       ▼                 ▼                 ▼
  STOCK_IN_ITEMS   STOCK_OUT_ITEMS   CART_ITEMS
```

---

## Stock Management Flow

### Stock In (Receiving)

```
REQUEST INITIATED
        │
        ▼
┌──────────────────────────────┐
│      stock_in               │
├──────────────────────────────┤
│ id                           │
│ requested_by_id (users.id)   │
│ remarks                      │
│ status: pending→approved→    │
│         rejected/completed   │
│ created_at                   │
│ updated_at                   │
└──────────────┬───────────────┘
               │ 1:N
               │
               ▼
    ┌──────────────────────────────┐
    │   stock_in_items            │
    ├──────────────────────────────┤
    │ id                           │
    │ stock_in_id (FK)             │
    │ product_id (FK)              │
    │ stock_in_quantity            │
    │ unit_price                   │
    │ created_at                   │
    │ updated_at                   │
    └──────────────┬───────────────┘
                   │
                   ▼
            PRODUCTS UPDATED
         (inventory increases)
         
                   │
                   ▼
        ┌──────────────────────┐
        │    history           │
        ├──────────────────────┤
        │ id                   │
        │ stock_in_id (FK)     │
        │ stock_out_id (FK)    │
        │ created_at           │
        │ updated_at           │
        └──────────────────────┘
```

### Stock Out (Delivery)

```
DELIVERY INITIATED
        │
        ▼
┌──────────────────────────────┐
│      stock_out              │
├──────────────────────────────┤
│ id                           │
│ requested_by_id (users.id)   │
│ delivered_to_id (customers.id)
│ delivery_no (unique 5-digit) │
│ address                      │
│ tin (tax ID)                 │
│ business_style               │
│ status: pending→approved→    │
│         shipped→delivered    │
│ created_at                   │
│ updated_at                   │
└──────────────┬───────────────┘
               │ 1:N
               │
               ▼
    ┌──────────────────────────────┐
    │   stock_out_items           │
    ├──────────────────────────────┤
    │ id                           │
    │ stock_out_id (FK)            │
    │ product_id (FK)              │
    │ stock_out_quantity           │
    │ unit_price                   │
    │ created_at                   │
    │ updated_at                   │
    └──────────────┬───────────────┘
                   │
                   ▼
        DELIVERY CONFIRMED
     (inventory decreases)
     
                   │
                   ▼
        ┌──────────────────────┐
        │    history           │
        ├──────────────────────┤
        │ id                   │
        │ stock_in_id (FK)     │
        │ stock_out_id (FK)    │
        │ created_at           │
        │ updated_at           │
        └──────────────────────┘
```

---

## Customer & Cart Flow

```
┌──────────────────────┐
│    customers         │
├──────────────────────┤
│ id (PK)              │
│ customer_name        │
│ created_at           │
│ updated_at           │
└──────┬───────────────┘
       │ 1:N
       ├──────────────────┬─────────────────┐
       │                  │                 │
       │ receives         │ has             │
       ▼                  ▼                 ▼
   STOCK_OUT          CART_ITEMS       (orders)
   deliveries    ┌──────────────────────┐
                 │   cart_items         │
                 ├──────────────────────┤
                 │ id (PK)              │
                 │ customer_id (FK)     │
                 │ product_id (FK)      │
                 │ cart_quantity        │
                 │ created_at           │
                 │ updated_at           │
                 └──────┬───────────────┘
                        │
                        ▼
                    PRODUCTS
                  (can become
                   stock_out
                   items)
```

---

## Complete Schema View

```
┌────────────────────────────────────────────────────────────────────┐
│                      INVENTORY SYSTEM SCHEMA                       │
└────────────────────────────────────────────────────────────────────┘

MASTER DATA                  TRANSACTIONS               TRACKING
─────────────────────────────────────────────────────────────────────

│ roles                       │ stock_in               │ history
├─ id                         ├─ id                   ├─ id
├─ role_name                  ├─ requested_by_id ──┐ ├─ stock_in_id
└─ timestamps                 ├─ status              │ ├─ stock_out_id
                              ├─ remarks             │ └─ timestamps
│ users                       └─ timestamps          │
├─ id                                                │ (tracks all
├─ name                       │ stock_in_items       │  movements)
├─ email                      ├─ id                  │
├─ password                   ├─ stock_in_id ────────┼─ references
├─ role_id ──────────┐        ├─ product_id          │ either
└─ timestamps        │        ├─ qty & price         │ stock_in or
                     │        └─ timestamps          │ stock_out
│ suppliers          │                               │
├─ id                │        │ stock_out            │
├─ supplier_name     │        ├─ id                  │
└─ timestamps        │        ├─ requested_by_id ┐   │
                     │        ├─ delivered_to_id  │   │
│ categories         │        ├─ delivery_no      │   │
├─ id                │        ├─ address          │   │
├─ category_name     │        ├─ tin              │   │
├─ deleted_at        │        ├─ business_style   │   │
└─ timestamps        │        ├─ status           │   │
                     │        └─ timestamps       │   │
│ customers          │                           │   │
├─ id                │        │ stock_out_items   │   │
├─ customer_name     │        ├─ id               │   │
└─ timestamps        │        ├─ stock_out_id ────┼───┤
                     │        ├─ product_id       │   │
│ products      ┌────┴─────┐  ├─ qty & price      │   │
├─ id           │          │  └─ timestamps       │   │
├─ category_id ─┘          │                      │   │
├─ supplier_id ────────┐   │  │ cart_items        │   │
├─ name                │   │  ├─ id               │   │
├─ price       ┌───────┼───┼──┤- customer_id ─┐  │   │
├─ barcode     │       │   │  ├─ product_id ──┼──┼───┤
├─ unit        │       │   │  ├─ qty           │  │   │
├─ serial_no   │       │   │  └─ timestamps    │  │   │
├─ warranty    │       │   │                   │  │   │
├─ deleted_at  │       │   │  RELATIONSHIPS    │  │   │
└─ timestamps  │       │   │  ──────────────   │  │   │
              │       │   │  M ─ to ─ N       │  │   │
              ▼       ▼   │  via line items   │  │   │
          FOREIGN KEYS    │                   │  │   │
          across          └─────────────────┬─┘  │   │
          all tables                        │    │   │
                                            ▼    ▼   ▼
```

---

## Table Dependencies (Migration Order)

```
1. roles (no dependencies)
   ↓
2. users (depends on roles)
   ↓
3. suppliers (no dependencies)
   ↓
4. categories (no dependencies)
   ↓
5. products (depends on suppliers, categories)
   ↓
6. customers (no dependencies)
   ↓
7. stock_in (depends on users)
   ↓
8. stock_in_items (depends on stock_in, products)
   ↓
9. stock_out (depends on users, customers)
   ↓
10. stock_out_items (depends on stock_out, products)
    ↓
11. cart_items (depends on customers, products)
    ↓
12. history (depends on stock_in, stock_out)
```

---

## Data Flow Diagram

```
ADMIN CREATES SYSTEM DATA
├─ Roles
│  └─ Users (assigned roles)
├─ Suppliers
├─ Categories
└─ Products (assigned suppliers & categories)

OPERATIONAL FLOW

WAREHOUSE MANAGER (Stock In):
├─ Creates Stock In Request
├─ Adds Items (products + quantities + prices)
├─ Submits for Approval
├─ Status: pending → approved → completed
├─ System records in History
└─ Products available for Stock Out

SALES MANAGER (Stock Out):
├─ Selects Customer
├─ Removes Items from Stock In
├─ Creates Delivery Request
├─ Gets auto-generated Delivery Number
├─ Sets Status: pending → approved → shipped → delivered
├─ System records in History
└─ Updates Product Quantities

CUSTOMER (via React Frontend):
├─ Browses Products
├─ Adds to Cart (stored in cart_items)
├─ Can view Cart
└─ Can checkout (converted to Stock Out)

ADMIN VIEWS:
├─ Dashboard
│  ├─ Total Products
│  ├─ Stock Levels
│  ├─ Recent Transactions
│  └─ Analytics
├─ History
│  └─ All Stock In/Out movements
└─ Notifications
   ├─ Pending Approvals
   ├─ Delivery Status
   └─ Low Stock Alerts
```

---

## Status Field Values

### Stock In Status
```
pending   ──┬──→  approved  ──→  completed
            │
            └──→  rejected
```

### Stock Out Status
```
pending  ──┬──→  approved  ──→  shipped  ──→  delivered
           │
           └──→  (cancelled/rejected)
```

---

## Key Constraints

### Unique Constraints
```
roles.role_name - Only one "Admin", one "Manager", etc.
suppliers.supplier_name - Each supplier name is unique
categories.category_name - Each category name is unique
products.barcode - No duplicate barcodes (when present)
products.serial_no - No duplicate serial numbers
stock_out.delivery_no - Each delivery has unique number (auto-gen)
users.email - Each user has unique email
```

### Foreign Key Constraints
```
ON DELETE CASCADE - Delete related records
  └─ Supplier → Products
  └─ Category → Products
  └─ User → StockIn/StockOut
  └─ StockIn → StockInItems
  └─ StockOut → StockOutItems
  └─ Customer → CartItems, StockOut
  └─ Product → CartItems, StockInItems, StockOutItems

ON DELETE SET NULL - Keep records but remove reference
  └─ History → StockIn (if deleted)
  └─ History → StockOut (if deleted)
```

---

## Soft Delete Tables

```
categories
├─ deleted_at timestamp (NULL = active)
├─ Only soft deleted (not physically removed)
└─ Can query with: Category::onlyTrashed()

products
├─ deleted_at timestamp (NULL = active)
├─ Only soft deleted (not physically removed)
└─ Can query with: Product::onlyTrashed()
```

---

## Indexes (Automatic)

```
Primary Keys (id) - Fast lookups
Foreign Keys - Fast joins
Unique Constraints - Fast WHERE clauses
Status Enums - Good for WHERE filtering
```

Recommended for future:
- `products.barcode` - For barcode scanning
- `stock_in.status` - For filtering pending
- `stock_out.status` - For filtering pending
- `stock_out.delivery_no` - For delivery lookups

---

## Transaction Examples

### Example 1: Complete Stock In Request

```
1. User creates StockIn
   INSERT INTO stock_in (requested_by_id, status, remarks)

2. Add items to request
   INSERT INTO stock_in_items (stock_in_id, product_id, qty, price)
   INSERT INTO stock_in_items (stock_in_id, product_id, qty, price)

3. Approve request
   UPDATE stock_in SET status = 'approved'

4. Mark as completed
   UPDATE stock_in SET status = 'completed'

5. Record in history
   INSERT INTO history (stock_in_id)

6. Products now available for delivery
```

### Example 2: Complete Stock Out Delivery

```
1. User creates StockOut for customer
   INSERT INTO stock_out (requested_by_id, delivered_to_id, ...)
   AUTO GENERATES delivery_no

2. Add items to delivery
   INSERT INTO stock_out_items (stock_out_id, product_id, qty, price)
   INSERT INTO stock_out_items (stock_out_id, product_id, qty, price)

3. Approve delivery
   UPDATE stock_out SET status = 'approved'

4. Mark as shipped
   UPDATE stock_out SET status = 'shipped'

5. Mark as delivered
   UPDATE stock_out SET status = 'delivered'

6. Record in history
   INSERT INTO history (stock_out_id)

7. Customer receives items
```

---

For detailed information, see:
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- [MODEL_RELATIONSHIPS.md](./MODEL_RELATIONSHIPS.md)
- [SCHEMA_SUMMARY.md](./SCHEMA_SUMMARY.md)

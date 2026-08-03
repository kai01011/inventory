# Inventory Management System - Database Schema

## Overview
This document describes the complete database schema for the inventory management system built with Laravel, React, and Inertia.

---

## Tables

### 1. `roles`
Stores user roles for role-based access control.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | |
| role_name | VARCHAR(255) | UNIQUE, NOT NULL | Admin, Manager, Staff, etc. |
| created_at | TIMESTAMP | | |
| updated_at | TIMESTAMP | | |

**Relationships:**
- One-to-Many: `users`

---

### 2. `users`
Stores system users with authentication.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | |
| name | VARCHAR(255) | NOT NULL | User's full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| email_verified_at | TIMESTAMP | NULLABLE | |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| role_id | BIGINT | FOREIGN KEY (roles.id) | User's role |
| remember_token | VARCHAR(100) | NULLABLE | |
| created_at | TIMESTAMP | | |
| updated_at | TIMESTAMP | | |

**Relationships:**
- Many-to-One: `roles`
- One-to-Many: `stock_in` (requested_by)
- One-to-Many: `stock_out` (requested_by)

---

### 3. `suppliers`
Stores supplier information.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | |
| supplier_name | VARCHAR(255) | UNIQUE, NOT NULL | Supplier company name |
| created_at | TIMESTAMP | | |
| updated_at | TIMESTAMP | | |

**Relationships:**
- One-to-Many: `products`

---

### 4. `categories`
Stores product categories (soft deletable).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | |
| category_name | VARCHAR(255) | UNIQUE, NOT NULL | Category name |
| deleted_at | TIMESTAMP | NULLABLE | For soft delete |
| created_at | TIMESTAMP | | |
| updated_at | TIMESTAMP | | |

**Relationships:**
- One-to-Many: `products`

---

### 5. `products`
Stores product information (soft deletable).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | |
| category_id | BIGINT | FOREIGN KEY (categories.id) | Product category |
| supplier_id | BIGINT | FOREIGN KEY (suppliers.id) | Product supplier |
| product_name | VARCHAR(255) | NOT NULL | Product name |
| price | DECIMAL(10,2) | NULLABLE | Unit price |
| barcode | VARCHAR(255) | UNIQUE, NULLABLE | Product barcode |
| unit | VARCHAR(255) | NOT NULL | Unit of measurement |
| serial_no | VARCHAR(255) | UNIQUE, NOT NULL | Serial number |
| warranty_date | DATE | NULLABLE | Warranty expiry date |
| deleted_at | TIMESTAMP | NULLABLE | For soft delete |
| created_at | TIMESTAMP | | |
| updated_at | TIMESTAMP | | |

**Relationships:**
- Many-to-One: `categories`
- Many-to-One: `suppliers`
- One-to-Many: `stock_in_items`
- One-to-Many: `stock_out_items`
- One-to-Many: `cart_items`

---

### 6. `customers`
Stores customer information.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | |
| customer_name | VARCHAR(255) | NOT NULL | Customer name |
| created_at | TIMESTAMP | | |
| updated_at | TIMESTAMP | | |

**Relationships:**
- One-to-Many: `stock_out` (delivered_to)
- One-to-Many: `cart_items`

---

### 7. `stock_in`
Tracks incoming stock requests.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | |
| requested_by_id | BIGINT | FOREIGN KEY (users.id) | User who requested |
| remarks | VARCHAR(255) | NULLABLE | Additional notes |
| status | ENUM | pending, approved, rejected, completed | Request status |
| created_at | TIMESTAMP | | |
| updated_at | TIMESTAMP | | |

**Status Values:**
- `pending` - Request created
- `approved` - Approved for receiving
- `rejected` - Request rejected
- `completed` - Stock received and processed

**Relationships:**
- Many-to-One: `users` (requested_by)
- One-to-Many: `stock_in_items`
- One-to-Many: `history`

---

### 8. `stock_in_items`
Line items for stock_in requests.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | |
| stock_in_id | BIGINT | FOREIGN KEY (stock_in.id) | Parent stock_in request |
| product_id | BIGINT | FOREIGN KEY (products.id) | Product being received |
| stock_in_quantity | INT | NOT NULL | Quantity received |
| unit_price | DECIMAL(10,2) | NOT NULL | Purchase price per unit |
| created_at | TIMESTAMP | | |
| updated_at | TIMESTAMP | | |

**Relationships:**
- Many-to-One: `stock_in`
- Many-to-One: `products`

---

### 9. `stock_out`
Tracks outgoing stock deliveries.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | |
| requested_by_id | BIGINT | FOREIGN KEY (users.id) | User who created delivery |
| delivered_to_id | BIGINT | FOREIGN KEY (customers.id) | Customer receiving stock |
| delivery_no | VARCHAR(255) | UNIQUE, NOT NULL | Auto-increment 5-digit delivery number |
| address | VARCHAR(255) | NOT NULL | Delivery address |
| tin | VARCHAR(255) | NULLABLE | Tax identification number |
| status | ENUM | pending, approved, shipped, delivered | Delivery status |
| business_style | VARCHAR(255) | NULLABLE | Business classification |
| created_at | TIMESTAMP | | |
| updated_at | TIMESTAMP | | |

**Status Values:**
- `pending` - Delivery request created
- `approved` - Approved for shipping
- `shipped` - Items shipped
- `delivered` - Delivery confirmed

**Relationships:**
- Many-to-One: `users` (requested_by)
- Many-to-One: `customers` (delivered_to)
- One-to-Many: `stock_out_items`
- One-to-Many: `history`

---

### 10. `stock_out_items`
Line items for stock_out deliveries.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | |
| stock_out_id | BIGINT | FOREIGN KEY (stock_out.id) | Parent stock_out delivery |
| product_id | BIGINT | FOREIGN KEY (products.id) | Product being shipped |
| stock_out_quantity | INT | NOT NULL | Quantity shipped |
| unit_price | DECIMAL(10,2) | NOT NULL | Sale price per unit |
| created_at | TIMESTAMP | | |
| updated_at | TIMESTAMP | | |

**Relationships:**
- Many-to-One: `stock_out`
- Many-to-One: `products`

---

### 11. `cart_items`
Temporary shopping cart for customers (uses React useState, optional DB storage).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | |
| customer_id | BIGINT | FOREIGN KEY (customers.id) | Customer |
| product_id | BIGINT | FOREIGN KEY (products.id) | Product in cart |
| cart_quantity | INT | NOT NULL | Quantity in cart |
| created_at | TIMESTAMP | | |
| updated_at | TIMESTAMP | | |

**Relationships:**
- Many-to-One: `customers`
- Many-to-One: `products`

---

### 12. `history`
Tracks historical stock movements.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | |
| stock_in_id | BIGINT | FOREIGN KEY (stock_in.id) | Related stock_in (nullable) |
| stock_out_id | BIGINT | FOREIGN KEY (stock_out.id) | Related stock_out (nullable) |
| created_at | TIMESTAMP | | |
| updated_at | TIMESTAMP | | |

**Relationships:**
- Many-to-One: `stock_in` (nullable, SET NULL on delete)
- Many-to-One: `stock_out` (nullable, SET NULL on delete)

---

## Entity Relationship Diagram

```
┌─────────────┐
│    roles    │
│ id (PK)     │
│ role_name   │
└──────┬──────┘
       │ 1:N
       └──────────────────────┐
                              │
                    ┌─────────────────┐
                    │     users       │
                    │ id (PK)         │
                    │ role_id (FK)    │
                    └──────┬──────────┘
                           │
            ┌──────────────┴──────────────┐
            │ 1:N                         │ 1:N
            ▼                             ▼
    ┌──────────────────┐         ┌──────────────────┐
    │   stock_in       │         │   stock_out      │
    │ id (PK)          │         │ id (PK)          │
    │ requested_by (FK)│         │ requested_by (FK)│
    └──────┬───────────┘         │ delivered_to (FK)│
           │                     └────────┬─────────┘
           │ 1:N                         │ 1:N
           ▼                             ▼
    ┌──────────────────────┐    ┌──────────────────────┐
    │  stock_in_items      │    │  stock_out_items     │
    │ id (PK)              │    │ id (PK)              │
    │ stock_in_id (FK)     │    │ stock_out_id (FK)    │
    │ product_id (FK)      │    │ product_id (FK)      │
    └─────────────────────┘    └──────────────────────┘
           │                             │
           └──────────────┬──────────────┘
                          │ 1:N
                          ▼
                  ┌──────────────────┐
                  │    products      │
                  │ id (PK)          │
                  │ category_id (FK) │
                  │ supplier_id (FK) │
                  └──────┬───────────┘
                         │
          ┌──────────────┴──────────────┐
          │ 1:N                         │ 1:N
          ▼                             ▼
    ┌──────────────┐         ┌──────────────────┐
    │ categories   │         │   suppliers      │
    │ id (PK)      │         │ id (PK)          │
    │ (soft delete)│         │ supplier_name    │
    └──────────────┘         └──────────────────┘
                  
    ┌───────────────────┐
    │    customers      │
    │ id (PK)           │ 1:N
    │ customer_name     │◄────────┐
    └───────────────────┘         │
              ▲                    │
              │ 1:N                │
              └────────┬───────────┘
                       │
              ┌────────▼──────────┐
              │   cart_items      │
              │ id (PK)           │
              │ customer_id (FK)  │
              │ product_id (FK)   │
              └───────────────────┘

    ┌──────────────────┐
    │    history       │
    │ id (PK)          │
    │ stock_in_id (FK) │
    │ stock_out_id (FK)│
    └──────────────────┘
```

---

## Key Features

### Soft Deletes
- `categories` - Can be soft deleted
- `products` - Can be soft deleted

### Foreign Key Constraints
- ON DELETE CASCADE - Automatically delete related records
- ON DELETE SET NULL - Set foreign key to null when referenced record is deleted

### Unique Constraints
- `role_name` - Only one role with this name
- `supplier_name` - Only one supplier with this name
- `category_name` - Only one category with this name (when not deleted)
- `barcode` - Product barcodes are unique
- `serial_no` - Product serial numbers are unique
- `delivery_no` - Delivery numbers are unique

### Status Tracking
- **Stock In:** pending → approved → completed (or rejected)
- **Stock Out:** pending → approved → shipped → delivered

### Numeric Fields
- `price`, `unit_price` - DECIMAL(10,2) for accurate financial calculations
- `*_quantity` - INT for item quantities

---

## Data Types Reference

| Type | Usage |
|------|-------|
| BIGINT | Primary and foreign keys (id columns) |
| VARCHAR(255) | Names, strings, identifiers |
| DECIMAL(10,2) | Monetary values (10 digits total, 2 decimals) |
| INT | Quantities, counts |
| DATE | Date values (warranty_date) |
| TIMESTAMP | created_at, updated_at, deleted_at |
| ENUM | Status fields (fixed set of values) |

---

## Indexes

Automatically created by Laravel for:
- Primary keys (id)
- Foreign keys (automatic, helps with joins)
- Unique constraints

Additional consideration for future:
- `products.barcode` - Good for scanning
- `stock_in.status` - For filtering
- `stock_out.status` - For filtering
- `stock_out.delivery_no` - For lookups

---

## Migrations Order

The migrations are created in this order to respect foreign key dependencies:

1. `roles` - No dependencies
2. `suppliers` - No dependencies
3. `categories` - No dependencies
4. `users` - Depends on `roles`
5. `products` - Depends on `categories`, `suppliers`
6. `customers` - No dependencies
7. `stock_in` - Depends on `users`
8. `stock_in_items` - Depends on `stock_in`, `products`
9. `stock_out` - Depends on `users`, `customers`
10. `stock_out_items` - Depends on `stock_out`, `products`
11. `cart_items` - Depends on `customers`, `products`
12. `history` - Depends on `stock_in`, `stock_out`

---

## Running Migrations

To create all tables in your database:

```bash
php artisan migrate
```

To rollback all migrations:

```bash
php artisan migrate:rollback
```

To refresh (rollback and re-run):

```bash
php artisan migrate:refresh
```

To seed with sample data:

```bash
php artisan db:seed
```

---

## Sample Queries

### Get all products with category and supplier
```sql
SELECT p.*, c.category_name, s.supplier_name
FROM products p
JOIN categories c ON p.category_id = c.id
JOIN suppliers s ON p.supplier_id = s.id
WHERE p.deleted_at IS NULL;
```

### Get stock_in requests with items
```sql
SELECT si.id, si.status, u.name as requested_by, COUNT(sii.id) as item_count
FROM stock_in si
JOIN users u ON si.requested_by_id = u.id
LEFT JOIN stock_in_items sii ON si.id = sii.stock_in_id
WHERE si.status = 'pending'
GROUP BY si.id;
```

### Get stock_out deliveries
```sql
SELECT so.*, c.customer_name, u.name as requested_by
FROM stock_out so
JOIN customers c ON so.delivered_to_id = c.id
JOIN users u ON so.requested_by_id = u.id
ORDER BY so.created_at DESC;
```

---

## Notes

- All timestamps are DATETIME columns (created_at, updated_at)
- All IDs are auto-incrementing BIGINT for future scalability
- Soft deletes are implemented for audit trail purposes
- Status enums provide data integrity
- Foreign keys enforce referential integrity

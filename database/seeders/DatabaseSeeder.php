<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Customer;
use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Get the Admin and Staff roles
        $adminRole = Role::where('role_name', 'Admin')->first();
        $staffRole = Role::where('role_name', 'Staff')->first();

        // Create Admin test user
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@gmail.com',
            'role_id' => $adminRole?->id,
        ]);

        // Create Staff user
        User::factory()->create([
            'name' => 'Staff User',
            'email' => 'staff@example.com',
            'role_id' => $staffRole?->id,
        ]);

        // Seed Categories
        $categories = [
            ['category_name' => 'Electronics'],
            ['category_name' => 'Accessories'],
            ['category_name' => 'Peripherals'],
            ['category_name' => 'Supplies'],
            ['category_name' => 'Cables'],
            ['category_name' => 'Networking'],
            ['category_name' => 'Storage'],
            ['category_name' => 'Monitors'],
            ['category_name' => 'Printers'],
            ['category_name' => 'Software'],
            ['category_name' => 'Components'],
            ['category_name' => 'Audio'],
        ];
        foreach ($categories as $cat) {
            Category::create($cat);
        }

        // Seed Suppliers
        $suppliers = [
            ['supplier_name' => 'TechCorp Distributors'],
            ['supplier_name' => 'Global Electronics Ltd'],
            ['supplier_name' => 'Premium Supply Co'],
            ['supplier_name' => 'Asia Tech Imports'],
            ['supplier_name' => 'Direct Import Solutions'],
            ['supplier_name' => 'Quality Components Inc'],
            ['supplier_name' => 'NextGen Suppliers'],
            ['supplier_name' => 'Reliable Wholesale'],
        ];
        foreach ($suppliers as $sup) {
            Supplier::create($sup);
        }

        // Seed Customers
        $customers = [
            ['customer_name' => 'ABC Corporation'],
            ['customer_name' => 'XYZ Industries'],
            ['customer_name' => 'Tech Solutions Ltd'],
            ['customer_name' => 'Digital Marketing Agency'],
            ['customer_name' => 'Corporate Offices Inc'],
            ['customer_name' => 'Educational Institutions'],
            ['customer_name' => 'Healthcare Facilities'],
            ['customer_name' => 'Retail Stores Network'],
            ['customer_name' => 'Government Departments'],
            ['customer_name' => 'Small Business Hub'],
        ];
        foreach ($customers as $cust) {
            Customer::create($cust);
        }

        // Seed Products with varied quantities (some low stock)
        $products = [
            ['product_name' => 'HDMI Cable 2M', 'category_id' => 5, 'supplier_id' => 1, 'quantity' => 3, 'unit' => 'pcs', 'price' => 150, 'serial_no' => 'HDMI-2M-001', 'barcode' => '4901234567890'],
            ['product_name' => 'USB-C Cable', 'category_id' => 5, 'supplier_id' => 2, 'quantity' => 8, 'unit' => 'pcs', 'price' => 200, 'serial_no' => 'USBC-001', 'barcode' => '4901234567891'],
            ['product_name' => 'Mechanical Keyboard', 'category_id' => 2, 'supplier_id' => 3, 'quantity' => 15, 'unit' => 'pcs', 'price' => 2500, 'serial_no' => 'KBD-MECH-001', 'barcode' => '4901234567892'],
            ['product_name' => 'Wireless Mouse', 'category_id' => 2, 'supplier_id' => 1, 'quantity' => 4, 'unit' => 'pcs', 'price' => 800, 'serial_no' => 'MOUSE-WIRELESS-001', 'barcode' => '4901234567893'],
            ['product_name' => 'USB 3.0 Hub', 'category_id' => 3, 'supplier_id' => 2, 'quantity' => 12, 'unit' => 'pcs', 'price' => 1200, 'serial_no' => 'HUB-USB3-001', 'barcode' => '4901234567894'],
            ['product_name' => 'Monitor Stand', 'category_id' => 2, 'supplier_id' => 3, 'quantity' => 20, 'unit' => 'pcs', 'price' => 1800, 'serial_no' => 'STAND-MON-001', 'barcode' => '4901234567895'],
            ['product_name' => 'SSD 256GB', 'category_id' => 7, 'supplier_id' => 1, 'quantity' => 6, 'unit' => 'pcs', 'price' => 3500, 'serial_no' => 'SSD-256-001', 'barcode' => '4901234567896'],
            ['product_name' => 'RAM DDR4 8GB', 'category_id' => 1, 'supplier_id' => 4, 'quantity' => 25, 'unit' => 'pcs', 'price' => 2800, 'serial_no' => 'RAM-DDR4-8GB-001', 'barcode' => '4901234567897'],
            ['product_name' => 'Power Supply 650W', 'category_id' => 1, 'supplier_id' => 5, 'quantity' => 9, 'unit' => 'pcs', 'price' => 4500, 'serial_no' => 'PSU-650W-001', 'barcode' => '4901234567898'],
            ['product_name' => 'Network Cable CAT6', 'category_id' => 6, 'supplier_id' => 2, 'quantity' => 50, 'unit' => 'pcs', 'price' => 300, 'serial_no' => 'CABLE-CAT6-001', 'barcode' => '4901234567899'],
            ['product_name' => 'Webcam 1080P', 'category_id' => 3, 'supplier_id' => 3, 'quantity' => 5, 'unit' => 'pcs', 'price' => 1500, 'serial_no' => 'WEBCAM-1080-001', 'barcode' => '4901234567900'],
            ['product_name' => 'Headphones', 'category_id' => 12, 'supplier_id' => 1, 'quantity' => 18, 'unit' => 'pcs', 'price' => 1200, 'serial_no' => 'HEADPHONES-001', 'barcode' => '4901234567901'],
            ['product_name' => 'USB Flash Drive 32GB', 'category_id' => 7, 'supplier_id' => 6, 'quantity' => 2, 'unit' => 'pcs', 'price' => 600, 'serial_no' => 'USB-FLASH-32GB-001', 'barcode' => '4901234567902'],
            ['product_name' => 'Laptop Stand', 'category_id' => 2, 'supplier_id' => 3, 'quantity' => 30, 'unit' => 'pcs', 'price' => 2200, 'serial_no' => 'STAND-LAP-001', 'barcode' => '4901234567903'],
            ['product_name' => 'Wireless Charger', 'category_id' => 3, 'supplier_id' => 7, 'quantity' => 7, 'unit' => 'pcs', 'price' => 1000, 'serial_no' => 'CHARGER-WIRELESS-001', 'barcode' => '4901234567904'],
            ['product_name' => 'Desk Lamp LED', 'category_id' => 4, 'supplier_id' => 8, 'quantity' => 40, 'unit' => 'pcs', 'price' => 800, 'serial_no' => 'LAMP-LED-001', 'barcode' => '4901234567905'],
            ['product_name' => 'Printer Cartridge', 'category_id' => 4, 'supplier_id' => 2, 'quantity' => 11, 'unit' => 'pcs', 'price' => 1100, 'serial_no' => 'CARTRIDGE-PRINT-001', 'barcode' => '4901234567906'],
            ['product_name' => 'Mouse Pad', 'category_id' => 2, 'supplier_id' => 1, 'quantity' => 60, 'unit' => 'pcs', 'price' => 200, 'serial_no' => 'MOUSEPAD-001', 'barcode' => '4901234567907'],
            ['product_name' => 'Screen Protector', 'category_id' => 4, 'supplier_id' => 3, 'quantity' => 35, 'unit' => 'pcs', 'price' => 300, 'serial_no' => 'PROTECTOR-SCREEN-001', 'barcode' => '4901234567908'],
            ['product_name' => 'Cooling Pad', 'category_id' => 3, 'supplier_id' => 5, 'quantity' => 14, 'unit' => 'pcs', 'price' => 900, 'serial_no' => 'PAD-COOL-001', 'barcode' => '4901234567909'],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}

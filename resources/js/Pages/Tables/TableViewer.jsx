import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import TableView from '@/components/TableView';
import { formatDateShort, formatDateTimeSingleLine } from '@/utils/dateUtils';

const COLUMN_DEFINITIONS = {
  'users': [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role_id', label: 'Role ID' },
    { key: 'created_at', label: 'Created At', render: (val) => formatDateTimeSingleLine(val) },
  ],
  'roles': [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'created_at', label: 'Created At', render: (val) => formatDateTimeSingleLine(val) },
  ],
  'suppliers': [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'contact_person', label: 'Contact Person' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
  ],
  'categories': [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'created_at', label: 'Created At', render: (val) => formatDateTimeSingleLine(val) },
  ],
  'products': [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'sku', label: 'SKU' },
    { key: 'category_id', label: 'Category ID' },
    { key: 'supplier_id', label: 'Supplier ID' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'price', label: 'Price', render: (val) => `$${parseFloat(val).toFixed(2)}` },
  ],
  'customers': [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
    { key: 'created_at', label: 'Created At', render: (val) => formatDateTimeSingleLine(val) },
  ],
  'stock-in': [
    { key: 'id', label: 'ID' },
    { key: 'reference_number', label: 'Reference' },
    { key: 'supplier_id', label: 'Supplier ID' },
    { key: 'total_items', label: 'Total Items' },
    { key: 'notes', label: 'Notes' },
    { key: 'created_at', label: 'Created At', render: (val) => formatDateTimeSingleLine(val) },
  ],
  'stock-in-items': [
    { key: 'id', label: 'ID' },
    { key: 'stock_in_id', label: 'Stock In ID' },
    { key: 'product_id', label: 'Product ID' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'unit_price', label: 'Unit Price', render: (val) => `$${parseFloat(val).toFixed(2)}` },
  ],
  'stock-out': [
    { key: 'id', label: 'ID' },
    { key: 'reference_number', label: 'Reference' },
    { key: 'customer_id', label: 'Customer ID' },
    { key: 'total_items', label: 'Total Items' },
    { key: 'notes', label: 'Notes' },
    { key: 'created_at', label: 'Created At', render: (val) => formatDateTimeSingleLine(val) },
  ],
  'stock-out-items': [
    { key: 'id', label: 'ID' },
    { key: 'stock_out_id', label: 'Stock Out ID' },
    { key: 'product_id', label: 'Product ID' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'unit_price', label: 'Unit Price', render: (val) => `$${parseFloat(val).toFixed(2)}` },
  ],
  'history': [
    { key: 'id', label: 'ID' },
    { key: 'user_id', label: 'User ID' },
    { key: 'action', label: 'Action' },
    { key: 'description', label: 'Description' },
    { key: 'created_at', label: 'Created At', render: (val) => formatDateTimeSingleLine(val) },
  ],
};

export default function TableViewer({ table, title, data }) {
  const columns = COLUMN_DEFINITIONS[table] || [];

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-3xl font-bold leading-tight text-gray-800">
          {title}
        </h2>
      }
    >
      <Head title={title} />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <TableView
            title={title}
            description={`Showing all records from the ${title.toLowerCase()} table`}
            data={data}
            columns={columns}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

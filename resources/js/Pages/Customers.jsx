import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Customers({ customers }) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, setData, post, processing, errors, reset } = useForm({
    customer_name: '',
  });

  const {
    data: editData,
    setData: setEditData,
    put,
    processing: editProcessing,
    errors: editErrors,
    reset: editReset,
  } = useForm({
    customer_name: '',
  });

  const {
    delete: destroy,
    processing: deleteProcessing,
  } = useForm({});

  // Filter customers based on search term - starts with
  const filteredCustomers = customers && customers.filter(customer => {
    if (!searchTerm) return true;
    return customer.customer_name.toLowerCase().startsWith(searchTerm.toLowerCase());
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/customers', {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  };

  const handleEditOpen = (customer) => {
    setEditingCustomer(customer);
    setEditData('customer_name', customer.customer_name);
    setEditOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    put(`/customers/${editingCustomer.id}`, {
      onSuccess: () => {
        editReset();
        setEditOpen(false);
        setEditingCustomer(null);
      },
    });
  };

  const handleDeleteOpen = (customer) => {
    setDeletingCustomer(customer);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    destroy(`/customers/${deletingCustomer.id}`, {
      onSuccess: () => {
        setDeleteOpen(false);
        setDeletingCustomer(null);
      },
    });
  };

  return (
    <AuthenticatedLayout onSearch={setSearchTerm}>
      <Head title="Customers" />
      
      <div className="p-8 bg-white min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
              <p className="text-gray-600 text-sm mt-1">Manage your customers {searchTerm && `(${filteredCustomers?.length || 0} results)`}</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-red-600 hover:bg-red-700">
                  <Plus size={18} />
                  Add customer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Customer</DialogTitle>
                  <DialogDescription>
                    Add a new customer to your system
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Customer Name
                    </label>
                    <input
                      id="customer_name"
                      type="text"
                      name="customer_name"
                      value={data.customer_name}
                      onChange={(e) => setData('customer_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                      placeholder="Enter customer name"
                    />
                    {errors.customer_name && <p className="text-red-600 text-sm mt-1">{errors.customer_name}</p>}
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => setOpen(false)}
                      variant="outline"
                      className="border border-gray-300 text-gray-900 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={processing}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {processing ? 'Adding...' : 'Add Customer'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers && filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.customer_name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEditOpen(customer)}
                            title="Edit customer"
                            className="group inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm hover:shadow-blue-200 hover:shadow-md transition-all duration-200"
                          >
                            <Pencil size={14} className="group-hover:scale-110 transition-transform duration-200" />
                          </button>
                          <button
                            onClick={() => handleDeleteOpen(customer)}
                            title="Delete customer"
                            className="group inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white shadow-sm hover:shadow-red-200 hover:shadow-md transition-all duration-200"
                          >
                            <Trash2 size={14} className="group-hover:scale-110 transition-transform duration-200" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-600">
                      {searchTerm ? 'No customers match your search' : 'No customers found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(isOpen) => {
        setEditOpen(isOpen);
        if (!isOpen) setEditingCustomer(null);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update the customer name
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Customer Name
              </label>
              <input
                id="edit_customer_name"
                type="text"
                name="customer_name"
                value={editData.customer_name}
                onChange={(e) => setEditData('customer_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                placeholder="Enter customer name"
              />
              {editErrors.customer_name && <p className="text-red-600 text-sm mt-1">{editErrors.customer_name}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={() => setEditOpen(false)}
                variant="outline"
                className="border border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editProcessing}
                className="bg-red-600 hover:bg-red-700"
              >
                {editProcessing ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={(isOpen) => {
        setDeleteOpen(isOpen);
        if (!isOpen) setDeletingCustomer(null);
      }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-red-50">
                <AlertTriangle size={22} className="text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-gray-900">Delete Customer</DialogTitle>
                <DialogDescription className="mt-1">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-gray-900">
                    {deletingCustomer?.customer_name}
                  </span>
                  ? This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={() => setDeleteOpen(false)}
              variant="outline"
              className="border border-gray-300 text-gray-900 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={deleteProcessing}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              <Trash2 size={15} />
              {deleteProcessing ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AuthenticatedLayout>
  );
}

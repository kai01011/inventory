import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Suppliers({ suppliers }) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deletingSupplier, setDeletingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, setData, post, processing, errors, reset } = useForm({
    supplier_name: '',
  });

  const {
    data: editData,
    setData: setEditData,
    put,
    processing: editProcessing,
    errors: editErrors,
    reset: editReset,
    clearErrors: clearEditErrors,
  } = useForm({
    supplier_name: '',
  });

  const {
    delete: destroy,
    processing: deleteProcessing,
  } = useForm({});

  // Memoize filtered suppliers to avoid recalculating on every render
  const filteredSuppliers = useMemo(() => {
    return suppliers && suppliers.filter(supplier => {
      if (!searchTerm) return true;
      return supplier.supplier_name.toLowerCase().startsWith(searchTerm.toLowerCase());
    });
  }, [suppliers, searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/suppliers', {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  };

  const handleEditOpen = (supplier) => {
    clearEditErrors();
    setEditingSupplier(supplier);
    setEditData('supplier_name', supplier.supplier_name);
    setEditOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    put(`/suppliers/${editingSupplier.id}`, {
      onSuccess: () => {
        editReset();
        setEditOpen(false);
        setEditingSupplier(null);
      },
    });
  };

  const handleDeleteOpen = (supplier) => {
    setDeletingSupplier(supplier);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    destroy(`/suppliers/${deletingSupplier.id}`, {
      onSuccess: () => {
        setDeleteOpen(false);
        setDeletingSupplier(null);
      },
    });
  };

  return (
    <AuthenticatedLayout onSearch={setSearchTerm}>
      <Head title="Suppliers" />
      
      <div className="p-8 bg-white min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white">
                  <Plus size={18} />
                  Add supplier
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Supplier</DialogTitle>
                  <DialogDescription>
                    Add a new supplier to your inventory system
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Supplier Name
                    </label>
                    <input
                      id="supplier_name"
                      type="text"
                      name="supplier_name"
                      value={data.supplier_name}
                      onChange={(e) => setData('supplier_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                      placeholder="Enter supplier name"
                    />
                    {errors.supplier_name && <p className="text-red-600 text-sm mt-1">{errors.supplier_name}</p>}
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
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {processing ? 'Adding...' : 'Add Supplier'}
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
                  <th className="hidden sm:table-cell px-3 sm:px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-[60px]">ID</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-[150px]">Supplier name</th>
                  <th className="px-3 sm:px-4 py-3 text-center text-sm font-semibold text-gray-900 min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSuppliers && filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((supplier, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="hidden sm:table-cell px-3 sm:px-4 py-3 text-sm font-medium text-gray-900">{supplier.id}</td>
                      <td className="px-3 sm:px-4 py-3 text-sm font-medium text-gray-900">{supplier.supplier_name}</td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {/* Edit button */}
                          <button
                            onClick={() => handleEditOpen(supplier)}
                            title="Edit supplier"
                            className="group inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm hover:shadow-blue-200 hover:shadow-md transition-all duration-200"
                          >
                            <Pencil size={16} className="group-hover:scale-110 transition-transform duration-200" />
                          </button>
                          {/* Delete button */}
                          <button
                            onClick={() => handleDeleteOpen(supplier)}
                            title="Delete supplier"
                            className="group inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white shadow-sm hover:shadow-red-200 hover:shadow-md transition-all duration-200"
                          >
                            <Trash2 size={16} className="group-hover:scale-110 transition-transform duration-200" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-3 sm:px-4 py-8 text-center text-sm text-gray-600">
                      {searchTerm ? 'No suppliers match your search' : 'No suppliers found'}
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
        if (!isOpen) {
          clearEditErrors();
          setEditingSupplier(null);
        }
      }}>
        <DialogContent className="sm:max-w-[420px] p-6">
          <DialogTitle className="text-lg font-semibold text-gray-900 mb-5">Edit Supplier</DialogTitle>
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="edit_supplier_name" className="block text-sm font-medium text-gray-900 mb-1.5">
                Supplier Name
              </label>
              <input
                id="edit_supplier_name"
                type="text"
                name="supplier_name"
                value={editData.supplier_name}
                onChange={(e) => setEditData('supplier_name', e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-red-500 transition ${
                  editErrors.supplier_name
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-red-500'
                }`}
                placeholder="Enter supplier name"
              />
              {editErrors.supplier_name && (
                <p className="text-red-600 text-xs mt-1">
                  {editErrors.supplier_name === 'The supplier name has already been taken.' 
                    ? 'A supplier with this name already exists.'
                    : editErrors.supplier_name}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2.5 mt-4">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="px-4 h-10 text-sm font-medium text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editProcessing}
                className="px-4 h-10 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {editProcessing ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={(isOpen) => {
        setDeleteOpen(isOpen);
        if (!isOpen) setDeletingSupplier(null);
      }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-red-50">
                <AlertTriangle size={22} className="text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-gray-900">Delete Supplier</DialogTitle>
                <DialogDescription className="mt-1">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-gray-900">
                    {deletingSupplier?.supplier_name}
                  </span>
                  ? This action can be undone by an administrator.
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

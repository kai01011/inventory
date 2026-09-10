import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Pencil, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDateShort } from '@/utils/dateUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import CalendarPicker from '@/components/ui/calendar-picker';
import ConfirmModal from '@/components/ui/confirm-modal';

export default function Products({ products, categories, suppliers }) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const { data, setData, post, processing, errors, reset } = useForm({
    product_name: '',
    category_id: '',
    supplier_id: '',
    price: '',
    barcode: '',
    unit: '',
    serial_no: '',
    warranty_date: '',
  });

  const deleteForm = useForm({});

  // Lock/unlock body scroll when modal opens/closes
  useEffect(() => {
    if (selectedProductDetails) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProductDetails]);

  const {
    data: editData,
    setData: setEditData,
    put,
    processing: editProcessing,
    errors: editErrors,
    reset: editReset,
  } = useForm({
    product_name: '',
    category_id: '',
    supplier_id: '',
    price: '',
    barcode: '',
    unit: '',
    serial_no: '',
    warranty_date: '',
  });

  const filteredProducts = products && products.filter(product => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return [
      product.product_name?.toLowerCase().startsWith(search),
      product.barcode?.toLowerCase().startsWith(search),
      product.category?.category_name?.toLowerCase().startsWith(search),
      product.supplier?.supplier_name?.toLowerCase().startsWith(search),
    ].some(Boolean);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/products', {
      onSuccess: () => { reset(); setOpen(false); },
    });
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      type: 'danger',
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      onConfirm: () => {
        deleteForm.delete(`/products/${id}`, {
          onSuccess: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
        });
      },
    });
  };

  const handleEditOpen = (product) => {
    setEditingProduct(product);
    setEditData({
      product_name: product.product_name || '',
      category_id: product.category_id || '',
      supplier_id: product.supplier_id || '',
      price: product.price || '',
      barcode: product.barcode || '',
      unit: product.unit || '',
      serial_no: product.serial_no || '',
      warranty_date: product.warranty_date
        ? new Date(product.warranty_date).toISOString().split('T')[0]
        : '',
    });
    setEditOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    put(`/products/${editingProduct.id}`, {
      onSuccess: () => { editReset(); setEditOpen(false); setEditingProduct(null); },
    });
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition';
  const selectCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition';
  const labelCls = 'block text-sm font-medium text-gray-900 mb-1';

  return (
    <AuthenticatedLayout onSearch={setSearchTerm}>
      <Head title="Products" />

      <div className="p-4 md:p-6 bg-white min-h-screen">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 text-xs md:text-sm mt-1">
              Manage your products {searchTerm && `(${filteredProducts?.length || 0} results)`}
            </p>
          </div>

          {/* Add Product Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-red-600 hover:bg-red-700">
                <Plus size={18} /> Add product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Product</DialogTitle>
                <DialogDescription>Add a new product to your inventory</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={labelCls}>Product Name</label>
                  <input id="product_name" name="product_name" type="text" value={data.product_name} onChange={e => setData('product_name', e.target.value)} className={inputCls} placeholder="Enter product name" autoComplete="off" />
                  {errors.product_name && <p className="text-red-600 text-sm mt-1">{errors.product_name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Category</label>
                    <select value={data.category_id} onChange={e => setData('category_id', e.target.value)} className={selectCls}>
                      <option value="">Select Category</option>
                      {categories?.map(cat => <option key={cat.id} value={cat.id}>{cat.category_name}</option>)}
                    </select>
                    {errors.category_id && <p className="text-red-600 text-sm mt-1">{errors.category_id}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Supplier</label>
                    <select value={data.supplier_id} onChange={e => setData('supplier_id', e.target.value)} className={selectCls}>
                      <option value="">Select Supplier</option>
                      {suppliers?.map(sup => <option key={sup.id} value={sup.id}>{sup.supplier_name}</option>)}
                    </select>
                    {errors.supplier_id && <p className="text-red-600 text-sm mt-1">{errors.supplier_id}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Price</label>
                    <input id="price" name="price" type="number" step="0.01" value={data.price} onChange={e => setData('price', e.target.value)} className={inputCls} placeholder="Enter price" autoComplete="off" />
                    {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Barcode</label>
                    <input id="barcode" name="barcode" type="text" value={data.barcode} onChange={e => setData('barcode', e.target.value)} className={inputCls} placeholder="Enter barcode" autoComplete="off" />
                    {errors.barcode && <p className="text-red-600 text-sm mt-1">{errors.barcode}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Unit</label>
                    <input id="unit" name="unit" type="text" value={data.unit} onChange={e => setData('unit', e.target.value)} className={inputCls} placeholder="e.g., box, piece" autoComplete="off" />
                    {errors.unit && <p className="text-red-600 text-sm mt-1">{errors.unit}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Serial Number</label>
                    <input id="serial_no" name="serial_no" type="text" value={data.serial_no} onChange={e => setData('serial_no', e.target.value)} className={inputCls} placeholder="Enter serial number" autoComplete="off" />
                    {errors.serial_no && <p className="text-red-600 text-sm mt-1">{errors.serial_no}</p>}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Warranty Date</label>
                  <CalendarPicker value={data.warranty_date} onChange={date => setData('warranty_date', date)} placeholder="Select warranty date" />
                  {errors.warranty_date && <p className="text-red-600 text-sm mt-1">{errors.warranty_date}</p>}
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" onClick={() => setOpen(false)} variant="outline" className="border border-gray-300 text-gray-900 hover:bg-gray-50">Cancel</Button>
                  <Button type="submit" disabled={processing} className="bg-red-600 hover:bg-red-700">{processing ? 'Adding...' : 'Add Product'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table — no inner scroll, flows with the page */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ tableLayout: 'fixed', minWidth: '860px' }}>
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-2 py-2.5 text-left font-semibold text-gray-900 w-10">ID</th>
                  <th className="px-2 py-2.5 text-left font-semibold text-gray-900 w-36">Product</th>
                  <th className="px-2 py-2.5 text-left font-semibold text-gray-900 w-24">Category</th>
                  <th className="px-2 py-2.5 text-left font-semibold text-gray-900 w-32">Supplier</th>
                  <th className="px-2 py-2.5 text-left font-semibold text-gray-900 w-20">Price</th>
                  <th className="px-2 py-2.5 text-left font-semibold text-gray-900 w-28">Barcode</th>
                  <th className="px-2 py-2.5 text-left font-semibold text-gray-900 w-16">Unit</th>
                  <th className="px-2 py-2.5 text-left font-semibold text-gray-900 w-28">Serial No</th>
                  <th className="px-2 py-2.5 text-left font-semibold text-gray-900 w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts && filteredProducts.length > 0 ? (
                  filteredProducts.map((product, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 py-2.5 font-medium text-gray-900 truncate">{product.id}</td>
                      <td className="px-2 py-2.5 font-medium text-gray-900 truncate" title={product.product_name}>{product.product_name}</td>
                      <td className="px-2 py-2.5 text-gray-700 truncate" title={product.category?.category_name}>{product.category?.category_name || '-'}</td>
                      <td className="px-2 py-2.5 text-gray-700 truncate" title={product.supplier?.supplier_name}>{product.supplier?.supplier_name || '-'}</td>
                      <td className="px-2 py-2.5 text-gray-700 truncate">₱{parseFloat(product.price || 0).toFixed(2)}</td>
                      <td className="px-2 py-2.5 text-gray-700 font-mono truncate" title={product.barcode}>{product.barcode || '-'}</td>
                      <td className="px-2 py-2.5 text-gray-700 truncate">{product.unit || '-'}</td>
                      <td className="px-2 py-2.5 text-gray-700 font-mono truncate" title={product.serial_no}>{product.serial_no || '-'}</td>
                      <td className="px-2 py-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedProductDetails(product)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-semibold px-1.5 py-0.5 bg-blue-50 rounded hover:bg-blue-100 transition whitespace-nowrap"
                            title="View details"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleEditOpen(product)}
                            title="Edit product"
                            className="group inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm hover:shadow-blue-200 hover:shadow-md transition-all duration-200"
                          >
                            <Pencil size={11} className="group-hover:scale-110 transition-transform duration-200" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            title="Delete product"
                            className="group inline-flex items-center justify-center w-6 h-6 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white shadow-sm hover:shadow-red-200 hover:shadow-md transition-all duration-200"
                          >
                            <Trash2 size={11} className="group-hover:scale-110 transition-transform duration-200" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-2 py-8 text-center text-sm text-gray-600">
                      {searchTerm ? 'No products match your search' : 'No products found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProductDetails && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{selectedProductDetails.product_name}</h3>
              <button type="button" onClick={() => setSelectedProductDetails(null)} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">Category:</span>
                <p className="text-gray-700">{selectedProductDetails.category?.category_name || 'Not assigned'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">Supplier:</span>
                <p className="text-gray-700">{selectedProductDetails.supplier?.supplier_name || 'Not assigned'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">Barcode:</span>
                <p className="text-gray-700 font-mono">{selectedProductDetails.barcode || '-'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">Serial No:</span>
                <p className="text-gray-700 font-mono">{selectedProductDetails.serial_no || '-'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">Unit:</span>
                <p className="text-gray-700">{selectedProductDetails.unit || '-'}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <span className="font-semibold text-gray-900">Price:</span>
                <p className="text-lg font-bold text-blue-600">₱{parseFloat(selectedProductDetails.price || 0).toFixed(2)}</p>
              </div>
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <span className="font-semibold text-gray-900">Available Quantity:</span>
                <p className="text-2xl font-bold text-green-600">{selectedProductDetails.quantity || 0} {selectedProductDetails.unit || 'units'}</p>
              </div>
              {selectedProductDetails.warranty_date && (
                <div className="bg-gray-50 p-3 rounded">
                  <span className="font-semibold text-gray-900">Warranty Date:</span>
                  <p className="text-gray-700">{formatDateShort(selectedProductDetails.warranty_date)}</p>
                </div>
              )}
            </div>
            <div className="mt-4">
              <button type="button" onClick={() => setSelectedProductDetails(null)} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={editOpen} onOpenChange={(isOpen) => { setEditOpen(isOpen); if (!isOpen) setEditingProduct(null); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the product details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Product Name</label>
              <input id="edit_product_name" name="edit_product_name" type="text" value={editData.product_name} onChange={e => setEditData('product_name', e.target.value)} className={inputCls} placeholder="Enter product name" autoComplete="off" />
              {editErrors.product_name && <p className="text-red-600 text-sm mt-1">{editErrors.product_name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Category</label>
                <select value={editData.category_id} onChange={e => setEditData('category_id', e.target.value)} className={selectCls}>
                  <option value="">Select Category</option>
                  {categories?.map(cat => <option key={cat.id} value={cat.id}>{cat.category_name}</option>)}
                </select>
                {editErrors.category_id && <p className="text-red-600 text-sm mt-1">{editErrors.category_id}</p>}
              </div>
              <div>
                <label className={labelCls}>Supplier</label>
                <select value={editData.supplier_id} onChange={e => setEditData('supplier_id', e.target.value)} className={selectCls}>
                  <option value="">Select Supplier</option>
                  {suppliers?.map(sup => <option key={sup.id} value={sup.id}>{sup.supplier_name}</option>)}
                </select>
                {editErrors.supplier_id && <p className="text-red-600 text-sm mt-1">{editErrors.supplier_id}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Price</label>
                <input id="edit_price" name="edit_price" type="number" step="0.01" value={editData.price} onChange={e => setEditData('price', e.target.value)} className={inputCls} placeholder="Enter price" autoComplete="off" />
                {editErrors.price && <p className="text-red-600 text-sm mt-1">{editErrors.price}</p>}
              </div>
              <div>
                <label className={labelCls}>Barcode</label>
                <input id="edit_barcode" name="edit_barcode" type="text" value={editData.barcode} onChange={e => setEditData('barcode', e.target.value)} className={inputCls} placeholder="Enter barcode" autoComplete="off" />
                {editErrors.barcode && <p className="text-red-600 text-sm mt-1">{editErrors.barcode}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Unit</label>
                <input id="edit_unit" name="edit_unit" type="text" value={editData.unit} onChange={e => setEditData('unit', e.target.value)} className={inputCls} placeholder="e.g., box, piece" autoComplete="off" />
                {editErrors.unit && <p className="text-red-600 text-sm mt-1">{editErrors.unit}</p>}
              </div>
              <div>
                <label className={labelCls}>Serial Number</label>
                <input id="edit_serial_no" name="edit_serial_no" type="text" value={editData.serial_no} onChange={e => setEditData('serial_no', e.target.value)} className={inputCls} placeholder="Enter serial number" autoComplete="off" />
                {editErrors.serial_no && <p className="text-red-600 text-sm mt-1">{editErrors.serial_no}</p>}
              </div>
            </div>
            <div>
              <label className={labelCls}>Warranty Date</label>
              <CalendarPicker value={editData.warranty_date} onChange={date => setEditData('warranty_date', date)} placeholder="Select warranty date" />
              {editErrors.warranty_date && <p className="text-red-600 text-sm mt-1">{editErrors.warranty_date}</p>}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" onClick={() => setEditOpen(false)} variant="outline" className="border border-gray-300 text-gray-900 hover:bg-gray-50">Cancel</Button>
              <Button type="submit" disabled={editProcessing} className="bg-red-600 hover:bg-red-700">{editProcessing ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
      />
    </AuthenticatedLayout>
  );
}

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Check, XCircle, FileText, X } from 'lucide-react';
import { useState, useEffect } from 'react';
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
import { useToast } from '@/components/ui/toast';
import { formatDatePhilippines, formatDateShort, formatDateTimeSingleLine } from '@/utils/dateUtils';

export default function StockIn({ stockIns, products, categories, suppliers }) {
  const { auth } = usePage().props;
  const { toast } = useToast();
  const isAdmin = auth.user?.role?.role_name === 'Admin';
  const [open, setOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    product_name: '',
    category_id: '',
    supplier_id: '',
    price: '',
    barcode: '',
    unit: '',
    serial_no: '',
    warranty_date: '',
    stock_in_quantity: '',
    unit_price: '',
  });
  const [formData, setFormData] = useState({
    remarks: '',
  });
  const [submitErrors, setSubmitErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [selectedStockInDetails, setSelectedStockInDetails] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const deleteForm = useForm({});

  // Handle search from header
  const handleSearch = (term) => {
    setSearchTerm(term);
  };
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Rejection modal state
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    stockInId: null,
  });
  const [rejectReason, setRejectReason] = useState('');

  // Auto-refresh every 30 seconds to sync data
  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({ only: ['stockIns'], preserveScroll: true, preserveState: true });
    }, 30000); // 30 seconds for better performance

    return () => clearInterval(interval);
  }, []);

  // Lock/unlock body scroll when modals open/close
  useEffect(() => {
    const hasModalOpen = selectedProductDetails || selectedStockInDetails || rejectModal.isOpen;
    
    if (hasModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProductDetails, selectedStockInDetails, rejectModal.isOpen]);

  const addItem = () => {
    if (!currentItem.product_name) {
      setSubmitErrors({ items: 'Please enter a product name' });
      return;
    }
    if (!currentItem.category_id) {
      setSubmitErrors({ items: 'Please enter a category' });
      return;
    }
    if (!currentItem.supplier_id) {
      setSubmitErrors({ items: 'Please enter a supplier' });
      return;
    }
    if (!currentItem.stock_in_quantity || parseFloat(currentItem.stock_in_quantity) <= 0) {
      setSubmitErrors({ items: 'Quantity must be greater than 0' });
      return;
    }
    if (!currentItem.stock_in_quantity || isNaN(parseFloat(currentItem.stock_in_quantity))) {
      setSubmitErrors({ items: 'Quantity is required' });
      return;
    }

    const exists = items.some(item => {
      return item.product_name === currentItem.product_name;
    });
    if (exists) {
      setSubmitErrors({ items: 'This product is already added' });
      return;
    }

    setItems([...items, { ...currentItem }]);
    setCurrentItem({
      product_name: '',
      category_id: '',
      supplier_id: '',
      price: '',
      barcode: '',
      unit: '',
      serial_no: '',
      warranty_date: '',
      stock_in_quantity: '',
      unit_price: '',
    });
    setSubmitErrors({});
  };

  // Filter functions for dropdowns - prioritize starts with
  const filteredProducts = products && products.filter(p => {
    if (!currentItem.product_name) return true;
    return p.product_name.toLowerCase().startsWith(currentItem.product_name.toLowerCase());
  });

  const filteredCategories = categories && categories.filter(c => {
    if (!currentItem.category_id) return true;
    return c.category_name.toLowerCase().startsWith(currentItem.category_id.toLowerCase());
  });

  const filteredSuppliers = suppliers && suppliers.filter(s => {
    if (!currentItem.supplier_id) return true;
    return s.supplier_name.toLowerCase().startsWith(currentItem.supplier_id.toLowerCase());
  });

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitErrors({});
    
    if (items.length === 0) {
      setSubmitErrors({ items: 'Please add at least one product to request.' });
      return;
    }

    setIsSubmitting(true);

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    if (!csrfToken) {
      setSubmitErrors({ form: 'CSRF token not found. Please refresh the page and try again.' });
      setIsSubmitting(false);
      return;
    }

    const requestBody = {
      remarks: formData.remarks,
      status: 'pending',
      items: items.map(item => ({
        product_name: item.product_name,
        category_id: item.category_id,
        supplier_id: item.supplier_id,
        price: item.price ? parseFloat(item.price) : 0,
        barcode: item.barcode,
        unit: item.unit,
        serial_no: item.serial_no,
        warranty_date: item.warranty_date,
        stock_in_quantity: parseFloat(item.stock_in_quantity),
        unit_price: parseFloat(item.unit_price),
      })),
    };

    fetch('/stock-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
      .then(async (response) => {
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(JSON.stringify(data));
        }
        return data;
      })
      .then(() => {
        setFormData({ remarks: '' });
        setItems([]);
        setCurrentItem({
          product_id: '',
          stock_in_quantity: '',
          unit_price: '',
        });
        setOpen(false);
        setSubmitErrors({});
        
        // Trigger immediate refresh of pending counts
        window.dispatchEvent(new CustomEvent('refreshPendingCounts'));
        
        window.location.reload();
      })
      .catch(error => {
        let errorMessage = 'Failed to create stock in request. Please try again.';
        let fieldErrors = {};
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.errors) {
            fieldErrors = errorData.errors;
          }
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // Not JSON
        }
        
        if (Object.keys(fieldErrors).length > 0) {
          setSubmitErrors(fieldErrors);
        } else {
          setSubmitErrors({ form: errorMessage });
        }
        setIsSubmitting(false);
      });
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      type: 'danger',
      title: 'Delete Stock In Record',
      message: 'Are you sure you want to delete this stock in record? This action cannot be undone.',
      onConfirm: () => {
        deleteForm.delete(`/stock-in/${id}`);
      },
    });
  };

  const handleApprove = (id) => {
    setConfirmModal({
      isOpen: true,
      type: 'success',
      title: 'Approve Stock In Request',
      message: 'Are you sure you want to approve this stock in request? Products will be added to inventory.',
      confirmText: 'Approve',
      onConfirm: () => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        fetch(`/stock-in/${id}/approve`, {
          method: 'POST',
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        })
          .then(async (response) => {
            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.error || 'Failed to approve stock in');
            }
            
            // Trigger immediate refresh of pending counts
            window.dispatchEvent(new CustomEvent('refreshPendingCounts'));
            
            window.location.reload();
          })
          .catch(error => {
            console.error('Approval error:', error);
            toast.error(`Failed to approve stock in request: ${error.message}`);
          });
      },
    });
  };

  const handleReject = (id) => {
    setRejectModal({
      isOpen: true,
      stockInId: id,
    });
    setRejectReason('');
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      toast.warning('Please provide a rejection reason');
      return;
    }

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const response = await fetch(`/stock-in/${rejectModal.stockInId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject stock in');
      }
      
      // Success! Show success toast
      toast.success('Stock in request rejected successfully!');
      
      // Trigger immediate refresh of pending counts
      window.dispatchEvent(new CustomEvent('refreshPendingCounts'));
      
      // Close modal and reset
      setRejectModal({ isOpen: false, stockInId: null });
      setRejectReason('');
      
      // Reload the page after a delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error(`Failed to reject: ${error.message}`);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderRequestDialog = () => (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-red-600 hover:bg-red-700 h-9 text-sm">
          <Plus size={18} />
          Request Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Products for Stock In</DialogTitle>
          <DialogDescription>
            Add products to your stock in request
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Product Name with Dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Product Name
            </label>
            <input
              id="product_name"
              type="text"
              name="product_name"
              value={currentItem.product_name}
              onChange={(e) => {
                setCurrentItem({ ...currentItem, product_name: e.target.value });
                setShowProductDropdown(true);
              }}
              onFocus={() => setShowProductDropdown(true)}
              onBlur={() => setTimeout(() => setShowProductDropdown(false), 200)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              placeholder="e.g., CCTV Camera, UPS, Network Switch"
            />
            {showProductDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto z-10">
                {filteredProducts && filteredProducts.length > 0 ? (
                  <>
                    {filteredProducts.map((prod) => (
                      <div key={prod.id} className="px-3 py-2 border-b border-gray-100">
                        <div className="flex items-center justify-between gap-2">
                          <div
                            onClick={() => {
                              // Handle both properly linked data (via relationships) and legacy data (direct names in fields)
                              const categoryName = prod.category?.category_name || prod.category_id || '';
                              const supplierName = prod.supplier?.supplier_name || prod.supplier_id || '';
                              setCurrentItem({
                                ...currentItem,
                                product_name: prod.product_name,
                                category_id: categoryName,
                                supplier_id: supplierName,
                                unit: prod.unit || '',
                                price: prod.price || '',
                                barcode: prod.barcode || '',
                                serial_no: prod.serial_no || '',
                              });
                              setShowProductDropdown(false);
                              setShowCategoryDropdown(false);
                              setShowSupplierDropdown(false);
                              // Force React to update by logging
                              console.log('Auto-filled - Category:', categoryName, 'Supplier:', supplierName);
                            }}
                            className="flex-1 hover:bg-blue-50 cursor-pointer py-2 px-2 rounded text-sm"
                          >
                            <div className="font-medium text-gray-900">{prod.product_name}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedProductDetails(prod)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-semibold px-2 py-1 bg-blue-50 rounded hover:bg-blue-100 transition"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 px-3 py-2 text-xs text-gray-500">
                      Or type to create new
                    </div>
                  </>
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Type to create new product
                  </div>
                )}
              </div>
            )}

            {/* Product Details Modal */}
            {selectedProductDetails && (
              <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{selectedProductDetails.product_name}</h3>
                    <button
                      type="button"
                      onClick={() => setSelectedProductDetails(null)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="font-semibold text-gray-900">Category:</span>
                      <p className="text-gray-700">{selectedProductDetails.category?.category_name || selectedProductDetails.category_id || 'Not assigned'}</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <span className="font-semibold text-gray-900">Supplier:</span>
                      <p className="text-gray-700">{selectedProductDetails.supplier?.supplier_name || selectedProductDetails.supplier_id || 'Not assigned'}</p>
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

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        // Handle both properly linked data (via relationships) and legacy data (direct names in fields)
                        const categoryName = selectedProductDetails.category?.category_name || selectedProductDetails.category_id || '';
                        const supplierName = selectedProductDetails.supplier?.supplier_name || selectedProductDetails.supplier_id || '';
                        setCurrentItem({
                          ...currentItem,
                          product_name: selectedProductDetails.product_name,
                          category_id: categoryName,
                          supplier_id: supplierName,
                          unit: selectedProductDetails.unit || '',
                          price: selectedProductDetails.price || '',
                          barcode: selectedProductDetails.barcode || '',
                          serial_no: selectedProductDetails.serial_no || '',
                        });
                        setSelectedProductDetails(null);
                        setShowProductDropdown(false);
                        setShowCategoryDropdown(false);
                        setShowSupplierDropdown(false);
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition"
                    >
                      Select Product
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedProductDetails(null)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Category with Dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Category
            </label>
            <input
              id="category_id"
              type="text"
              name="category_id"
              value={currentItem.category_id}
              onChange={(e) => {
                setCurrentItem({ ...currentItem, category_id: e.target.value });
                setShowCategoryDropdown(true);
              }}
              onFocus={() => setShowCategoryDropdown(true)}
              onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              placeholder="e.g., Security, IT Equipment, Networking"
            />
            {showCategoryDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                {filteredCategories && filteredCategories.length > 0 ? (
                  <>
                    {filteredCategories.map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setCurrentItem({
                            ...currentItem,
                            category_id: cat.category_name,
                          });
                          setShowCategoryDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-900"
                      >
                        {cat.category_name}
                      </div>
                    ))}
                    <div className="border-t border-gray-200 px-3 py-2 text-xs text-gray-500">
                      Or type to create new
                    </div>
                  </>
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Type to create new category
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Supplier with Dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Supplier
            </label>
            <input
              id="supplier_id"
              type="text"
              name="supplier_id"
              value={currentItem.supplier_id}
              onChange={(e) => {
                setCurrentItem({ ...currentItem, supplier_id: e.target.value });
                setShowSupplierDropdown(true);
              }}
              onFocus={() => setShowSupplierDropdown(true)}
              onBlur={() => setTimeout(() => setShowSupplierDropdown(false), 200)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              placeholder="e.g., Hikvision, Dahua, Ubiquiti"
            />
            {showSupplierDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                {filteredSuppliers && filteredSuppliers.length > 0 ? (
                  <>
                    {filteredSuppliers.map((sup) => (
                      <div
                        key={sup.id}
                        onClick={() => {
                          setCurrentItem({
                            ...currentItem,
                            supplier_id: sup.supplier_name,
                          });
                          setShowSupplierDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-900"
                      >
                        {sup.supplier_name}
                      </div>
                    ))}
                    <div className="border-t border-gray-200 px-3 py-2 text-xs text-gray-500">
                      Or type to create new
                    </div>
                  </>
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Type to create new supplier
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Price
            </label>
            <input
              id="price"
              type="number"
              name="price"
              step="0.01"
              value={currentItem.price}
              onChange={(e) => setCurrentItem({ ...currentItem, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              placeholder="e.g., 5000.00"
            />
          </div>

          {/* Barcode */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Barcode
            </label>
            <input
              id="barcode"
              type="text"
              name="barcode"
              value={currentItem.barcode}
              onChange={(e) => setCurrentItem({ ...currentItem, barcode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              placeholder="e.g., 8936099880123"
            />
          </div>

          {/* Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Unit
            </label>
            <input
              id="unit"
              type="text"
              name="unit"
              value={currentItem.unit}
              onChange={(e) => setCurrentItem({ ...currentItem, unit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              placeholder="e.g., pieces, box, set"
            />
          </div>

          {/* Serial No */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Serial No
            </label>
            <input
              id="serial_no"
              type="text"
              name="serial_no"
              value={currentItem.serial_no}
              onChange={(e) => setCurrentItem({ ...currentItem, serial_no: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              placeholder="e.g., SN123456789"
            />
          </div>

          {/* Warranty Date */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Warranty Date
            </label>
            <CalendarPicker 
              value={currentItem.warranty_date}
              onChange={(date) => setCurrentItem({ ...currentItem, warranty_date: date })}
              placeholder="Select warranty date"
            />
          </div>

          {/* Quantity and Price */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Quantity</label>
            <input
              id="stock_in_quantity"
              type="number"
              name="stock_in_quantity"
              min="1"
              step="1"
              value={currentItem.stock_in_quantity}
              onChange={(e) => setCurrentItem({ ...currentItem, stock_in_quantity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              placeholder="e.g., 10"
            />
          </div>

          <Button
            type="button"
            onClick={addItem}
            className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={16} />
            Add to Request
          </Button>

          {submitErrors.items && <p className="text-red-600 text-sm">{submitErrors.items}</p>}

          {/* Items List */}
          {items.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Requested Products ({items.length})
              </label>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-1.5 text-left font-semibold text-gray-500">Product Name</th>
                      <th className="px-3 py-1.5 text-center font-semibold text-gray-500 w-14">Qty</th>
                      <th className="px-3 py-1.5 text-center font-semibold text-gray-500 w-24">Price</th>
                      <th className="px-3 py-1.5 text-center font-semibold text-gray-500 w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 last:border-b-0 bg-white hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 font-medium text-gray-900 text-sm">{item.product_name || 'Product'}</td>
                        <td className="px-3 py-2 text-center font-semibold text-gray-800">{item.stock_in_quantity}</td>
                        <td className="px-3 py-2 text-center font-semibold text-gray-800">₱{parseFloat(item.price || 0).toFixed(2)}</td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setDetailItem(item)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium px-1.5 py-0.5 bg-blue-50 rounded hover:bg-blue-100 transition"
                            >
                              Details
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-500 hover:text-red-700 transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Item Detail Modal */}
          {detailItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30">
              <div className="bg-white rounded-xl shadow-2xl p-5 w-full max-w-sm mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900">{detailItem.product_name || 'Product'}</h3>
                  <button onClick={() => setDetailItem(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><p className="text-gray-500">Category</p><p className="font-medium text-gray-900">{detailItem.category_id || '-'}</p></div>
                  <div><p className="text-gray-500">Supplier</p><p className="font-medium text-gray-900">{detailItem.supplier_id || '-'}</p></div>
                  <div><p className="text-gray-500">Price</p><p className="font-medium text-gray-900">₱{parseFloat(detailItem.price || 0).toFixed(2)}</p></div>
                  <div><p className="text-gray-500">Barcode</p><p className="font-medium text-gray-900">{detailItem.barcode || '-'}</p></div>
                  <div><p className="text-gray-500">Unit</p><p className="font-medium text-gray-900">{detailItem.unit || '-'}</p></div>
                  <div><p className="text-gray-500">Serial No</p><p className="font-medium text-gray-900">{detailItem.serial_no || '-'}</p></div>
                  <div className="col-span-2"><p className="text-gray-500">Warranty Date</p><p className="font-medium text-gray-900">{detailItem.warranty_date ? formatDateShort(detailItem.warranty_date) : '-'}</p></div>
                  <div className="col-span-2 border-t border-gray-100 pt-2">
                    <p className="text-gray-500">Qty</p><p className="font-semibold text-gray-900">{detailItem.stock_in_quantity}</p>
                  </div>
                </div>
                <button onClick={() => setDetailItem(null)} className="mt-4 w-full py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition">Close</button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Remarks</label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition resize-none"
              placeholder="Enter remarks (optional)"
              rows="2"
            />
          </div>

          {submitErrors.form && <p className="text-red-600 text-sm">{submitErrors.form}</p>}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              onClick={() => {
                setOpen(false);
                setItems([]);
                setCurrentItem({
                  product_name: '',
                  category_id: '',
                  supplier_id: '',
                  price: '',
                  barcode: '',
                  unit: '',
                  serial_no: '',
                  warranty_date: '',
                  stock_in_quantity: '',
                  unit_price: '',
                });
                setFormData({ remarks: '' });
                setSubmitErrors({});
              }}
              variant="outline"
              className="border border-gray-300 text-gray-900 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  const renderTable = (filteredStockIns) => (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full table-fixed">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="w-12 px-2 py-3 text-left text-xs font-semibold text-gray-900">ID</th>
            <th className="w-24 px-2 py-3 text-left text-xs font-semibold text-gray-900">Requested By</th>
            <th className="w-48 px-2 py-3 text-left text-xs font-semibold text-gray-900">Products</th>
            <th className="w-32 px-2 py-3 text-left text-xs font-semibold text-gray-900">Remarks</th>
            <th className="w-20 px-2 py-3 text-left text-xs font-semibold text-gray-900">Status</th>
            <th className="w-32 px-2 py-3 text-left text-xs font-semibold text-gray-900">Created At</th>
            <th className="w-32 px-2 py-3 text-center text-xs font-semibold text-gray-900">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredStockIns && filteredStockIns.length > 0 ? (
            filteredStockIns.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="px-2 py-2 text-xs font-medium text-gray-900">{item.id}</td>
                <td className="px-2 py-2 text-xs text-gray-700">
                  <div className="truncate" title={item.user?.name}>{item.user?.name || '-'}</div>
                </td>
                <td className="px-2 py-2 text-xs text-gray-700">
                  {item.items && item.items.length > 0 ? (
                    <div className="truncate" title={item.items.map(stockItem => `${stockItem.product_name || stockItem.product?.product_name || 'Custom Product'} (${stockItem.stock_in_quantity})`).join(', ')}>
                      {item.items.map((stockItem, i) => (
                        <span key={i}>
                          {i > 0 && ', '}
                          {stockItem.product_name || stockItem.product?.product_name || 'Custom Product'} ({stockItem.stock_in_quantity})
                        </span>
                      ))}
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-2 py-2 text-xs text-gray-700">
                  <div className="truncate" title={item.remarks}>{item.remarks || '-'}</div>
                </td>
                <td className="px-2 py-2 text-xs">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-2 py-2 text-xs text-gray-700 whitespace-nowrap">
                  {formatDateTimeSingleLine(item.created_at)}
                </td>
                <td className="px-6 py-4 text-sm text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <button
                      onClick={() => setSelectedStockInDetails(item)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-semibold px-3 py-1 bg-blue-50 rounded hover:bg-blue-100 transition"
                    >
                      Details
                    </button>
                    {isAdmin && item.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="text-green-600 hover:text-green-800 transition-colors p-1"
                          title="Approve"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      </>
                    ) : item.user?.id === auth.user?.id && item.status === 'pending' ? (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 transition-colors p-1"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                No stock in requests found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // Filter stock ins by status and search term
  const pendingRequests = stockIns.filter(s => s.status === 'pending');
  const approvedRequests = stockIns.filter(s => s.status === 'approved');
  const rejectedRequests = stockIns.filter(s => s.status === 'rejected');

  // Apply search filter to the displayed requests - prioritize starts with
  const applySearchFilter = (requests) => {
    if (!searchTerm) return requests;
    
    const search = searchTerm.toLowerCase();
    
    return requests.filter(request => {
      // Check if any field starts with the search term
      const startsWithMatches = [
        request.id?.toString().startsWith(search),
        request.user?.name?.toLowerCase().startsWith(search),
        request.remarks?.toLowerCase().startsWith(search),
        request.status?.toLowerCase().startsWith(search)
      ].some(Boolean);
      
      // Check product names within items
      const productMatches = request.items?.some(item =>
        item.product_name?.toLowerCase().startsWith(search) ||
        item.product?.product_name?.toLowerCase().startsWith(search)
      ) || false;
      
      return startsWithMatches || productMatches;
    });
  };

  const displayedRequests = activeTab === 'pending' ? applySearchFilter(pendingRequests) : 
                           activeTab === 'approved' ? applySearchFilter(approvedRequests) : 
                           applySearchFilter(rejectedRequests);

  return (
    <AuthenticatedLayout onSearch={handleSearch}>
      <Head title="Stock In" />
      
      <div className="p-8 bg-white min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Stock In</h1>
              <p className="text-gray-600 text-sm mt-1">Manage incoming stock requests</p>
            </div>
            <div className="flex items-center gap-3">
              {renderRequestDialog()}
            </div>
          </div>

          {/* Tabs - Only show for Admin */}
          {isAdmin && (
            <div className="mb-6 border-b border-gray-200">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'pending'
                      ? 'border-b-2 border-red-600 text-red-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Pending Requests ({pendingRequests.length})
                </button>
                <button
                  onClick={() => setActiveTab('approved')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'approved'
                      ? 'border-b-2 border-red-600 text-red-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Approved ({approvedRequests.length})
                </button>
                <button
                  onClick={() => setActiveTab('rejected')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'rejected'
                      ? 'border-b-2 border-red-600 text-red-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Rejected ({rejectedRequests.length})
                </button>
              </div>
            </div>
          )}

          {/* Content Section */}
          <div className="space-y-6">

            {/* Table Section - Show based on admin and tab */}
            {isAdmin ? (
              renderTable(displayedRequests)
            ) : (
              // Staff view - show their own requests
              <>
                <div>
                  {renderTable(applySearchFilter(stockIns.filter(s => s.user?.id === auth.user?.id)))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stock In Details Modal - Enterprise UI Design */}
      {selectedStockInDetails && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* FIXED HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 truncate">
                      Stock In Request
                    </h2>
                    <p className="text-sm text-gray-600 mt-0.5">
                      #{selectedStockInDetails.id.toString().padStart(5, '0')} · Created {formatDateShort(selectedStockInDetails.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        selectedStockInDetails.status === 'approved' ? 'bg-green-500' :
                        selectedStockInDetails.status === 'pending' ? 'bg-yellow-500' :
                        selectedStockInDetails.status === 'rejected' ? 'bg-red-500' :
                        'bg-gray-400'
                      }`} />
                      <span className={`text-sm font-medium capitalize ${
                        selectedStockInDetails.status === 'approved' ? 'text-green-700' :
                        selectedStockInDetails.status === 'pending' ? 'text-yellow-700' :
                        selectedStockInDetails.status === 'rejected' ? 'text-red-700' :
                        'text-gray-700'
                      }`}>
                        {selectedStockInDetails.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStockInDetails(null)}
                className="flex-shrink-0 ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* SCROLLABLE BODY */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              
              {/* REQUEST INFORMATION */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
                  Request Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <dt className="text-sm text-gray-600 mb-1">Requested By</dt>
                    <dd className="text-base font-medium text-gray-900">
                      {selectedStockInDetails.user?.name || 'Not specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600 mb-1">Status</dt>
                    <dd>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          selectedStockInDetails.status === 'approved' ? 'bg-green-500' :
                          selectedStockInDetails.status === 'pending' ? 'bg-yellow-500' :
                          selectedStockInDetails.status === 'rejected' ? 'bg-red-500' :
                          'bg-gray-400'
                        }`} />
                        <span className={`text-base font-medium capitalize ${
                          selectedStockInDetails.status === 'approved' ? 'text-green-700' :
                          selectedStockInDetails.status === 'pending' ? 'text-yellow-700' :
                          selectedStockInDetails.status === 'rejected' ? 'text-red-700' :
                          'text-gray-700'
                        }`}>
                          {selectedStockInDetails.status}
                        </span>
                      </div>
                    </dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-sm text-gray-600 mb-1">Created At</dt>
                    <dd className="text-base font-medium text-gray-900">
                      {formatDatePhilippines(selectedStockInDetails.created_at)}
                    </dd>
                  </div>
                  {selectedStockInDetails.remarks && (
                    <div className="md:col-span-2">
                      <dt className="text-sm text-gray-600 mb-1">Remarks</dt>
                      <dd className="text-base text-gray-900">
                        {selectedStockInDetails.remarks}
                      </dd>
                    </div>
                  )}
                </div>
              </div>

              {/* APPROVAL INFORMATION */}
              {(selectedStockInDetails.status !== 'pending' && (selectedStockInDetails.approved_by || selectedStockInDetails.rejection_reason)) && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
                    Approval Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {selectedStockInDetails.approved_by && (
                      <div>
                        <dt className="text-sm text-gray-600 mb-1">
                          {selectedStockInDetails.status === 'approved' ? 'Approved By' : 'Processed By'}
                        </dt>
                        <dd className="text-base font-medium text-gray-900">
                          {selectedStockInDetails.approved_by.name}
                        </dd>
                      </div>
                    )}
                    {selectedStockInDetails.approved_at && (
                      <div>
                        <dt className="text-sm text-gray-600 mb-1">
                          {selectedStockInDetails.status === 'approved' ? 'Approved At' : 'Processed At'}
                        </dt>
                        <dd className="text-base font-medium text-gray-900">
                          {formatDatePhilippines(selectedStockInDetails.approved_at)}
                        </dd>
                      </div>
                    )}
                    {selectedStockInDetails.status === 'rejected' && selectedStockInDetails.rejection_reason && (
                      <div className="md:col-span-2">
                        <dt className="text-sm text-red-600 mb-1">Rejection Reason</dt>
                        <dd className="text-base text-red-800 bg-red-50 border border-red-200 rounded-lg p-3">
                          {selectedStockInDetails.rejection_reason}
                        </dd>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PRODUCTS */}
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Products
                  </h3>
                  <span className="text-sm font-medium text-gray-700">
                    {selectedStockInDetails.items?.length || 0} {(selectedStockInDetails.items?.length || 0) === 1 ? 'item' : 'items'}
                  </span>
                </div>
                
                {selectedStockInDetails.items && selectedStockInDetails.items.length > 0 ? (
                  <div className="space-y-0">
                    {/* Desktop table view */}
                    <div className="hidden md:block border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Supplier
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Unit Price
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {selectedStockInDetails.items.map((stockItem, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {stockItem.product_name || stockItem.product?.product_name || 'Unknown Product'}
                                  </div>
                                  {stockItem.barcode && (
                                    <div className="text-xs text-gray-500">
                                      Barcode: {stockItem.barcode}
                                    </div>
                                  )}
                                  {stockItem.serial_no && (
                                    <div className="text-xs text-gray-500">
                                      SN: {stockItem.serial_no}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {stockItem.category_id || '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {stockItem.supplier_id || '-'}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="text-lg font-semibold text-gray-900">
                                  {stockItem.stock_in_quantity}
                                </span>
                                <span className="text-sm text-gray-600 ml-1">
                                  {stockItem.unit || 'pcs'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="text-sm font-medium text-gray-900">
                                  ₱{parseFloat(stockItem.unit_price || 0).toFixed(2)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="text-lg font-semibold text-green-600">
                                  ₱{(parseFloat(stockItem.unit_price || 0) * parseFloat(stockItem.stock_in_quantity || 0)).toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile card view */}
                    <div className="md:hidden space-y-3">
                      {selectedStockInDetails.items.map((stockItem, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white">
                          <div className="flex items-start justify-between mb-3">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {stockItem.product_name || stockItem.product?.product_name || 'Unknown Product'}
                              </h4>
                              {stockItem.barcode && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Barcode: {stockItem.barcode}
                                </p>
                              )}
                              {stockItem.serial_no && (
                                <p className="text-xs text-gray-500">
                                  SN: {stockItem.serial_no}
                                </p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-lg font-semibold text-green-600">
                                ₱{(parseFloat(stockItem.unit_price || 0) * parseFloat(stockItem.stock_in_quantity || 0)).toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <dt className="text-gray-600">Category</dt>
                              <dd className="font-medium text-gray-900">
                                {stockItem.category_id || '-'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-gray-600">Supplier</dt>
                              <dd className="font-medium text-gray-900">
                                {stockItem.supplier_id || '-'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-gray-600">Quantity</dt>
                              <dd className="font-semibold text-gray-900">
                                {stockItem.stock_in_quantity} {stockItem.unit || 'pcs'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-gray-600">Unit Price</dt>
                              <dd className="font-medium text-gray-900">
                                ₱{parseFloat(stockItem.unit_price || 0).toFixed(2)}
                              </dd>
                            </div>
                            {stockItem.warranty_date && (
                              <div className="col-span-2">
                                <dt className="text-gray-600">Warranty Date</dt>
                                <dd className="font-medium text-gray-900">
                                  {formatDateShort(stockItem.warranty_date)}
                                </dd>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total Summary */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">Grand Total:</span>
                        <span className="text-2xl font-bold text-green-600">
                          ₱{selectedStockInDetails.items.reduce((sum, item) => sum + (parseFloat(item.unit_price || 0) * parseFloat(item.stock_in_quantity || 0)), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No products found in this request</p>
                  </div>
                )}
              </div>
            </div>

            {/* FIXED FOOTER */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
              <button
                type="button"
                onClick={() => setSelectedStockInDetails(null)}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Reject Stock In Request</h3>
              <button
                type="button"
                onClick={() => {
                  setRejectModal({ isOpen: false, stockInId: null });
                  setRejectReason('');
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Please provide a reason for rejecting this stock in request:
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition resize-none"
                rows="3"
                maxLength="500"
              />
              <div className="text-xs text-gray-500 mt-1">
                {rejectReason.length}/500 characters
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setRejectModal({ isOpen: false, stockInId: null });
                  setRejectReason('');
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitReject}
                disabled={!rejectReason.trim()}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-2 px-4 rounded transition"
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
      />
    </AuthenticatedLayout>
  );
}

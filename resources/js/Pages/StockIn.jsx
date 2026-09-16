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

    // Prevent duplicate submissions
    if (isSubmitting) {
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
      title: 'Approve Stock In Request?',
      message: 'Approving this request will add its products to inventory.',
      requestId: id,
      confirmText: 'Approve Request',
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
        <Button className="gap-2 bg-red-600 hover:bg-red-700 h-10 text-white font-medium text-sm">
          <Plus size={18} />
          Add Stock In Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-semibold">Add Stock In Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col">
          <div className="space-y-5 flex-1">
            {/* Product Name - Full Width */}
            <div className="relative">
              <label className="block text-xs text-gray-600 mb-1.5 font-medium">Product Name</label>
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
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                placeholder="CCTV Camera, UPS, Network Switch"
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
                <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg w-full max-w-[560px] max-h-[90vh] flex flex-col shadow-lg">
                    {/* HEADER */}
                    <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
                      <h3 className="text-lg font-semibold text-gray-900 break-words">{selectedProductDetails.product_name}</h3>
                      <button
                        type="button"
                        onClick={() => setSelectedProductDetails(null)}
                        className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition"
                        aria-label="Close modal"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    {/* BODY - Scrollable */}
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                      
                      {/* Price & Quantity Summary Row */}
                      <div className="flex items-center justify-between py-3 border-b border-gray-200">
                        <div>
                          <span className="text-xs text-gray-600">Price</span>
                          <p className="text-sm font-semibold text-gray-900">₱{parseFloat(selectedProductDetails.price || 0).toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-600">Available Quantity</span>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedProductDetails.quantity ? 
                              (selectedProductDetails.quantity % 1 === 0 ? 
                                `${selectedProductDetails.quantity} ${selectedProductDetails.unit || 'pcs'}` 
                                : `${parseFloat(selectedProductDetails.quantity).toFixed(2)} ${selectedProductDetails.unit || 'pcs'}`)
                              : `0 ${selectedProductDetails.unit || 'pcs'}`}
                          </p>
                        </div>
                      </div>

                      {/* Category | Unit - Two Columns */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <span className="text-xs text-gray-600">Category</span>
                          <p className="text-sm text-gray-900 break-words">
                            {selectedProductDetails.category?.category_name || selectedProductDetails.category_id || '-'}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600">Unit</span>
                          <p className="text-sm text-gray-900 break-words">
                            {selectedProductDetails.unit || '-'}
                          </p>
                        </div>
                      </div>

                      {/* Supplier - Full Width */}
                      <div>
                        <span className="text-xs text-gray-600">Supplier</span>
                        <p className="text-sm text-gray-900 break-words">
                          {selectedProductDetails.supplier?.supplier_name || selectedProductDetails.supplier_id || '-'}
                        </p>
                      </div>

                      {/* Barcode | Serial No - Two Columns */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <span className="text-xs text-gray-600">Barcode</span>
                          <p className="text-sm text-gray-900 font-mono break-words">
                            {selectedProductDetails.barcode || '-'}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600">Serial No</span>
                          <p className="text-sm text-gray-900 font-mono break-words">
                            {selectedProductDetails.serial_no || '-'}
                          </p>
                        </div>
                      </div>

                      {/* Warranty Date - Full Width if present */}
                      {selectedProductDetails.warranty_date && (
                        <div>
                          <span className="text-xs text-gray-600">Warranty Date</span>
                          <p className="text-sm text-gray-900">
                            {formatDateShort(selectedProductDetails.warranty_date)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* FOOTER - Fixed */}
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedProductDetails(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded transition"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={() => {
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
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition"
                      >
                        Select Product
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Category | Supplier - Two Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-xs text-gray-600 mb-1.5 font-medium">Category</label>
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  placeholder="Security, IT Equipment"
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

              <div className="relative">
                <label className="block text-xs text-gray-600 mb-1.5 font-medium">Supplier</label>
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  placeholder="Hikvision, Dahua"
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
            </div>

            {/* Price | Unit - Two Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1.5 font-medium">Price</label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  step="0.01"
                  value={currentItem.price}
                  onChange={(e) => setCurrentItem({ ...currentItem, price: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  placeholder="5000.00"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1.5 font-medium">Unit</label>
                <input
                  id="unit"
                  type="text"
                  name="unit"
                  value={currentItem.unit}
                  onChange={(e) => setCurrentItem({ ...currentItem, unit: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  placeholder="pcs, box, set"
                />
              </div>
            </div>

            {/* Barcode | Serial No - Two Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1.5 font-medium">Barcode</label>
                <input
                  id="barcode"
                  type="text"
                  name="barcode"
                  value={currentItem.barcode}
                  onChange={(e) => setCurrentItem({ ...currentItem, barcode: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  placeholder="8936099880123"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1.5 font-medium">Serial No</label>
                <input
                  id="serial_no"
                  type="text"
                  name="serial_no"
                  value={currentItem.serial_no}
                  onChange={(e) => setCurrentItem({ ...currentItem, serial_no: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  placeholder="SN123456789"
                />
              </div>
            </div>

            {/* Warranty Date | Quantity - Two Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1.5 font-medium">Warranty Date</label>
                <CalendarPicker 
                  value={currentItem.warranty_date}
                  onChange={(date) => setCurrentItem({ ...currentItem, warranty_date: date })}
                  placeholder="Select date"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1.5 font-medium">Quantity</label>
                <input
                  id="stock_in_quantity"
                  type="number"
                  name="stock_in_quantity"
                  min="1"
                  step="1"
                  value={currentItem.stock_in_quantity}
                  onChange={(e) => setCurrentItem({ ...currentItem, stock_in_quantity: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  placeholder="10"
                />
              </div>
            </div>

            {/* Add to Request Button */}
            <Button
              type="button"
              onClick={addItem}
              variant="outline"
              className="w-full gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 h-10"
            >
              <Plus size={16} />
              Add to Request
            </Button>

            {submitErrors.items && <p className="text-red-600 text-sm">{submitErrors.items}</p>}

            {/* Items List */}
            {items.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Requested Products ({items.length})
                </label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Product Name</th>
                        <th className="px-3 py-2 text-center font-semibold text-gray-600 w-14">Qty</th>
                        <th className="px-3 py-2 text-center font-semibold text-gray-600 w-24">Price</th>
                        <th className="px-3 py-2 text-center font-semibold text-gray-600 w-20">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 last:border-b-0 bg-white hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-2 font-medium text-gray-900">{item.product_name || 'Product'}</td>
                          <td className="px-3 py-2 text-center font-semibold text-gray-800">{item.stock_in_quantity}</td>
                          <td className="px-3 py-2 text-center font-semibold text-gray-800">₱{parseFloat(item.price || 0).toFixed(2)}</td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setDetailItem(item)}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 bg-blue-50 rounded hover:bg-blue-100 transition"
                              >
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="text-red-500 hover:text-red-700 transition p-1"
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
          </div>

          {/* Item Detail Modal */}
          {detailItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg shadow-lg p-5 w-full max-w-sm mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900">{detailItem.product_name || 'Product'}</h3>
                  <button onClick={() => setDetailItem(null)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
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
                <button onClick={() => setDetailItem(null)} className="w-full py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition">Close</button>
              </div>
            </div>
          )}

          {/* Remarks Section - Separated with divider */}
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-xs text-gray-600 mb-2.5 font-medium">Remarks</label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition resize-none"
              placeholder="Enter remarks (optional)"
              rows="3"
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
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[70px]">Request ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[120px]">Requested By</th>
            <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[200px]">Products</th>
            <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[140px]">Remarks</th>
            <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[130px]">Requested At</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[110px]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredStockIns && filteredStockIns.length > 0 ? (
            filteredStockIns.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="hidden sm:table-cell px-4 py-4 text-sm font-medium text-gray-900">{item.id}</td>
                <td className="px-4 py-4 text-sm text-gray-700">
                  <div className="truncate" title={item.user?.name}>{item.user?.name || '-'}</div>
                </td>
                <td className="hidden md:table-cell px-4 py-4 text-sm text-gray-700">
                  {item.items && item.items.length > 0 ? (
                    <div className="space-y-1">
                      {item.items.map((stockItem, i) => (
                        <div key={i} className="text-sm text-gray-700">
                          <span className="text-gray-900 font-medium">{stockItem.product_name || stockItem.product?.product_name || 'Custom Product'}</span>
                          <span className="text-gray-600"> · Qty: {stockItem.stock_in_quantity}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="hidden lg:table-cell px-4 py-4 text-sm text-gray-700">
                  <div className="line-clamp-2 text-gray-700" title={item.remarks}>{item.remarks || '-'}</div>
                </td>
                <td className="hidden md:table-cell px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                  <div className="font-medium">{formatDateTimeSingleLine(item.created_at)}</div>
                </td>
                <td className="px-4 py-4 text-sm text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <button
                      onClick={() => setSelectedStockInDetails(item)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 px-2.5 py-2 hover:bg-blue-50 rounded transition"
                    >
                      <span>Details</span>
                    </button>
                    {isAdmin && item.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="text-green-600 hover:text-green-800 transition-colors p-2"
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-2"
                          title="Reject"
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    ) : item.user?.id === auth.user?.id && item.status === 'pending' ? (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 transition-colors p-2"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-4 py-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">No stock in requests found</p>
                </div>
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
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {renderRequestDialog()}
            </div>
          </div>

          {/* Tabs - Show to all users */}
          <div className="mb-5 border-b border-gray-200">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('pending')}
                className={`pb-3 text-sm transition-colors border-b-2 ${
                  activeTab === 'pending'
                    ? 'border-red-600 text-gray-900 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Pending Requests
                <span className={`ml-2 text-xs font-normal ${activeTab === 'pending' ? 'text-gray-600' : 'text-gray-500'}`}>
                  ({pendingRequests.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`pb-3 text-sm transition-colors border-b-2 ${
                  activeTab === 'approved'
                    ? 'border-red-600 text-gray-900 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Approved
                <span className={`ml-2 text-xs font-normal ${activeTab === 'approved' ? 'text-gray-600' : 'text-gray-500'}`}>
                  ({approvedRequests.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('rejected')}
                className={`pb-3 text-sm transition-colors border-b-2 ${
                  activeTab === 'rejected'
                    ? 'border-red-600 text-gray-900 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Rejected
                <span className={`ml-2 text-xs font-normal ${activeTab === 'rejected' ? 'text-gray-600' : 'text-gray-500'}`}>
                  ({rejectedRequests.length})
                </span>
              </button>
            </div>
          </div>

          {/* Content Section */}
          <div>
            {/* Table Section - Show filtered requests based on active tab and user role */}
            {isAdmin ? (
              renderTable(displayedRequests)
            ) : (
              // Staff view - show their own requests filtered by tab
              renderTable(applySearchFilter(stockIns.filter(s => s.user?.id === auth.user?.id && s.status === activeTab)))
            )}
          </div>
        </div>
      </div>

      {/* Stock In Details Modal */}
      {selectedStockInDetails && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-[720px] max-h-[90vh] flex flex-col">
            {/* FIXED HEADER */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-gray-900">Stock In Request</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Request #{selectedStockInDetails.id.toString().padStart(5, '0')}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-6">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedStockInDetails.status === 'approved' ? 'bg-green-500' :
                    selectedStockInDetails.status === 'pending' ? 'bg-yellow-500' :
                    selectedStockInDetails.status === 'rejected' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`} />
                  <span className={`text-xs font-semibold capitalize px-2 py-1 rounded ${
                    selectedStockInDetails.status === 'approved' ? 'bg-green-100 text-green-700' :
                    selectedStockInDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    selectedStockInDetails.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedStockInDetails.status}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStockInDetails(null)}
                className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* SCROLLABLE BODY */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              
              {/* REQUEST INFORMATION - Simplified */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <span className="text-xs text-gray-600">Requested By</span>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedStockInDetails.user?.name || 'Not specified'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-600">Created At</span>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDatePhilippines(selectedStockInDetails.created_at)}
                  </p>
                </div>
                {selectedStockInDetails.remarks && (
                  <div className="sm:col-span-2">
                    <span className="text-xs text-gray-600">Remarks</span>
                    <p className="text-sm text-gray-900 break-words">
                      {selectedStockInDetails.remarks}
                    </p>
                  </div>
                )}
              </div>

              {/* APPROVAL INFORMATION */}
              {(selectedStockInDetails.status !== 'pending' && (selectedStockInDetails.approved_by || selectedStockInDetails.rejection_reason)) && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {selectedStockInDetails.approved_by && (
                      <div>
                        <span className="text-xs text-gray-600">
                          {selectedStockInDetails.status === 'approved' ? 'Approved By' : 'Processed By'}
                        </span>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedStockInDetails.approved_by.name}
                        </p>
                      </div>
                    )}
                    {selectedStockInDetails.approved_at && (
                      <div>
                        <span className="text-xs text-gray-600">
                          {selectedStockInDetails.status === 'approved' ? 'Approved At' : 'Processed At'}
                        </span>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDatePhilippines(selectedStockInDetails.approved_at)}
                        </p>
                      </div>
                    )}
                    {selectedStockInDetails.status === 'rejected' && selectedStockInDetails.rejection_reason && (
                      <div className="sm:col-span-2">
                        <span className="text-xs text-red-600">Rejection Reason</span>
                        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg p-3 mt-1">
                          {selectedStockInDetails.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PRODUCTS */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">Products</h3>
                  <span className="text-xs text-gray-600">
                    {selectedStockInDetails.items?.length || 0} {(selectedStockInDetails.items?.length || 0) === 1 ? 'item' : 'items'}
                  </span>
                </div>
                
                {selectedStockInDetails.items && selectedStockInDetails.items.length > 0 ? (
                  <div className="space-y-0 overflow-x-auto">
                    {/* Desktop table view */}
                    <div className="hidden md:block border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Product</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Supplier</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">Quantity</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">Unit Price</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {selectedStockInDetails.items.map((stockItem, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 break-words">
                                    {stockItem.product_name || stockItem.product?.product_name || 'Unknown Product'}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    {stockItem.category_id && <div>Category: {stockItem.category_id}</div>}
                                  </div>
                                  {(stockItem.barcode || stockItem.serial_no) && (
                                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                      {stockItem.barcode && <div>Barcode: {stockItem.barcode}</div>}
                                      {stockItem.serial_no && <div>SN: {stockItem.serial_no}</div>}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 break-words">
                                {stockItem.supplier_id || '-'}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-sm font-medium text-gray-900">
                                  {stockItem.stock_in_quantity} {stockItem.unit || 'pcs'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-sm text-gray-900">
                                  ₱{parseFloat(stockItem.unit_price || 0).toFixed(2)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-sm font-medium text-gray-900">
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
                        <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-white">
                          <div className="flex items-start justify-between mb-2">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-medium text-gray-900 break-words">
                                {stockItem.product_name || stockItem.product?.product_name || 'Unknown Product'}
                              </h4>
                              {stockItem.category_id && (
                                <p className="text-xs text-gray-600 mt-1">Category: {stockItem.category_id}</p>
                              )}
                              {(stockItem.barcode || stockItem.serial_no) && (
                                <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                  {stockItem.barcode && <div>Barcode: {stockItem.barcode}</div>}
                                  {stockItem.serial_no && <div>SN: {stockItem.serial_no}</div>}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs mt-3 pt-3 border-t border-gray-100">
                            <div>
                              <span className="text-gray-600">Supplier</span>
                              <p className="font-medium text-gray-900 break-words">{stockItem.supplier_id || '-'}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-gray-600">Quantity</span>
                              <p className="font-medium text-gray-900">{stockItem.stock_in_quantity} {stockItem.unit || 'pcs'}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Unit Price</span>
                              <p className="font-medium text-gray-900">₱{parseFloat(stockItem.unit_price || 0).toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-gray-600">Total</span>
                              <p className="font-semibold text-gray-900">
                                ₱{(parseFloat(stockItem.unit_price || 0) * parseFloat(stockItem.stock_in_quantity || 0)).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total Summary - Compact, right-aligned */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-end gap-6">
                      <span className="text-sm font-semibold text-gray-700">Grand Total:</span>
                      <span className="text-lg font-bold text-gray-900">
                        ₱{selectedStockInDetails.items.reduce((sum, item) => sum + (parseFloat(item.unit_price || 0) * parseFloat(item.stock_in_quantity || 0)), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 text-sm">
                    No products found in this request
                  </div>
                )}
              </div>
            </div>

            {/* FIXED FOOTER */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 flex-shrink-0">
              <button
                type="button"
                onClick={() => setSelectedStockInDetails(null)}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-[460px] bg-white rounded-lg shadow-lg animate-in fade-in zoom-in duration-200">
            {/* Close button */}
            <button
              type="button"
              onClick={() => {
                setRejectModal({ isOpen: false, stockInId: null });
                setRejectReason('');
              }}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="p-6">
              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Reject Stock In Request
              </h3>

              {/* Label */}
              <label className="block text-xs text-gray-600 mb-2.5 font-medium">
                Rejection reason
              </label>

              {/* Textarea */}
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this request is being rejected…"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition resize-none"
                rows="4"
                maxLength="500"
              />

              {/* Character counter and errors */}
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-red-600">
                  {/* Validation messages go here if needed */}
                </div>
                <div className="text-xs text-gray-500">
                  {rejectReason.length}/500
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setRejectModal({ isOpen: false, stockInId: null });
                    setRejectReason('');
                  }}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitReject}
                  disabled={!rejectReason.trim()}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Reject Request
                </button>
              </div>
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
        requestId={confirmModal.requestId}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
      />
    </AuthenticatedLayout>
  );
}

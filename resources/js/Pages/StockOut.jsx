import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, FileText, Download, Check, X, ChevronDown, Search } from 'lucide-react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { formatDatePhilippines, formatDateShort, formatDateTimeSingleLine } from '@/utils/dateUtils';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import ConfirmModal from '@/components/ui/confirm-modal';
import { useToast } from '@/components/ui/toast';

export default function StockOut({ stockOuts: initialStockOuts, customers, products, auth }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Real-time polling for stock out data - updates every 2 seconds
  const { data: realtimeData, refetch } = useRealTimeData(
    `/api/stock-out-list`,
    2000, // 2 second interval for real-time updates
    true
  );

  // Use real-time data if available, otherwise use initial data
  const stockOuts = useMemo(() => {
    if (realtimeData?.stock_outs) {
      return realtimeData.stock_outs;
    }
    return initialStockOuts || [];
  }, [realtimeData, initialStockOuts]);

  // Smart default tab
  const isAdmin = auth?.user?.role?.role_name === 'Admin';
  const pendingCount = stockOuts?.filter(s => s.status === 'pending').length || 0;
  const approvedCount = stockOuts?.filter(s => s.status === 'approved').length || 0;
  
  const defaultTab = !isAdmin && pendingCount === 0 && approvedCount > 0 ? 'approved' : 'pending';
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedStockOutDetails, setSelectedStockOutDetails] = useState(null);
  const [items, setItems] = useState([]);
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [detailItem, setDetailItem] = useState(null);
  const [currentItem, setCurrentItem] = useState({
    product_id: '',
    stock_out_quantity: '',
    unit_price: '',
  });
  
  const { data, setData, processing, errors, reset } = useForm({
    delivered_to_id: '',
    address: '',
    tin: '',
    remarks: '',
    business_style: '',
    items: [],
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Lock/unlock body scroll when modals open/close
  useEffect(() => {
    const hasModalOpen = detailItem || selectedStockOutDetails || rejectDialogOpen || confirmModal.isOpen;
    
    if (hasModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [detailItem, selectedStockOutDetails, rejectDialogOpen, confirmModal.isOpen]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Close product dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (productSearchOpen && !e.target.closest('[data-product-dropdown]')) {
        setProductSearchOpen(false);
      }
      if (customerSearchOpen && !e.target.closest('[data-customer-dropdown]')) {
        setCustomerSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [productSearchOpen, customerSearchOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.warning('Please add at least one product item');
      return;
    }
    
    if (!data.delivered_to_id) {
      toast.warning('Please select a customer');
      return;
    }

    if (!data.address) {
      toast.warning('Please enter an address');
      return;
    }

    // Prevent duplicate submissions
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    // Create JSON payload
    const payload = {
      delivered_to_id: data.delivered_to_id,
      address: data.address,
      tin: data.tin || '',
      remarks: data.remarks || '',
      business_style: data.business_style || '',
      items: items.map(item => ({
        product_id: parseInt(item.product_id),
        stock_out_quantity: parseInt(item.stock_out_quantity),
        unit_price: parseFloat(item.unit_price),
      })),
    };

    // Get CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

    // Submit via fetch with JSON
    fetch('/stock-out', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        const contentType = response.headers.get('content-type');
        
        // Try to parse JSON if available
        let jsonData = null;
        if (contentType && contentType.includes('application/json')) {
          jsonData = await response.json();
        }

        // Check for error status codes
        if (response.status === 422) {
          // Validation error
          const errorMessages = Object.values(jsonData?.errors || {}).flat().join('\n');
          throw new Error('Validation Error:\n' + errorMessages);
        }
        
        if (!response.ok) {
          throw new Error(jsonData?.message || `HTTP Error: ${response.status}`);
        }

        // Success - return the JSON data
        if (!jsonData || !jsonData.success) {
          throw new Error('Unexpected response from server');
        }
        
        return jsonData;
      })
      .then((result) => {
        // Success! Only now clear and reload
        toast.success('Stock out request created successfully!');
        reset();
        setItems([]);
        setCurrentItem({ product_id: '', stock_out_quantity: '', unit_price: '' });
        setOpen(false);
        
        // Trigger immediate refresh of pending counts
        window.dispatchEvent(new CustomEvent('refreshPendingCounts'));
        
        // Force a hard refresh
        setTimeout(() => {
          window.location.href = '/stock-out';
        }, 500);
      })
      .catch(error => {
        console.error('Error:', error);
        // Show error but do NOT close dialog or reload
        toast.error('Failed to create stock out: ' + (error.message || 'Unknown error'));
        setIsSubmitting(false);
      });
  };

  const addItem = () => {
    if (!currentItem.product_id || !currentItem.stock_out_quantity || !currentItem.unit_price) {
      toast.warning('Please fill all product fields');
      return;
    }
    
    setItems([...items, { ...currentItem }]);
    setCurrentItem({ product_id: '', stock_out_quantity: '', unit_price: '' });
  };

  const removeItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleApprove = async (id) => {
    setConfirmModal({
      isOpen: true,
      type: 'success',
      title: 'Approve Stock Out Request',
      message: 'Are you sure you want to approve this stock out request? Products will be deducted from inventory.',
      confirmText: 'Approve',
      onConfirm: async () => {
        try {
          const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
          
          const response = await fetch(`/stock-out/${id}/approve`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-TOKEN': csrfToken,
              'Accept': 'application/json',
            },
          });

          const contentType = response.headers.get('content-type');
          let result = null;

          // Try to parse JSON if available
          if (contentType && contentType.includes('application/json')) {
            result = await response.json();
          }

          // Check for errors
          if (!response.ok) {
            throw new Error(result?.message || result?.error || `HTTP Error: ${response.status}`);
          }

          if (!result || !result.success) {
            throw new Error(result?.message || 'Failed to approve request');
          }

          // Success! Show success toast
          toast.success('Stock out request approved successfully!');
          
          // Trigger immediate refresh of pending counts
          window.dispatchEvent(new CustomEvent('refreshPendingCounts'));
          
          // Add a small delay to ensure backend processes the approval
          setTimeout(() => {
            // Open the delivery receipt PDF in new tab
            console.log('Opening delivery receipt for ID:', id);
            window.open(`/delivery-receipt/${id}/view`, '_blank');
            
            // Reload the page after another delay
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }, 300);
        } catch (error) {
          console.error('Approval error:', error);
          toast.error(`Failed to approve: ${error.message}`);
        }
      },
    });
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.warning('Please provide a rejection reason');
      return;
    }

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
      
      const response = await fetch(`/stock-out/${rejectingId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          reason: rejectReason,
        }),
      });

      const contentType = response.headers.get('content-type');
      let result = null;

      // Try to parse JSON if available
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      }

      // Check for errors
      if (!response.ok) {
        throw new Error(result?.error || result?.message || `HTTP Error: ${response.status}`);
      }

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to reject request');
      }

      // Success
      toast.success('Stock out request rejected successfully!');
      setRejectDialogOpen(false);
      setRejectingId(null);
      setRejectReason('');
      
      // Trigger immediate refresh of pending counts
      window.dispatchEvent(new CustomEvent('refreshPendingCounts'));
      
      window.location.reload();
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error('Failed to reject: ' + (error.message || 'Unknown error'));
      // Don't close dialog or reload on error
    }
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter stock outs by status and search term
  const pendingRequests = stockOuts.filter(s => s.status === 'pending');
  const approvedRequests = stockOuts.filter(s => s.status === 'approved');
  const rejectedRequests = stockOuts.filter(s => s.status === 'rejected');

  // Apply search filter to the displayed requests - prioritize starts with
  const applySearchFilter = (requests) => {
    if (!searchTerm) return requests;
    
    const search = searchTerm.toLowerCase();
    
    return requests.filter(request => {
      // Check if any field starts with the search term
      const startsWithMatches = [
        request.id?.toString().startsWith(search),
        request.delivery_no?.toLowerCase().startsWith(search),
        request.user?.name?.toLowerCase().startsWith(search),
        request.requestedBy?.name?.toLowerCase().startsWith(search),
        request.remarks?.toLowerCase().startsWith(search),
        request.status?.toLowerCase().startsWith(search),
        request.address?.toLowerCase().startsWith(search),
        request.business_style?.toLowerCase().startsWith(search),
        request.customer?.customer_name?.toLowerCase().startsWith(search)
      ].some(Boolean);
      
      // Check product names within items
      const productMatches = request.items?.some(item =>
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
      <Head title="Stock Out" />
      
      <div className="p-8 bg-white min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-red-600 hover:bg-red-700 h-10 text-white font-medium text-sm">
                  <Plus size={18} />
                  Add Stock Out Request
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[640px] max-h-[90vh] flex flex-col">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
                  <DialogTitle className="text-xl font-semibold">Add Stock Out Request</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col">
                  <div className="space-y-5 flex-1">
                    
                    {/* Requester Info - Neutral Row */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div>
                        <span className="text-xs text-gray-600">Requested by</span>
                        <p className="text-sm font-semibold text-gray-900">{auth?.user?.name}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{auth?.user?.email}</p>
                      </div>
                    </div>

                    {/* Delivered To - Customer Selection */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                        Delivered To (Customer)
                      </label>
                      
                      {/* Custom Customer Dropdown */}
                      <div className="relative" data-customer-dropdown>
                        {/* Trigger Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setCustomerSearchOpen(!customerSearchOpen);
                            if (!customerSearchOpen) setCustomerSearchTerm('');
                          }}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition text-left flex items-center justify-between bg-white hover:bg-gray-50"
                        >
                          <span className={data.delivered_to_id ? 'text-gray-900' : 'text-gray-500'}>
                            {data.delivered_to_id 
                              ? customers?.find(c => c.id == data.delivered_to_id)?.customer_name || 'Select Customer'
                              : 'Select Customer'}
                          </span>
                          <ChevronDown size={16} className={`transition-transform ${customerSearchOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {customerSearchOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-72 flex flex-col">
                            
                            {/* Search Input */}
                            <div className="p-2 border-b border-gray-200 flex-shrink-0">
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Search customers..."
                                  value={customerSearchTerm}
                                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                                  autoFocus
                                  className="w-full px-3 py-2 pl-8 border border-gray-300 rounded text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"
                                />
                                <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                              </div>
                            </div>

                            {/* Options List */}
                            <div className="overflow-y-auto flex-1">
                              {(() => {
                                const filtered = customers?.filter(c =>
                                  c.customer_name.toLowerCase().includes(customerSearchTerm.toLowerCase())
                                ) || [];

                                if (filtered.length === 0) {
                                  return (
                                    <div className="px-3 py-3 text-xs text-gray-500 text-center">
                                      No customers found
                                    </div>
                                  );
                                }

                                return filtered.map((cust) => {
                                  const isSelected = data.delivered_to_id == cust.id;
                                  return (
                                    <button
                                      key={cust.id}
                                      type="button"
                                      onClick={() => {
                                        setData('delivered_to_id', cust.id);
                                        setCustomerSearchOpen(false);
                                        setCustomerSearchTerm('');
                                      }}
                                      className={`w-full px-3 py-2.5 text-xs text-left flex items-center justify-between border-b border-gray-100 last:border-b-0 transition ${
                                        isSelected
                                          ? 'bg-blue-50 text-blue-900'
                                          : 'bg-white text-gray-900 hover:bg-gray-50'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0 flex-1">
                                        {isSelected && <Check size={14} className="flex-shrink-0 text-blue-600" />}
                                        <span className="truncate font-medium">{cust.customer_name}</span>
                                      </div>
                                    </button>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {errors.delivered_to_id && <p className="text-red-600 text-xs mt-1">{errors.delivered_to_id}</p>}
                    </div>

                    {/* Address - Full Width */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                        Delivery Address
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition resize-none"
                        placeholder="Enter delivery address"
                        rows="2"
                      />
                      {errors.address && <p className="text-red-600 text-xs mt-1">{errors.address}</p>}
                    </div>

                    {/* TIN | Business Style - Two Columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                          TIN
                        </label>
                        <input
                          id="tin"
                          type="text"
                          name="tin"
                          value={data.tin}
                          onChange={(e) => setData('tin', e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                          placeholder="Enter TIN"
                        />
                        {errors.tin && <p className="text-red-600 text-xs mt-1">{errors.tin}</p>}
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                          Business Style
                        </label>
                        <input
                          id="business_style"
                          type="text"
                          name="business_style"
                          value={data.business_style}
                          onChange={(e) => setData('business_style', e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                          placeholder="Enter business style"
                        />
                        {errors.business_style && <p className="text-red-600 text-xs mt-1">{errors.business_style}</p>}
                      </div>
                    </div>

                    {/* Remarks - Full Width */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                        Remarks
                      </label>
                      <textarea
                        id="remarks_stockout"
                        name="remarks"
                        value={data.remarks}
                        onChange={(e) => setData('remarks', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition resize-none"
                        placeholder="Additional remarks or notes"
                        rows="2"
                      />
                      {errors.remarks && <p className="text-red-600 text-xs mt-1">{errors.remarks}</p>}
                    </div>

                    {/* Products Section - Separated with divider */}
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-xs text-gray-600 mb-4 font-medium">Products to Ship</h3>
                      
                      {/* Product Selection Fields */}
                      <div className="space-y-4 mb-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                            Product
                          </label>
                          
                          {/* Custom Product Dropdown */}
                          <div className="relative" data-product-dropdown>
                            {/* Trigger Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setProductSearchOpen(!productSearchOpen);
                                if (!productSearchOpen) setProductSearchTerm('');
                              }}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition text-left flex items-center justify-between bg-white hover:bg-gray-50"
                            >
                              <span className={currentItem.product_id ? 'text-gray-900' : 'text-gray-500'}>
                                {currentItem.product_id 
                                  ? products?.find(p => p.id == currentItem.product_id)?.product_name || 'Select Product'
                                  : 'Select Product'}
                              </span>
                              <ChevronDown size={16} className={`transition-transform ${productSearchOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {productSearchOpen && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-72 flex flex-col">
                                
                                {/* Search Input */}
                                <div className="p-2 border-b border-gray-200 flex-shrink-0">
                                  <div className="relative">
                                    <input
                                      type="text"
                                      placeholder="Search products..."
                                      value={productSearchTerm}
                                      onChange={(e) => setProductSearchTerm(e.target.value)}
                                      autoFocus
                                      className="w-full px-3 py-2 pl-8 border border-gray-300 rounded text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"
                                    />
                                    <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                                  </div>
                                </div>

                                {/* Options List */}
                                <div className="overflow-y-auto flex-1">
                                  {(() => {
                                    const filtered = products?.filter(p =>
                                      p.product_name.toLowerCase().includes(productSearchTerm.toLowerCase())
                                    ) || [];

                                    if (filtered.length === 0) {
                                      return (
                                        <div className="px-3 py-3 text-xs text-gray-500 text-center">
                                          No products found
                                        </div>
                                      );
                                    }

                                    return filtered.map((prod) => {
                                      const isSelected = currentItem.product_id == prod.id;
                                      const displayQty = prod.quantity % 1 === 0 ? Math.floor(prod.quantity) : parseFloat(prod.quantity).toFixed(2);
                                      return (
                                        <button
                                          key={prod.id}
                                          type="button"
                                          onClick={() => {
                                            setCurrentItem({
                                              ...currentItem,
                                              product_id: prod.id,
                                              unit_price: prod.price || '',
                                            });
                                            setProductSearchOpen(false);
                                            setProductSearchTerm('');
                                          }}
                                          className={`w-full px-3 py-2.5 text-xs text-left flex items-center justify-between border-b border-gray-100 last:border-b-0 transition ${
                                            isSelected
                                              ? 'bg-blue-50 text-blue-900'
                                              : 'bg-white text-gray-900 hover:bg-gray-50'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2 min-w-0 flex-1">
                                            {isSelected && <Check size={14} className="flex-shrink-0 text-blue-600" />}
                                            <span className="truncate font-medium">{prod.product_name}</span>
                                          </div>
                                          <span className="text-gray-500 flex-shrink-0 ml-2">Available: {displayQty}</span>
                                        </button>
                                      );
                                    });
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quantity | Unit Price - Two Columns */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                              Quantity
                            </label>
                            <input
                              id="stock_out_quantity"
                              type="number"
                              name="stock_out_quantity"
                              value={currentItem.stock_out_quantity}
                              onChange={(e) => setCurrentItem({
                                ...currentItem,
                                stock_out_quantity: e.target.value,
                              })}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                              placeholder="e.g., 5"
                              min="1"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                              Unit Price (₱)
                            </label>
                            <input
                              id="unit_price"
                              type="number"
                              name="unit_price"
                              value={currentItem.unit_price}
                              onChange={(e) => setCurrentItem({
                                ...currentItem,
                                unit_price: e.target.value,
                              })}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                              placeholder="e.g., 5000.00"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        {/* Add Product Button - Outline Style */}
                        <Button
                          type="button"
                          onClick={addItem}
                          variant="outline"
                          className="w-full gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 h-10"
                        >
                          <Plus size={16} />
                          Add Product
                        </Button>
                      </div>

                      {/* Items List */}
                      {items.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-3">
                            Products to Ship ({items.length})
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
                                {items.map((item, idx) => {
                                  const product = products?.find(p => p.id == item.product_id);
                                  return (
                                    <tr key={idx} className="border-b border-gray-100 last:border-b-0 bg-white hover:bg-gray-50 transition-colors">
                                      <td className="px-3 py-2 font-medium text-gray-900">{product?.product_name || '-'}</td>
                                      <td className="px-3 py-2 text-center font-semibold text-gray-800">{item.stock_out_quantity}</td>
                                      <td className="px-3 py-2 text-center font-semibold text-gray-800">₱{parseFloat(item.unit_price || 0).toFixed(2)}</td>
                                      <td className="px-3 py-2 text-center">
                                        <button
                                          type="button"
                                          onClick={() => removeItem(idx)}
                                          className="text-red-500 hover:text-red-700 transition p-1"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Item Detail Modal */}
                      {detailItem && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                          <div className="bg-white rounded-lg shadow-lg p-5 w-full max-w-sm mx-4">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-sm font-bold text-gray-900">{products?.find(p => p.id == detailItem.product_id)?.product_name || 'Product'}</h3>
                              <button onClick={() => setDetailItem(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                              <div><p className="text-gray-500">Qty</p><p className="font-semibold text-gray-900">{detailItem.stock_out_quantity}</p></div>
                              <div><p className="text-gray-500">Unit Price</p><p className="font-semibold text-gray-900">₱{parseFloat(detailItem.unit_price || 0).toFixed(2)}</p></div>
                            </div>
                            <button onClick={() => setDetailItem(null)} className="w-full py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition">Close</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer - Right Aligned Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-auto">
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
                      disabled={isSubmitting || items.length === 0}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isSubmitting ? 'Submitting...' : 'Add Stock Out Request'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            </div>{/* end flex container */}
          </div>

          {/* Tabs for all users */}
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

          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[70px]">Request ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[100px]">Delivery No.</th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[130px]">Customer</th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[150px]">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[120px]">Requested By</th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[130px]">Requested At</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[130px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(() => {
                  // Apply filtering based on user role
                  let requestsToDisplay = displayedRequests;
                  if (!isAdmin) {
                    // Staff users only see their own requests
                    requestsToDisplay = displayedRequests.filter(item => item.requested_by_id === auth?.user?.id);
                  }
                  
                  return requestsToDisplay && requestsToDisplay.length > 0 ? (
                    requestsToDisplay.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="hidden sm:table-cell px-4 py-4 text-sm font-medium text-gray-900">{item.id}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{item.delivery_no}</td>
                        <td className="hidden md:table-cell px-4 py-4 text-sm text-gray-700">
                          <div className="text-gray-900" title={item.customer?.customer_name}>{item.customer?.customer_name || '-'}</div>
                        </td>
                        <td className="hidden lg:table-cell px-4 py-4 text-sm text-gray-700">
                          <div className="break-words" title={item.address}>{item.address || '-'}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          <span className="text-gray-900 block truncate" title={item.requestedBy?.name || item.user?.name || 'Unknown'}>
                            {item.requestedBy?.name || item.user?.name || 'Unknown'}
                          </span>
                        </td>
                        <td className="hidden md:table-cell px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                          <div className="font-medium">{formatDateTimeSingleLine(item.created_at)}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedStockOutDetails(item)}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 px-2.5 py-2 hover:bg-blue-50 rounded transition"
                              title="View Details"
                            >
                              <span>Details</span>
                            </button>
                            {isAdmin && item.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(item.id)}
                                  className="inline-flex items-center justify-center text-green-600 hover:text-green-800 transition-colors p-2 rounded hover:bg-green-50"
                                  title="Approve stock out"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectingId(item.id);
                                    setRejectDialogOpen(true);
                                  }}
                                  className="inline-flex items-center justify-center text-red-600 hover:text-red-800 transition-colors p-2 rounded hover:bg-red-50"
                                  title="Reject stock out"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            )}
                            {/* Receipt buttons ONLY for approved requests */}
                            {item.status === 'approved' && (
                              <>
                                <button
                                  onClick={() => window.open(`/delivery-receipt/${item.id}/view`, '_blank')}
                                  className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-800 px-2.5 py-2 hover:bg-green-50 rounded transition"
                                  title="View delivery receipt"
                                >
                                  <FileText size={16} />
                                  <span className="hidden sm:inline">Receipt</span>
                                </button>
                                <button
                                  onClick={() => window.open(`/delivery-receipt/${item.id}/download`, '_blank')}
                                  className="inline-flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors p-2 rounded hover:bg-gray-50"
                                  title="Download delivery receipt PDF"
                                >
                                  <Download size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            {isAdmin 
                              ? `No ${activeTab} records found` 
                              : `You haven't created any ${activeTab} stock out requests yet`
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Reject Stock Out Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this stock out request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Rejection Reason
              </label>
              <textarea
                id="rejection_reason"
                name="rejection_reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition resize-none"
                placeholder="Enter reason for rejection"
                rows="3"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectingId(null);
                  setRejectReason('');
                }}
                variant="outline"
                className="border border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleReject}
                className="bg-red-600 hover:bg-red-700"
              >
                Reject Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Out Details Modal - Redesigned Enterprise UI */}
      {selectedStockOutDetails && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-[720px] max-h-[90vh] flex flex-col">
            {/* FIXED HEADER */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-gray-900">Stock Out Request</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Request #{selectedStockOutDetails.id.toString().padStart(5, '0')}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-6">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedStockOutDetails.status === 'approved' ? 'bg-green-500' :
                    selectedStockOutDetails.status === 'pending' ? 'bg-yellow-500' :
                    selectedStockOutDetails.status === 'rejected' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`} />
                  <span className={`text-xs font-semibold capitalize px-2 py-1 rounded ${
                    selectedStockOutDetails.status === 'approved' ? 'bg-green-100 text-green-700' :
                    selectedStockOutDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    selectedStockOutDetails.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedStockOutDetails.status}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStockOutDetails(null)}
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
                  <span className="text-xs text-gray-600">Customer</span>
                  <p className="text-sm font-medium text-gray-900 break-words">
                    {selectedStockOutDetails.customer?.customer_name || 'Not specified'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-600">Created At</span>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDatePhilippines(selectedStockOutDetails.created_at)}
                  </p>
                </div>
                {selectedStockOutDetails.remarks && (
                  <div className="sm:col-span-2">
                    <span className="text-xs text-gray-600">Remarks</span>
                    <p className="text-sm text-gray-900 break-words">
                      {selectedStockOutDetails.remarks}
                    </p>
                  </div>
                )}
              </div>

              {/* DELIVERY INFORMATION */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Delivery Information</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-gray-600">Delivery Address</span>
                    <p className="text-sm text-gray-900 break-words leading-relaxed mt-1">
                      {selectedStockOutDetails.address || 'No address specified'}
                    </p>
                  </div>
                  
                  {(selectedStockOutDetails.tin || selectedStockOutDetails.business_style) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {selectedStockOutDetails.tin && (
                        <div>
                          <span className="text-xs text-gray-600">TIN</span>
                          <p className="text-sm font-medium text-gray-900 break-words">
                            {selectedStockOutDetails.tin}
                          </p>
                        </div>
                      )}
                      {selectedStockOutDetails.business_style && (
                        <div>
                          <span className="text-xs text-gray-600">Business Style</span>
                          <p className="text-sm font-medium text-gray-900 break-words">
                            {selectedStockOutDetails.business_style}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* APPROVAL INFORMATION */}
              {(selectedStockOutDetails.status !== 'pending' && (selectedStockOutDetails.approved_by || selectedStockOutDetails.rejection_reason)) && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {selectedStockOutDetails.approved_by && (
                      <div>
                        <span className="text-xs text-gray-600">
                          {selectedStockOutDetails.status === 'approved' ? 'Approved By' : 'Processed By'}
                        </span>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedStockOutDetails.approved_by.name}
                        </p>
                      </div>
                    )}
                    {selectedStockOutDetails.approved_at && (
                      <div>
                        <span className="text-xs text-gray-600">
                          {selectedStockOutDetails.status === 'approved' ? 'Approved At' : 'Processed At'}
                        </span>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDatePhilippines(selectedStockOutDetails.approved_at)}
                        </p>
                      </div>
                    )}
                    {selectedStockOutDetails.status === 'rejected' && selectedStockOutDetails.rejection_reason && (
                      <div className="sm:col-span-2">
                        <span className="text-xs text-red-600">Rejection Reason</span>
                        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg p-3 mt-1">
                          {selectedStockOutDetails.rejection_reason}
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
                    {selectedStockOutDetails.items?.length || 0} {(selectedStockOutDetails.items?.length || 0) === 1 ? 'item' : 'items'}
                  </span>
                </div>
                
                {selectedStockOutDetails.items && selectedStockOutDetails.items.length > 0 ? (
                  <div className="space-y-0 overflow-x-auto">
                    {/* Desktop table view */}
                    <div className="hidden md:block border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Product</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Unit</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">Quantity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {selectedStockOutDetails.items.map((stockItem, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 break-words">
                                    {stockItem.product?.product_name || 'Unknown Product'}
                                  </div>
                                  {stockItem.product?.sku && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      SKU: {stockItem.product.sku}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {stockItem.product?.unit || 'pcs'}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-sm font-medium text-gray-900">
                                  {stockItem.stock_out_quantity}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile card view */}
                    <div className="md:hidden space-y-3">
                      {selectedStockOutDetails.items.map((stockItem, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-white">
                          <div className="flex items-start justify-between mb-2">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-medium text-gray-900 break-words">
                                {stockItem.product?.product_name || 'Unknown Product'}
                              </h4>
                              {stockItem.product?.sku && (
                                <p className="text-xs text-gray-500 mt-1">
                                  SKU: {stockItem.product.sku}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs mt-3 pt-3 border-t border-gray-100">
                            <div>
                              <span className="text-gray-600">Unit</span>
                              <p className="font-medium text-gray-900">{stockItem.product?.unit || 'pcs'}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-gray-600">Quantity</span>
                              <p className="font-semibold text-gray-900">{stockItem.stock_out_quantity}</p>
                            </div>
                          </div>
                        </div>
                      ))}
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
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0">
              {selectedStockOutDetails.status === 'approved' && (
                <button
                  type="button"
                  onClick={() => window.open(`/delivery-receipt/${selectedStockOutDetails.id}/view`, '_blank')}
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800 transition"
                >
                  <FileText size={16} />
                  View Delivery Receipt
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedStockOutDetails(null)}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition"
              >
                Close
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

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, FileText, Download, Check, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
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

export default function StockOut({ stockOuts, customers, products, auth }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  // Smart default tab - if staff user has no pending requests, show approved
  const isAdmin = auth?.user?.role?.role_name === 'Admin';
  const pendingCount = stockOuts?.filter(s => s.status === 'pending').length || 0;
  const approvedCount = stockOuts?.filter(s => s.status === 'approved').length || 0;
  
  const defaultTab = !isAdmin && pendingCount === 0 && approvedCount > 0 ? 'approved' : 'pending';
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedStockOutDetails, setSelectedStockOutDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState([]);

  // Handle search from header
  const handleSearch = (term) => {
    setSearchTerm(term);
  };
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

  // Confirmation modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Auto-refresh every 30 seconds to sync data
  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({ only: ['stockOuts'], preserveScroll: true, preserveState: true });
    }, 30000); // 30 seconds for better performance

    return () => clearInterval(interval);
  }, []);

  // Lock/unlock body scroll when modals open/close
  useEffect(() => {
    const hasModalOpen = detailItem || selectedStockOutDetails || rejectDialogOpen || confirmModal.isOpen;
    
    if (hasModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [detailItem, selectedStockOutDetails, rejectDialogOpen, confirmModal.isOpen]);

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
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Stock Out</h1>
              <p className="text-gray-600 text-sm mt-1">
                {isAdmin ? 'Manage outgoing stock deliveries' : 'View stock delivery history'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-red-600 hover:bg-red-700 h-9 text-sm">
                  <Plus size={18} />
                  Add Stock Out
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Stock Out Request</DialogTitle>
                  <DialogDescription>
                    Create a new outgoing stock delivery.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-gray-900">Requested By (You):</p>
                    <p className="text-sm text-gray-700 mt-1">{auth?.user?.name}</p>
                    <p className="text-xs text-gray-600 mt-1">Email: {auth?.user?.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Delivered To (Customer)
                    </label>
                    <select
                      id="delivered_to_id"
                      name="delivered_to_id"
                      value={data.delivered_to_id}
                      onChange={(e) => setData('delivered_to_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                    >
                      <option value="">Select Customer</option>
                      {customers && customers.map((cust) => (
                        <option key={cust.id} value={cust.id}>{cust.customer_name}</option>
                      ))}
                    </select>
                    {errors.delivered_to_id && <p className="text-red-600 text-sm mt-1">{errors.delivered_to_id}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={data.address}
                      onChange={(e) => setData('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition resize-none"
                      placeholder="Enter delivery address"
                      rows="2"
                    />
                    {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        TIN
                      </label>
                      <input
                        id="tin"
                        type="text"
                        name="tin"
                        value={data.tin}
                        onChange={(e) => setData('tin', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                        placeholder="Enter TIN"
                      />
                      {errors.tin && <p className="text-red-600 text-sm mt-1">{errors.tin}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Business Style
                      </label>
                      <input
                        id="business_style"
                        type="text"
                        name="business_style"
                        value={data.business_style}
                        onChange={(e) => setData('business_style', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                        placeholder="Enter business style"
                      />
                      {errors.business_style && <p className="text-red-600 text-sm mt-1">{errors.business_style}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Remarks
                    </label>
                    <textarea
                      id="remarks_stockout"
                      name="remarks"
                      value={data.remarks}
                      onChange={(e) => setData('remarks', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition resize-none"
                      placeholder="Additional remarks or notes"
                      rows="2"
                    />
                    {errors.remarks && <p className="text-red-600 text-sm mt-1">{errors.remarks}</p>}
                  </div>

                  {/* Products Section */}
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Products to Ship</h3>
                    
                    <div className="space-y-3 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Product
                        </label>
                        <select
                          id="product_id"
                          name="product_id"
                          value={currentItem.product_id}
                          onChange={(e) => {
                            const product = products?.find(p => p.id == e.target.value);
                            setCurrentItem({
                              ...currentItem,
                              product_id: e.target.value,
                              unit_price: product?.price || '',
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                        >
                          <option value="">Select Product</option>
                          {products && products.map((prod) => (
                            <option key={prod.id} value={prod.id}>
                              {prod.product_name} (Qty: {prod.quantity})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                            placeholder="e.g., 5"
                            min="1"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                            placeholder="e.g., 5000.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={addItem}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Add Product
                      </Button>
                    </div>

                    {/* Items List */}
                    {items.length > 0 && (
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Products to Ship ({items.length})
                        </label>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <table className="w-full text-xs border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-3 py-1.5 text-left font-semibold text-gray-500">Product Name</th>
                                <th className="px-3 py-1.5 text-center font-semibold text-gray-500 w-14">Qty</th>
                                <th className="px-3 py-1.5 text-center font-semibold text-gray-500 w-24">Price</th>
                                <th className="px-3 py-1.5 text-center font-semibold text-gray-500 w-16">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((item, idx) => {
                                const product = products?.find(p => p.id == item.product_id);
                                return (
                                  <tr key={idx} className="border-b border-gray-100 last:border-b-0 bg-white hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-2 font-medium text-gray-900 text-sm">{product?.product_name || '-'}</td>
                                    <td className="px-3 py-2 text-center font-semibold text-gray-800">{item.stock_out_quantity}</td>
                                    <td className="px-3 py-2 text-center font-semibold text-gray-800">₱{parseFloat(item.unit_price || 0).toFixed(2)}</td>
                                    <td className="px-3 py-2 text-center">
                                      <button
                                        type="button"
                                        onClick={() => removeItem(idx)}
                                        className="text-red-500 hover:text-red-700 transition"
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
                      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30">
                        <div className="bg-white rounded-xl shadow-2xl p-5 w-full max-w-sm mx-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900">{products?.find(p => p.id == detailItem.product_id)?.product_name || 'Product'}</h3>
                            <button onClick={() => setDetailItem(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div><p className="text-gray-500">Qty</p><p className="font-semibold text-gray-900">{detailItem.stock_out_quantity}</p></div>
                            <div><p className="text-gray-500">Unit Price</p><p className="font-semibold text-gray-900">₱{parseFloat(detailItem.unit_price || 0).toFixed(2)}</p></div>
                          </div>
                          <button onClick={() => setDetailItem(null)} className="mt-4 w-full py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition">Close</button>
                        </div>
                      </div>
                    )}
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
                      {processing ? 'Adding...' : 'Add Stock Out'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            </div>{/* end flex container */}
          </div>

          {/* Tabs for admin */}
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

          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-2 py-3 text-left text-xs font-semibold text-gray-900">ID</th>
                  <th className="w-20 px-2 py-3 text-left text-xs font-semibold text-gray-900">Delivery No</th>
                  <th className="w-32 px-2 py-3 text-left text-xs font-semibold text-gray-900">Customer</th>
                  <th className="w-40 px-2 py-3 text-left text-xs font-semibold text-gray-900">Address</th>
                  <th className="w-24 px-2 py-3 text-left text-xs font-semibold text-gray-900">Requested By</th>
                  <th className="w-20 px-2 py-3 text-left text-xs font-semibold text-gray-900">Status</th>
                  <th className="w-32 px-2 py-3 text-left text-xs font-semibold text-gray-900">Created At</th>
                  <th className="w-32 px-2 py-3 text-center text-xs font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayedRequests && displayedRequests.length > 0 ? (
                  displayedRequests.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-2 py-2 text-xs font-medium text-gray-900">{item.id}</td>
                        <td className="px-2 py-2 text-xs text-gray-700">{item.delivery_no}</td>
                        <td className="px-2 py-2 text-xs text-gray-700">
                          <div className="truncate" title={item.customer?.customer_name}>{item.customer?.customer_name || '-'}</div>
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-700">
                          <div className="truncate" title={item.address}>{item.address || '-'}</div>
                        </td>
                        <td className="px-2 py-2 text-xs">
                          <span className="text-blue-600 font-medium truncate block" title={item.requestedBy?.name || item.user?.name || 'Unknown'}>
                            {item.requestedBy?.name || item.user?.name || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-xs">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-700 whitespace-nowrap">
                          {formatDateTimeSingleLine(item.created_at)}
                        </td>
                        <td className="px-2 py-2 text-xs text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setSelectedStockOutDetails(item)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 px-1 py-1 bg-blue-50 rounded hover:bg-blue-100 transition"
                              title="View Details"
                            >
                              <span className="hidden sm:inline">Details</span>
                            </button>
                            {isAdmin && item.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(item.id)}
                                  className="inline-flex items-center justify-center text-green-600 hover:text-green-800 transition-colors p-1 rounded hover:bg-green-50"
                                  title="Approve stock out"
                                >
                                  <Check size={12} />
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectingId(item.id);
                                    setRejectDialogOpen(true);
                                  }}
                                  className="inline-flex items-center justify-center text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                                  title="Reject stock out"
                                >
                                  <X size={12} />
                                </button>
                              </>
                            )}
                            {/* Receipt buttons ONLY for approved requests */}
                            {item.status === 'approved' && (
                              <>
                                <button
                                  onClick={() => window.open(`/delivery-receipt/${item.id}/view`, '_blank')}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-800 px-1 py-1 bg-green-50 rounded hover:bg-green-100 transition"
                                  title="View delivery receipt"
                                >
                                  <FileText size={12} />
                                  <span className="hidden sm:inline">Receipt</span>
                                </button>
                                <button
                                  onClick={() => window.open(`/delivery-receipt/${item.id}/download`, '_blank')}
                                  className="inline-flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-50"
                                  title="Download delivery receipt"
                                >
                                  <Download size={12} />
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
                    <td colSpan="8" className="px-6 py-8 text-center text-sm text-gray-600">
                      {isAdmin 
                        ? `No ${activeTab} records found` 
                        : `You haven't created any ${activeTab} stock out requests yet. Click "Add Stock Out" to create your first request.`
                      }
                    </td>
                  </tr>
                )}
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
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* FIXED HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 truncate">
                      Stock Out Request
                    </h2>
                    <p className="text-sm text-gray-600 mt-0.5">
                      #{selectedStockOutDetails.delivery_no || selectedStockOutDetails.id.toString().padStart(5, '0')} · Created {formatDateShort(selectedStockOutDetails.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        selectedStockOutDetails.status === 'approved' ? 'bg-green-500' :
                        selectedStockOutDetails.status === 'pending' ? 'bg-yellow-500' :
                        selectedStockOutDetails.status === 'rejected' ? 'bg-red-500' :
                        'bg-gray-400'
                      }`} />
                      <span className={`text-sm font-medium capitalize ${
                        selectedStockOutDetails.status === 'approved' ? 'text-green-700' :
                        selectedStockOutDetails.status === 'pending' ? 'text-yellow-700' :
                        selectedStockOutDetails.status === 'rejected' ? 'text-red-700' :
                        'text-gray-700'
                      }`}>
                        {selectedStockOutDetails.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStockOutDetails(null)}
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
                    <dt className="text-sm text-gray-600 mb-1">Customer</dt>
                    <dd className="text-base font-medium text-gray-900">
                      {selectedStockOutDetails.customer?.customer_name || 'Not specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600 mb-1">Status</dt>
                    <dd>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          selectedStockOutDetails.status === 'approved' ? 'bg-green-500' :
                          selectedStockOutDetails.status === 'pending' ? 'bg-yellow-500' :
                          selectedStockOutDetails.status === 'rejected' ? 'bg-red-500' :
                          'bg-gray-400'
                        }`} />
                        <span className={`text-base font-medium capitalize ${
                          selectedStockOutDetails.status === 'approved' ? 'text-green-700' :
                          selectedStockOutDetails.status === 'pending' ? 'text-yellow-700' :
                          selectedStockOutDetails.status === 'rejected' ? 'text-red-700' :
                          'text-gray-700'
                        }`}>
                          {selectedStockOutDetails.status}
                        </span>
                      </div>
                    </dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-sm text-gray-600 mb-1">Created At</dt>
                    <dd className="text-base font-medium text-gray-900">
                      {formatDatePhilippines(selectedStockOutDetails.created_at)}
                    </dd>
                  </div>
                  {selectedStockOutDetails.remarks && (
                    <div className="md:col-span-2">
                      <dt className="text-sm text-gray-600 mb-1">Remarks</dt>
                      <dd className="text-base text-gray-900">
                        {selectedStockOutDetails.remarks}
                      </dd>
                    </div>
                  )}
                </div>
              </div>

              {/* DELIVERY INFORMATION */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
                  Delivery Information
                </h3>
                <div className="space-y-6">
                  <div>
                    <dt className="text-sm text-gray-600 mb-1">Delivery Address</dt>
                    <dd className="text-base text-gray-900 leading-relaxed">
                      {selectedStockOutDetails.address || 'No address specified'}
                    </dd>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {selectedStockOutDetails.tin && (
                      <div>
                        <dt className="text-sm text-gray-600 mb-1">TIN</dt>
                        <dd className="text-base font-medium text-gray-900">
                          {selectedStockOutDetails.tin}
                        </dd>
                      </div>
                    )}
                    {selectedStockOutDetails.business_style && (
                      <div>
                        <dt className="text-sm text-gray-600 mb-1">Business Style</dt>
                        <dd className="text-base font-medium text-gray-900">
                          {selectedStockOutDetails.business_style}
                        </dd>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* PRODUCTS */}
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Products
                  </h3>
                  <span className="text-sm font-medium text-gray-700">
                    {selectedStockOutDetails.items?.length || 0} {(selectedStockOutDetails.items?.length || 0) === 1 ? 'item' : 'items'}
                  </span>
                </div>
                
                {selectedStockOutDetails.items && selectedStockOutDetails.items.length > 0 ? (
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
                              Unit
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Quantity
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {selectedStockOutDetails.items.map((stockItem, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {stockItem.product?.product_name || 'Unknown Product'}
                                  </div>
                                  {stockItem.product?.sku && (
                                    <div className="text-xs text-gray-500">
                                      SKU: {stockItem.product.sku}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {stockItem.product?.unit || 'pcs'}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="text-lg font-semibold text-gray-900">
                                  {stockItem.stock_out_quantity}
                                </span>
                                <span className="text-sm text-gray-600 ml-1">
                                  {stockItem.product?.unit || 'pcs'}
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
                        <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white">
                          <div className="flex items-start justify-between mb-3">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {stockItem.product?.product_name || 'Unknown Product'}
                              </h4>
                              {stockItem.product?.sku && (
                                <p className="text-xs text-gray-500 mt-1">
                                  SKU: {stockItem.product.sku}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <dt className="text-gray-600">Unit</dt>
                              <dd className="font-medium text-gray-900">
                                {stockItem.product?.unit || 'pcs'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-gray-600">Quantity</dt>
                              <dd className="font-semibold text-gray-900 text-right">
                                {stockItem.stock_out_quantity} {stockItem.product?.unit || 'pcs'}
                              </dd>
                            </div>
                          </div>
                        </div>
                      ))}
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
              {selectedStockOutDetails.status === 'approved' && (
                <button
                  type="button"
                  onClick={() => window.open(`/delivery-receipt/${selectedStockOutDetails.id}/view`, '_blank')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors"
                >
                  <FileText size={16} />
                  View Delivery Receipt
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedStockOutDetails(null)}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
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

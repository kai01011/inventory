import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import { FileText, Plus, Minus, Eye, X } from 'lucide-react';
import { formatDateShort, formatDateTimeSingleLine, formatDatePhilippines } from '@/utils/dateUtils';

export default function History({ histories }) {
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Handle search from header
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Lock/unlock body scroll when modal opens/closes
  useEffect(() => {
    if (showDetailsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showDetailsModal]);

  const safeHistories = Array.isArray(histories) ? histories : [];

  // Auto-refresh every 60 seconds, but pause when tab is hidden (page visibility API)
  useEffect(() => {
    let interval;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause refresh when tab hidden
        if (interval) clearInterval(interval);
      } else {
        // Resume refresh when tab becomes visible
        interval = setInterval(() => {
          router.reload({ only: ['histories'], preserveScroll: true, preserveState: true });
        }, 60000); // 60 seconds (reduced from 10s)
      }
    };

    // Start initial interval only if tab is visible
    if (!document.hidden) {
      interval = setInterval(() => {
        router.reload({ only: ['histories'], preserveScroll: true, preserveState: true });
      }, 60000);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const filteredHistories = useMemo(() => {
    return safeHistories.filter(h => {
      // Type filter
      const typeFilter =
        filterType === 'all' ||
        (filterType === 'stock-in' && h.stock_in_id !== null) ||
        (filterType === 'stock-out' && h.stock_out_id !== null);

      if (!typeFilter) return false;

      if (searchTerm) {
        const search = searchTerm.toLowerCase().trim();
        
        // Get names safely
        const actionByName = h.user?.name?.toLowerCase() || '';
        const requestedByName = (
          h.stock_in_id ? (h.stock_in?.requested_by?.name?.toLowerCase() || '') :
          h.stock_out_id ? (h.stock_out?.requested_by?.name?.toLowerCase() || '') : ''
        );
        
        const status = h.status?.toLowerCase() || '';
        const description = h.description?.toLowerCase() || '';
        const typeLabel = h.stock_in_id ? 'stock in' : h.stock_out_id ? 'stock out' : '';
        
        // Date formatting for search
        const createdDate = new Date(h.created_at);
        
        // Basic text searches
        if (actionByName.includes(search) ||
            requestedByName.includes(search) ||
            status.includes(search) ||
            typeLabel.includes(search) ||
            description.includes(search) ||
            (h.stock_in_id && h.stock_in_id.toString().includes(search)) ||
            (h.stock_out_id && h.stock_out_id.toString().includes(search)) ||
            (h.stock_out?.delivery_no && h.stock_out.delivery_no.toLowerCase().includes(search))) {
          return true;
        }
        
        // Date searches
        try {
          const dateFormats = [
            formatDateTimeSingleLine(h.created_at)?.toLowerCase() || '',
            formatDateShort(h.created_at)?.toLowerCase() || '',
            createdDate.toDateString().toLowerCase(),
            createdDate.getFullYear().toString(),
            createdDate.toLocaleString('default', { month: 'long' }).toLowerCase(),
            createdDate.toLocaleString('default', { month: 'short' }).toLowerCase(),
          ];

          // Check if search matches any date format
          if (dateFormats.some(dateStr => dateStr && dateStr.includes(search))) {
            return true;
          }

          // Relative date checks
          const today = new Date();
          const isToday = createdDate.toDateString() === today.toDateString();
          
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const isYesterday = createdDate.toDateString() === yesterday.toDateString();
          
          const thisWeekStart = new Date();
          thisWeekStart.setDate(today.getDate() - today.getDay());
          thisWeekStart.setHours(0, 0, 0, 0);
          const isThisWeek = createdDate >= thisWeekStart && createdDate <= today;
          
          const isThisMonth = createdDate.getMonth() === today.getMonth() && 
                             createdDate.getFullYear() === today.getFullYear();

          // Relative date searches
          if ((search === 'today' && isToday) ||
              (search === 'yesterday' && isYesterday) ||
              (search === 'this week' && isThisWeek) ||
              (search === 'this month' && isThisMonth)) {
            return true;
          }
        } catch (error) {
          console.warn('Date search error:', error);
        }

        return false;
      }

      return true;
    });
  }, [safeHistories, searchTerm, filterType]);



  const getTypeIcon = (h) => {
    if (h.stock_in_id) {
      return <Plus size={16} className="text-gray-600" />;
    } else if (h.stock_out_id) {
      return <Minus size={16} className="text-gray-600" />;
    }
    return null;
  };

  const getTypeLabel = (h) => {
    if (h.stock_in_id) return 'In';
    if (h.stock_out_id) return 'Out';
    return 'Unknown';
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':  return 'bg-green-100 text-green-800';
      case 'rejected':  return 'bg-red-100 text-red-800';
      default:          return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = async (history) => {
    if ((history.status === 'approved' || history.status === 'rejected') && (history.stock_in_id || history.stock_out_id)) {
      setLoadingDetails(true);
      setShowDetailsModal(true);
      
      try {
        const url = history.stock_in_id 
          ? `/history/stock-in/${history.stock_in_id}/details`
          : `/history/stock-out/${history.stock_out_id}/details`;
          
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch details');
        }
        
        const data = await response.json();
        setSelectedDetails({
          ...data,
          type: history.stock_in_id ? 'stock-in' : 'stock-out',
          status: history.status,
        });
      } catch (error) {
        console.error('Error fetching details:', error);
        setSelectedDetails(null);
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedDetails(null);
  };

  return (
    <AuthenticatedLayout onSearch={handleSearch}>
      <Head title="History" />

      <div className="p-8 bg-white min-h-screen">
        <div className="max-w-6xl mx-auto">

          {/* Filter Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-8">
              {[
                { key: 'all',       label: 'All Transactions', count: safeHistories.length },
                { key: 'stock-in',  label: 'Stock In', count: safeHistories.filter(h => h.stock_in_id).length },
                { key: 'stock-out', label: 'Stock Out', count: safeHistories.filter(h => h.stock_out_id).length },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilterType(tab.key)}
                  className={`pb-3 text-sm transition-colors border-b-2 ${
                    filterType === tab.key
                      ? 'border-red-600 text-gray-900 font-medium'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 text-xs font-normal ${filterType === tab.key ? 'text-gray-600' : 'text-gray-500'}`}>
                    ({tab.count})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[120px]">Delivery No.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[90px]">Type</th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[100px]">Status</th>
                    <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[120px]">Requested By</th>
                    <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[120px]">Processed By</th>
                    <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[130px]">Date</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[110px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredHistories.length > 0 ? (
                    filteredHistories.map((history, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="hidden lg:table-cell px-4 py-4 text-sm text-gray-700 font-medium whitespace-nowrap">
                          {history.stock_out_id && history.stock_out?.delivery_no ? (
                            <span className="text-gray-900">{history.stock_out.delivery_no}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                            {getTypeIcon(history)}
                            {getTypeLabel(history)}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium capitalize ${
                            history.status === 'approved' ? 'bg-green-50 text-green-700' :
                            history.status === 'rejected' ? 'bg-red-50 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {history.status === 'approved' ? 'Approved' : history.status === 'rejected' ? 'Rejected' : history.status}
                          </span>
                        </td>
                        <td className="hidden md:table-cell px-4 py-4">
                          <span className="text-sm text-gray-700 block truncate" title={history.stock_in_id ? (history.stock_in?.requested_by?.name || 'Unknown') : history.stock_out_id ? (history.stock_out?.requested_by?.name || 'Unknown') : '-'}>
                            {history.stock_in_id 
                              ? (history.stock_in?.requested_by?.name || 'Unknown')
                              : history.stock_out_id 
                                ? (history.stock_out?.requested_by?.name || 'Unknown')
                                : '-'
                            }
                          </span>
                        </td>
                        <td className="hidden lg:table-cell px-4 py-4">
                          <span className="text-sm text-gray-700 whitespace-nowrap block truncate" title={history.user?.name || `User ${history.user_id}` || '-'}>
                            {history.user?.name || `User ${history.user_id}` || '-'}
                          </span>
                        </td>
                        <td className="hidden md:table-cell px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                          <div className="font-medium">{formatDateTimeSingleLine(history.created_at)}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* View Details Button for Approved/Rejected */}
                            {(history.status === 'approved' || history.status === 'rejected') && (history.stock_in_id || history.stock_out_id) && (
                              <button
                                onClick={() => handleViewDetails(history)}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 px-2.5 py-2 hover:bg-blue-50 rounded transition"
                                title="View Details"
                              >
                                <Eye size={16} />
                                <span className="hidden sm:inline">Details</span>
                              </button>
                            )}
                            
                            {/* Delivery Receipt Button for Approved Stock Out ONLY */}
                            {history.stock_out_id && history.status === 'approved' && (
                              <a
                                href={`/delivery-receipt/${history.stock_out_id}/view`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-800 px-2.5 py-2 hover:bg-green-50 rounded transition"
                                title="View Receipt"
                              >
                                <FileText size={16} />
                                <span className="hidden sm:inline">Receipt</span>
                              </a>
                            )}

                            {/* Show dash if no actions available */}
                            {!(
                              ((history.status === 'approved' || history.status === 'rejected') && (history.stock_in_id || history.stock_out_id)) ||
                              (history.stock_out_id && history.status === 'approved')
                            ) && (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">No history records found</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {searchTerm ? 'Try adjusting your search' : 'History will appear here when transactions are made'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedDetails?.type === 'stock-in' ? 'Stock In History Details' : 'Stock Out Request Details'}
                </h3>
                {selectedDetails && (
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-sm text-gray-600">
                      Request #{selectedDetails.type === 'stock-in' ? selectedDetails.stockIn?.id : selectedDetails.stockOut?.id}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 ml-6">
                {selectedDetails?.type === 'stock-in' && (
                  <div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold capitalize ${getStatusBadgeColor(selectedDetails.status)}`}>
                      {selectedDetails.status === 'approved' ? 'Approved' : selectedDetails.status === 'rejected' ? 'Rejected' : selectedDetails.status}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={closeDetailsModal}
                className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading details...</span>
                </div>
              ) : selectedDetails ? (
                <div className="space-y-5">
                  {/* Request Information - Simplified */}
                  {selectedDetails?.type === 'stock-in' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <span className="text-xs text-gray-600">Requested By</span>
                        <p className="text-sm font-medium text-gray-900 break-words">
                          {selectedDetails.stockIn?.requested_by?.name || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600">Request Date</span>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedDetails.stockIn?.created_at ? formatDatePhilippines(selectedDetails.stockIn.created_at) : 'Not available'}
                        </p>
                      </div>
                      {(selectedDetails.status === 'approved' || selectedDetails.status === 'rejected') && (
                        <>
                          <div>
                            <span className="text-xs text-gray-600">
                              {selectedDetails.status === 'approved' ? 'Approved By' : 'Rejected By'}
                            </span>
                            <p className="text-sm font-medium text-gray-900 break-words">
                              {selectedDetails.stockIn?.approved_by?.name || 'Not specified'}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">
                              {selectedDetails.status === 'approved' ? 'Approved Date' : 'Rejected Date'}
                            </span>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedDetails.stockIn?.approved_at ? formatDatePhilippines(selectedDetails.stockIn.approved_at) : 'Not yet processed'}
                            </p>
                          </div>
                        </>
                      )}
                      {selectedDetails.status === 'rejected' && selectedDetails.stockIn?.rejection_reason && (
                        <div className="sm:col-span-2">
                          <span className="text-xs text-red-600">Rejection Reason</span>
                          <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg p-3 mt-1">
                            {selectedDetails.stockIn.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Delivery Information for Stock Out */}
                  {selectedDetails.type === 'stock-out' && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-4">Delivery Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Customer:</span>
                          <div className="font-medium">{selectedDetails.stockOut.customer?.customer_name || 'Not specified'}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">TIN:</span>
                          <div className="font-medium">{selectedDetails.stockOut.tin || 'Not provided'}</div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Address:</span>
                          <div className="font-medium">{selectedDetails.stockOut.address || 'Not specified'}</div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Business Style:</span>
                          <div className="font-medium">{selectedDetails.stockOut.business_style || 'Not provided'}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rejection Information for Stock Out */}
                  {selectedDetails.type === 'stock-out' && selectedDetails.status === 'rejected' && selectedDetails.stockOut?.rejection_reason && (
                    <div className="pt-4 border-t border-gray-200">
                      <span className="text-xs text-red-600">Rejection Reason</span>
                      <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg p-3 mt-1">
                        {selectedDetails.stockOut.rejection_reason}
                      </p>
                    </div>
                  )}

                  {/* Items */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Items</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            {selectedDetails.type === 'stock-in' ? (
                              <>
                                <th className="px-4 py-2 text-left font-medium text-gray-700">Product Name</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-700">Category</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-700">Supplier</th>
                                <th className="px-4 py-2 text-right font-medium text-gray-700">Quantity</th>
                                <th className="px-4 py-2 text-right font-medium text-gray-700">Unit Price</th>
                                <th className="px-4 py-2 text-right font-medium text-gray-700">Total</th>
                              </>
                            ) : (
                              <>
                                <th className="px-4 py-2 text-left font-medium text-gray-700">Product Name</th>
                                <th className="px-4 py-2 text-right font-medium text-gray-700">Quantity</th>
                                <th className="px-4 py-2 text-right font-medium text-gray-700">Unit Price</th>
                                <th className="px-4 py-2 text-right font-medium text-gray-700">Total</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedDetails.type === 'stock-in' ? (
                            selectedDetails.stockIn?.items?.map((item, idx) => (
                              <tr key={idx}>
                                <td className="px-4 py-2">{item.product_name}</td>
                                <td className="px-4 py-2">{item.category?.category_name || item.category_id}</td>
                                <td className="px-4 py-2">{item.supplier?.supplier_name || item.supplier_id}</td>
                                <td className="px-4 py-2 text-right">{item.stock_in_quantity}</td>
                                <td className="px-4 py-2 text-right">₱{parseFloat(item.unit_price).toFixed(2)}</td>
                                <td className="px-4 py-2 text-right">₱{(item.stock_in_quantity * parseFloat(item.unit_price)).toFixed(2)}</td>
                              </tr>
                            ))
                          ) : (
                            selectedDetails.stockOut?.items?.map((item, idx) => (
                              <tr key={idx}>
                                <td className="px-4 py-2">{item.product?.product_name}</td>
                                <td className="px-4 py-2 text-right">{item.stock_out_quantity}</td>
                                <td className="px-4 py-2 text-right">₱{parseFloat(item.product?.price || 0).toFixed(2)}</td>
                                <td className="px-4 py-2 text-right">₱{(item.stock_out_quantity * parseFloat(item.product?.price || 0)).toFixed(2)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Failed to load details. Please try again.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}


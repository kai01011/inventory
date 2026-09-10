import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { FileText, Plus, Minus, Eye } from 'lucide-react';
import { formatDateShort, formatDateTimeSingleLine } from '@/utils/dateUtils';

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

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({ only: ['histories'], preserveScroll: true, preserveState: true });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredHistories = safeHistories.filter(h => {
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

  const getActionBadgeColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'pending':   return 'bg-yellow-100 text-yellow-800';
      case 'approved':  return 'bg-green-100 text-green-800';
      case 'rejected':  return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default:          return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadgeColor = (h) =>
    h.stock_in_id  ? 'bg-green-100 text-green-800 border-green-200' :
    h.stock_out_id ? 'bg-red-100 text-red-800 border-red-200' :
                     'bg-gray-100 text-gray-800 border-gray-200';

  const getTypeLabel = (h) =>
    h.stock_in_id ? 'Stock In' : h.stock_out_id ? 'Stock Out' : 'Unknown';

  const getTypeIcon = (h) => {
    if (h.stock_in_id) {
      return <Plus size={14} className="text-green-600" />;
    } else if (h.stock_out_id) {
      return <Minus size={14} className="text-red-600" />;
    }
    return null;
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

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">History</h1>
            <p className="text-gray-600 text-sm mt-1">View stock transactions</p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-4">
              {[
                { key: 'all',       label: `All Transactions (${safeHistories.length})` },
                { key: 'stock-in',  label: `Stock In (${safeHistories.filter(h => h.stock_in_id).length})` },
                { key: 'stock-out', label: `Stock Out (${safeHistories.filter(h => h.stock_out_id).length})` },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilterType(tab.key)}
                  className={`px-4 py-2 font-medium transition-colors ${
                    filterType === tab.key
                      ? 'border-b-2 border-red-600 text-red-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="w-20 px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Delivery No</th>
                    <th className="w-20 px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                    <th className="w-20 px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="w-32 px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                    <th className="w-24 px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Requested By</th>
                    <th className="w-24 px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action By</th>
                    <th className="w-32 px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="w-32 px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredHistories.length > 0 ? (
                    filteredHistories.map((history, idx) => (
                      <tr key={idx} className="hover:bg-blue-50 transition-colors">
                        <td className="px-2 py-2 text-xs text-gray-700">
                          <div className="truncate whitespace-nowrap" title={history.stock_out?.delivery_no}>
                            {history.stock_out_id ? (history.stock_out?.delivery_no || '-') : '-'}
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold border whitespace-nowrap ${getTypeBadgeColor(history)}`}>
                            {getTypeIcon(history)}
                            {getTypeLabel(history)}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${getActionBadgeColor(history.status)}`}>
                            {history.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-700">
                          <div className="truncate" title={history.description}>{history.description || '-'}</div>
                        </td>
                        <td className="px-2 py-2">
                          <span className="text-xs font-semibold text-blue-600 whitespace-nowrap block truncate" title={history.stock_in_id ? (history.stock_in?.requested_by?.name || 'Unknown') : history.stock_out_id ? (history.stock_out?.requested_by?.name || 'Unknown') : '-'}>
                            {history.stock_in_id 
                              ? (history.stock_in?.requested_by?.name || 'Unknown')
                              : history.stock_out_id 
                                ? (history.stock_out?.requested_by?.name || 'Unknown')
                                : '-'
                            }
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <span className="text-xs font-semibold text-gray-900 whitespace-nowrap block truncate" title={history.user?.name || `User ${history.user_id}` || '-'}>
                            {history.user?.name || `User ${history.user_id}` || '-'}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-700 whitespace-nowrap">
                          <div className="font-medium">{formatDateTimeSingleLine(history.created_at)}</div>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* View Details Button for Approved/Rejected */}
                            {(history.status === 'approved' || history.status === 'rejected') && (history.stock_in_id || history.stock_out_id) && (
                              <button
                                onClick={() => handleViewDetails(history)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 px-1 py-1 bg-blue-50 rounded hover:bg-blue-100 transition"
                                title="View Details"
                              >
                                <Eye size={12} />
                                <span className="hidden sm:inline">Details</span>
                              </button>
                            )}
                            
                            {/* Delivery Receipt Button for Approved Stock Out ONLY */}
                            {history.stock_out_id && history.status === 'approved' && (
                              <a
                                href={`/delivery-receipt/${history.stock_out_id}/view`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-800 px-1 py-1 bg-green-50 rounded hover:bg-green-100 transition"
                                title="View Receipt"
                              >
                                <FileText size={12} />
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
                      <td colSpan="8" className="px-6 py-12 text-center">
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
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedDetails?.type === 'stock-in' ? 'Stock In' : 'Stock Out'} Request Details
              </h3>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600 text-xl font-semibold"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading details...</span>
                </div>
              ) : selectedDetails ? (
                <div className="space-y-6">
                  {/* Request Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Request Information</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Request ID:</span>
                        <div className="font-medium">
                          #{selectedDetails.type === 'stock-in' ? selectedDetails.stockIn?.id : selectedDetails.stockOut?.id}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getActionBadgeColor(selectedDetails.status)}`}>
                          {selectedDetails.status}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Requested By:</span>
                        <div className="font-medium">
                          {selectedDetails.type === 'stock-in' ? selectedDetails.stockIn?.requested_by?.name : selectedDetails.stockOut?.requested_by?.name}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Request Date:</span>
                        <div className="font-medium">
                          {selectedDetails.type === 'stock-in' ? (selectedDetails.stockIn?.created_at || 'Not available') : (selectedDetails.stockOut?.created_at || 'Not available')}
                        </div>
                      </div>
                      {(selectedDetails.status === 'approved' || selectedDetails.status === 'rejected') && (
                        <>
                          <div>
                            <span className="text-gray-600">
                              {selectedDetails.status === 'approved' ? 'Approved' : 'Rejected'} By:
                            </span>
                            <div className="font-medium">
                              {selectedDetails.type === 'stock-in' ? selectedDetails.stockIn?.approved_by?.name : selectedDetails.stockOut?.approved_by?.name}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              {selectedDetails.status === 'approved' ? 'Approved' : 'Rejected'} Date:
                            </span>
                            <div className="font-medium">
                              {selectedDetails.type === 'stock-in' ? (selectedDetails.stockIn?.approved_at || 'Not yet approved') : (selectedDetails.stockOut?.approved_at || 'Not yet approved')}
                            </div>
                          </div>
                        </>
                      )}
                      {selectedDetails.status === 'rejected' && (
                        <div className="col-span-full">
                          <span className="text-gray-600">Rejection Reason:</span>
                          <div className="font-medium text-red-600">
                            {selectedDetails.type === 'stock-in' ? selectedDetails.stockIn?.rejection_reason : selectedDetails.stockOut?.rejection_reason}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Information for Stock Out - moved above Items */}
                  {selectedDetails.type === 'stock-out' && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Delivery Information</h4>
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

                  {/* Items */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Items</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
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


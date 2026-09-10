import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Package, AlertCircle, TrendingDown, TrendingUp, Plus, ArrowDownLeft, ArrowUpRight, Box, Building2, Users, Folder, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDateShort, formatTimePhilippines } from '@/utils/dateUtils';

export default function Dashboard({ user, stats, lowStockItems, recentActivity, inventorySummary }) {
  const [showLowStockDetails, setShowLowStockDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle search from header
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Lock/unlock body scroll when modal opens/closes
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProduct]);

  // Ensure arrays — backend may pass null or object on error
  const safeRecentActivity = Array.isArray(recentActivity) ? recentActivity : [];
  const safeLowStockItems = Array.isArray(lowStockItems) ? lowStockItems : [];

  // Filter recent activity based on search term
  const filteredRecentActivity = safeRecentActivity.filter(activity => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase().trim();

    // Build date variants from created_at
    const recordDate = activity.created_at ? new Date(activity.created_at) : null;
    const isoDate       = recordDate ? recordDate.toISOString().split('T')[0] : '';          // 2026-08-19
    const localeDate    = recordDate ? recordDate.toLocaleDateString('en-US') : '';           // 8/19/2026
    const shortDate     = recordDate ? recordDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toLowerCase() : ''; // aug 19, 2026
    const formattedTime = recordDate ? recordDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase() : ''; // 12:00 am

    return [
      activity.user?.toLowerCase().startsWith(search),
      activity.type?.toLowerCase().startsWith(search),
      activity.status?.toLowerCase().startsWith(search),
      activity.item?.toLowerCase().startsWith(search),
      isoDate.startsWith(search),
      localeDate.startsWith(search),
      shortDate.startsWith(search),
      formattedTime.startsWith(search),
    ].some(Boolean);
  });

  // Filter low stock items based on search term - prioritize starts with
  const filteredLowStockItems = safeLowStockItems.filter(item => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase().trim();
    return [
      item.product_name?.toLowerCase().startsWith(search),
      item.category?.toLowerCase().startsWith(search),
      item.supplier?.toLowerCase().startsWith(search),
    ].some(Boolean);
  });

  // Auto-refresh every 10 seconds to sync dashboard data
  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({ only: ['stats', 'lowStockItems', 'recentActivity', 'inventorySummary'], preserveScroll: true, preserveState: true });
    }, 10000); // 10 seconds for dashboard

    return () => clearInterval(interval);
  }, []);

  // Status color helper
  const getStatusColor = (status) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    return status === 'critical' ? 'Critical' : status === 'low' ? 'Low' : 'Normal';
  };

  // Get trend icon for stats
  const getTrendIcon = (label) => {
    if (label.includes('Stock In')) return <ArrowDownLeft size={20} className="text-green-600" />;
    if (label.includes('Stock Out')) return <ArrowUpRight size={20} className="text-orange-600" />;
    if (label.includes('Low')) return <AlertCircle size={20} className="text-red-600" />;
    return <Package size={20} className="text-blue-600" />;
  };

  return (
    <AuthenticatedLayout onSearch={handleSearch}>
      <Head title="Dashboard" />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => {
              const isLowStock = stat.label.includes('Low');
              return (
                <div 
                  key={idx} 
                  className={`bg-white border rounded-lg p-6 hover:shadow-md transition-all duration-200 ${
                    isLowStock 
                      ? 'border-red-300 hover:border-red-400 bg-gradient-to-br from-red-50 to-white' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className={`text-xs font-medium uppercase tracking-wide mb-2 ${
                        isLowStock ? 'text-red-700' : 'text-gray-600'
                      }`}>
                        {stat.label}
                      </p>
                      <p className={`text-3xl font-bold ${
                        isLowStock ? 'text-red-900' : 'text-gray-900'
                      }`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg ${
                      isLowStock ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {getTrendIcon(stat.label)}
                    </div>
                  </div>
                  <p className={`text-xs ${
                    isLowStock ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {stat.change}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Quick Actions Section */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Primary Action - Add Product */}
              <button
                onClick={() => router.visit('/products')}
                className="flex items-center justify-between bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg font-medium focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 group shadow-md hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <Plus size={20} />
                  <span>Add Product</span>
                </div>
                <ChevronRight size={18} className="opacity-75 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Secondary Actions */}
              <button
                onClick={() => router.visit('/stock-in')}
                className="flex items-center justify-between bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <ArrowDownLeft size={20} />
                  <span>Stock In</span>
                </div>
                <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => router.visit('/stock-out')}
                className="flex items-center justify-between bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <ArrowUpRight size={20} />
                  <span>Stock Out</span>
                </div>
                <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            {/* Low Stock Items - Full Width on Mobile/Tablet */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Low Stock Items</h3>
                  {filteredLowStockItems.length > 0 && (
                    <button
                      onClick={() => router.visit('/products')}
                      className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
                    >
                      View All <ChevronRight size={16} />
                    </button>
                  )}
                </div>

                {filteredLowStockItems && filteredLowStockItems.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Supplier</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Current</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Status</th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredLowStockItems.map((product, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-gray-900">{product.product_name}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-600">{product.category}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-600">{product.supplier}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-600">{product.quantity} units</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(product.status)}`}>
                                {getStatusLabel(product.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button 
                                onClick={() => setSelectedProduct(product)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors cursor-pointer"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <div className="flex justify-center mb-3">
                      <div className="p-3 bg-green-100 rounded-full">
                        <Package size={24} className="text-green-600" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900">✓ No low stock items</p>
                    <p className="text-xs text-gray-500 mt-1">All products currently have sufficient inventory</p>
                  </div>
                )}
              </div>
            </div>

            {/* Inventory Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Inventory Summary</h3>
              <div className="space-y-4">
                {[
                  { label: 'Categories', value: inventorySummary.categories, icon: Folder },
                  { label: 'Suppliers', value: inventorySummary.suppliers, icon: Building2 },
                  { label: 'Customers', value: inventorySummary.customers, icon: Users },
                  { label: 'Total Products', value: inventorySummary.total_products, icon: Box },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-gray-200">
                          <Icon size={18} className="text-gray-600" />
                        </div>
                        <p className="text-sm text-gray-700">{item.label}</p>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              {filteredRecentActivity.length > 0 && (
                <button
                  onClick={() => router.visit('/history')}
                  className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
                >
                  View All <ChevronRight size={16} />
                </button>
              )}
            </div>

            {filteredRecentActivity && filteredRecentActivity.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredRecentActivity.slice(0, 8).map((activity, idx) => (
                  <div key={idx} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${
                            activity.type === 'stock_in' ? 'bg-green-100' : 'bg-orange-100'
                          }`}>
                            {activity.type === 'stock_in' ? 
                              <ArrowDownLeft size={16} className="text-green-600" /> :
                              <ArrowUpRight size={16} className="text-orange-600" />
                            }
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {activity.item}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {activity.quantity} units{activity.item_count ? ` from ${activity.item_count} items` : ''} • {activity.created_at ? formatDateShort(activity.created_at) + ', ' + formatTimePhilippines(activity.created_at) : '—'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-11">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                          <span className="text-xs text-gray-600">by {activity.user}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4 flex flex-col items-end gap-2">
                        {/* Quantity indicator only for approved transactions */}
                        {activity.status === 'approved' && (
                          <div className={`px-2 py-1 rounded-md text-xs font-bold ${
                            activity.type === 'stock_in' 
                              ? 'bg-green-100 text-green-700 border border-green-300' 
                              : 'bg-orange-100 text-orange-700 border border-orange-300'
                          }`}>
                            {activity.type === 'stock_in' ? '+' : '-'}{activity.quantity}
                          </div>
                        )}
                        
                        {/* Status indicator dots only */}
                        {activity.status === 'approved' && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                        {activity.status === 'rejected' && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                        {activity.status === 'pending' && (
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <Box size={24} className="text-gray-400" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">No recent activity</p>
                <p className="text-xs text-gray-500 mt-1">Activities will appear here as you manage inventory</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{selectedProduct.product_name}</h3>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">Category:</span>
                <p className="text-gray-700 mt-1">{selectedProduct.category || 'Not assigned'}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">Supplier:</span>
                <p className="text-gray-700 mt-1">{selectedProduct.supplier || 'Not assigned'}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold text-gray-900">Current Stock:</span>
                <p className="text-lg font-bold text-gray-900 mt-1">{selectedProduct.quantity} units</p>
              </div>

              <div className="bg-red-50 p-3 rounded border border-red-200">
                <span className="font-semibold text-gray-900">Status:</span>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedProduct.status)}`}>
                    {getStatusLabel(selectedProduct.status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedProduct(null);
                  router.visit('/products');
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                View in Products
              </button>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { TrendingUp, TrendingDown, Package, BarChart3, Calendar, DollarSign } from 'lucide-react';

export default function MonthlyReport({ 
  year, 
  month, 
  monthName, 
  stockInStats, 
  stockOutStats, 
  monthlyBreakdown 
}) {
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedMonth, setSelectedMonth] = useState(month);

  const handleDateChange = () => {
    router.get('/reports/monthly', {
      year: selectedYear,
      month: selectedMonth,
    });
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const StatCard = ({ title, value, subValue, icon: Icon, color, bgColor }) => (
    <div className={`${bgColor} rounded-lg p-6 shadow-sm border border-gray-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
          {subValue && (
            <p className="text-sm text-gray-500 mt-1">{subValue}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color === 'text-green-600' ? 'bg-green-100' : 'bg-red-100'}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  return (
    <AuthenticatedLayout>
      <Head title="Monthly Report" />

      <div className="p-8 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Monthly Report</h1>
                <p className="text-gray-600 text-sm mt-1">
                  Inventory transactions and statistics for {monthName} {year}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {months.map((monthName, index) => (
                    <option key={index + 1} value={index + 1}>
                      {monthName}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleDateChange}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
                >
                  Update
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Stock In Transactions"
              value={stockInStats.transactionCount}
              subValue={`${stockInStats.uniqueProducts} unique products`}
              icon={TrendingUp}
              color="text-green-600"
              bgColor="bg-green-50"
            />
            <StatCard
              title="Items Added"
              value={stockInStats.totalItemsAdded.toLocaleString()}
              subValue={formatCurrency(stockInStats.totalValue)}
              icon={Package}
              color="text-green-600"
              bgColor="bg-green-50"
            />
            <StatCard
              title="Stock Out Transactions"
              value={stockOutStats.transactionCount}
              subValue={`${stockOutStats.uniqueProducts} unique products`}
              icon={TrendingDown}
              color="text-red-600"
              bgColor="bg-red-50"
            />
            <StatCard
              title="Items Removed"
              value={stockOutStats.totalItemsOut.toLocaleString()}
              subValue={formatCurrency(stockOutStats.totalValue)}
              icon={Package}
              color="text-red-600"
              bgColor="bg-red-50"
            />
          </div>

          {/* Summary Card */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {monthName} {year} Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Net Item Movement</p>
                <p className={`text-2xl font-bold mt-1 ${
                  (stockInStats.totalItemsAdded - stockOutStats.totalItemsOut) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {(stockInStats.totalItemsAdded - stockOutStats.totalItemsOut) >= 0 ? '+' : ''}
                  {(stockInStats.totalItemsAdded - stockOutStats.totalItemsOut).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Items added - Items removed</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {stockInStats.transactionCount + stockOutStats.transactionCount}
                </p>
                <p className="text-xs text-gray-500 mt-1">Stock In + Stock Out</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Net Value Movement</p>
                <p className={`text-2xl font-bold mt-1 ${
                  (stockInStats.totalValue - stockOutStats.totalValue) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatCurrency(stockInStats.totalValue - stockOutStats.totalValue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Value In - Value Out</p>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {year} Monthly Breakdown
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Transaction and item counts by month
              </p>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Month</th>
                      <th className="text-right py-3 px-2 font-medium text-green-700">Stock In Transactions</th>
                      <th className="text-right py-3 px-2 font-medium text-green-700">Items Added</th>
                      <th className="text-right py-3 px-2 font-medium text-red-700">Stock Out Transactions</th>
                      <th className="text-right py-3 px-2 font-medium text-red-700">Items Removed</th>
                      <th className="text-right py-3 px-2 font-medium text-blue-700">Net Items</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {monthlyBreakdown.map((monthData, index) => {
                      const netItems = monthData.stockIn.items - monthData.stockOut.items;
                      const isCurrentMonth = monthData.month === month;
                      
                      return (
                        <tr 
                          key={index} 
                          className={`hover:bg-gray-50 ${isCurrentMonth ? 'bg-blue-50 border-blue-200' : ''}`}
                        >
                          <td className={`py-3 px-2 font-medium ${isCurrentMonth ? 'text-blue-900' : 'text-gray-900'}`}>
                            {monthData.monthName}
                            {isCurrentMonth && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Current
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-right text-green-600 font-medium">
                            {monthData.stockIn.transactions}
                          </td>
                          <td className="py-3 px-2 text-right text-green-600">
                            {monthData.stockIn.items.toLocaleString()}
                          </td>
                          <td className="py-3 px-2 text-right text-red-600 font-medium">
                            {monthData.stockOut.transactions}
                          </td>
                          <td className="py-3 px-2 text-right text-red-600">
                            {monthData.stockOut.items.toLocaleString()}
                          </td>
                          <td className={`py-3 px-2 text-right font-medium ${
                            netItems >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {netItems >= 0 ? '+' : ''}
                            {netItems.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
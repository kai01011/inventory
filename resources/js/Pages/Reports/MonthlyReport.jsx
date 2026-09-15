import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Package, BarChart3 } from 'lucide-react';

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

  const StatCard = ({ title, value, subValue, icon: Icon }) => (
    <div className="rounded-lg p-6 border border-gray-200 bg-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
          {subValue && (
            <p className="text-sm text-gray-600 mt-1">{subValue}</p>
          )}
        </div>
        {Icon && (
          <div className="flex-shrink-0">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const formatNetChange = (value) => {
    if (value === 0) return '0';
    return value > 0 ? `+${value}` : `${value}`;
  };

  return (
    <AuthenticatedLayout>
      <Head title="Monthly Report" />

      <div className="bg-white min-h-screen">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900" style={{ fontSize: '20px' }}>
              Monthly Report
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Inventory transactions and statistics for {monthName} {year}
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-end gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {months.map((monthName, index) => (
                  <option key={index + 1} value={index + 1}>
                    {monthName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleDateChange}
              className="h-10 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
            >
              Update
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Stock In Transactions"
              value={stockInStats.transactionCount}
              subValue={`${stockInStats.uniqueProducts} unique products`}
              icon={BarChart3}
            />
            <StatCard
              title="Quantity Received"
              value={stockInStats.totalItemsAdded.toLocaleString()}
              subValue={`Value received: ${formatCurrency(stockInStats.totalValue)}`}
              icon={Package}
            />
            <StatCard
              title="Stock Out Transactions"
              value={stockOutStats.transactionCount}
              subValue={`${stockOutStats.uniqueProducts} unique products`}
              icon={BarChart3}
            />
            <StatCard
              title="Quantity Released"
              value={stockOutStats.totalItemsOut.toLocaleString()}
              subValue={`Value released: ${formatCurrency(stockOutStats.totalValue)}`}
              icon={Package}
            />
          </div>

          {/* Summary Card */}
          <div className="rounded-lg p-6 border border-gray-200 bg-white mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-6 uppercase tracking-wide">
              {monthName} {year} Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Net Quantity Change</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">
                  {formatNetChange(stockInStats.totalItemsAdded - stockOutStats.totalItemsOut)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Transactions</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">
                  {stockInStats.transactionCount + stockOutStats.transactionCount}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Net Value Change</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">
                  {formatCurrency(stockInStats.totalValue - stockOutStats.totalValue)}
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
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
                      <th className="text-left py-3 px-3 font-medium text-gray-700 text-xs uppercase tracking-wide">Month</th>
                      <th className="text-right py-3 px-3 font-medium text-gray-700 text-xs uppercase tracking-wide">Stock In Transactions</th>
                      <th className="text-right py-3 px-3 font-medium text-gray-700 text-xs uppercase tracking-wide">Quantity Received</th>
                      <th className="text-right py-3 px-3 font-medium text-gray-700 text-xs uppercase tracking-wide">Stock Out Transactions</th>
                      <th className="text-right py-3 px-3 font-medium text-gray-700 text-xs uppercase tracking-wide">Quantity Released</th>
                      <th className="text-right py-3 px-3 font-medium text-gray-700 text-xs uppercase tracking-wide">Net Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyBreakdown.map((monthData, index) => {
                      const netItems = monthData.stockIn.items - monthData.stockOut.items;
                      const isSelectedMonth = monthData.month === month;
                      
                      return (
                        <tr 
                          key={index} 
                          className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                            isSelectedMonth ? 'bg-blue-50' : ''
                          }`}
                        >
                          <td className={`py-3 px-3 font-medium ${
                            isSelectedMonth ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            <div className="flex items-center gap-2">
                              {monthData.monthName}
                              {isSelectedMonth && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                                  Selected
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right text-gray-700">
                            {monthData.stockIn.transactions}
                          </td>
                          <td className="py-3 px-3 text-right text-gray-700">
                            {monthData.stockIn.items.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right text-gray-700">
                            {monthData.stockOut.transactions}
                          </td>
                          <td className="py-3 px-3 text-right text-gray-700">
                            {monthData.stockOut.items.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right font-medium text-gray-900">
                            {formatNetChange(netItems)}
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
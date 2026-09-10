import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import CalendarPicker from '@/components/ui/calendar-picker';

export default function CalendarDemo() {
  const [warrantyDate, setWarrantyDate] = useState('');
  const [stockInDate, setStockInDate] = useState('');
  const [stockOutDate, setStockOutDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  return (
    <AuthenticatedLayout>
      <Head title="Calendar Picker Demo" />
      
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Calendar Date Picker</h1>
            <p className="text-gray-600 mt-2">Modern, clean, and professional date picker for inventory management</p>
          </div>

          {/* Demo Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Warranty Date */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Warranty Date</h2>
              <p className="text-sm text-gray-600 mb-4">Select product warranty expiration date</p>
              <CalendarPicker 
                value={warrantyDate} 
                onChange={setWarrantyDate}
                placeholder="Select warranty date"
              />
              {warrantyDate && (
                <p className="text-xs text-gray-500 mt-3">Selected: <span className="font-medium text-gray-900">{warrantyDate}</span></p>
              )}
            </div>

            {/* Card 2: Stock In Date */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Stock In Date</h2>
              <p className="text-sm text-gray-600 mb-4">Select when inventory was received</p>
              <CalendarPicker 
                value={stockInDate} 
                onChange={setStockInDate}
                placeholder="Select stock in date"
              />
              {stockInDate && (
                <p className="text-xs text-gray-500 mt-3">Selected: <span className="font-medium text-gray-900">{stockInDate}</span></p>
              )}
            </div>

            {/* Card 3: Stock Out Date */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Stock Out Date</h2>
              <p className="text-sm text-gray-600 mb-4">Select when inventory was released</p>
              <CalendarPicker 
                value={stockOutDate} 
                onChange={setStockOutDate}
                placeholder="Select stock out date"
              />
              {stockOutDate && (
                <p className="text-xs text-gray-500 mt-3">Selected: <span className="font-medium text-gray-900">{stockOutDate}</span></p>
              )}
            </div>

            {/* Card 4: Delivery Date */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Delivery Date</h2>
              <p className="text-sm text-gray-600 mb-4">Select expected delivery date</p>
              <CalendarPicker 
                value={deliveryDate} 
                onChange={setDeliveryDate}
                placeholder="Select delivery date"
              />
              {deliveryDate && (
                <p className="text-xs text-gray-500 mt-3">Selected: <span className="font-medium text-gray-900">{deliveryDate}</span></p>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="mt-12 bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">✓ Modern Design</h3>
                <p className="text-sm text-gray-600">Clean, minimal interface with professional SaaS aesthetics</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">✓ Smooth Animations</h3>
                <p className="text-sm text-gray-600">Fade in/zoom animations for opening and closing</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">✓ Easy Navigation</h3>
                <p className="text-sm text-gray-600">Previous/next month buttons and Today shortcut</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">✓ Clear Selection</h3>
                <p className="text-sm text-gray-600">Blue highlight for selected date with hover states</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">✓ User Friendly</h3>
                <p className="text-sm text-gray-600">Click outside to close, immediate date update</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">✓ Compact Layout</h3>
                <p className="text-sm text-gray-600">300-340px wide popover with comfortable spacing</p>
              </div>
            </div>
          </div>

          {/* Usage Guide */}
          <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="font-semibold text-blue-900 mb-3">How to Use</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• <strong>Click the input field</strong> to open the calendar popover</li>
              <li>• <strong>Use arrow buttons</strong> to navigate between months</li>
              <li>• <strong>Click on a date</strong> to select it (immediately updates and closes)</li>
              <li>• <strong>Click "Today"</strong> to quickly select today's date</li>
              <li>• <strong>Click "Clear"</strong> to remove the selected date</li>
              <li>• <strong>Click outside</strong> the calendar to close it</li>
              <li>• <strong>Hover states</strong> provide visual feedback on interactive elements</li>
            </ul>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

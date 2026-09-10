import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SearchInput from './SearchInput';

export default function TableView({ title, description, data, columns }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data?.filter(row => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    
    return columns.some(col =>
      String(row[col.key] || '').toLowerCase().startsWith(search)
    );
  }) || [];

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 font-medium">No data available</p>
          <p className="text-sm text-gray-400">There are no records to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>

        {/* Search */}
        <SearchInput
          id="table-search"
          onSearch={setSearchTerm}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Search records..."
          width="w-full"
          size="md"
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className="text-gray-700">
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row, idx) => (
                <TableRow key={idx} className="hover:bg-gray-50 transition">
                  {columns.map((column) => (
                    <TableCell key={column.key} className="text-gray-700">
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key] ?? '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-sm text-gray-500">
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
        Showing <span className="font-semibold">{filteredData.length}</span> of{' '}
        <span className="font-semibold">{data.length}</span> records
      </div>
    </div>
  );
}

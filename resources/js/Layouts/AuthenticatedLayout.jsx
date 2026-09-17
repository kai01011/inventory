import { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { usePendingCounts } from '@/hooks/usePendingCounts';

export default function AuthenticatedLayout({ children, onSearch }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { stockIn, stockOut } = usePendingCounts();
    
    const pendingCounts = useMemo(() => ({ stockIn, stockOut }), [stockIn, stockOut]);

    const handleSearch = (term) => {
        setSearchTerm(term);
        onSearch?.(term);
    };

    const marginClass = sidebarOpen ? 'ml-64' : 'ml-16';

    return (
        <div className="flex h-screen bg-white font-sans overflow-hidden">
            <Sidebar 
                open={sidebarOpen} 
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                pendingCounts={pendingCounts}
            />

            <div className={`flex-1 flex flex-col transition-[margin-left] duration-200 ${marginClass}`}>
                <div className="sticky top-0 z-30 flex-shrink-0">
                    <Header 
                        sidebarOpen={sidebarOpen} 
                        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                        onSearch={handleSearch}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />
                </div>

                <div className="flex-1 overflow-auto bg-white">
                    {children}
                </div>
            </div>
        </div>
    );
}

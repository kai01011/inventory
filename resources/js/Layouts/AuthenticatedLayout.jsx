import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { usePendingCounts } from '@/hooks/usePendingCounts';

export default function AuthenticatedLayout({ children, onSearch }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { stockIn, stockOut, refresh } = usePendingCounts();
    
    const pendingCounts = { stockIn, stockOut };

    // Handle synchronized search between header and sidebar
    const handleSearch = (term) => {
        setSearchTerm(term);
        if (onSearch) {
            onSearch(term);
        }
    };

    return (
        <div className="flex min-h-screen bg-white font-sans">
            {/* Sidebar - Fixed on left side */}
            <Sidebar 
                open={sidebarOpen} 
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                pendingCounts={pendingCounts}
            />

            {/* Main Content - Adjust margin based on sidebar state */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
                {/* Header - Sticky, stays visible when scrolling content */}
                <div className="sticky top-0 z-30">
                    <Header 
                        sidebarOpen={sidebarOpen} 
                        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                        onSearch={handleSearch}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />
                </div>

                {/* Page Content - Scrollable independently */}
                <div className="flex-1 overflow-auto bg-white min-h-0">
                    {children}
                </div>
            </div>
        </div>
    );
}

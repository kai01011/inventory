import { usePage, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Home, Users, Package, ArrowDown, ArrowUp, History, ChevronDown, ChevronRight, Tag, Building2, UserCheck, BarChart3 } from 'lucide-react';

export default function Sidebar({ open, onToggle, pendingCounts = {} }) {
    const { auth } = usePage().props;
    const [expandedSections, setExpandedSections] = useState({});

    const mainMenuItems = useMemo(() => [
        { label: 'Dashboard', icon: Home, href: '/dashboard', id: 'dashboard' },
    ], []);

    const masterDataItems = useMemo(() => [
        { label: 'Suppliers', icon: Building2, href: '/suppliers', id: 'suppliers' },
        { label: 'Categories', icon: Tag, href: '/categories', id: 'categories' },
        { label: 'Products', icon: Package, href: '/products', id: 'products' },
        { label: 'Customers', icon: UserCheck, href: '/customers', id: 'customers' },
    ], []);

    const stockManagementItems = useMemo(() => [
        { 
            label: 'Stock In', 
            icon: ArrowDown, 
            href: '/stock-in', 
            id: 'stock-in',
            badge: pendingCounts.stockIn || 0
        },
        { 
            label: 'Stock Out', 
            icon: ArrowUp, 
            href: '/stock-out', 
            id: 'stock-out',
            badge: pendingCounts.stockOut || 0
        },
    ], [pendingCounts.stockIn, pendingCounts.stockOut]);

    const otherItems = useMemo(() => [
        { label: 'History', icon: History, href: '/history', id: 'history' },
        { label: 'Reports', icon: BarChart3, href: '/reports/monthly', id: 'reports' },
    ], []);

    const toggleSection = (id) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const MenuSection = ({ title, items }) => (
        <div className="mb-6">
            {open && <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</h3>}
            <nav className="flex flex-col gap-1">
                {items.map((item, idx) => {
                    const Icon = item.icon;
                    const isActive = typeof window !== 'undefined' ? window.location.pathname === item.href : false;
                    
                    return (
                        <div key={item.id}>
                            <Link
                                href={item.href}
                                className={`${open ? 'px-4' : 'px-3'} py-2.5 rounded-lg flex items-center ${open ? 'gap-3' : 'justify-center'} transition-colors text-sm font-medium ${
                                    isActive
                                        ? 'bg-red-50 text-red-600'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
                                }`}
                                title={!open ? item.label : ''}
                            >
                                <div className="relative flex-shrink-0">
                                    <Icon size={18} />
                                    {!open && item.badge > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px]">
                                            {item.badge > 9 ? '9+' : item.badge}
                                        </span>
                                    )}
                                </div>
                                {open && <span className="flex-1">{item.label}</span>}
                                {open && item.badge > 0 && (
                                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium min-w-[20px] h-5 flex items-center justify-center">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </Link>
                        </div>
                    );
                })}
            </nav>
        </div>
    );

    return (
        <div className={`${open ? 'w-64' : 'w-16'} bg-gray-50 text-gray-900 overflow-hidden transition-[width] duration-200 border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-40`}>
            <div className="h-16 border-b border-gray-200 flex items-center justify-center px-4 flex-shrink-0">
                {open ? (
                    <div className="flex items-center gap-3">
                        <img src="/images/cravelogo.png" alt="CRAVE" className="h-10 w-10 flex-shrink-0" />
                        <div className="text-sm">
                            <div className="font-bold text-gray-900">CRAVE</div>
                            <div className="text-xs text-gray-500">Inventory</div>
                        </div>
                    </div>
                ) : (
                    <img src="/images/cravelogo.png" alt="CRAVE" className="h-8 w-8" />
                )}
            </div>

            <div className="flex-1 px-3 py-4 overflow-y-auto">
                <MenuSection title="Main" items={mainMenuItems} />
                <MenuSection title="Master Data" items={masterDataItems} />
                <MenuSection title="Stock Management" items={stockManagementItems} />
                <MenuSection title="Others" items={otherItems} />
            </div>
        </div>
    );
}

import { usePage, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Home, Users, Package, ArrowDown, ArrowUp, History, ChevronDown, ChevronRight, Layers, Tag, Building2, UserCheck, BarChart3 } from 'lucide-react';

export default function Sidebar({ open, onToggle, pendingCounts = {} }) {
    const { auth } = usePage().props;
    const [expandedSections, setExpandedSections] = useState({});

    const mainMenuItems = [
        { label: 'Dashboard', icon: Home, href: '/dashboard', id: 'dashboard' },
    ];

    const masterDataItems = [
        // Users management removed from admin
        // ...(auth?.user?.role?.role_name === 'Admin' ? [{ label: 'Users', icon: Users, href: '/users', id: 'users' }] : []),
        { label: 'Suppliers', icon: Building2, href: '/suppliers', id: 'suppliers' },
        { label: 'Categories', icon: Tag, href: '/categories', id: 'categories' },
        { label: 'Products', icon: Package, href: '/products', id: 'products' },
        { label: 'Customers', icon: UserCheck, href: '/customers', id: 'customers' },
    ];

    const stockManagementItems = [
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
    ];

    const otherItems = [
        { label: 'History', icon: History, href: '/history', id: 'history' },
        { label: 'Reports', icon: BarChart3, href: '/reports/monthly', id: 'reports' },
    ];

    const toggleSection = (id) => {
        setExpandedSections(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const MenuSection = ({ title, items }) => (
        <div className="mb-6">
            {open && <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {title}
            </h3>}
            <nav className="flex flex-col gap-1">
                {items.map((item, idx) => {
                    const Icon = item.icon;
                    const isActive = typeof window !== 'undefined' ? window.location.pathname === item.href : false;
                    
                    return (
                        <div key={idx}>
                            {item.submenu ? (
                                <button
                                    onClick={() => toggleSection(item.id)}
                                    className={`w-full ${open ? 'px-4' : 'px-3'} py-2.5 rounded-lg flex items-center ${open ? 'gap-3' : 'justify-center'} transition-all text-sm font-medium ${
                                        isActive
                                            ? 'bg-red-50 text-red-600'
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
                                    }`}
                                    title={!open ? item.label : ''}
                                >
                                    <Icon size={18} className="flex-shrink-0" />
                                    {open && <span>{item.label}</span>}
                                    {open && item.submenu && (
                                        <span className="ml-auto text-xs">
                                            {expandedSections[item.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                        </span>
                                    )}
                                </button>
                            ) : (
                                <div className="relative">
                                    <Link
                                        href={item.href}
                                        className={`${open ? 'px-4' : 'px-3'} py-2.5 rounded-lg flex items-center ${open ? 'gap-3' : 'justify-center'} transition-all text-sm font-medium ${
                                            isActive
                                                ? 'bg-red-50 text-red-600'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
                                        }`}
                                        title={!open ? item.label : ''}
                                    >
                                        <div className="relative">
                                            <Icon size={18} className="flex-shrink-0" />
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
                            )}
                            {open && item.submenu && expandedSections[item.id] && (
                                <div className="ml-8 mt-1 space-y-1 border-l border-gray-300">
                                    {item.submenu.map((sub, subIdx) => (
                                        <Link
                                            key={subIdx}
                                            href={sub.href}
                                            className="block px-3 py-1.5 text-xs text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded transition-all"
                                        >
                                            {sub.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </div>
    );

    return (
        <div className={`${open ? 'w-64' : 'w-16'} bg-gray-50 text-gray-900 overflow-hidden transition-all duration-300 border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-40`}>
            {/* Logo Section */}
            <div className="h-16 border-b border-gray-200 flex items-center justify-center px-4">
                {open ? (
                    <div className="flex items-center gap-3 text-xl font-bold">
                        <img src="/images/cravelogo.png" alt="CRAVE Logo" className="h-10 w-10 flex-shrink-0" />
                        <div className="text-sm">
                            <div className="font-bold text-gray-900">CRAVE</div>
                            <div className="text-xs text-gray-500">Inventory</div>
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        <img src="/images/cravelogo.png" alt="CRAVE Logo" className="h-8 w-8" />
                    </div>
                )}
            </div>

            {/* Menu */}
            <div className="flex-1 px-3 py-4 overflow-y-auto">
                <MenuSection title="Main" items={mainMenuItems} />
                <MenuSection title="Master Data" items={masterDataItems} />
                <MenuSection title="Stock Management" items={stockManagementItems} />
                <MenuSection title="Others" items={otherItems} />
            </div>
        </div>
    );
}

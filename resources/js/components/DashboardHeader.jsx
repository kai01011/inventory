import { useState, useEffect, useRef } from 'react';
import { ChevronDown, LogOut, Menu, User, Search, Users } from 'lucide-react';
import { usePage, Link } from '@inertiajs/react';
import NotificationBell from './NotificationBell';
import SearchInput from './SearchInput';
import { getCurrentTime } from '@/utils/dateUtils';

export default function DashboardHeader({ user, onSearch, searchTerm: externalSearchTerm, setSearchTerm: externalSetSearchTerm, onToggleSidebar }) {
    const { component } = usePage();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const userMenuRef = useRef(null);

    // Hide global search on Users page (uses page-specific search instead)
    const hideGlobalSearch = component === 'Users';

    // Get current date
    const currentTime = getCurrentTime();

    // Determine page title based on component name
    const getPageTitle = () => {
        if (component === 'Dashboard') return 'Dashboard';
        // Return component name with spaces for other pages
        return component?.replace(/([A-Z])/g, ' $1').trim() || 'Page';
    };

    // Close user menu on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
        };

        if (showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showUserMenu]);

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <>
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 sm:px-6 h-16 flex items-center shadow-sm">
                <div className="flex items-center justify-between w-full gap-4">
                    {/* Left side - Toggle and Title */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Sidebar Toggle Button */}
                        <button
                            onClick={onToggleSidebar}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                            title="Toggle sidebar"
                            aria-label="Toggle navigation"
                        >
                            <Menu size={20} />
                        </button>

                        {/* Page Title */}
                        <div className="flex items-center gap-2 min-w-0">
                            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 whitespace-nowrap">
                                {getPageTitle()}
                            </h1>
                        </div>
                    </div>

                    {/* Right side - Search, Notifications, User Menu */}
                    <div className="flex items-center gap-3 ml-auto flex-shrink-0">
                        {/* Mobile Search Button - Hidden on Users page */}
                        {!hideGlobalSearch && (
                            <button
                                onClick={() => setShowMobileSearch(true)}
                                className="block md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Search"
                            >
                                <Search size={18} />
                            </button>
                        )}

                        {/* Global Search - Hidden on Users page */}
                        {!hideGlobalSearch && (
                            <div className="relative hidden lg:block">
                                <SearchInput
                                    id="dashboard-header-search"
                                    onSearch={onSearch}
                                    searchTerm={externalSearchTerm}
                                    setSearchTerm={externalSetSearchTerm}
                                    placeholder="Search inventory…"
                                    width="w-64"
                                    size="md"
                                    showShortcut={false}
                                />
                            </div>
                        )}

                        {/* Compact Search for Tablet - Hidden on Users page */}
                        {!hideGlobalSearch && (
                            <div className="relative hidden md:block lg:hidden">
                                <SearchInput
                                    id="dashboard-header-search-tablet"
                                    onSearch={onSearch}
                                    searchTerm={externalSearchTerm}
                                    setSearchTerm={externalSetSearchTerm}
                                    placeholder="Search inventory…"
                                    width="w-48"
                                    size="sm"
                                />
                            </div>
                        )}

                        {/* Notification Bell */}
                        <div className="relative">
                            <NotificationBell user={user} />
                        </div>

                        {/* User Menu */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                                aria-expanded={showUserMenu}
                                aria-haspopup="true"
                                aria-label="Account menu"
                            >
                                {/* User Avatar with Initials */}
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-700">
                                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                                </div>
                                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                    {user?.name?.split(' ')[0] || 'User'}
                                </span>
                                <ChevronDown 
                                    size={16} 
                                    className={`text-gray-500 transition-transform duration-150 hidden sm:block ${showUserMenu ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* User Dropdown Menu */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                    <div className="py-2">
                                        {/* User Info Header */}
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold text-gray-700">
                                                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-medium text-gray-900 truncate">
                                                        {user?.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 truncate">
                                                        {user?.email}
                                                    </div>
                                                    <div className="text-xs text-gray-400 capitalize">
                                                        {user?.role?.role_name || 'Staff'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* User Management - Admin Only */}
                                        {user?.role?.role_name === 'Admin' && (
                                            <div className="border-b border-gray-100 pb-2">
                                                <Link
                                                    href="/users"
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors block"
                                                >
                                                    <Users size={16} className="text-gray-500" />
                                                    User Management
                                                </Link>
                                            </div>
                                        )}

                                        {/* Logout */}
                                        <div className="pt-2">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 font-medium transition-colors"
                                            >
                                                <LogOut size={16} className="text-red-500" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Search Overlay - Hidden on Users page */}
            {!hideGlobalSearch && showMobileSearch && (
                <div className="fixed inset-0 bg-white z-50 md:hidden">
                    <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                        <button
                            onClick={() => setShowMobileSearch(false)}
                            className="p-2 text-gray-600 hover:text-gray-900"
                            aria-label="Close search"
                        >
                            ✕
                        </button>
                        <SearchInput
                            onSearch={onSearch}
                            searchTerm={externalSearchTerm}
                            setSearchTerm={externalSetSearchTerm}
                            placeholder="Search inventory…"
                            className="flex-1"
                            width=""
                            size="lg"
                            autoFocus={true}
                            onEscape={() => setShowMobileSearch(false)}
                        />
                    </div>
                    <div className="p-4">
                        <p className="text-sm text-gray-500 text-center">
                            Start typing to search…
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
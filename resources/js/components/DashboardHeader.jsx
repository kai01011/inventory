import { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, LogOut, Calendar, Menu, User, Search, Users } from 'lucide-react';
import { router } from '@inertiajs/react';
import NotificationBell from './NotificationBell';
import SearchInput from './SearchInput';
import { getCurrentTime, getTimeBasedGreeting } from '@/utils/dateUtils';

export default function DashboardHeader({ user, onSearch, searchTerm: externalSearchTerm, setSearchTerm: externalSetSearchTerm }) {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const userMenuRef = useRef(null);

    // Get current time and date using corrected date utility
    const currentTime = getCurrentTime();
    const currentHour = currentTime.hour;
    const currentDate = currentTime.longDate;

    // Dynamic greeting based on time
    const getGreeting = () => getTimeBasedGreeting();

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
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                    {/* Left side - Greeting Section */}
                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                                {getGreeting()}, {user?.name?.split(' ')[0] || 'Staff'} ??
                            </h1>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 hidden sm:block">
                            Here's your inventory overview for today.
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-xs text-gray-500">{currentDate}</span>
                        </div>
                    </div>

                    {/* Right side - Search, Notifications, User Menu */}
                    <div className="flex items-center gap-2 sm:gap-4 ml-4">
                        {/* Mobile Search Button */}
                        <button
                            onClick={() => setShowMobileSearch(true)}
                            className="block md:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <Search size={18} />
                        </button>

                        {/* Global Search - Hidden on mobile */}
                        <div className="relative hidden lg:block">
                            <SearchInput
                                id="dashboard-header-search"
                                onSearch={onSearch}
                                searchTerm={externalSearchTerm}
                                setSearchTerm={externalSetSearchTerm}
                                placeholder="Search products, suppliers, categories..."
                                width="w-80"
                                size="md"
                                showShortcut={true}
                            />
                        </div>

                        {/* Compact Search for Tablet */}
                        <div className="relative hidden md:block lg:hidden">
                            <SearchInput
                                id="dashboard-header-search-tablet"
                                onSearch={onSearch}
                                searchTerm={externalSearchTerm}
                                setSearchTerm={externalSetSearchTerm}
                                placeholder="Search..."
                                width="w-48"
                                size="md"
                            />
                        </div>

                        {/* Notification Bell */}
                        <div className="relative">
                            <NotificationBell user={user} />
                        </div>

                        {/* User Menu */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                                aria-expanded={showUserMenu}
                                aria-haspopup="true"
                            >
                                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User size={16} className="text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                    {user?.name?.split(' ')[0] || 'Staff'}
                                </span>
                                <ChevronDown 
                                    size={16} 
                                    className={`text-gray-400 transition-transform duration-150 hidden sm:block ${showUserMenu ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* User Dropdown Menu */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                    <div className="py-2">
                                        {/* User Info Header */}
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <User size={18} className="text-white" />
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
                                                <button
                                                    onClick={() => router.visit('/users')}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                                                >
                                                    <Users size={16} className="text-gray-500" />
                                                    User Management
                                                </button>
                                            </div>
                                        )}

                                        {/* Logout */}
                                        <div className="pt-2">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 font-medium"
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

            {/* Mobile Search Overlay */}
            {showMobileSearch && (
                <div className="fixed inset-0 bg-white z-50 md:hidden">
                    <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                        <button
                            onClick={() => setShowMobileSearch(false)}
                            className="p-2 text-gray-600 hover:text-gray-800"
                        >
                            ?
                        </button>
                        <SearchInput
                            onSearch={onSearch}
                            searchTerm={externalSearchTerm}
                            setSearchTerm={externalSetSearchTerm}
                            placeholder="Search products, suppliers, categories..."
                            className="flex-1"
                            width=""
                            size="lg"
                            autoFocus={true}
                            onEscape={() => setShowMobileSearch(false)}
                        />
                    </div>
                    <div className="p-4">
                        <p className="text-sm text-gray-500 text-center">
                            Start typing to search inventory...
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
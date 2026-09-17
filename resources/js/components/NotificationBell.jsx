import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, PackageSearch, PackageMinus, CheckCheck, Inbox } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { formatDateShort } from '@/utils/dateUtils';

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDateShort(date);
}

function NotificationIcon({ type }) {
  if (type === 'stock_in_request') {
    return (
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
        <PackageSearch size={16} className="text-blue-600" />
      </div>
    );
  }
  if (type === 'stock_out_request') {
    return (
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
        <PackageMinus size={16} className="text-orange-600" />
      </div>
    );
  }
  if (type === 'stock_in_approved' || type === 'stock_out_approved') {
    return (
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCheck size={16} className="text-green-600" />
      </div>
    );
  }
  if (type === 'stock_in_rejected' || type === 'stock_out_rejected') {
    return (
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
        <X size={16} className="text-red-600" />
      </div>
    );
  }
  return (
    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
      <Bell size={16} className="text-gray-500" />
    </div>
  );
}

export default function NotificationBell({ user }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const pollInterval = useRef(null);

  const csrf = useCallback(() =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'), []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/notifications/unread-count');
      const data = await res.json();
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/notifications/recent?limit=10');
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally { 
      setLoading(false); 
    }
  }, []);

  // Initialize polling on mount
  useEffect(() => {
    fetchUnreadCount();
    
    // Poll every 2 seconds for faster updates
    pollInterval.current = setInterval(() => {
      fetchUnreadCount();
      if (open) {
        fetchNotifications();
      }
    }, 2000);

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [open, fetchUnreadCount, fetchNotifications]);

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleOpen = useCallback(() => {
    if (!open) {
      fetchNotifications();
    }
    setOpen(v => !v);
  }, [open, fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    try {
      await fetch(`/notifications/${id}/read`, {
        method: 'POST',
        headers: { 
          'X-CSRF-TOKEN': csrf(), 
          'Content-Type': 'application/json' 
        },
      });
      // Update UI immediately without waiting for fetch
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, [csrf]);

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch('/notifications/mark-all-read', {
        method: 'POST',
        headers: { 
          'X-CSRF-TOKEN': csrf(), 
          'Content-Type': 'application/json' 
        },
      });
      // Update UI immediately
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [csrf]);

  const handleNotificationClick = useCallback((notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setOpen(false);
    
    const stockTypes = ['stock_in_request', 'stock_in_approved', 'stock_in_rejected'];
    if (stockTypes.includes(notification.type)) {
      window.location.href = `/stock-in?highlight=${notification.related_id}`;
    } else {
      window.location.href = `/stock-out?highlight=${notification.related_id}`;
    }
  }, [markAsRead]);

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold px-0.5 leading-none animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">

          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium px-2 py-0.5 rounded hover:bg-blue-50 transition-colors"
                >
                  <CheckCheck size={12} /> All read
                </button>
              )}
              <button 
                onClick={() => setOpen(false)} 
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-6 gap-2">
                <div className="w-4 h-4 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin" />
                <p className="text-[11px] text-gray-400">Loading...</p>
              </div>
            ) : notifications.length > 0 ? (
              <div>
                {notifications.map((n, idx) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`
                      relative flex items-start gap-3 px-4 py-3 cursor-pointer
                      transition-colors duration-150 group
                      ${!n.read ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-gray-50'}
                      ${idx !== 0 ? 'border-t border-gray-100' : ''}
                    `}
                  >
                    {!n.read && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    )}

                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${
                      n.type === 'stock_in_request' ? 'bg-blue-100' : 
                      n.type === 'stock_out_request' ? 'bg-orange-100' : 
                      n.type === 'stock_in_approved' ? 'bg-green-100' :
                      n.type === 'stock_out_approved' ? 'bg-green-100' :
                      n.type === 'stock_in_rejected' ? 'bg-red-100' :
                      n.type === 'stock_out_rejected' ? 'bg-red-100' :
                      'bg-gray-100'
                    }`}>
                      {n.type === 'stock_in_request' && <PackageSearch size={14} className="text-blue-600" />}
                      {n.type === 'stock_out_request' && <PackageMinus size={14} className="text-orange-600" />}
                      {n.type === 'stock_in_approved' && <CheckCheck size={14} className="text-green-600" />}
                      {n.type === 'stock_out_approved' && <CheckCheck size={14} className="text-green-600" />}
                      {n.type === 'stock_in_rejected' && <X size={14} className="text-red-600" />}
                      {n.type === 'stock_out_rejected' && <X size={14} className="text-red-600" />}
                      {!['stock_in_request', 'stock_out_request', 'stock_in_approved', 'stock_out_approved', 'stock_in_rejected', 'stock_out_rejected'].includes(n.type) && <Bell size={14} className="text-gray-500" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-[12px] leading-snug truncate ${!n.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {n.title}
                        </p>
                        <span className="flex-shrink-0 text-[11px] text-gray-400 mt-px">
                          {timeAgo(n.created_at)}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                        {n.message}
                      </p>
                    </div>

                    {!n.read && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-blue-100 text-blue-500 transition-all"
                        title="Mark as read"
                      >
                        <CheckCheck size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Inbox size={17} className="text-gray-400" />
                </div>
                <p className="text-[11px] text-gray-400">No notifications yet</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
              <p className="text-[11px] text-gray-400 text-center">
                {notifications.length} most recent
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


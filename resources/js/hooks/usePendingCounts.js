import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export function usePendingCounts() {
    const { auth } = usePage().props;
    const [pendingCounts, setPendingCounts] = useState({
        stockIn: 0,
        stockOut: 0
    });

    const fetchPendingCounts = async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            
            const response = await fetch('/api/pending-counts', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken && {'X-CSRF-TOKEN': csrfToken})
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setPendingCounts(data);
            } else {
                console.warn('Failed to fetch pending counts:', response.status);
            }
        } catch (error) {
            console.error('Failed to fetch pending counts:', error);
        }
    };

    useEffect(() => {
        if (auth?.user) {
            fetchPendingCounts();
            
            let interval;

            // Page visibility API: pause refresh when tab is hidden
            const handleVisibilityChange = () => {
                if (document.hidden) {
                    if (interval) clearInterval(interval);
                } else {
                    // Resume refresh when tab becomes visible
                    interval = setInterval(fetchPendingCounts, 60000); // 60 seconds (reduced from 30s)
                }
            };

            // Start initial interval only if tab is visible
            if (!document.hidden) {
                interval = setInterval(fetchPendingCounts, 60000); // 60 seconds
            }

            document.addEventListener('visibilitychange', handleVisibilityChange);
            
            // Listen for custom events to refresh immediately
            const handleRefreshCounts = () => {
                fetchPendingCounts();
            };
            
            window.addEventListener('refreshPendingCounts', handleRefreshCounts);
            
            return () => {
                if (interval) clearInterval(interval);
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                window.removeEventListener('refreshPendingCounts', handleRefreshCounts);
            };
        }
    }, [auth?.user?.id]);

    // Return both counts and refresh function for manual triggering
    return { 
        ...pendingCounts, 
        refresh: fetchPendingCounts 
    };
}
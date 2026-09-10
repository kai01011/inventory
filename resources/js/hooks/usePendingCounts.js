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
            
            // Refresh counts every 30 seconds
            const interval = setInterval(fetchPendingCounts, 30000);
            
            // Listen for custom events to refresh immediately
            const handleRefreshCounts = () => {
                fetchPendingCounts();
            };
            
            window.addEventListener('refreshPendingCounts', handleRefreshCounts);
            
            return () => {
                clearInterval(interval);
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
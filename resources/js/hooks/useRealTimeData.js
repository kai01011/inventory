import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Real-time data fetching hook with automatic polling
 * @param {string} endpoint - API endpoint to fetch from
 * @param {number} interval - Polling interval in milliseconds (default: 3000ms)
 * @param {boolean} enabled - Whether to enable polling (default: true)
 * @returns {object} { data, loading, error, refetch }
 */
export function useRealTimeData(endpoint, interval = 3000, enabled = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollInterval = useRef(null);

  const fetchData = useCallback(async () => {
    if (!endpoint || !enabled) return;

    try {
      setLoading(true);
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch real-time data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint, enabled]);

  // Initial fetch and setup polling
  useEffect(() => {
    if (!enabled) return;

    // Fetch immediately on mount
    fetchData();

    // Setup polling interval
    if (interval > 0) {
      pollInterval.current = setInterval(fetchData, interval);
    }

    // Cleanup
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [endpoint, interval, enabled, fetchData]);

  return { data, loading, error, refetch: fetchData };
}

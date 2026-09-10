import { useState, useEffect } from 'react';

/**
 * Shared search hook that provides consistent search functionality across all components
 * Based on the DashboardHeader search implementation
 */
export function useSearch(onSearch, externalSearchTerm, externalSetSearchTerm) {
    const [searchTerm, setSearchTerm] = useState(externalSearchTerm || '');

    // Sync with external search term when it changes
    useEffect(() => {
        if (externalSearchTerm !== undefined && externalSearchTerm !== searchTerm) {
            setSearchTerm(externalSearchTerm);
        }
    }, [externalSearchTerm]);

    // Handle search with debouncing - same as DashboardHeader
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onSearch) {
                onSearch(searchTerm);
            }
            // Also update external state if provided
            if (externalSetSearchTerm && searchTerm !== externalSearchTerm) {
                externalSetSearchTerm(searchTerm);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, onSearch, externalSetSearchTerm, externalSearchTerm]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
        if (e.key === 'Escape') {
            setSearchTerm('');
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
        if (externalSetSearchTerm) {
            externalSetSearchTerm('');
        }
    };

    return {
        searchTerm,
        setSearchTerm,
        handleSearchChange,
        handleKeyPress,
        clearSearch
    };
}

/**
 * Global keyboard shortcut handler for search inputs
 * Use this to enable Ctrl/Cmd+K shortcuts
 */
export function useSearchKeyboardShortcuts(inputId, enabled = true) {
    useEffect(() => {
        if (!enabled) return;

        const handleGlobalKeyPress = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const input = document.getElementById(inputId);
                if (input) {
                    input.focus();
                }
            }
        };

        document.addEventListener('keydown', handleGlobalKeyPress);
        return () => document.removeEventListener('keydown', handleGlobalKeyPress);
    }, [inputId, enabled]);
}
import { Search } from 'lucide-react';
import { useSearch, useSearchKeyboardShortcuts } from '@/hooks/useSearch';

/**
 * Standardized search input component with consistent styling and functionality
 * Used across all pages and components for unified search experience
 */
export default function SearchInput({ 
    onSearch, 
    searchTerm: externalSearchTerm, 
    setSearchTerm: externalSetSearchTerm,
    placeholder = "Search...",
    className = "",
    id = "search-input",
    showShortcut = false,
    width = "w-56",
    size = "md", // "sm", "md", "lg"
    autoFocus = false,
    onEscape = null // Optional callback for escape key
}) {
    const { searchTerm, handleSearchChange, handleKeyPress, clearSearch } = useSearch(
        onSearch, 
        externalSearchTerm, 
        externalSetSearchTerm
    );
    
    useSearchKeyboardShortcuts(id);

    // Handle key press with optional escape callback
    const handleKeyPressWithEscape = (e) => {
        handleKeyPress(e);
        if (e.key === 'Escape' && onEscape) {
            onEscape();
        }
    };

    // Size variants
    const sizeClasses = {
        sm: "h-8 text-xs pl-8 pr-3",
        md: "h-9 text-sm pl-9 pr-4", 
        lg: "h-10 text-sm pl-10 pr-4"
    };

    const iconSizes = {
        sm: 14,
        md: 16,
        lg: 18
    };

    const iconPositions = {
        sm: "left-2.5 top-1/2 -translate-y-1/2",
        md: "left-3 top-1/2 -translate-y-1/2",
        lg: "left-3.5 top-1/2 -translate-y-1/2"
    };

    return (
        <div className={`relative ${width} ${className}`}>
            <Search 
                size={iconSizes[size]} 
                className={`absolute ${iconPositions[size]} text-gray-400 pointer-events-none`} 
            />
            <input
                id={id}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyPress={onEscape ? handleKeyPressWithEscape : handleKeyPress}
                placeholder={placeholder}
                autoComplete="off"
                autoFocus={autoFocus}
                className={`
                    ${width ? width : className.includes('flex-') ? 'w-full' : 'w-full'} 
                    ${sizeClasses[size]}
                    border border-gray-300 bg-white text-gray-900 rounded-lg 
                    placeholder-gray-400 focus:outline-none focus:ring-2 
                    focus:ring-red-500 focus:border-red-500 transition
                `}
            />
            {showShortcut && !searchTerm && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <kbd className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </div>
            )}
            {searchTerm && (
                <button
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Clear search"
                >
                    ✕
                </button>
            )}
        </div>
    );
}
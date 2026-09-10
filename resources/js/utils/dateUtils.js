/**
 * Date utility functions to handle date display and formatting
 * Displays database timestamps exactly as they are stored without timezone conversion
 */

/**
 * Format date for display exactly as stored in database
 * No timezone conversion applied - shows the literal database date/time
 */
export function formatDatePhilippines(date, options = {}) {
    if (!date) return '';
    
    const inputDate = new Date(date);
    
    // Get date components in local time (matches database storage)
    const year = inputDate.getFullYear();
    const month = inputDate.toLocaleDateString('en-US', { month: 'long' });
    const day = inputDate.getDate();
    const hours = inputDate.getHours();
    const minutes = inputDate.getMinutes().toString().padStart(2, '0');
    
    // Convert to 12-hour format with AM/PM
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    return `${month} ${day}, ${year} ${displayHours}:${minutes} ${period}`;
}

/**
 * Format date for display (short format) - exact database date
 */
export function formatDateShort(date) {
    if (!date) return '';
    
    const inputDate = new Date(date);
    
    // Get date components without timezone conversion
    const year = inputDate.getFullYear();
    const month = inputDate.toLocaleDateString('en-US', { month: 'short' });
    const day = inputDate.getDate();
    
    return `${month} ${day}, ${year}`;
}

/**
 * Format date for display (long format with day) - exact database date
 */
export function formatDateLong(date) {
    if (!date) return '';
    
    const inputDate = new Date(date);
    
    // Get date components without timezone conversion
    const weekday = inputDate.toLocaleDateString('en-US', { weekday: 'long' });
    const year = inputDate.getFullYear();
    const month = inputDate.toLocaleDateString('en-US', { month: 'long' });
    const day = inputDate.getDate();
    
    return `${weekday}, ${month} ${day}, ${year}`;
}

/**
 * Format time for display - exact database time with AM/PM
 */
export function formatTimePhilippines(date, options = {}) {
    if (!date) return '';
    
    const inputDate = new Date(date);
    
    // Get time components without timezone conversion
    const hours = inputDate.getHours();
    const minutes = inputDate.getMinutes().toString().padStart(2, '0');
    
    // Convert to 12-hour format with AM/PM
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    return `${displayHours}:${minutes} ${period}`;
}

/**
 * Get current time with proper timezone (for UI elements like greetings)
 * This uses actual system time for real-time UI elements
 */
export function getCurrentTime() {
    const now = new Date();
    
    return {
        date: now,
        hour: now.getHours(),
        formatted: formatDatePhilippines(now),
        shortDate: formatDateShort(now),
        longDate: formatDateLong(now)
    };
}

/**
 * Get greeting based on current time
 */
export function getTimeBasedGreeting() {
    const { hour } = getCurrentTime();
    
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

/**
 * Legacy function for backwards compatibility
 * Just returns the input date without correction
 */
export function getCorrectedDate(date = null) {
    return date ? new Date(date) : new Date();
}

/**
 * Format date and time on a single line for table displays
 * Example: "Aug 17, 2026 7:47 AM"
 */
export function formatDateTimeSingleLine(date) {
    if (!date) return '';
    
    const inputDate = new Date(date);
    
    // Get date components
    const year = inputDate.getFullYear();
    const month = inputDate.toLocaleDateString('en-US', { month: 'short' });
    const day = inputDate.getDate();
    
    // Get time components with AM/PM
    const hours = inputDate.getHours();
    const minutes = inputDate.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    return `${month} ${day}, ${year} ${displayHours}:${minutes} ${period}`;
}
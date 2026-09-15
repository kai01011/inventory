import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { usePage } from '@inertiajs/react'

/**
 * Merge Tailwind CSS classes intelligently
 * Combines clsx with tailwind-merge to handle class conflicts
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Check if the page has errors
 * @param {string} field - Optional field name to check
 */
export function useErrors(field = null) {
  const { errors } = usePage().props
  
  if (!field) {
    return errors
  }
  
  return errors[field] ? errors[field] : null
}

/**
 * Get authenticated user
 * @returns {object} Current user object
 */
export function useAuth() {
  return usePage().props.auth?.user
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

/**
 * Format date
 * @param {string|Date} date - Date to format
 * @param {string} format - Format string (default: 'MMM dd, yyyy')
 */
export function formatDate(date, format = 'MMM dd, yyyy') {
  const d = new Date(date)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(d)
}


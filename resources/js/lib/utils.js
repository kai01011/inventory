import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { usePage, router } from '@inertiajs/react'
import { useEffect } from 'react'

/**
 * Merge Tailwind CSS classes intelligently
 * Combines clsx with tailwind-merge to handle class conflicts
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Access page props from Inertia
 * Provides easy access to auth, errors, flash messages, etc.
 */
export function usePageProps() {
  return usePage().props
}

/**
 * Navigate using Inertia
 * @param {string} url - The URL to navigate to
 * @param {object} options - Navigation options
 */
export function navigateTo(url, options = {}) {
  router.visit(url, {
    method: 'get',
    ...options
  })
}

/**
 * Submit form data via POST using Inertia
 * @param {string} url - The URL to submit to
 * @param {object} data - Form data to submit
 * @param {object} options - Additional options
 */
export function submitForm(url, data, options = {}) {
  router.post(url, data, {
    preserveScroll: true,
    ...options
  })
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
 * Get flash messages from server
 * @returns {object} Flash messages object
 */
export function useFlash() {
  return usePage().props.flash || {}
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

/**
 * Debounce a function
 * @param {function} func - Function to debounce
 * @param {number} wait - Debounce delay in ms
 */
export function debounce(func, wait = 300) {
  let timeout
  return function(...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Check if object is empty
 * @param {object} obj - Object to check
 */
export function isEmpty(obj) {
  return Object.keys(obj).length === 0
}

/**
 * Get query parameters from URL
 * @returns {object} Query parameters
 */
export function getQueryParams() {
  const params = new URLSearchParams(window.location.search)
  const obj = {}
  for (const [key, value] of params) {
    obj[key] = value
  }
  return obj
}


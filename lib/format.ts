/**
 * lib/format.ts
 * NEXUS Design System — formatting utilities for all numerical data.
 * All currency, quantity, date, and time values must use these functions.
 */

/**
 * Format a currency amount.
 * Output: "USD 84,250.00" or compact "USD 84.2k"
 */
export function formatCurrency(
  amount: number,
  currency: 'USD' | 'ZWG' = 'USD',
  options?: { compact?: boolean; decimals?: number }
): string {
  if (options?.compact && Math.abs(amount) >= 1_000) {
    const val = (amount / 1_000).toFixed(1)
    return `${currency} ${val}k`
  }
  const decimals = options?.decimals ?? 2
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
  return `${currency} ${formatted}`
}

/**
 * Format a quantity with optional unit.
 * Output: "2,000 pcs" | "480 m"
 */
export function formatQuantity(n: number, unit?: string): string {
  const formatted = new Intl.NumberFormat('en-US').format(n)
  return unit ? `${formatted} ${unit}` : formatted
}

/**
 * Format a date string.
 * Output: "17 Mar 2026"
 */
export function formatDate(isoOrDate: string | Date): string {
  const date = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate
  return new Intl.DateTimeFormat('en-GB', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  }).format(date)
}

/**
 * Format a date + time string.
 * Output: "17 Mar 2026, 14:30"
 */
export function formatDateTime(isoOrDate: string | Date): string {
  const date = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate
  return new Intl.DateTimeFormat('en-GB', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

/**
 * Format a date as a relative string.
 * Output: "2 hours ago" | "3 days ago" | "just now"
 */
export function formatRelative(isoOrDate: string | Date): string {
  const date = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate
  const diffMs  = Date.now() - date.getTime()
  const diffSec = Math.floor(diffMs / 1_000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr  = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr  / 24)

  if (diffSec < 60)  return 'just now'
  if (diffMin < 60)  return `${diffMin}m ago`
  if (diffHr  < 24)  return `${diffHr}h ago`
  if (diffDay < 7)   return `${diffDay}d ago`
  return formatDate(date)
}

/**
 * Format a percentage.
 * Output: "84.5%"
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format a file size in human-readable form.
 * Output: "1.4 MB" | "840 KB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024)         return `${bytes} B`
  if (bytes < 1_048_576)   return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(1)} MB`
  return `${(bytes / 1_073_741_824).toFixed(2)} GB`
}

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'

// ─── Class name utility ───────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Currency ────────────────────────────────────────────────────────────────
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  compact: boolean = false
): string {
  if (compact && Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`
  }
  if (compact && Math.abs(amount) >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format a ZWG amount as "ZWG X,XXX.XX" — no dollar sign, always 2 dp. */
export function formatZWG(amount: number, compact = false): string {
  if (compact && Math.abs(amount) >= 1_000_000) {
    return `ZWG ${(amount / 1_000_000).toFixed(1)}M`
  }
  if (compact && Math.abs(amount) >= 1_000) {
    return `ZWG ${(amount / 1_000).toFixed(1)}K`
  }
  return `ZWG ${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`
}

// ─── Numbers ─────────────────────────────────────────────────────────────────
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

// ─── Dates ───────────────────────────────────────────────────────────────────
export function formatDate(dateStr: string, fmt: string = 'dd MMM yyyy'): string {
  try { return format(parseISO(dateStr), fmt) } catch { return dateStr }
}

export function formatRelative(dateStr: string): string {
  try { return formatDistanceToNow(parseISO(dateStr), { addSuffix: true }) } catch { return dateStr }
}

export function getDaysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ─── Deal stage ───────────────────────────────────────────────────────────────
export const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
}

export const STAGE_COLORS: Record<string, string> = {
  lead: 'bg-slate-100 text-slate-600',
  qualified: 'bg-blue-100 text-blue-700',
  proposal: 'bg-amber-100 text-amber-700',
  negotiation: 'bg-purple-100 text-purple-700',
  closed_won: 'bg-emerald-100 text-emerald-700',
  closed_lost: 'bg-red-100 text-red-600',
}

// ─── Status badges ────────────────────────────────────────────────────────────
export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-500',
  prospect: 'bg-blue-100 text-blue-700',
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-600',
  paid: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-red-100 text-red-600',
  partial: 'bg-amber-100 text-amber-700',
  draft: 'bg-slate-100 text-slate-500',
  submitted: 'bg-blue-100 text-blue-700',
  received: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-400',
}

// ─── Role labels ──────────────────────────────────────────────────────────────
export const ROLE_LABELS: Record<string, string> = {
  executive: 'Executive',
  admin: 'Administrator',
  sales_manager: 'Sales Manager',
  sales_rep: 'Sales Rep',
  hr_manager: 'HR Manager',
  accountant: 'Accountant',
  supply_chain_manager: 'Supply Chain Manager',
  supply_chain_staff: 'Supply Chain Staff',
}

// ─── Trend ───────────────────────────────────────────────────────────────────
export function getTrend(current: number, previous: number): {
  direction: 'up' | 'down' | 'flat'
  percent: number
} {
  if (previous === 0) return { direction: 'flat', percent: 0 }
  const pct = ((current - previous) / previous) * 100
  return {
    direction: pct > 0.5 ? 'up' : pct < -0.5 ? 'down' : 'flat',
    percent: Math.abs(pct),
  }
}

// ─── Initials ─────────────────────────────────────────────────────────────────
export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// ─── Debounce ────────────────────────────────────────────────────────────────
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

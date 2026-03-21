'use client'
// AStatusBadge — Standardised pill badges for accounting status values
import { cn } from '@/lib/utils'

type StatusKey =
  | 'overdue' | 'sent' | 'paid' | 'draft' | 'cancelled'
  | 'partial' | 'unpaid'
  | 'pending' | 'approved' | 'rejected'
  | 'posted' | 'processing' | 'payroll_approved' | 'payroll_paid'
  | string

const COLORS: Record<string, string> = {
  overdue:           'bg-red-100 text-red-700 border-red-200',
  unpaid:            'bg-blue-100 text-blue-700 border-blue-200',
  sent:              'bg-blue-100 text-blue-700 border-blue-200',
  partial:           'bg-amber-100 text-amber-700 border-amber-200',
  pending:           'bg-amber-100 text-amber-700 border-amber-200',
  draft:             'bg-slate-100 text-slate-500 border-slate-200',
  paid:              'bg-emerald-100 text-emerald-700 border-emerald-200',
  approved:          'bg-emerald-100 text-emerald-700 border-emerald-200',
  posted:            'bg-emerald-100 text-emerald-700 border-emerald-200',
  payroll_approved:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  payroll_paid:      'bg-slate-100 text-slate-600 border-slate-200',
  rejected:          'bg-red-100 text-red-700 border-red-200',
  cancelled:         'bg-slate-100 text-slate-400 border-slate-200',
  processing:        'bg-purple-100 text-purple-700 border-purple-200',
}

const LABELS: Record<string, string> = {
  payroll_approved: 'Approved',
  payroll_paid: 'Paid',
  unpaid: 'Unpaid',
}

interface AStatusBadgeProps {
  status: StatusKey
  className?: string
}

export default function AStatusBadge({ status, className }: AStatusBadgeProps) {
  const color = COLORS[status] ?? 'bg-slate-100 text-slate-500 border-slate-200'
  const label = LABELS[status] ?? status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', color, className)}>
      {label}
    </span>
  )
}

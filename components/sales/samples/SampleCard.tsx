'use client'

import { Package, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type Sample, type CheckoutRecord, type SampleRequest,
  getAvailableUnits, getCheckedOutUnits, isOverdue,
  CATEGORY_COLORS, COMPANY_COLORS, CONDITION_COLORS,
} from '@/lib/samples'

interface SampleCardProps {
  sample: Sample
  checkouts: CheckoutRecord[]
  requests: SampleRequest[]
  canManage: boolean
  onSelect: (s: Sample) => void
  onCheckOut: (s: Sample) => void
  onRequest: (s: Sample) => void
}

export default function SampleCard({
  sample, checkouts, requests, canManage, onSelect, onCheckOut, onRequest,
}: SampleCardProps) {
  const available = getAvailableUnits(sample, checkouts)
  const checkedOut = getCheckedOutUnits(sample.id, checkouts)
  const total = sample.total_units
  const activeCOs = checkouts.filter(c => c.sample_id === sample.id && c.status === 'checked_out')
  const hasTender = activeCOs.some(c => c.is_tender)
  const overdueCheckout = activeCOs.find(c => isOverdue(c))
  const pendingRequests = requests.filter(r => r.sample_id === sample.id && r.status === 'pending')

  const availColor =
    available === 0 ? 'text-red-600' :
    available < total ? 'text-amber-600' :
    'text-emerald-600'

  const dueDateStr = activeCOs.length > 0
    ? activeCOs.sort((a, b) => a.expected_return_date.localeCompare(b.expected_return_date))[0].expected_return_date
    : null

  return (
    <div
      className="card p-4 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow group"
      onClick={() => onSelect(sample)}
    >
      {/* Image / placeholder */}
      <div className="relative w-full aspect-[4/3] rounded-xl bg-surface-muted flex items-center justify-center overflow-hidden">
        <Package className="w-10 h-10 text-nexus-border" />
        {hasTender && (
          <span className="absolute top-2 left-2 badge bg-amber-400 text-white text-[10px] font-bold uppercase tracking-wide">
            TENDER
          </span>
        )}
        {sample.company && (
          <span className={cn('absolute top-2 right-2 badge text-[10px]', COMPANY_COLORS[sample.company])}>
            {sample.company}
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="space-y-1">
        <p className="font-mono text-[10px] text-nexus-muted">{sample.id}</p>
        <p className="font-semibold text-sm text-nexus-ink leading-snug group-hover:text-brand-600 transition-colors">
          {sample.name}
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          <span className={cn('badge text-[10px]', CATEGORY_COLORS[sample.category])}>{sample.category}</span>
          <span className={cn('badge text-[10px]', CONDITION_COLORS[sample.condition])}>{sample.condition}</span>
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-1">
        <p className={cn('text-sm font-semibold', availColor)}>
          {available} of {total} available
        </p>
        {available === 0 && dueDateStr && (
          <p className={cn('text-[11px]', overdueCheckout ? 'text-red-500 font-semibold' : 'text-nexus-muted')}>
            {overdueCheckout ? (
              <><AlertTriangle className="w-3 h-3 inline mr-1" />OVERDUE</>
            ) : (
              <>Due back: {new Date(dueDateStr).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short' })}</>
            )}
          </p>
        )}
        {pendingRequests.length > 0 && (
          <p className="text-[11px] text-amber-600">{pendingRequests.length} on waitlist</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => available > 0 ? onRequest(sample) : onRequest(sample)}
          className="btn-secondary btn-sm flex-1 text-xs"
          title={available === 0 ? 'All units checked out — join waitlist' : undefined}
        >
          {available === 0 ? 'Join Waitlist' : 'Request Sample'}
        </button>
        {canManage && available > 0 && (
          <button
            onClick={() => onCheckOut(sample)}
            className="btn-primary btn-sm flex-1 text-xs"
          >
            Check Out
          </button>
        )}
      </div>
    </div>
  )
}

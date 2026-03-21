'use client'

import { useState } from 'react'
import { Search, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type CheckoutRecord, type Sample, type SampleRequest,
  isOverdue, daysRemaining, daysRemainingColor,
  CONDITION_COLORS,
} from '@/lib/samples'

function fmtDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' })
}

type CheckoutFilter = 'all' | 'checked_out' | 'overdue' | 'returned' | 'lost'

// ─── Checkouts View ───────────────────────────────────────────────────────────
export function CheckoutsView({
  checkouts, samples, canSeeAll, currentUserId, currentUserName,
  onReturn, onMarkLost, onLogVisit, canManage,
}: {
  checkouts: CheckoutRecord[]
  samples: Sample[]
  canSeeAll: boolean
  currentUserId: string
  currentUserName: string
  onReturn: (c: CheckoutRecord) => void
  onMarkLost: (c: CheckoutRecord) => void
  onLogVisit: (c: CheckoutRecord) => void
  canManage: boolean
}) {
  const [filter, setFilter] = useState<CheckoutFilter>('all')
  const [myOnly, setMyOnly] = useState(!canSeeAll)
  const [search, setSearch] = useState('')

  const base = myOnly
    ? checkouts.filter(c => c.checked_out_by_id === currentUserId)
    : checkouts

  const filtered = base.filter(c => {
    const over = isOverdue(c)
    if (filter === 'overdue') return over
    if (filter === 'checked_out') return c.status === 'checked_out' && !over
    if (filter === 'returned') return c.status === 'returned'
    if (filter === 'lost') return c.status === 'lost'
    return true
  }).filter(c => {
    if (!search) return true
    const s = samples.find(s => s.id === c.sample_id)
    return (
      c.checked_out_by.toLowerCase().includes(search.toLowerCase()) ||
      c.client_visited.toLowerCase().includes(search.toLowerCase()) ||
      s?.name.toLowerCase().includes(search.toLowerCase()) ||
      c.sample_id.toLowerCase().includes(search.toLowerCase())
    )
  })

  // Sort: overdue first, then by expected return asc
  const sorted = [...filtered].sort((a, b) => {
    const ao = isOverdue(a) ? 0 : 1
    const bo = isOverdue(b) ? 0 : 1
    if (ao !== bo) return ao - bo
    return a.expected_return_date.localeCompare(b.expected_return_date)
  })

  const FILTERS: { id: CheckoutFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'checked_out', label: 'Checked Out' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'returned', label: 'Returned' },
    { id: 'lost', label: 'Lost' },
  ]

  return (
    <div className="card">
      {/* Toolbar */}
      <div className="p-4 border-b border-nexus-border flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-light" />
          <input className="input pl-9" placeholder="Search checkouts…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {canSeeAll && (
          <label className="flex items-center gap-2 text-sm text-nexus-slate cursor-pointer">
            <input type="checkbox" checked={myOnly} onChange={e => setMyOnly(e.target.checked)} className="accent-brand-600" />
            My Checkouts only
          </label>
        )}
      </div>
      {/* Filter strip */}
      <div className="px-4 py-2 border-b border-nexus-border flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={cn('badge cursor-pointer transition-all', filter === f.id
              ? f.id === 'overdue' ? 'bg-red-500 text-white' : 'bg-brand-600 text-white'
              : 'bg-surface-muted text-nexus-slate hover:bg-surface border border-nexus-border'
            )}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="table-wrapper rounded-none border-0">
        <table className="table">
          <thead>
            <tr>
              <th>Sample</th>
              <th>Rep</th>
              <th className="w-10 text-center">Units</th>
              <th>Client</th>
              <th>Purpose</th>
              <th>Due</th>
              <th>Days</th>
              <th>Cond. Out</th>
              <th>Status</th>
              <th className="w-28"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-10 text-nexus-muted text-sm">No checkout records match your filters.</td></tr>
            ) : sorted.map(co => {
              const sample = samples.find(s => s.id === co.sample_id)
              const over = isOverdue(co)
              const days = daysRemaining(co)
              return (
                <tr key={co.checkout_id} className={cn('transition-colors', over && co.status === 'checked_out' ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-surface-muted')}>
                  <td>
                    <p className="font-mono text-[10px] text-nexus-muted">{co.sample_id}</p>
                    <p className="text-sm font-medium text-nexus-ink">{sample?.name ?? co.sample_id}</p>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-[9px] font-bold text-brand-700">
                        {co.checked_out_by.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm text-nexus-slate">{co.checked_out_by}</span>
                    </div>
                  </td>
                  <td className="text-center font-mono text-sm">{co.units_taken}</td>
                  <td className="text-sm text-nexus-slate max-w-[140px] truncate">{co.client_visited}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-nexus-slate">{co.purpose}</span>
                      {co.is_tender && <span className="badge bg-amber-100 text-amber-700 text-[9px]">TENDER</span>}
                    </div>
                  </td>
                  <td className="text-sm text-nexus-muted">{fmtDate(co.expected_return_date)}</td>
                  <td>
                    {co.status === 'checked_out' && (
                      <span className={cn('text-sm font-semibold', daysRemainingColor(days))}>
                        {over ? <><AlertTriangle className="w-3 h-3 inline mr-0.5" />{Math.abs(days)}d overdue</> : `${days}d`}
                      </span>
                    )}
                    {co.status !== 'checked_out' && <span className="text-nexus-muted text-sm">—</span>}
                  </td>
                  <td><span className={cn('badge text-[10px]', CONDITION_COLORS[co.condition_on_checkout])}>{co.condition_on_checkout}</span></td>
                  <td>
                    {co.status === 'checked_out' && over && (
                      <span className="badge bg-red-100 text-red-600 text-[10px]">OVERDUE</span>
                    )}
                    {co.status === 'checked_out' && !over && (
                      <span className="badge bg-amber-100 text-amber-700 text-[10px]">Out</span>
                    )}
                    {co.status === 'returned' && <span className="badge bg-emerald-100 text-emerald-700 text-[10px]">Returned</span>}
                    {co.status === 'lost' && <span className="badge bg-slate-100 text-slate-500 text-[10px]">Lost</span>}
                    {co.condition_flag && <span className="ml-1 badge bg-orange-100 text-orange-600 text-[9px]">⚠ Cond</span>}
                  </td>
                  <td>
                    {co.status === 'checked_out' && (
                      <div className="flex gap-1">
                        {canManage && (
                          <>
                            <button onClick={() => onReturn(co)} className="btn-secondary btn-sm text-xs">Return</button>
                            {over && <button onClick={() => onMarkLost(co)} className="btn-sm text-xs bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-semibold px-2">Lost</button>}
                          </>
                        )}
                        {(co.checked_out_by_id === currentUserId || canManage) && (
                          <button onClick={() => onLogVisit(co)} className="btn-icon rounded-lg text-xs" title="Log client visit">+</button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Requests View ────────────────────────────────────────────────────────────
export function RequestsView({
  requests, samples, canSeeAll, currentUserId,
  onCancel,
}: {
  requests: SampleRequest[]
  samples: Sample[]
  canSeeAll: boolean
  currentUserId: string
  onCancel: (r: SampleRequest) => void
}) {
  const [search, setSearch] = useState('')

  const base = canSeeAll ? requests : requests.filter(r => r.rep_id === currentUserId)

  const filtered = base.filter(r => {
    if (!search) return true
    const s = samples.find(s => s.id === r.sample_id)
    return (
      r.rep_name.toLowerCase().includes(search.toLowerCase()) ||
      r.client.toLowerCase().includes(search.toLowerCase()) ||
      s?.name.toLowerCase().includes(search.toLowerCase())
    )
  })

  // Sort: tender DESC, then by date ascending
  const sorted = [...filtered].sort((a, b) => {
    if (a.is_tender !== b.is_tender) return a.is_tender ? -1 : 1
    if (a.status !== b.status) {
      const order = { pending: 0, fulfilled: 1, cancelled: 2 }
      return order[a.status] - order[b.status]
    }
    return a.requested_on.localeCompare(b.requested_on)
  })

  // Compute position in queue per sample (pending only, tender-first)
  function getQueuePosition(req: SampleRequest): number {
    if (req.status !== 'pending') return -1
    const queue = requests
      .filter(r => r.sample_id === req.sample_id && r.status === 'pending')
      .sort((a, b) => {
        if (a.is_tender !== b.is_tender) return a.is_tender ? -1 : 1
        return a.requested_on.localeCompare(b.requested_on)
      })
    return queue.findIndex(r => r.request_id === req.request_id) + 1
  }

  return (
    <div className="card">
      <div className="p-4 border-b border-nexus-border">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-light" />
          <input className="input pl-9" placeholder="Search requests…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="table-wrapper rounded-none border-0">
        <table className="table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Rep</th>
              <th>Sample</th>
              <th className="w-10 text-center">Units</th>
              <th>Purpose</th>
              <th>Client</th>
              <th>Needed By</th>
              <th>Requested</th>
              <th>Queue</th>
              <th>Status</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={11} className="text-center py-10 text-nexus-muted text-sm">No requests found.</td></tr>
            ) : sorted.map(req => {
              const sample = samples.find(s => s.id === req.sample_id)
              const pos = getQueuePosition(req)
              return (
                <tr key={req.request_id} className={cn('transition-colors', req.is_tender && req.status === 'pending' ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-surface-muted')}>
                  <td className="font-mono text-xs text-brand-600 font-semibold">{req.request_id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-[9px] font-bold text-brand-700">
                        {req.rep_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm text-nexus-slate">{req.rep_name}</span>
                    </div>
                  </td>
                  <td>
                    <p className="font-mono text-[10px] text-nexus-muted">{req.sample_id}</p>
                    <p className="text-sm font-medium text-nexus-ink">{sample?.name ?? req.sample_id}</p>
                  </td>
                  <td className="text-center font-mono text-sm">{req.units_needed}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-nexus-slate">{req.purpose}</span>
                      {req.is_tender && <span className="badge bg-amber-100 text-amber-700 text-[9px]">TENDER</span>}
                    </div>
                  </td>
                  <td className="text-sm text-nexus-slate">{req.client}</td>
                  <td className="text-sm text-nexus-muted">{fmtDate(req.date_needed_by)}</td>
                  <td className="text-sm text-nexus-muted">{fmtDate(req.requested_on)}</td>
                  <td className="text-center">
                    {pos > 0 ? (
                      <span className={cn('font-mono text-sm font-bold', pos === 1 ? 'text-emerald-600' : 'text-nexus-slate')}>#{pos}</span>
                    ) : <span className="text-nexus-muted">—</span>}
                  </td>
                  <td>
                    {req.status === 'pending' && <span className="badge bg-amber-100 text-amber-700 text-[10px]">Pending</span>}
                    {req.status === 'fulfilled' && <span className="badge bg-emerald-100 text-emerald-700 text-[10px]">Fulfilled</span>}
                    {req.status === 'cancelled' && <span className="badge bg-slate-100 text-slate-400 text-[10px]">Cancelled</span>}
                  </td>
                  <td>
                    {req.status === 'pending' && (req.rep_id === currentUserId || canSeeAll) && (
                      <button onClick={() => onCancel(req)} className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">Cancel</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

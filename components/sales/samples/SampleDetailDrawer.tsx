'use client'

import { X, Package, Clock, AlertTriangle, ChevronDown, ChevronUp, Users, History } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  type Sample, type CheckoutRecord, type SampleRequest, type HistoryEntry,
  getAvailableUnits, isOverdue, daysRemaining, daysRemainingColor, getWaitlistQueue,
  CATEGORY_COLORS, COMPANY_COLORS, CONDITION_COLORS,
} from '@/lib/samples'

function fmtDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' })
}

type DrawerSection = 'details' | 'availability' | 'waitlist' | 'history'

interface Props {
  sample: Sample
  checkouts: CheckoutRecord[]
  requests: SampleRequest[]
  history: HistoryEntry[]
  canManage: boolean
  onClose: () => void
  onCheckOut: (s: Sample) => void
  onReturn: (c: CheckoutRecord) => void
  onMarkLost: (c: CheckoutRecord) => void
  onRetire: (s: Sample) => void
  onLogVisit: (c: CheckoutRecord) => void
}

export default function SampleDetailDrawer({
  sample, checkouts, requests, history, canManage,
  onClose, onCheckOut, onReturn, onMarkLost, onRetire, onLogVisit,
}: Props) {
  const [section, setSection] = useState<DrawerSection>('details')

  const activeCOs = checkouts.filter(c => c.sample_id === sample.id && c.status === 'checked_out')
  const allCOs = checkouts.filter(c => c.sample_id === sample.id)
  const available = getAvailableUnits(sample, checkouts)
  const waitlist = getWaitlistQueue(sample.id, requests)
  const sampleHistory = history.filter(h => h.sample_id === sample.id).sort((a, b) => b.date.localeCompare(a.date))

  const sections: { id: DrawerSection; label: string; count?: number }[] = [
    { id: 'details', label: 'Details' },
    { id: 'availability', label: 'Availability', count: activeCOs.length },
    { id: 'waitlist', label: 'Waitlist', count: waitlist.length },
    { id: 'history', label: 'History', count: sampleHistory.length },
  ]

  return (
    <>
      <motion.div className="fixed inset-0 bg-black/30 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.aside
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[520px] bg-surface border-l border-nexus-border shadow-lift flex flex-col"
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-nexus-border flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-nexus-muted" />
            </div>
            <div>
              <p className="font-mono text-[10px] text-nexus-muted">{sample.id}</p>
              <h2 className="font-display font-bold text-nexus-ink text-sm leading-snug">{sample.name}</h2>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className={cn('badge text-[10px]', CATEGORY_COLORS[sample.category])}>{sample.category}</span>
                <span className={cn('badge text-[10px]', COMPANY_COLORS[sample.company])}>{sample.company}</span>
                <span className={cn('badge text-[10px]', CONDITION_COLORS[sample.condition])}>{sample.condition}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon rounded-xl flex-shrink-0"><X className="w-4 h-4" /></button>
        </div>

        {/* Section tabs */}
        <div className="flex border-b border-nexus-border flex-shrink-0">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                'flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px',
                section === s.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-nexus-muted hover:text-nexus-ink'
              )}
            >
              {s.label}
              {s.count !== undefined && s.count > 0 && (
                <span className={cn('ml-1 badge text-[9px]', section === s.id ? 'bg-brand-50 text-brand-600' : 'bg-surface-muted text-nexus-muted')}>
                  {s.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ── DETAILS ── */}
          {section === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total Units', value: sample.total_units },
                  { label: 'Available', value: available },
                  { label: 'Status', value: sample.status },
                  { label: 'Added By', value: sample.added_by },
                  { label: 'Added Date', value: fmtDate(sample.added_date) },
                  { label: 'Company', value: sample.company },
                ].map(f => (
                  <div key={f.label} className="bg-surface-muted rounded-xl p-3">
                    <p className="text-[10px] text-nexus-muted uppercase font-semibold tracking-wide">{f.label}</p>
                    <p className="text-sm font-semibold text-nexus-ink mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>
              {sample.description && (
                <div className="bg-surface-muted rounded-xl p-3">
                  <p className="text-[10px] text-nexus-muted uppercase font-semibold tracking-wide mb-1">Description</p>
                  <p className="text-sm text-nexus-ink">{sample.description}</p>
                </div>
              )}
              {sample.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-[10px] text-amber-600 uppercase font-semibold tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-amber-800">{sample.notes}</p>
                </div>
              )}
              {canManage && sample.status === 'Active' && (
                <div className="flex gap-2 pt-2">
                  {available > 0 && (
                    <button onClick={() => onCheckOut(sample)} className="btn-primary btn-sm flex-1">Check Out</button>
                  )}
                  <button
                    onClick={() => onRetire(sample)}
                    className="btn-secondary btn-sm flex-1 text-nexus-muted"
                  >
                    Archive / Retire
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── AVAILABILITY ── */}
          {section === 'availability' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-emerald-600 uppercase font-semibold">Available</p>
                  <p className="text-2xl font-display font-bold text-emerald-700">{available}</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-amber-600 uppercase font-semibold">Checked Out</p>
                  <p className="text-2xl font-display font-bold text-amber-700">{sample.total_units - available}</p>
                </div>
              </div>

              {activeCOs.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-nexus-border mx-auto mb-2" />
                  <p className="text-sm text-nexus-muted">No active checkouts.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeCOs.map(co => {
                    const days = daysRemaining(co)
                    const overdue = isOverdue(co)
                    return (
                      <div key={co.checkout_id} className={cn('rounded-xl border p-4 space-y-2', overdue ? 'bg-red-50 border-red-200' : 'bg-surface-muted border-nexus-border')}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-[10px] font-bold text-brand-700">
                              {co.checked_out_by.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-semibold text-sm text-nexus-ink">{co.checked_out_by}</span>
                            {co.is_tender && <span className="badge bg-amber-100 text-amber-700 text-[9px]">TENDER</span>}
                            {overdue && <span className="badge bg-red-100 text-red-600 text-[9px]">OVERDUE</span>}
                          </div>
                          <span className="font-mono text-xs text-nexus-muted">{co.units_taken} unit{co.units_taken !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-nexus-muted">Client: </span><span className="text-nexus-ink font-medium">{co.client_visited}</span></div>
                          <div><span className="text-nexus-muted">Purpose: </span><span className="text-nexus-ink">{co.purpose}</span></div>
                          <div><span className="text-nexus-muted">Due: </span><span className="text-nexus-ink">{fmtDate(co.expected_return_date)}</span></div>
                          <div>
                            <span className="text-nexus-muted">Days left: </span>
                            <span className={cn('font-semibold', daysRemainingColor(days))}>
                              {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}
                            </span>
                          </div>
                        </div>
                        {co.additional_clients.length > 0 && (
                          <div className="text-xs">
                            <span className="text-nexus-muted">Chain of custody: </span>
                            <span className="text-nexus-ink">{co.additional_clients.map(v => v.client).join(' → ')}</span>
                          </div>
                        )}
                        {canManage && (
                          <div className="flex gap-2 pt-1">
                            <button onClick={() => onReturn(co)} className="btn-secondary btn-sm text-xs flex-1">Record Return</button>
                            {overdue && <button onClick={() => onMarkLost(co)} className="btn-sm text-xs flex-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-semibold">Mark Lost</button>}
                          </div>
                        )}
                        {!canManage && (
                          <button onClick={() => onLogVisit(co)} className="btn-secondary btn-sm text-xs w-full">Log Client Visit</button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── WAITLIST ── */}
          {section === 'waitlist' && (
            <div className="space-y-3">
              {waitlist.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-nexus-border mx-auto mb-2" />
                  <p className="text-sm text-nexus-muted">No pending waitlist requests.</p>
                </div>
              ) : waitlist.map((req, idx) => (
                <div key={req.request_id} className={cn('rounded-xl border p-4 space-y-2', req.is_tender ? 'bg-amber-50 border-amber-200' : 'bg-surface-muted border-nexus-border')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-nexus-border text-nexus-muted text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-sm text-nexus-ink">{req.rep_name}</span>
                      {req.is_tender && <span className="badge bg-amber-400 text-white text-[9px]">TENDER</span>}
                    </div>
                    <span className="text-xs text-nexus-muted">{fmtDate(req.requested_on)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-nexus-muted">Client: </span><span className="text-nexus-ink">{req.client}</span></div>
                    <div><span className="text-nexus-muted">Purpose: </span><span className="text-nexus-ink">{req.purpose}</span></div>
                    <div><span className="text-nexus-muted">Units: </span><span className="text-nexus-ink">{req.units_needed}</span></div>
                    <div><span className="text-nexus-muted">Needed by: </span><span className="text-nexus-ink">{fmtDate(req.date_needed_by)}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── HISTORY ── */}
          {section === 'history' && (
            <div className="space-y-0">
              {sampleHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-8 h-8 text-nexus-border mx-auto mb-2" />
                  <p className="text-sm text-nexus-muted">No history yet.</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-3.5 top-0 bottom-0 w-px bg-nexus-border" />
                  <div className="space-y-4">
                    {sampleHistory.map(entry => {
                      const dotColor =
                        entry.type === 'condition_flag' ? 'bg-amber-400' :
                        entry.type === 'returned' ? 'bg-emerald-400' :
                        entry.type === 'checked_out' ? 'bg-brand-500' :
                        entry.type === 'client_visit' ? 'bg-purple-400' :
                        'bg-nexus-border'
                      return (
                        <div key={entry.id} className="flex gap-4 pl-8 relative">
                          <div className={cn('absolute left-2.5 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-surface', dotColor)} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-nexus-ink leading-snug">{entry.description}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-nexus-muted">{fmtDate(entry.date)}</span>
                              <span className="text-[10px] text-nexus-muted">·</span>
                              <span className="text-[10px] text-nexus-muted">{entry.actor}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.aside>
    </>
  )
}

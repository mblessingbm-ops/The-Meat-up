'use client'

// ─── components/sales/SamplesTab.tsx ──────────────────────────────────────────
// Root orchestrator for the Sample Catalogue & Tracking System.
// Manages all state and delegates rendering to focused sub-components.

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Archive, Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  MOCK_SAMPLES, MOCK_CHECKOUTS, MOCK_REQUESTS, MOCK_HISTORY,
  getAvailableUnits, getCheckedOutUnits, isOverdue,
  CATEGORY_COLORS,
  type Sample, type CheckoutRecord, type SampleRequest,
  type SampleCategory, type SampleCondition, type CheckoutPurpose,
} from '@/lib/samples'
import SampleCard from './samples/SampleCard'
import SampleDetailDrawer from './samples/SampleDetailDrawer'
import {
  CheckOutModal, ReturnModal, RequestModal, LogVisitModal, AddSampleDrawer,
} from './samples/SampleModals'
import { CheckoutsView, RequestsView } from './samples/SampleViews'
import toast from 'react-hot-toast'

// ─── Role mock — swap to test ──────────────────────────────────────────────────
const CURRENT_USER = {
  id: 'lucia',
  name: 'Lucia Chiwanza',
  role: 'sales_manager' as 'executive' | 'sales_manager' | 'sales_rep' | 'data_capture',
}

type SubView = 'catalogue' | 'checkouts' | 'requests'
type CategoryFilter = SampleCategory | 'All'

const ALL_CATEGORIES: CategoryFilter[] = [
  'All', 'Garments', 'Caps', 'PPE & Workwear',
  'Bags & Accessories', 'Promotional Items', 'Fabric Swatches', 'Other',
]

function nextSampleId(samples: Sample[]): string {
  const year = new Date().getFullYear()
  const nums = samples.map(s => parseInt(s.id.split('-')[2] ?? '0'))
  const next = (Math.max(0, ...nums) + 1).toString().padStart(4, '0')
  return `SMP-${year}-${next}`
}

function nextCheckoutId(checkouts: CheckoutRecord[]): string {
  const year = new Date().getFullYear()
  const nums = checkouts.map(c => parseInt(c.checkout_id.split('-')[2] ?? '0'))
  const next = (Math.max(0, ...nums) + 1).toString().padStart(4, '0')
  return `CHK-${year}-${next}`
}

function nextRequestId(requests: SampleRequest[]): string {
  const year = new Date().getFullYear()
  const nums = requests.map(r => parseInt(r.request_id.split('-')[2] ?? '0'))
  const next = (Math.max(0, ...nums) + 1).toString().padStart(4, '0')
  return `REQ-${year}-${next}`
}

export default function SamplesTab() {
  const role = CURRENT_USER.role
  const canManage = role === 'executive' || role === 'sales_manager'
  const canSeeAll = canManage // reps see own only
  const isRep = role === 'sales_rep'

  // ── State ─────────────────────────────────────────────────────────────────
  const [samples, setSamples] = useState<Sample[]>(MOCK_SAMPLES)
  const [checkouts, setCheckouts] = useState<CheckoutRecord[]>(MOCK_CHECKOUTS)
  const [requests, setRequests] = useState<SampleRequest[]>(MOCK_REQUESTS)

  const [subView, setSubView] = useState<SubView>('catalogue')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All')
  const [search, setSearch] = useState('')
  const [showRetired, setShowRetired] = useState(false)

  // Drawer / modal state
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null)
  const [checkoutTarget, setCheckoutTarget] = useState<Sample | null>(null)
  const [returnTarget, setReturnTarget] = useState<CheckoutRecord | null>(null)
  const [requestTarget, setRequestTarget] = useState<Sample | null>(null)
  const [logVisitTarget, setLogVisitTarget] = useState<CheckoutRecord | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  // ── KPI counts ─────────────────────────────────────────────────────────────
  const activeSamples = samples.filter(s => s.status === 'Active')
  const totalSamples = activeSamples.length
  const availableNow = activeSamples.filter(s => getAvailableUnits(s, checkouts) > 0).length
  const checkedOutCount = checkouts.filter(c => c.status === 'checked_out').length
  const overdueCount = checkouts.filter(c => isOverdue(c)).length
  const pendingRequests = requests.filter(r => r.status === 'pending').length

  // ── Filtered catalogue ─────────────────────────────────────────────────────
  const filteredSamples = useMemo(() => {
    return samples.filter(s => {
      if (!showRetired && s.status === 'Retired') return false
      if (categoryFilter !== 'All' && s.category !== categoryFilter) return false
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) &&
          !s.id.toLowerCase().includes(search.toLowerCase()) &&
          !s.category.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [samples, categoryFilter, search, showRetired])

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleCheckOut(data: {
    rep_id: string; rep_name: string; units: number; client: string
    purpose: CheckoutPurpose; is_tender: boolean; expected_return: string
    condition: SampleCondition; notes: string
  }) {
    if (!checkoutTarget) return
    const id = nextCheckoutId(checkouts)
    const newCO: CheckoutRecord = {
      checkout_id: id,
      sample_id: checkoutTarget.id,
      units_taken: data.units,
      checked_out_by: data.rep_name,
      checked_out_by_id: data.rep_id,
      checkout_date: new Date().toISOString().slice(0, 10),
      expected_return_date: data.expected_return,
      client_visited: data.client,
      purpose: data.purpose,
      is_tender: data.is_tender,
      additional_clients: [],
      condition_on_checkout: data.condition,
      status: 'checked_out',
      notes: data.notes || undefined,
    }
    setCheckouts(prev => [...prev, newCO])
    // Fulfil any pending waitlist request for this rep
    setRequests(prev => prev.map(r =>
      r.sample_id === checkoutTarget.id && r.rep_id === data.rep_id && r.status === 'pending'
        ? { ...r, status: 'fulfilled' as const } : r
    ))
    setCheckoutTarget(null)
    if (selectedSample?.id === checkoutTarget.id) setSelectedSample(null)
  }

  function handleReturn(data: { units_returned: number; return_date: string; condition: SampleCondition; notes: string; mark_lost: boolean }) {
    if (!returnTarget) return
    const condFlag = data.condition !== returnTarget.condition_on_checkout &&
      ['Poor', 'Fair'].includes(data.condition)
    setCheckouts(prev => prev.map(c => {
      if (c.checkout_id !== returnTarget.checkout_id) return c
      const newStatus = data.units_returned >= c.units_taken ? 'returned' : 'checked_out'
      return {
        ...c,
        status: newStatus as CheckoutRecord['status'],
        condition_on_return: data.condition,
        returned_date: data.return_date,
        returned_by: CURRENT_USER.name,
        notes: data.notes || c.notes,
        condition_flag: condFlag,
      }
    }))
    if (data.mark_lost) {
      const lost = returnTarget.units_taken - data.units_returned
      setSamples(prev => prev.map(s =>
        s.id === returnTarget.sample_id ? { ...s, total_units: Math.max(0, s.total_units - lost) } : s
      ))
      toast.error(`${lost} unit(s) marked as lost.`)
    }
    if (condFlag) {
      toast(`${returnTarget.checked_out_by} returned in ${data.condition} condition (was ${returnTarget.condition_on_checkout}).`, { icon: '⚠️' })
    }
    // Notify first waitlist rep if now available
    const updatedAvail = getAvailableUnits(
      samples.find(s => s.id === returnTarget.sample_id)!,
      checkouts.map(c => c.checkout_id === returnTarget.checkout_id ? { ...c, status: 'returned' as const, units_taken: c.units_taken - data.units_returned } : c)
    ) + data.units_returned
    if (updatedAvail > 0) {
      const firstInQueue = requests
        .filter(r => r.sample_id === returnTarget.sample_id && r.status === 'pending')
        .sort((a, b) => {
          if (a.is_tender !== b.is_tender) return a.is_tender ? -1 : 1
          return a.requested_on.localeCompare(b.requested_on)
        })[0]
      if (firstInQueue) {
        const sName = samples.find(s => s.id === returnTarget.sample_id)?.name ?? returnTarget.sample_id
        toast.success(`${sName} is now available. ${firstInQueue.rep_name} has been notified.`)
      }
    }
    setReturnTarget(null)
  }

  function handleMarkLost(co: CheckoutRecord) {
    setCheckouts(prev => prev.map(c => c.checkout_id === co.checkout_id ? { ...c, status: 'lost' as const } : c))
    setSamples(prev => prev.map(s => s.id === co.sample_id ? { ...s, total_units: Math.max(0, s.total_units - co.units_taken) } : s))
    toast.error(`${co.units_taken} unit(s) of ${co.sample_id} marked as lost.`)
  }

  function handleRequest(data: { units: number; purpose: CheckoutPurpose; is_tender: boolean; client: string; date_needed: string; notes: string }) {
    if (!requestTarget) return
    const id = nextRequestId(requests)
    setRequests(prev => [...prev, {
      request_id: id,
      sample_id: requestTarget.id,
      rep_id: CURRENT_USER.id,
      rep_name: CURRENT_USER.name,
      units_needed: data.units,
      purpose: data.purpose,
      is_tender: data.is_tender,
      client: data.client,
      date_needed_by: data.date_needed,
      requested_on: new Date().toISOString().slice(0, 10),
      status: 'pending' as const,
      notes: data.notes || undefined,
    }])
    setRequestTarget(null)
  }

  function handleLogVisit(client: string, date: string, notes: string) {
    if (!logVisitTarget) return
    setCheckouts(prev => prev.map(c => {
      if (c.checkout_id !== logVisitTarget.checkout_id) return c
      return {
        ...c,
        additional_clients: [...c.additional_clients, {
          id: `cv-${Date.now()}`,
          client,
          visit_date: date,
          notes: notes || undefined,
        }],
      }
    }))
    setLogVisitTarget(null)
  }

  function handleCancelRequest(req: SampleRequest) {
    setRequests(prev => prev.map(r => r.request_id === req.request_id ? { ...r, status: 'cancelled' as const } : r))
    toast.success('Request cancelled.')
  }

  function handleRetire(s: Sample) {
    setSamples(prev => prev.map(x => x.id === s.id ? { ...x, status: 'Retired' as const } : x))
    setRequests(prev => prev.map(r => r.sample_id === s.id && r.status === 'pending' ? { ...r, status: 'cancelled' as const } : r))
    toast.success(`${s.name} has been retired.`)
    setSelectedSample(null)
  }

  function handleAddSample(data: { name: string; category: string; description: string; total_units: number; condition: SampleCondition; company: string; notes: string }) {
    const id = nextSampleId(samples)
    setSamples(prev => [...prev, {
      id,
      name: data.name,
      category: data.category as SampleCategory,
      description: data.description || undefined,
      total_units: data.total_units,
      condition: data.condition,
      company: data.company as any,
      added_by: CURRENT_USER.name,
      added_date: new Date().toISOString().slice(0, 10),
      status: 'Active' as const,
      notes: data.notes || undefined,
    }])
    setAddOpen(false)
  }

  // ── Sub-nav badge counts ───────────────────────────────────────────────────
  const subNavItems: { id: SubView; label: string; badge?: number; badgeColor?: string }[] = [
    { id: 'catalogue', label: 'Catalogue' },
    {
      id: 'checkouts', label: 'Checkouts',
      badge: overdueCount > 0 ? overdueCount : undefined,
      badgeColor: 'bg-red-100 text-red-600',
    },
    {
      id: 'requests', label: 'Requests',
      badge: pendingRequests > 0 ? pendingRequests : undefined,
      badgeColor: 'bg-amber-100 text-amber-700',
    },
  ]

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

      {/* Sub-navigation strip */}
      <div className="flex gap-1 border-b border-nexus-border">
        {subNavItems.map(item => (
          <button
            key={item.id}
            onClick={() => setSubView(item.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px whitespace-nowrap',
              subView === item.id
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-nexus-muted hover:text-nexus-slate'
            )}
          >
            {item.label}
            {item.badge && (
              <span className={cn('badge text-[10px] py-0 px-1.5 leading-4', item.badgeColor)}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── CATALOGUE VIEW ──────────────────────────────────────────────────── */}
      {subView === 'catalogue' && (
        <div className="space-y-5">
          {/* KPI strip */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Samples', value: totalSamples, color: 'text-brand-600' },
              { label: 'Available Now', value: availableNow, color: 'text-emerald-600' },
              { label: 'Checked Out', value: checkedOutCount, color: 'text-amber-600' },
              { label: 'Overdue', value: overdueCount, color: overdueCount > 0 ? 'text-red-600' : 'text-nexus-muted' },
              { label: 'Requests Pending', value: pendingRequests, color: pendingRequests > 0 ? 'text-amber-600' : 'text-nexus-muted' },
            ].map((kpi, i) => (
              <motion.div key={kpi.label} className="stat-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <p className="kpi-label">{kpi.label}</p>
                <p className={cn('kpi-value', kpi.color)}>{kpi.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-light" />
              <input className="input pl-9" placeholder="Search samples…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm text-nexus-slate cursor-pointer">
              <input type="checkbox" checked={showRetired} onChange={e => setShowRetired(e.target.checked)} className="accent-brand-600" />
              Show Retired
            </label>
            {canManage && (
              <button onClick={() => setAddOpen(true)} className="btn-primary btn-sm">
                <Plus className="w-3.5 h-3.5" /> Add Sample
              </button>
            )}
          </div>

          {/* Category filter chips */}
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  'badge cursor-pointer transition-all',
                  categoryFilter === cat
                    ? 'bg-brand-600 text-white'
                    : cat === 'All'
                    ? 'bg-surface-muted text-nexus-slate border border-nexus-border hover:bg-surface'
                    : cn(CATEGORY_COLORS[cat as SampleCategory], 'hover:opacity-80')
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sample grid */}
          {filteredSamples.length === 0 ? (
            <div className="card p-12 text-center">
              <Archive className="w-10 h-10 text-nexus-border mx-auto mb-3" />
              <p className="font-display font-bold text-nexus-ink mb-1">No samples found</p>
              <p className="text-sm text-nexus-muted">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSamples.map(sample => (
                <motion.div key={sample.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <SampleCard
                    sample={sample}
                    checkouts={checkouts}
                    requests={requests}
                    canManage={canManage}
                    onSelect={setSelectedSample}
                    onCheckOut={s => { setCheckoutTarget(s); setSelectedSample(null) }}
                    onRequest={s => { setRequestTarget(s); setSelectedSample(null) }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CHECKOUTS VIEW ──────────────────────────────────────────────────── */}
      {subView === 'checkouts' && (
        <CheckoutsView
          checkouts={checkouts}
          samples={samples}
          canSeeAll={canSeeAll}
          currentUserId={CURRENT_USER.id}
          currentUserName={CURRENT_USER.name}
          onReturn={setReturnTarget}
          onMarkLost={handleMarkLost}
          onLogVisit={setLogVisitTarget}
          canManage={canManage}
        />
      )}

      {/* ── REQUESTS VIEW ───────────────────────────────────────────────────── */}
      {subView === 'requests' && (
        <RequestsView
          requests={requests}
          samples={samples}
          canSeeAll={canSeeAll}
          currentUserId={CURRENT_USER.id}
          onCancel={handleCancelRequest}
        />
      )}

      {/* ── Drawers & Modals ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedSample && (
          <SampleDetailDrawer
            sample={selectedSample}
            checkouts={checkouts}
            requests={requests}
            history={MOCK_HISTORY}
            canManage={canManage}
            onClose={() => setSelectedSample(null)}
            onCheckOut={s => { setCheckoutTarget(s); setSelectedSample(null) }}
            onReturn={setReturnTarget}
            onMarkLost={handleMarkLost}
            onRetire={handleRetire}
            onLogVisit={setLogVisitTarget}
          />
        )}
      </AnimatePresence>

      {checkoutTarget && (
        <CheckOutModal
          sample={checkoutTarget}
          available={getAvailableUnits(checkoutTarget, checkouts)}
          onClose={() => setCheckoutTarget(null)}
          onConfirm={handleCheckOut}
        />
      )}

      {returnTarget && (
        <ReturnModal
          checkout={returnTarget}
          onClose={() => setReturnTarget(null)}
          onConfirm={handleReturn}
        />
      )}

      {requestTarget && (
        <RequestModal
          sample={requestTarget}
          currentUserId={CURRENT_USER.id}
          currentUserName={CURRENT_USER.name}
          onClose={() => setRequestTarget(null)}
          onConfirm={handleRequest}
        />
      )}

      {logVisitTarget && (
        <LogVisitModal
          checkout={logVisitTarget}
          currentUserId={CURRENT_USER.id}
          onClose={() => setLogVisitTarget(null)}
          onConfirm={handleLogVisit}
        />
      )}

      <AddSampleDrawer
        open={addOpen}
        currentUserName={CURRENT_USER.name}
        onClose={() => setAddOpen(false)}
        onSave={handleAddSample}
      />
    </motion.div>
  )
}

// ─── Named export for badge count (used in sales page.tsx) ────────────────────
export { MOCK_CHECKOUTS as SAMPLES_MOCK_CHECKOUTS }

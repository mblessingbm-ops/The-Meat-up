'use client'
// OverheadCostsView.tsx — Overhead Costs section for Accounting Expenses tab
// Covers: Fuel, Utilities, Rentals, Other Overheads
// Created March 2026

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Fuel, Zap, Building2, MoreHorizontal, Plus, Settings, ChevronDown, ChevronUp,
  Download, AlertTriangle, History, CheckCircle, FileEdit, Pencil
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer
} from 'recharts'
import { cn, formatDate } from '@/lib/utils'
import {
  MOCK_UTILITIES, MOCK_RENTALS, MOCK_OTHER_OVERHEADS, DEFAULT_OVERHEAD_SETTINGS,
  NHC_STANDING, MOCK_SPLIT_RENTALS,
  formatPeriod, daysUntilReview, isReviewSoon,
  type UtilityEntry, type RentalEntry, type OtherOverheadEntry, type OverheadSettings,
  type SplitRentalStanding, type SplitRentalEntry,
} from '@/lib/overheads'
import { MOCK_FUEL_ENTRIES, FUEL_PRICE_HISTORY, TOTAL_WEEKLY_ALLOCATION, MOCK_VEHICLES, type FuelEntry } from '@/lib/fleet'
import WeeklyFuelEntryForm from './WeeklyFuelEntryForm'
import toast from 'react-hot-toast'

const USD = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// ─── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: 'draft' | 'posted' }) {
  return <span className={cn('badge', status === 'posted' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500')}>{status}</span>
}

// ─── Section expander ──────────────────────────────────────────────────────────
function Section({ icon, title, count, children }: { icon: React.ReactNode; title: string; count?: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="card overflow-hidden">
      <button className="w-full flex items-center gap-3 px-5 py-4 hover:bg-nexus-bg/50 transition-colors text-left" onClick={() => setOpen(v => !v)}>
        <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">{icon}</div>
        <span className="font-display font-semibold text-nexus-ink flex-1">{title}</span>
        {count !== undefined && <span className="badge bg-nexus-bg text-nexus-muted text-xs">{count} entries</span>}
        {open ? <ChevronUp className="w-4 h-4 text-nexus-muted" /> : <ChevronDown className="w-4 h-4 text-nexus-muted" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="border-t border-nexus-border">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Fuel Price Config ─────────────────────────────────────────────────────────
function FuelPriceConfig({ canEdit }: { canEdit: boolean }) {
  const [editing, setEditing] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const current = FUEL_PRICE_HISTORY[FUEL_PRICE_HISTORY.length - 1]

  return (
    <div className="px-5 py-4 bg-brand-50/60 border-b border-nexus-border">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Fuel className="w-4 h-4 text-brand-600 flex-shrink-0" />
          <div>
            <span className="text-sm text-nexus-muted">Current Fuel Price: </span>
            <span className="font-display font-bold text-brand-700 num text-lg">${current.price.toFixed(2)}</span>
            <span className="text-sm text-nexus-muted"> / litre</span>
            <span className="text-xs text-nexus-muted ml-2">· Effective {current.effective_date} · Set by {current.set_by}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1" onClick={() => setShowHistory(v => !v)}>
            <History className="w-3 h-3" /> Price History
          </button>
          {canEdit && (
            <button className="btn-primary btn-sm" onClick={() => setEditing(true)}>
              <Pencil className="w-3 h-3" /> Update Price
            </button>
          )}
        </div>
      </div>
      {showHistory && (
        <div className="mt-3 border-t border-nexus-border pt-3">
          <p className="text-xs font-semibold text-nexus-muted mb-2">Price History</p>
          <table className="table text-xs w-full">
            <thead><tr><th>Price (USD/L)</th><th>Effective Date</th><th>Set By</th></tr></thead>
            <tbody>
              {[...FUEL_PRICE_HISTORY].reverse().map((p, i) => (
                <tr key={i}><td className="num font-bold">${p.price.toFixed(2)}</td><td>{p.effective_date}</td><td>{p.set_by}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && (
        <div className="mt-3 border-t border-nexus-border pt-3 flex items-end gap-3 flex-wrap">
          <div>
            <label className="form-label">New Price (USD/L)</label>
            <input type="number" step="0.01" className="input w-32" placeholder="1.71" />
          </div>
          <div>
            <label className="form-label">Effective Date</label>
            <input type="date" className="input" defaultValue={new Date().toISOString().slice(0, 10)} />
          </div>
          <div className="flex gap-2 pb-0.5">
            <button className="btn-primary btn-sm" onClick={() => { toast.success('Fuel price updated.'); setEditing(false) }}>
              <CheckCircle className="w-3.5 h-3.5" /> Save
            </button>
            <button className="btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Fuel Row Detail (expandable) ────────────────────────────────────────────
function FuelRowDetail({ entry }: { entry: FuelEntry }) {
  return (
    <tr>
      <td colSpan={9} className="p-0">
        <div className="bg-nexus-bg/40 border-t border-nexus-border px-5 py-3">
          <p className="text-xs font-semibold text-nexus-muted mb-2">Per-Vehicle Breakdown</p>
          <table className="table text-xs w-full">
            <thead><tr><th>Vehicle</th><th>Registration</th><th>Assigned To</th><th className="text-right">Max Alloc</th><th className="text-right">Est. Remaining</th><th className="text-right">Dispensed</th><th className="text-right">Amount</th><th>Notes</th></tr></thead>
            <tbody>
              {entry.lines.map(l => (
                <tr key={l.vehicleId} className={l.isNil ? 'opacity-50' : ''}>
                  <td className="text-xs">{l.make} {l.model}</td>
                  <td className="font-mono text-xs">{l.registration}</td>
                  <td className="text-xs">{l.assignedTo}</td>
                  <td className="text-right num">{l.maxAllocation}L</td>
                  <td className="text-right num">{l.estRemaining != null ? `${l.estRemaining}L` : '—'}</td>
                  <td className={cn('text-right num font-medium', l.dispensed === 0 ? 'text-nexus-muted' : l.dispensed > l.maxAllocation ? 'text-red-600' : 'text-nexus-ink')}>
                    {l.dispensed}L
                  </td>
                  <td className="text-right num">{l.amount > 0 ? USD(l.amount) : '—'}</td>
                  <td className="text-xs text-nexus-muted">{l.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  )
}

// ─── Fuel Section ─────────────────────────────────────────────────────────────
function FuelSection({ canEdit, onNewEntry }: { canEdit: boolean; onNewEntry: () => void }) {
  const [entries, setEntries] = useState<FuelEntry[]>(MOCK_FUEL_ENTRIES)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Monthly summary data (current month)
  const monthlyData = [
    { week: 'Feb 24', dispensed: 655, max: TOTAL_WEEKLY_ALLOCATION },
    { week: 'Mar 3', dispensed: entries.find(e => e.id === 'fuel-2026-03-0001')?.totalDispensed ?? 0, max: TOTAL_WEEKLY_ALLOCATION },
  ]

  const totalMonthlyDispensed = monthlyData.reduce((s, d) => s + d.dispensed, 0)
  const totalMonthlyMax = monthlyData.length * TOTAL_WEEKLY_ALLOCATION
  const totalMonthlyCost = parseFloat((totalMonthlyDispensed * 1.71).toFixed(2))

  return (
    <div>
      <FuelPriceConfig canEdit={canEdit} />
      {/* Fuel history table */}
      <div className="px-5 py-4 border-b border-nexus-border flex items-center justify-between">
        <h4 className="font-medium text-nexus-ink text-sm">Weekly Fuel Entries</h4>
        {canEdit && (
          <button className="btn-primary btn-sm" onClick={onNewEntry}>
            <Plus className="w-3.5 h-3.5" /> New Weekly Fuel Entry
          </button>
        )}
      </div>
      <div className="table-wrapper rounded-none border-0">
        <table className="table text-sm">
          <thead>
            <tr>
              <th>Week Period</th>
              <th className="text-right">Dispensed</th>
              <th className="text-right">Max Alloc</th>
              <th className="text-right">Utilisation</th>
              <th className="text-right">Price/L</th>
              <th className="text-right">Total Cost</th>
              <th>Posted By</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {entries.map(e => {
              const util = e.utilisationPct
              return (
                <React.Fragment key={e.id}>
                  <tr className="cursor-pointer hover:bg-nexus-bg/40" onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}>
                    <td className="text-sm">{e.weekStart} – {e.weekEnd}</td>
                    <td className="text-right num">{e.totalDispensed.toFixed(1)}L</td>
                    <td className="text-right num text-nexus-muted">{e.maxAllocation}L</td>
                    <td className={cn('text-right num font-semibold', util >= 90 ? 'text-emerald-600' : util >= 70 ? 'text-amber-600' : 'text-slate-500')}>
                      {util}%
                    </td>
                    <td className="text-right num">${e.pricePerLitre.toFixed(2)}</td>
                    <td className="text-right num font-semibold">{USD(e.totalCost)}</td>
                    <td className="text-sm">{e.postedBy}</td>
                    <td>
                      <StatusBadge status={e.status} />
                      {e.status === 'draft' && <span className="ml-1 text-xs text-brand-600 cursor-pointer hover:underline">Continue Editing</span>}
                    </td>
                    <td>
                      {expandedId === e.id ? <ChevronUp className="w-4 h-4 text-nexus-muted" /> : <ChevronDown className="w-4 h-4 text-nexus-muted" />}
                    </td>
                  </tr>
                  {expandedId === e.id && <FuelRowDetail entry={e} />}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Monthly Fuel Summary */}
      <div className="px-5 py-4 border-t border-nexus-border">
        <h4 className="font-medium text-nexus-ink text-sm mb-3">Monthly Fuel Summary — March 2026</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="L" />
              <Tooltip formatter={(v: number) => [`${v}L`, 'Dispensed']} />
              <ReferenceLine y={TOTAL_WEEKLY_ALLOCATION} stroke="#f87171" strokeDasharray="6 3" label={{ value: `Max ${TOTAL_WEEKLY_ALLOCATION}L`, position: 'insideTopRight', fontSize: 10, fill: '#f87171' }} />
              <Bar dataKey="dispensed" fill="#2563eb" radius={[4, 4, 0, 0]} name="Dispensed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div><p className="text-xs text-nexus-muted">Total Dispensed</p><p className="font-bold num">{totalMonthlyDispensed.toFixed(1)}L</p></div>
          <div><p className="text-xs text-nexus-muted">Max Allocation</p><p className="font-bold num text-nexus-muted">{totalMonthlyMax}L</p></div>
          <div><p className="text-xs text-nexus-muted">Total Saved</p><p className="font-bold num text-amber-600">{(totalMonthlyMax - totalMonthlyDispensed).toFixed(1)}L · {USD((totalMonthlyMax - totalMonthlyDispensed) * 1.71)}</p></div>
          <div><p className="text-xs text-nexus-muted">Total Cost</p><p className="font-bold num text-brand-700">{USD(totalMonthlyCost)}</p></div>
        </div>
      </div>
    </div>
  )
}

// ─── Utilities Section ─────────────────────────────────────────────────────────
function UtilitiesSection({ canEdit }: { canEdit: boolean }) {
  const [entries, setEntries] = useState<UtilityEntry[]>(MOCK_UTILITIES)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ utilityType: 'Electricity', provider: '', company: 'Kingsport', billingPeriod: '', amount: '', invoiceReference: '', notes: '' })

  function handleAdd(draft: boolean) {
    const entry: UtilityEntry = {
      id: `util-${Date.now()}`, utilityType: form.utilityType as UtilityEntry['utilityType'],
      provider: form.provider, company: form.company as UtilityEntry['company'],
      billingPeriod: form.billingPeriod, amount: parseFloat(form.amount) || 0,
      invoiceReference: form.invoiceReference || undefined,
      notes: form.notes || undefined,
      postedBy: 'Nothando Ncube', status: draft ? 'draft' : 'posted', createdAt: new Date().toISOString()
    }
    setEntries(prev => [entry, ...prev])
    toast.success(draft ? 'Utility entry saved as draft.' : 'Utility entry posted.')
    setShowModal(false)
  }

  return (
    <div>
      <div className="px-5 py-3 border-b border-nexus-border flex items-center justify-between">
        <span className="text-sm text-nexus-muted">{entries.length} entries</span>
        {canEdit && <button className="btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus className="w-3.5 h-3.5" /> Add Utility Entry</button>}
      </div>
      <div className="table-wrapper rounded-none border-0">
        <table className="table text-sm">
          <thead><tr><th>Type</th><th>Provider</th><th>Company</th><th>Period</th><th className="text-right">Amount</th><th>Posted By</th><th>Status</th></tr></thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id}>
                <td><span className="badge bg-slate-100 text-slate-600">{e.utilityType}</span></td>
                <td className="text-sm">{e.provider}</td>
                <td><span className="badge badge-blue">{e.company}</span></td>
                <td className="text-sm">{formatPeriod(e.billingPeriod)}</td>
                <td className="text-right num font-semibold">{USD(e.amount)}</td>
                <td className="text-sm text-nexus-muted">{e.postedBy}</td>
                <td><StatusBadge status={e.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-nexus-border"><h3 className="font-display font-bold">Add Utility Entry</h3></div>
            <div className="p-5 space-y-3">
              <div><label className="form-label">Utility Type</label>
                <select className="input" value={form.utilityType} onChange={e => setForm(f => ({ ...f, utilityType: e.target.value }))}>
                  {['Electricity','Water','Internet','Telephone','Other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="form-label">Provider</label><input className="input" placeholder="ZESA, ZOL…" value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} /></div>
              <div><label className="form-label">Company</label>
                <select className="input" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}>
                  {['Kingsport','Bralyn','SGA'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="form-label">Billing Period (YYYY-MM)</label><input type="month" className="input" value={form.billingPeriod} onChange={e => setForm(f => ({ ...f, billingPeriod: e.target.value }))} /></div>
              <div><label className="form-label">Amount (USD)</label><input type="number" step="0.01" className="input" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
              <div><label className="form-label">Invoice Reference (optional)</label><input className="input" value={form.invoiceReference} onChange={e => setForm(f => ({ ...f, invoiceReference: e.target.value }))} /></div>
              <div><label className="form-label">Notes (optional)</label><textarea className="input h-16 resize-none" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
            </div>
            <div className="p-4 border-t border-nexus-border flex gap-2">
              <button className="btn-primary flex-1" onClick={() => handleAdd(false)}><CheckCircle className="w-3.5 h-3.5" /> Post</button>
              <button className="btn-secondary" onClick={() => handleAdd(true)}><FileEdit className="w-3.5 h-3.5" /> Save Draft</button>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── NHC Split-Currency Modal ─────────────────────────────────────────────────
function NHCSplitEntryModal({ standing, onClose, onSave }: {
  standing: SplitRentalStanding
  onClose: () => void
  onSave: (entry: SplitRentalEntry) => void
}) {
  const [form, setForm] = useState({
    billingPeriod: new Date().toISOString().slice(0, 7),
    usdAmount: standing.usdComponent.toString(),
    zwgAmount: '',
    exchangeRate: '',
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentReference: '',
    notes: '',
  })
  const zwg = parseFloat(form.zwgAmount) || 0
  const usd = parseFloat(form.usdAmount) || 0

  function handleSave(draft: boolean) {
    if (!form.billingPeriod) { toast.error('Billing period is required.'); return }
    if (!form.zwgAmount) { toast.error('ZWG amount is required for NHC rental.'); return }
    const entry: SplitRentalEntry = {
      id: `split-rent-nhc-${Date.now()}`,
      standingId: standing.id,
      refNumber: `RNT-${form.billingPeriod.replace('-', '-')}-${Date.now().toString().slice(-3)}`,
      billingPeriod: form.billingPeriod,
      usdAmount: usd,
      zwgAmount: zwg,
      exchangeRateUsed: form.exchangeRate ? parseFloat(form.exchangeRate) : undefined,
      paymentDate: form.paymentDate,
      paymentReference: form.paymentReference || undefined,
      postedBy: 'Ashleigh Kurira',
      status: draft ? 'draft' : 'posted',
      notes: form.notes || undefined,
      createdAt: new Date().toISOString(),
    }
    onSave(entry)
    toast.success(draft ? 'NHC entry saved as draft.' : 'NHC monthly entry posted.')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="p-5 border-b border-nexus-border">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-nexus-ink">Post NHC Monthly Rental Entry</h3>
            <span className="badge bg-amber-100 text-amber-700 text-[10px] font-semibold">SPLIT CURRENCY</span>
          </div>
          <p className="text-xs text-nexus-muted">National Handicraft Centre · USD 1,700.00 fixed + ZWG equivalent at prevailing rate</p>
        </div>

        {/* Read-only contract summary */}
        <div className="px-5 pt-4 pb-3 bg-slate-50 border-b border-nexus-border">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div><p className="text-nexus-muted">Lessor</p><p className="font-semibold text-nexus-ink">National Handicraft Centre</p></div>
            <div><p className="text-nexus-muted">Company</p><p className="font-semibold">Kingsport</p></div>
            <div><p className="text-nexus-muted">Contract Value</p><p className="font-semibold num">USD 3,400.00/month</p></div>
          </div>
        </div>

        <div className="p-5 space-y-4 max-h-[55vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Billing Period <span className="text-red-500">*</span></label>
              <input type="month" className="input" value={form.billingPeriod} onChange={e => setForm(f => ({ ...f, billingPeriod: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Payment Date <span className="text-red-500">*</span></label>
              <input type="date" className="input" value={form.paymentDate} onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">USD Amount <span className="text-red-500">*</span></label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-nexus-muted">$</span>
                <input type="number" step="0.01" className="input pl-7" value={form.usdAmount} onChange={e => setForm(f => ({ ...f, usdAmount: e.target.value }))} />
              </div>
              <p className="text-[10px] text-nexus-muted mt-1">Fixed component — pre-filled at USD 1,700.00</p>
            </div>
            <div>
              <label className="form-label">ZWG Amount <span className="text-red-500">*</span></label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-amber-700">ZWG</span>
                <input type="number" step="0.01" className="input pl-12" placeholder="e.g. 43350.00" value={form.zwgAmount} onChange={e => setForm(f => ({ ...f, zwgAmount: e.target.value }))} />
              </div>
              <p className="text-[10px] text-amber-700 mt-1">ZWG equivalent of USD 1,700.00 — enter at prevailing rate on payment date</p>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-[11px] text-amber-800 font-medium">This field must be entered manually each month based on the RBZ or prevailing market rate at time of payment.</p>
          </div>

          <div>
            <label className="form-label">Rate Applied (ZWG per USD) — optional, for audit reference</label>
            <input type="number" step="0.01" className="input" placeholder="e.g. 25.50" value={form.exchangeRate} onChange={e => setForm(f => ({ ...f, exchangeRate: e.target.value }))} />
            <p className="text-[10px] text-nexus-muted mt-1">Stored for audit trail. Does not auto-calculate the ZWG amount above.</p>
          </div>

          <div>
            <label className="form-label">Payment Reference (optional)</label>
            <input className="input" placeholder="e.g. NHC-MAR2026" value={form.paymentReference} onChange={e => setForm(f => ({ ...f, paymentReference: e.target.value }))} />
          </div>

          <div>
            <label className="form-label">Notes (optional)</label>
            <textarea className="input h-16 resize-none" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>

          {/* Summary (shown when ZWG is entered) */}
          {zwg > 0 && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="text-[11px] text-nexus-muted mb-1 font-semibold uppercase tracking-wide">Total payment this month</p>
              <div className="flex items-center gap-3">
                <span className="font-display font-bold num text-brand-700">${usd.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
                <span className="text-nexus-muted">+</span>
                <span className="font-display font-bold num text-amber-700">ZWG {zwg.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <p className="text-[10px] text-nexus-muted mt-1">Parallel ledger entries — amounts are never combined or converted.</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-nexus-border flex gap-2">
          <button className="btn-primary flex-1" onClick={() => handleSave(false)}><CheckCircle className="w-3.5 h-3.5" /> Post Entry</button>
          <button className="btn-secondary" onClick={() => handleSave(true)}><FileEdit className="w-3.5 h-3.5" /> Save Draft</button>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ─── NHC Standing Card ────────────────────────────────────────────────────────
function NHCStandingCard({ standing, entries, canEdit, onNewEntry }: {
  standing: SplitRentalStanding
  entries: SplitRentalEntry[]
  canEdit: boolean
  onNewEntry: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="border-b border-nexus-border">
      {/* Contract row */}
      <div className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-nexus-bg/40 transition-colors" onClick={() => setExpanded(v => !v)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-nexus-ink text-sm">{standing.description}</p>
            <span className="badge bg-amber-100 text-amber-700 text-[10px] font-bold">SPLIT CURRENCY</span>
            {standing.isActive && <span className="badge bg-emerald-100 text-emerald-700 text-[10px]">Active</span>}
          </div>
          <p className="text-xs text-nexus-muted mt-0.5">{standing.lessor} · {standing.company} · USD {standing.totalContractValueUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}/month total</p>
          <p className="text-[11px] text-nexus-muted">USD {standing.usdComponent.toLocaleString('en-US', { minimumFractionDigits: 2 })} fixed + ZWG equivalent of USD 1,700 at prevailing rate · Monthly</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {canEdit && (
            <button className="btn-primary btn-sm" onClick={e => { e.stopPropagation(); onNewEntry() }}>
              <Plus className="w-3 h-3" /> Post Monthly Entry
            </button>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-nexus-muted" /> : <ChevronDown className="w-4 h-4 text-nexus-muted" />}
        </div>
      </div>

      {/* Monthly entries table */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            {entries.length === 0 ? (
              <div className="px-5 pb-4 text-xs text-nexus-muted">No monthly entries yet.</div>
            ) : (
              <div className="px-5 pb-4">
                <p className="text-[11px] font-semibold text-nexus-muted uppercase tracking-wide mb-2">Monthly Payment History</p>
                <table className="table text-xs w-full">
                  <thead>
                    <tr>
                      <th>Ref</th>
                      <th>Period</th>
                      <th>Currency</th>
                      <th className="text-right">Amount</th>
                      <th className="text-right">Rate Used</th>
                      <th>Payment Date</th>
                      <th>Ref #</th>
                      <th>Posted By</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(e => (
                      <React.Fragment key={e.id}>
                        {/* USD row */}
                        <tr className="border-l-2 border-l-blue-400">
                          <td className="font-mono text-[10px] text-nexus-muted" rowSpan={2}>{e.refNumber}<div className="w-0.5 h-full bg-slate-300 mx-auto mt-1" /></td>
                          <td>{formatPeriod(e.billingPeriod)}</td>
                          <td><span className="badge bg-blue-100 text-blue-700 text-[10px]">USD</span></td>
                          <td className="text-right num font-semibold text-blue-700">${e.usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="text-right text-nexus-muted">—</td>
                          <td>{e.paymentDate}</td>
                          <td className="text-nexus-muted font-mono text-[10px]">{e.paymentReference || '—'}</td>
                          <td className="text-nexus-muted">{e.postedBy}</td>
                          <td><StatusBadge status={e.status} /></td>
                        </tr>
                        {/* ZWG row */}
                        <tr className="border-l-2 border-l-amber-400 border-t border-dashed border-nexus-border/50">
                          <td>{formatPeriod(e.billingPeriod)}</td>
                          <td><span className="badge bg-amber-100 text-amber-700 text-[10px]">ZWG</span></td>
                          <td className="text-right num font-semibold text-amber-700">ZWG {e.zwgAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="text-right num text-nexus-muted">{e.exchangeRateUsed ? `${e.exchangeRateUsed.toFixed(2)}` : '—'}</td>
                          <td>{e.paymentDate}</td>
                          <td className="text-nexus-muted font-mono text-[10px]">{e.paymentReference || '—'}</td>
                          <td className="text-nexus-muted">{e.postedBy}</td>
                          <td><StatusBadge status={e.status} /></td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
                {/* Overhead summary footnote */}
                <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[10px] text-nexus-muted">
                    USD 1,700.00 included in Kingsport USD overhead total.
                    ZWG {entries[entries.length - 1]?.zwgAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} displayed separately — parallel ledger, not converted.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Rentals Section ──────────────────────────────────────────────────────────
function RentalsSection({ canEdit }: { canEdit: boolean }) {
  const [entries, setEntries] = useState<RentalEntry[]>(MOCK_RENTALS)
  const [splitEntries, setSplitEntries] = useState<SplitRentalEntry[]>(MOCK_SPLIT_RENTALS)
  const [showModal, setShowModal] = useState(false)
  const [showNHCModal, setShowNHCModal] = useState(false)
  const [form, setForm] = useState({ rentalType: 'Premises', description: '', lessor: '', company: 'Kingsport', billingPeriod: '', amount: '', leaseReference: '', nextReviewDate: '', notes: '' })

  function handleAdd(draft: boolean) {
    const entry: RentalEntry = {
      id: `rent-${Date.now()}`, rentalType: form.rentalType as RentalEntry['rentalType'],
      description: form.description, lessor: form.lessor, company: form.company as RentalEntry['company'],
      billingPeriod: form.billingPeriod, amount: parseFloat(form.amount) || 0,
      leaseReference: form.leaseReference || undefined,
      nextReviewDate: form.nextReviewDate || undefined,
      notes: form.notes || undefined,
      postedBy: 'Nothando Ncube', status: draft ? 'draft' : 'posted', createdAt: new Date().toISOString()
    }
    setEntries(prev => [entry, ...prev])
    toast.success(draft ? 'Rental saved as draft.' : 'Rental entry posted.')
    setShowModal(false)
  }

  const totalEntries = entries.length + 1 // +1 for NHC standing record

  return (
    <div>
      <div className="px-5 py-3 border-b border-nexus-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-nexus-muted">{totalEntries} rental{totalEntries !== 1 ? 's' : ''}</span>
          <span className="badge bg-amber-100 text-amber-700 text-[10px]">1 split-currency</span>
        </div>
        {canEdit && <button className="btn-secondary btn-sm" onClick={() => setShowModal(true)}><Plus className="w-3.5 h-3.5" /> Add Standard Rental</button>}
      </div>

      {/* NHC Split-Currency Standing Record (always shown first) */}
      <NHCStandingCard
        standing={NHC_STANDING}
        entries={splitEntries}
        canEdit={canEdit}
        onNewEntry={() => setShowNHCModal(true)}
      />

      {/* Standard USD-only rentals */}
      {entries.length > 0 && (
        <div className="table-wrapper rounded-none border-0">
          <table className="table text-sm">
            <thead><tr><th>Description</th><th>Lessor</th><th>Company</th><th>Period</th><th className="text-right">Amount</th><th>Next Review</th><th>Status</th></tr></thead>
            <tbody>
              {entries.map(e => {
                const reviewSoon = e.nextReviewDate ? isReviewSoon(e.nextReviewDate) : false
                const daysLeft = e.nextReviewDate ? daysUntilReview(e.nextReviewDate) : null
                return (
                  <tr key={e.id}>
                    <td>
                      <p className="font-medium text-nexus-ink">{e.description}</p>
                      <p className="text-xs text-nexus-muted">{e.rentalType}</p>
                    </td>
                    <td className="text-sm">{e.lessor}</td>
                    <td><span className="badge badge-blue">{e.company}</span></td>
                    <td className="text-sm">{formatPeriod(e.billingPeriod)}</td>
                    <td className="text-right num font-semibold">{USD(e.amount)}</td>
                    <td>
                      {e.nextReviewDate ? (
                        <div className={cn('flex items-center gap-1', reviewSoon && 'text-amber-600')}>
                          {reviewSoon && <AlertTriangle className="w-3 h-3 flex-shrink-0" />}
                          <span className="text-xs">{e.nextReviewDate}</span>
                          {daysLeft !== null && <span className="text-[10px] text-nexus-muted">({daysLeft}d)</span>}
                        </div>
                      ) : <span className="text-nexus-muted text-xs">—</span>}
                    </td>
                    <td><StatusBadge status={e.status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Standard rental modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-nexus-border"><h3 className="font-display font-bold">Add Standard Rental Entry</h3></div>
            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
              <div><label className="form-label">Rental Type</label>
                <select className="input" value={form.rentalType} onChange={e => setForm(f => ({ ...f, rentalType: e.target.value }))}>
                  {['Premises','Equipment Lease','Vehicle Lease','Storage','Other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="form-label">Description</label><input className="input" placeholder="Stand 41339 Graniteside…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div><label className="form-label">Landlord / Lessor</label><input className="input" value={form.lessor} onChange={e => setForm(f => ({ ...f, lessor: e.target.value }))} /></div>
              <div><label className="form-label">Company</label>
                <select className="input" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}>
                  {['Kingsport','Bralyn','SGA'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="form-label">Billing Period (YYYY-MM)</label><input type="month" className="input" value={form.billingPeriod} onChange={e => setForm(f => ({ ...f, billingPeriod: e.target.value }))} /></div>
              <div><label className="form-label">Amount (USD)</label><input type="number" step="0.01" className="input" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
              <div><label className="form-label">Lease Reference (optional)</label><input className="input" value={form.leaseReference} onChange={e => setForm(f => ({ ...f, leaseReference: e.target.value }))} /></div>
              <div><label className="form-label">Next Review Date (optional)</label><input type="date" className="input" value={form.nextReviewDate} onChange={e => setForm(f => ({ ...f, nextReviewDate: e.target.value }))} /></div>
              <div><label className="form-label">Notes (optional)</label><textarea className="input h-16 resize-none" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
            </div>
            <div className="p-4 border-t border-nexus-border flex gap-2">
              <button className="btn-primary flex-1" onClick={() => handleAdd(false)}><CheckCircle className="w-3.5 h-3.5" /> Post</button>
              <button className="btn-secondary" onClick={() => handleAdd(true)}><FileEdit className="w-3.5 h-3.5" /> Save Draft</button>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* NHC split-currency modal */}
      {showNHCModal && (
        <NHCSplitEntryModal
          standing={NHC_STANDING}
          onClose={() => setShowNHCModal(false)}
          onSave={entry => setSplitEntries(prev => [entry, ...prev])}
        />
      )}
    </div>
  )
}

// ─── Other Overheads Section ──────────────────────────────────────────────────
function OtherOverheadsSection({ canEdit }: { canEdit: boolean }) {
  const [entries, setEntries] = useState<OtherOverheadEntry[]>(MOCK_OTHER_OVERHEADS)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ category: 'Security', description: '', company: 'Kingsport', billingPeriod: '', amount: '', reference: '', notes: '' })
  const CATEGORIES = ['Security', 'Cleaning', 'Insurance', 'Bank Charges', 'Subscriptions', 'Other']

  function handleAdd(draft: boolean) {
    const entry: OtherOverheadEntry = {
      id: `other-${Date.now()}`, category: form.category, description: form.description,
      company: form.company as OtherOverheadEntry['company'], billingPeriod: form.billingPeriod,
      amount: parseFloat(form.amount) || 0, reference: form.reference || undefined,
      notes: form.notes || undefined, postedBy: 'Nothando Ncube',
      status: draft ? 'draft' : 'posted', createdAt: new Date().toISOString()
    }
    setEntries(prev => [entry, ...prev]); toast.success(draft ? 'Saved as draft.' : 'Entry posted.'); setShowModal(false)
  }

  return (
    <div>
      <div className="px-5 py-3 border-b border-nexus-border flex items-center justify-between">
        <span className="text-sm text-nexus-muted">{entries.length} entries</span>
        {canEdit && <button className="btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus className="w-3.5 h-3.5" /> Add Entry</button>}
      </div>
      {entries.length === 0 ? (
        <div className="p-8 text-center text-nexus-muted text-sm">No other overhead entries yet.</div>
      ) : (
        <div className="table-wrapper rounded-none border-0">
          <table className="table text-sm">
            <thead><tr><th>Category</th><th>Description</th><th>Company</th><th>Period</th><th className="text-right">Amount</th><th>Status</th></tr></thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id}>
                  <td><span className="badge bg-slate-100 text-slate-600">{e.category}</span></td>
                  <td>{e.description}</td>
                  <td><span className="badge badge-blue">{e.company}</span></td>
                  <td>{formatPeriod(e.billingPeriod)}</td>
                  <td className="text-right num font-semibold">{USD(e.amount)}</td>
                  <td><StatusBadge status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-nexus-border"><h3 className="font-display font-bold">Add Other Overhead</h3></div>
            <div className="p-5 space-y-3">
              <div><label className="form-label">Category</label>
                <input list="cat-list" className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
                <datalist id="cat-list">{CATEGORIES.map(c => <option key={c} value={c} />)}</datalist>
              </div>
              <div><label className="form-label">Description</label><input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div><label className="form-label">Company</label>
                <select className="input" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}>
                  {['Kingsport','Bralyn','SGA'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="form-label">Billing Period</label><input type="month" className="input" value={form.billingPeriod} onChange={e => setForm(f => ({ ...f, billingPeriod: e.target.value }))} /></div>
              <div><label className="form-label">Amount (USD)</label><input type="number" step="0.01" className="input" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
              <div><label className="form-label">Reference (optional)</label><input className="input" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} /></div>
              <div><label className="form-label">Notes (optional)</label><textarea className="input h-16 resize-none" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
            </div>
            <div className="p-4 border-t border-nexus-border flex gap-2">
              <button className="btn-primary flex-1" onClick={() => handleAdd(false)}>Post</button>
              <button className="btn-secondary" onClick={() => handleAdd(true)}>Save Draft</button>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Overhead Settings Panel ──────────────────────────────────────────────────
function OverheadSettingsPanel({ settings, canEdit, onClose }: { settings: OverheadSettings; canEdit: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ fuelBudget: settings.monthlyFuelBudget.toString(), overheadsBudget: settings.monthlyOverheadsBudget.toString() })
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="p-5 border-b border-nexus-border flex items-center justify-between">
          <h3 className="font-display font-bold flex items-center gap-2"><Settings className="w-4 h-4" /> Overhead Settings</h3>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="form-label">Monthly Fuel Budget (USD)</label>
            <input type="number" step="0.01" className="input" disabled={!canEdit} value={form.fuelBudget} onChange={e => setForm(f => ({ ...f, fuelBudget: e.target.value }))} />
            <p className="text-[10px] text-nexus-muted mt-1">Default: 695L × $1.71 × 4.33 weeks = $5,147.47</p>
          </div>
          <div>
            <label className="form-label">Monthly Overheads Budget (USD)</label>
            <input type="number" step="0.01" className="input" disabled={!canEdit} value={form.overheadsBudget} onChange={e => setForm(f => ({ ...f, overheadsBudget: e.target.value }))} />
          </div>
        </div>
        <div className="p-4 border-t border-nexus-border flex gap-2">
          {canEdit && <button className="btn-primary flex-1" onClick={() => { toast.success('Settings saved.'); onClose() }}>Save</button>}
          <button className="btn-secondary flex-1" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

// ─── Overhead Summary Panel ────────────────────────────────────────────────────
function SummaryPanel({ fuelCost, utilitiesTot, rentalsTot, otherTot, nhcZwgAmount }: {
  fuelCost: number; utilitiesTot: number; rentalsTot: number; otherTot: number; nhcZwgAmount?: number
}) {
  const total = fuelCost + utilitiesTot + rentalsTot + otherTot
  const rows = [
    { cat: 'Fuel', amt: fuelCost, color: 'bg-brand-500' },
    { cat: 'Utilities', amt: utilitiesTot, color: 'bg-emerald-500' },
    { cat: 'Rentals', amt: rentalsTot, color: 'bg-purple-500' },
    { cat: 'Other', amt: otherTot, color: 'bg-amber-500' },
  ]
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-nexus-ink">This Month's Overhead Summary</h3>
        <button className="btn-secondary btn-sm" onClick={() => toast.success('Export started.')}><Download className="w-3.5 h-3.5" /> Export CSV</button>
      </div>
      {/* Stacked bar */}
      <div className="flex h-6 rounded-lg overflow-hidden mb-4">
        {rows.map(r => total > 0 && (
          <div key={r.cat} className={cn(r.color, 'transition-all')} style={{ width: `${(r.amt / total) * 100}%` }} title={`${r.cat}: ${USD(r.amt)}`} />
        ))}
      </div>
      <table className="table text-sm w-full">
        <thead><tr><th>Category</th><th className="text-right">This Month (USD)</th><th className="text-right">% of Total</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <React.Fragment key={r.cat}>
              <tr>
                <td className="flex items-center gap-2"><span className={cn('w-3 h-3 rounded-sm inline-block', r.color)} />{r.cat}</td>
                <td className="text-right num">{USD(r.amt)}</td>
                <td className="text-right num text-nexus-muted">{total > 0 ? ((r.amt / total) * 100).toFixed(1) : 0}%</td>
              </tr>
              {/* ZWG note beneath Rentals row — parallel ledger, never converted */}
              {r.cat === 'Rentals' && nhcZwgAmount && nhcZwgAmount > 0 && (
                <tr className="bg-amber-50/50">
                  <td colSpan={3} className="py-1 px-4">
                    <p className="text-[10px] text-amber-700">
                      + ZWG {nhcZwgAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-nexus-muted">(National Handicraft Centre — paid separately in ZWG, not converted)</span>
                    </p>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
          <tr className="font-bold border-t border-nexus-border">
            <td>Total Overheads</td>
            <td className="text-right num">{USD(total)}</td>
            <td className="text-right num">100%</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── Main OverheadCostsView ────────────────────────────────────────────────────
interface Props { canEdit: boolean }

export default function OverheadCostsView({ canEdit }: Props) {
  const [showSettings, setShowSettings] = useState(false)
  const [showFuelForm, setShowFuelForm] = useState(false)
  const [settings] = useState<OverheadSettings>(DEFAULT_OVERHEAD_SETTINGS)

  const currentWeekFuelCost = MOCK_FUEL_ENTRIES[0].totalCost // most recent posted
  const monthlyFuelCost = MOCK_FUEL_ENTRIES.filter(e => e.status === 'posted').reduce((s, e) => s + e.totalCost, 0)
  const monthlyCost_utilities = MOCK_UTILITIES.filter(e => e.status === 'posted').reduce((s, e) => s + e.amount, 0)
  const monthlyCost_rentals = MOCK_RENTALS.filter(e => e.status === 'posted').reduce((s, e) => s + e.amount, 0)
  const monthlyCost_other = MOCK_OTHER_OVERHEADS.filter(e => e.status === 'posted').reduce((s, e) => s + e.amount, 0)
  const totalMonthly = monthlyFuelCost + monthlyCost_utilities + monthlyCost_rentals + monthlyCost_other
  const fuelUtilisationPct = parseFloat(((currentWeekFuelCost / settings.monthlyFuelBudget) * 100).toFixed(1))
  const pendingCount = MOCK_FUEL_ENTRIES.filter(e => e.status === 'draft').length

  const kpis = [
    { label: 'Weekly Fuel Cost', value: USD(currentWeekFuelCost), sub: 'Current week', color: 'text-brand-700', bg: 'bg-brand-50' },
    { label: 'Monthly Overheads', value: USD(totalMonthly), sub: 'All posted entries', color: 'text-nexus-ink', bg: 'bg-nexus-bg' },
    { label: 'Fuel Budget Utilisation', value: `${fuelUtilisationPct}%`, sub: `Fuel budget: ${USD(settings.monthlyFuelBudget)}/mo`, color: fuelUtilisationPct > 90 ? 'text-red-600' : fuelUtilisationPct > 70 ? 'text-amber-600' : 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Entries', value: pendingCount.toString(), sub: 'Saved as draft', color: pendingCount > 0 ? 'text-amber-600' : 'text-nexus-muted', bg: pendingCount > 0 ? 'bg-amber-50' : 'bg-nexus-bg' },
  ]

  if (showFuelForm) {
    return <WeeklyFuelEntryForm onClose={() => setShowFuelForm(false)} onSave={() => {}} />
  }

  return (
    <div className="space-y-4 p-4">
      {/* KPI Strip */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-full sm:min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {kpis.map(k => (
            <div key={k.label} className={cn('rounded-xl p-3', k.bg)}>
              <p className="text-[11px] text-nexus-muted">{k.label}</p>
              <p className={cn('font-display font-bold num text-lg mt-0.5', k.color)}>{k.value}</p>
              <p className="text-[10px] text-nexus-muted mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>
        <button className="icon-btn flex-shrink-0 self-start mt-0.5" onClick={() => setShowSettings(true)} title="Overhead Settings">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Panel — NHC ZWG shown as footnote beneath Rentals row */}
      <SummaryPanel
        fuelCost={monthlyFuelCost}
        utilitiesTot={monthlyCost_utilities}
        rentalsTot={monthlyCost_rentals}
        otherTot={monthlyCost_other}
        nhcZwgAmount={MOCK_SPLIT_RENTALS.filter(e => e.status === 'posted').reduce((s, e) => s + e.zwgAmount, 0)}
      />

      {/* Four expandable sections */}
      <Section icon={<Fuel className="w-4 h-4" />} title="Fuel" count={MOCK_FUEL_ENTRIES.length}>
        <FuelSection canEdit={canEdit} onNewEntry={() => setShowFuelForm(true)} />
      </Section>

      <Section icon={<Zap className="w-4 h-4" />} title="Utilities" count={MOCK_UTILITIES.length}>
        <UtilitiesSection canEdit={canEdit} />
      </Section>

      <Section icon={<Building2 className="w-4 h-4" />} title="Rentals" count={MOCK_RENTALS.length}>
        <RentalsSection canEdit={canEdit} />
      </Section>

      <Section icon={<MoreHorizontal className="w-4 h-4" />} title="Other Overheads" count={MOCK_OTHER_OVERHEADS.length}>
        <OtherOverheadsSection canEdit={canEdit} />
      </Section>

      {showSettings && (
        <OverheadSettingsPanel settings={settings} canEdit={canEdit} onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}

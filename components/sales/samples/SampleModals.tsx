'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Loader2, Package, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getRepClients } from '@/lib/customers'
import {
  type Sample, type CheckoutRecord,
  CONDITION_COLORS, ALL_REPS,
  type CheckoutPurpose, type SampleCondition,
} from '@/lib/samples'
import toast from 'react-hot-toast'

const PURPOSES: CheckoutPurpose[] = [
  'Client Presentation', 'Tender Submission', 'Client Visit', 'Trade Show', 'Other',
]
const CONDITIONS: SampleCondition[] = ['Excellent', 'Good', 'Fair', 'Poor']

// ─── Backdrop + Modal shell ────────────────────────────────────────────────────
function ModalShell({ title, subtitle, icon, onClose, children, footer }: {
  title: string; subtitle?: string; icon: React.ReactNode
  onClose: () => void; children: React.ReactNode; footer: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        className="bg-surface rounded-2xl shadow-lift w-full max-w-lg flex flex-col max-h-[90vh]"
        initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-nexus-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">{icon}</div>
            <div>
              <h3 className="font-display font-bold text-nexus-ink text-sm">{title}</h3>
              {subtitle && <p className="text-xs text-nexus-muted">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="btn-icon rounded-xl"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">{children}</div>
        <div className="p-5 border-t border-nexus-border flex gap-3 flex-shrink-0">{footer}</div>
      </motion.div>
    </div>
  )
}

// ─── Check Out Modal ─────────────────────────────────────────────────────────────
export function CheckOutModal({ sample, available, onClose, onConfirm }: {
  sample: Sample; available: number
  onClose: () => void
  onConfirm: (data: {
    rep_id: string; rep_name: string; units: number; client: string
    purpose: CheckoutPurpose; is_tender: boolean; expected_return: string
    condition: SampleCondition; notes: string
  }) => void
}) {
  const [repId, setRepId] = useState('')
  const [units, setUnits] = useState(1)
  const [client, setClient] = useState('')
  const [purpose, setPurpose] = useState<CheckoutPurpose>('Client Presentation')
  const [isTender, setIsTender] = useState(false)
  const [returnDate, setReturnDate] = useState('')
  const [condition, setCondition] = useState<SampleCondition>('Excellent')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const selectedRep = ALL_REPS.find(r => r.id === repId)
  const repClients = repId ? getRepClients(repId) : []

  async function handleSave() {
    if (!repId || !client || !returnDate) { toast.error('Please fill all required fields.'); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    onConfirm({
      rep_id: repId, rep_name: selectedRep?.name ?? '', units,
      client, purpose, is_tender: isTender, expected_return: returnDate,
      condition, notes,
    })
    toast.success(`${units} unit(s) of ${sample.name} checked out.`)
    setSaving(false); onClose()
  }

  return (
    <ModalShell
      title="Check Out Sample" subtitle={`${sample.id} — ${sample.name}`}
      icon={<Package className="w-5 h-5 text-brand-600" />} onClose={onClose}
      footer={<>
        <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : 'Confirm Check Out'}
        </button>
      </>}
    >
      <div>
        <label className="label">Rep <span className="text-red-500">*</span></label>
        <select className="select mt-1" value={repId} onChange={e => { setRepId(e.target.value); setClient('') }}>
          <option value="">Select rep…</option>
          {ALL_REPS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Units to Check Out <span className="text-red-500">*</span></label>
        <input type="number" min={1} max={available} value={units} onChange={e => setUnits(Number(e.target.value))}
          className="input mt-1" />
        <p className="text-xs text-nexus-muted mt-1">{available} unit(s) available</p>
      </div>
      <div>
        <label className="label">Client <span className="text-red-500">*</span></label>
        <input className="input mt-1" list="checkout-client-list" value={client} onChange={e => setClient(e.target.value)} placeholder="Type or select client…" />
        <datalist id="checkout-client-list">{repClients.map(c => <option key={c.id} value={c.name} />)}</datalist>
      </div>
      <div>
        <label className="label">Purpose</label>
        <select className="select mt-1" value={purpose} onChange={e => {
          const p = e.target.value as CheckoutPurpose
          setPurpose(p); if (p === 'Tender Submission') setIsTender(true)
        }}>
          {PURPOSES.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>
      <label className={cn('flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors', isTender ? 'bg-amber-50 border-amber-300' : 'border-nexus-border')}>
        <input type="checkbox" checked={isTender} onChange={e => setIsTender(e.target.checked)} className="accent-amber-500 w-4 h-4" />
        <div>
          <p className="text-sm font-medium text-nexus-ink">Tender Flag</p>
          {isTender && <p className="text-xs text-amber-600 mt-0.5">This checkout will be prioritised in the waitlist queue.</p>}
        </div>
      </label>
      <div>
        <label className="label">Expected Return Date <span className="text-red-500">*</span></label>
        <input type="date" className="input mt-1" value={returnDate} onChange={e => setReturnDate(e.target.value)} />
      </div>
      <div>
        <label className="label">Condition on Checkout</label>
        <select className="select mt-1" value={condition} onChange={e => setCondition(e.target.value as SampleCondition)}>
          {CONDITIONS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input mt-1 resize-none h-20" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes…" />
      </div>
    </ModalShell>
  )
}

// ─── Return Modal ─────────────────────────────────────────────────────────────
export function ReturnModal({ checkout, onClose, onConfirm }: {
  checkout: CheckoutRecord
  onClose: () => void
  onConfirm: (data: { units_returned: number; return_date: string; condition: SampleCondition; notes: string; mark_lost: boolean }) => void
}) {
  const [unitsReturned, setUnitsReturned] = useState(checkout.units_taken)
  const [returnDate, setReturnDate] = useState(new Date().toISOString().slice(0, 10))
  const [condition, setCondition] = useState<SampleCondition>(checkout.condition_on_checkout)
  const [notes, setNotes] = useState('')
  const [markLost, setMarkLost] = useState(false)
  const [saving, setSaving] = useState(false)
  const partial = unitsReturned < checkout.units_taken

  async function handleSave() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    onConfirm({ units_returned: unitsReturned, return_date: returnDate, condition, notes, mark_lost: markLost })
    toast.success('Return recorded.')
    setSaving(false); onClose()
  }

  return (
    <ModalShell
      title="Record Return" subtitle={`${checkout.checkout_id} — ${checkout.checked_out_by}`}
      icon={<Package className="w-5 h-5 text-brand-600" />} onClose={onClose}
      footer={<>
        <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : 'Record Return'}
        </button>
      </>}
    >
      <div className="bg-surface-muted rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
        <div><span className="text-nexus-muted text-xs">Rep</span><p className="font-medium text-nexus-ink">{checkout.checked_out_by}</p></div>
        <div><span className="text-nexus-muted text-xs">Client</span><p className="font-medium text-nexus-ink">{checkout.client_visited}</p></div>
        <div><span className="text-nexus-muted text-xs">Units Out</span><p className="font-medium text-nexus-ink">{checkout.units_taken}</p></div>
        <div><span className="text-nexus-muted text-xs">Condition Out</span><p className="font-medium text-nexus-ink">{checkout.condition_on_checkout}</p></div>
      </div>
      <div>
        <label className="label">Units Returned</label>
        <input type="number" min={1} max={checkout.units_taken} value={unitsReturned}
          onChange={e => setUnitsReturned(Number(e.target.value))} className="input mt-1" />
      </div>
      <div>
        <label className="label">Return Date</label>
        <input type="date" className="input mt-1" value={returnDate} onChange={e => setReturnDate(e.target.value)} />
      </div>
      <div>
        <label className="label">Condition on Return</label>
        <select className="select mt-1" value={condition} onChange={e => setCondition(e.target.value as SampleCondition)}>
          {CONDITIONS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input resize-none h-20 mt-1" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional…" />
      </div>
      {partial && (
        <label className="flex items-start gap-3 p-3 rounded-xl border border-red-200 bg-red-50 cursor-pointer">
          <input type="checkbox" checked={markLost} onChange={e => setMarkLost(e.target.checked)} className="accent-red-500 w-4 h-4 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-700">Mark remaining {checkout.units_taken - unitsReturned} unit(s) as lost</p>
            <p className="text-xs text-red-500 mt-0.5">This will decrement total_units and notify Lucia.</p>
          </div>
        </label>
      )}
    </ModalShell>
  )
}

// ─── Request / Waitlist Modal ─────────────────────────────────────────────────
export function RequestModal({ sample, currentUserId, currentUserName, onClose, onConfirm }: {
  sample: Sample
  currentUserId: string
  currentUserName: string
  onClose: () => void
  onConfirm: (data: { units: number; purpose: CheckoutPurpose; is_tender: boolean; client: string; date_needed: string; notes: string }) => void
}) {
  const repClients = getRepClients(currentUserId)
  const [units, setUnits] = useState(1)
  const [purpose, setPurpose] = useState<CheckoutPurpose>('Client Presentation')
  const [isTender, setIsTender] = useState(false)
  const [client, setClient] = useState('')
  const [dateNeeded, setDateNeeded] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!client || !dateNeeded) { toast.error('Please fill all required fields.'); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    onConfirm({ units, purpose, is_tender: isTender, client, date_needed: dateNeeded, notes })
    toast.success('Request submitted.')
    setSaving(false); onClose()
  }

  return (
    <ModalShell
      title="Request Sample" subtitle={`${sample.id} — ${sample.name}`}
      icon={<Package className="w-5 h-5 text-brand-600" />} onClose={onClose}
      footer={<>
        <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</> : 'Submit Request'}
        </button>
      </>}
    >
      <div>
        <label className="label">Units Needed</label>
        <input type="number" min={1} value={units} onChange={e => setUnits(Number(e.target.value))} className="input mt-1" />
      </div>
      <div>
        <label className="label">Purpose</label>
        <select className="select mt-1" value={purpose} onChange={e => {
          const p = e.target.value as CheckoutPurpose
          setPurpose(p); if (p === 'Tender Submission') setIsTender(true)
        }}>
          {PURPOSES.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>
      <label className={cn('flex items-center gap-3 p-3 rounded-xl border cursor-pointer', isTender ? 'bg-amber-50 border-amber-300' : 'border-nexus-border')}>
        <input type="checkbox" checked={isTender} onChange={e => setIsTender(e.target.checked)} className="accent-amber-500 w-4 h-4" />
        <p className="text-sm font-medium text-nexus-ink">Tender request (priority queue)</p>
      </label>
      <div>
        <label className="label">Client <span className="text-red-500">*</span></label>
        <input className="input mt-1" list="request-client-list" value={client} onChange={e => setClient(e.target.value)} placeholder="Type or select…" />
        <datalist id="request-client-list">{repClients.map(c => <option key={c.id} value={c.name} />)}</datalist>
      </div>
      <div>
        <label className="label">Date Needed By <span className="text-red-500">*</span></label>
        <input type="date" className="input mt-1" value={dateNeeded} onChange={e => setDateNeeded(e.target.value)} />
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input resize-none h-20 mt-1" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional…" />
      </div>
    </ModalShell>
  )
}

// ─── Log Client Visit Modal ─────────────────────────────────────────────────
export function LogVisitModal({ checkout, currentUserId, onClose, onConfirm }: {
  checkout: CheckoutRecord; currentUserId: string
  onClose: () => void; onConfirm: (client: string, date: string, notes: string) => void
}) {
  const repClients = getRepClients(currentUserId)
  const [client, setClient] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!client) { toast.error('Client is required.'); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    onConfirm(client, date, notes)
    toast.success('Client visit logged.')
    setSaving(false); onClose()
  }

  return (
    <ModalShell
      title="Log Client Visit" subtitle={`Checkout ${checkout.checkout_id}`}
      icon={<Package className="w-5 h-5 text-brand-600" />} onClose={onClose}
      footer={<>
        <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Logging…</> : 'Log Visit'}
        </button>
      </>}
    >
      <div>
        <label className="label">Client <span className="text-red-500">*</span></label>
        <input className="input mt-1" list="visit-client-list" value={client} onChange={e => setClient(e.target.value)} placeholder="Type or select…" />
        <datalist id="visit-client-list">{repClients.map(c => <option key={c.id} value={c.name} />)}</datalist>
      </div>
      <div>
        <label className="label">Visit Date</label>
        <input type="date" className="input mt-1" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input resize-none h-20 mt-1" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional…" />
      </div>
    </ModalShell>
  )
}

// ─── Add Sample Drawer ────────────────────────────────────────────────────────
export function AddSampleDrawer({ open, currentUserName, onClose, onSave }: {
  open: boolean; currentUserName: string
  onClose: () => void
  onSave: (data: {
    name: string; category: string; description: string; total_units: number
    condition: SampleCondition; company: string; notes: string
  }) => void
}) {
  const CATEGORIES = ['Garments','Caps','PPE & Workwear','Bags & Accessories','Promotional Items','Fabric Swatches','Other']
  const COMPANIES = ['Kingsport', 'Bralyn', 'SGA']
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Garments')
  const [description, setDescription] = useState('')
  const [units, setUnits] = useState(1)
  const [condition, setCondition] = useState<SampleCondition>('Excellent')
  const [company, setCompany] = useState('Kingsport')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!name) { toast.error('Sample name is required.'); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    onSave({ name, category, description, total_units: units, condition, company, notes })
    toast.success('Sample added to catalogue.')
    setSaving(false); onClose()
    setName(''); setDescription(''); setUnits(1); setNotes('')
  }

  if (!open) return null

  return (
    <>
      <motion.div className="fixed inset-0 bg-black/40 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.aside
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[460px] bg-surface border-l border-nexus-border shadow-lift flex flex-col"
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-between p-5 border-b border-nexus-border flex-shrink-0">
          <div>
            <h2 className="font-display font-bold text-nexus-ink text-sm">Add Sample to Catalogue</h2>
            <p className="text-xs text-nexus-muted mt-0.5">Adding as {currentUserName}</p>
          </div>
          <button onClick={onClose} className="btn-icon rounded-xl"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="label">Sample Name <span className="text-red-500">*</span></label>
            <input className="input mt-1" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Navy Polo Shirt — Size L" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select className="select mt-1" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Company</label>
              <select className="select mt-1" value={company} onChange={e => setCompany(e.target.value)}>
                {COMPANIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Total Units</label>
              <input type="number" min={1} className="input mt-1" value={units} onChange={e => setUnits(Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Condition</label>
              <select className="select mt-1" value={condition} onChange={e => setCondition(e.target.value as SampleCondition)}>
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input mt-1 resize-none h-20" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional detail…" />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input mt-1 resize-none h-20" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes…" />
          </div>
        </div>
        <div className="p-5 border-t border-nexus-border flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <>Add Sample</>}
          </button>
        </div>
      </motion.aside>
    </>
  )
}

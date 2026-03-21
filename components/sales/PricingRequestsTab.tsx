'use client'

// ─── components/sales/PricingRequestsTab.tsx ──────────────────────────────────
// Self-contained Pricing Requests tab — extracted from the old standalone page.

import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Tag, Plus, X, CheckCircle, Clock, AlertTriangle,
    ChevronDown, ChevronUp, Search, Loader2, Bell,
} from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'
import { getRepClients } from '@/lib/customers'
import toast from 'react-hot-toast'

// ─── Role mock — swap role to test ────────────────────────────────────────────
const CURRENT_USER = {
    id: 'usr_rep_02',
    name: 'Lucia Chiwanza',
    role: 'sales_manager' as 'sales_rep' | 'sales_manager' | 'executive' | 'admin',
}

type TicketStatus = 'pending' | 'priced' | 'expired'
type UnitLabel = 'pieces' | 'sets' | 'boxes'

interface PricingTicket {
    id: string; ref: string; rep_id: string; rep_name: string; customer: string
    product_type: string; quantity: number; unit_label: UnitLabel
    design_types: string[]; deadline: string; notes?: string; status: TicketStatus
    created_at: string; priced_at?: string; priced_by?: string; unit_price?: number
}

const DESIGN_OPTIONS = [
    'Embroidery', 'Screen Print', 'Digital Print', 'Lithograph', 'Plain / No Decoration', 'Other',
]

function applyExpiry(tickets: PricingTicket[]): PricingTicket[] {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180)
    return tickets.map(t =>
        t.status !== 'priced' && new Date(t.created_at) < sixMonthsAgo
            ? { ...t, status: 'expired' as TicketStatus }
            : t
    )
}

const INITIAL_TICKETS: PricingTicket[] = applyExpiry([
    { id: 't1', ref: 'PRQ-2026-0001', rep_id: 'usr_rep_01', rep_name: 'Thandeka Madeya', customer: 'UNICEF', product_type: 'Branded Polo Shirts', quantity: 500, unit_label: 'pieces', design_types: ['Embroidery', 'Screen Print'], deadline: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10), notes: 'UNICEF branding — exact Pantone colours required. Rush order.', status: 'pending', created_at: '2026-02-26T09:15:00Z' },
    { id: 't2', ref: 'PRQ-2026-0002', rep_id: 'usr_rep_03', rep_name: 'Dudzai Ndemera', customer: 'Schweppes Zimbabwe', product_type: 'Promotional Caps', quantity: 300, unit_label: 'pieces', design_types: ['Embroidery'], deadline: new Date(Date.now() + 12 * 86400000).toISOString().slice(0, 10), notes: 'Soft-brushed caps, structured front.', status: 'pending', created_at: '2026-02-28T11:00:00Z' },
    { id: 't3', ref: 'PRQ-2026-0003', rep_id: 'usr_rep_04', rep_name: 'Spiwe Mandizha', customer: 'BAT Zimbabwe', product_type: 'Reflective Safety Vests', quantity: 200, unit_label: 'pieces', design_types: ['Screen Print', 'Plain / No Decoration'], deadline: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10), notes: 'Hi-vis orange vests with BAT logo on back.', status: 'pending', created_at: '2026-02-15T08:30:00Z' },
    { id: 't4', ref: 'PRQ-2026-0004', rep_id: 'usr_rep_02', rep_name: 'Chiedza Jowa', customer: 'TM Msasa', product_type: 'Staff Uniforms — Shirts', quantity: 120, unit_label: 'sets', design_types: ['Embroidery'], deadline: '2026-03-20', status: 'priced', created_at: '2026-02-10T09:00:00Z', priced_at: '2026-02-12T14:22:00Z', priced_by: 'Lucia Chiwanza', unit_price: 8.50 },
    { id: 't5', ref: 'PRQ-2026-0005', rep_id: 'usr_rep_01', rep_name: 'Thandeka Madeya', customer: 'Delta Beverages', product_type: 'Branded T-Shirts', quantity: 1000, unit_label: 'pieces', design_types: ['Screen Print', 'Digital Print'], deadline: '2026-03-10', status: 'priced', created_at: '2026-02-01T10:00:00Z', priced_at: '2026-02-03T09:15:00Z', priced_by: 'Kingstone Mhako', unit_price: 5.75 },
    { id: 't6', ref: 'PRQ-2026-0006', rep_id: 'usr_rep_05', rep_name: 'Sandra Mwanza', customer: 'NMB Bank', product_type: 'Executive Golf Shirts', quantity: 80, unit_label: 'pieces', design_types: ['Embroidery'], deadline: '2026-03-15', status: 'priced', created_at: '2026-02-05T13:30:00Z', priced_at: '2026-02-07T11:00:00Z', priced_by: 'Lucia Chiwanza', unit_price: 14.00 },
    { id: 't7', ref: 'PRQ-2026-0007', rep_id: 'usr_rep_03', rep_name: 'Dudzai Ndemera', customer: 'World Vision', product_type: 'Cotton Tote Bags', quantity: 600, unit_label: 'pieces', design_types: ['Lithograph'], deadline: '2026-03-25', status: 'priced', created_at: '2026-02-18T08:00:00Z', priced_at: '2026-02-20T10:30:00Z', priced_by: 'Lucia Chiwanza', unit_price: 4.20 },
    { id: 't8', ref: 'PRQ-2025-0048', rep_id: 'usr_rep_06', rep_name: 'Priviledge Zimunya', customer: 'EcoCash', product_type: 'Promo Notebooks', quantity: 250, unit_label: 'sets', design_types: ['Digital Print'], deadline: '2025-09-30', status: 'pending', created_at: '2025-08-01T09:00:00Z' },
])

function daysBetween(a: string, b: string) { return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000) }
function daysUntil(dateStr: string) { return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000) }
function nextRef(tickets: PricingTicket[]) {
    const year = new Date().getFullYear()
    const nums = tickets.filter(t => t.ref.startsWith(`PRQ-${year}`)).map(t => parseInt(t.ref.split('-')[2] ?? '0'))
    return `PRQ-${year}-${(Math.max(0, ...nums) + 1).toString().padStart(4, '0')}`
}

function StatusBadge({ status }: { status: TicketStatus }) {
    const styles: Record<TicketStatus, string> = { pending: 'bg-amber-100 text-amber-700', priced: 'bg-emerald-100 text-emerald-700', expired: 'bg-slate-100 text-slate-400' }
    return <span className={cn('badge capitalize', styles[status])}>{status}</span>
}

function SubmitDrawer({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (t: PricingTicket) => void }) {
    const repClients = getRepClients(CURRENT_USER.id)
    const [form, setForm] = useState({ customer: '', product_type: '', quantity: '', unit_label: 'pieces' as UnitLabel, design_types: [] as string[], deadline: '', notes: '' })
    const [saving, setSaving] = useState(false)
    const up = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))
    const toggleDesign = (d: string) => setForm(f => ({ ...f, design_types: f.design_types.includes(d) ? f.design_types.filter(x => x !== d) : [...f.design_types, d] }))

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!form.customer || !form.product_type || !form.quantity || !form.deadline) { toast.error('Please fill in all required fields.'); return }
        setSaving(true)
        await new Promise(r => setTimeout(r, 700))
        const ref = nextRef(INITIAL_TICKETS)
        onSubmit({ id: `t_${Date.now()}`, ref, rep_id: CURRENT_USER.id, rep_name: CURRENT_USER.name, customer: form.customer, product_type: form.product_type, quantity: Number(form.quantity), unit_label: form.unit_label, design_types: form.design_types, deadline: form.deadline, notes: form.notes || undefined, status: 'pending', created_at: new Date().toISOString() })
        toast.success(`Pricing request ${ref} submitted.`)
        setSaving(false); onClose()
        setForm({ customer: '', product_type: '', quantity: '', unit_label: 'pieces', design_types: [], deadline: '', notes: '' })
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div className="fixed inset-0 bg-black/40 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
                    <motion.div className="fixed right-0 top-0 bottom-0 w-[460px] bg-surface z-50 shadow-lift flex flex-col" initial={{ x: 460 }} animate={{ x: 0 }} exit={{ x: 460 }} transition={{ type: 'spring', damping: 26, stiffness: 280 }}>
                        <div className="flex items-center justify-between p-5 border-b border-nexus-border">
                            <div><h2 className="font-display font-bold text-base text-nexus-ink">Request Pricing</h2><p className="text-xs text-nexus-muted mt-0.5">Submit a new pricing ticket to the MD</p></div>
                            <button onClick={onClose} className="btn-icon rounded-lg"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
                            <div>
                                <label className="label">Customer Name <span className="text-red-500">*</span></label>
                                <input className="input" list="client-list" value={form.customer} onChange={e => up('customer', e.target.value)} placeholder="Type or select a client…" />
                                <datalist id="client-list">{repClients.map(c => <option key={c.id} value={c.name} />)}<option value="New / One-Off Customer" /></datalist>
                            </div>
                            <div><label className="label">Product Type <span className="text-red-500">*</span></label><input className="input" value={form.product_type} onChange={e => up('product_type', e.target.value)} placeholder="e.g. Branded Polo Shirts" /></div>
                            <div><label className="label">Quantity <span className="text-red-500">*</span></label><input className="input" type="number" min="1" value={form.quantity} onChange={e => up('quantity', e.target.value)} placeholder="e.g. 500" /></div>
                            <div><label className="label">Unit</label><select className="select" value={form.unit_label} onChange={e => up('unit_label', e.target.value)}>{(['pieces', 'sets', 'boxes'] as UnitLabel[]).map(u => <option key={u}>{u}</option>)}</select></div>
                            <div>
                                <label className="label">Design Type <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 gap-2 mt-1">{DESIGN_OPTIONS.map(d => (<label key={d} className={cn('flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors text-sm', form.design_types.includes(d) ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-nexus-border text-nexus-slate hover:border-brand-300')}><input type="checkbox" className="accent-brand-600" checked={form.design_types.includes(d)} onChange={() => toggleDesign(d)} />{d}</label>))}</div>
                            </div>
                            <div><label className="label">Delivery Deadline <span className="text-red-500">*</span></label><input className="input" type="date" value={form.deadline} onChange={e => up('deadline', e.target.value)} /></div>
                            <div><label className="label">Special Instructions / Notes</label><textarea className="input resize-none h-24" value={form.notes} onChange={e => up('notes', e.target.value)} placeholder="Any special requirements, colour codes, logo files, etc." /></div>
                        </form>
                        <div className="p-5 border-t border-nexus-border flex gap-3">
                            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                            <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1">{saving ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</> : <><Tag className="w-4 h-4" />Submit Request</>}</button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

function SetPriceModal({ ticket, onConfirm, onClose }: { ticket: PricingTicket; onConfirm: (price: number) => void; onClose: () => void }) {
    const [price, setPrice] = useState('')
    const [saving, setSaving] = useState(false)
    async function handleConfirm() {
        const p = parseFloat(price)
        if (!price || isNaN(p) || p <= 0) { toast.error('Enter a valid unit price.'); return }
        setSaving(true); await new Promise(r => setTimeout(r, 700)); onConfirm(p); toast.success(`${ticket.ref} priced and closed.`); setSaving(false)
    }
    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div className="bg-surface rounded-2xl shadow-lift w-full max-w-lg p-6" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-5"><div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center"><Tag className="w-5 h-5 text-brand-600" /></div><div><h3 className="font-display font-bold text-nexus-ink">Set Unit Price</h3><p className="text-xs text-nexus-muted mt-0.5">{ticket.ref} — {ticket.rep_name}</p></div></div>
                <div className="bg-surface-muted rounded-xl p-4 mb-5 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-nexus-muted">Customer</span><span className="font-medium text-nexus-ink">{ticket.customer}</span></div>
                    <div className="flex justify-between"><span className="text-nexus-muted">Product</span><span className="font-medium text-nexus-ink">{ticket.product_type}</span></div>
                    <div className="flex justify-between"><span className="text-nexus-muted">Quantity</span><span className="font-medium text-nexus-ink">{ticket.quantity.toLocaleString()} {ticket.unit_label}</span></div>
                    <div className="flex justify-between"><span className="text-nexus-muted">Design</span><span className="font-medium text-nexus-ink text-right max-w-[220px]">{ticket.design_types.join(', ')}</span></div>
                    <div className="flex justify-between"><span className="text-nexus-muted">Deadline</span><span className="font-medium text-nexus-ink">{formatDate(ticket.deadline)}</span></div>
                    {ticket.notes && <div className="flex justify-between"><span className="text-nexus-muted">Notes</span><span className="text-nexus-ink text-right max-w-[220px]">{ticket.notes}</span></div>}
                </div>
                <div className="mb-5"><label className="label">Unit Price (USD) <span className="text-red-500">*</span></label><div className="relative mt-1"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-muted font-semibold">$</span><input className="input pl-7" type="number" step="0.01" min="0.01" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} autoFocus /></div></div>
                <div className="flex gap-3"><button onClick={onClose} className="btn-secondary flex-1">Cancel</button><button onClick={handleConfirm} disabled={saving} className="btn-primary flex-1">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" />Price &amp; Close</>}</button></div>
            </motion.div>
        </div>
    )
}

function RepRow({ ticket }: { ticket: PricingTicket }) {
    const [expanded, setExpanded] = useState(false)
    const isExpired = ticket.status === 'expired'
    const deadlineSoon = daysUntil(ticket.deadline) <= 3
    return (
        <>
            <tr className={cn('cursor-pointer hover:bg-surface-muted transition-colors', isExpired && 'opacity-50')} onClick={() => setExpanded(e => !e)}>
                <td className="font-mono text-xs text-brand-600 font-semibold">{ticket.ref}</td>
                <td className="font-medium text-nexus-ink">{ticket.customer}</td>
                <td className="text-nexus-slate text-sm">{ticket.product_type}</td>
                <td className="text-nexus-slate text-sm num">{ticket.quantity.toLocaleString()} {ticket.unit_label}</td>
                <td className="text-nexus-muted text-xs max-w-[140px] truncate">{ticket.design_types.join(', ')}</td>
                <td className={cn('text-sm', deadlineSoon && ticket.status === 'pending' ? 'text-red-600 font-semibold' : 'text-nexus-muted')}>{formatDate(ticket.deadline)}{deadlineSoon && ticket.status === 'pending' && <span className="ml-1 text-[10px]">⚠</span>}</td>
                <td className="text-nexus-muted text-xs">{formatDate(ticket.created_at)}</td>
                <td><StatusBadge status={ticket.status} /></td>
                <td>{expanded ? <ChevronUp className="w-4 h-4 text-nexus-light" /> : <ChevronDown className="w-4 h-4 text-nexus-light" />}</td>
            </tr>
            {expanded && (
                <tr><td colSpan={9} className="bg-surface-soft px-5 py-4 border-b border-nexus-border">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                            {ticket.notes && <div><span className="text-nexus-muted text-xs uppercase font-semibold">Notes</span><p className="mt-0.5 text-nexus-ink">{ticket.notes}</p></div>}
                            <div><span className="text-nexus-muted text-xs uppercase font-semibold">Design Types</span><p className="mt-0.5 text-nexus-ink">{ticket.design_types.join(', ') || '—'}</p></div>
                        </div>
                        {ticket.status === 'priced' && ticket.unit_price !== undefined && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-1">Pricing Set</p>
                                <p className="text-2xl font-display font-bold text-emerald-700 num">${ticket.unit_price.toFixed(2)} <span className="text-sm font-normal">/ unit</span></p>
                                <p className="text-xs text-emerald-500 mt-1">By {ticket.priced_by} · {formatDate(ticket.priced_at!)}</p>
                            </div>
                        )}
                        {ticket.status === 'expired' && <div className="bg-slate-50 border border-slate-200 rounded-xl p-4"><p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Expired</p><p className="text-sm text-slate-400 mt-1">This ticket has passed the 6-month reference window.</p></div>}
                    </div>
                </td></tr>
            )}
        </>
    )
}

function MDRow({ ticket, onSetPrice }: { ticket: PricingTicket; onSetPrice: (t: PricingTicket) => void }) {
    const daysWaiting = daysBetween(ticket.created_at, new Date().toISOString())
    const deadlineDays = daysUntil(ticket.deadline)
    const isUrgent = deadlineDays <= 3
    const isOld = daysWaiting > 7
    return (
        <tr className={cn('transition-colors', isUrgent ? 'bg-red-50 hover:bg-red-100' : isOld ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-surface-muted')}>
            <td className="font-mono text-xs text-brand-600 font-semibold">{ticket.ref}</td>
            <td className="font-medium text-nexus-ink">{ticket.rep_name}{isUrgent && <span className="ml-2 badge bg-red-100 text-red-600 text-[10px]">URGENT</span>}{!isUrgent && isOld && <span className="ml-2 badge bg-amber-100 text-amber-700 text-[10px]">AWAITING</span>}</td>
            <td className="text-nexus-slate">{ticket.customer}</td>
            <td className="text-nexus-slate text-sm">{ticket.product_type}</td>
            <td className="text-nexus-slate text-sm num">{ticket.quantity.toLocaleString()} {ticket.unit_label}</td>
            <td className="text-nexus-muted text-xs max-w-[140px] truncate">{ticket.design_types.join(', ')}</td>
            <td className={cn('text-sm font-medium', isUrgent ? 'text-red-600' : 'text-nexus-slate')}>{formatDate(ticket.deadline)}{isUrgent && <span className="block text-xs font-normal text-red-500">{deadlineDays}d remaining</span>}</td>
            <td className={cn('text-sm num', isOld ? 'text-amber-600 font-semibold' : 'text-nexus-muted')}>{daysWaiting}d</td>
            <td><button onClick={() => onSetPrice(ticket)} className="btn-primary btn-sm text-xs">Set Price</button></td>
        </tr>
    )
}

// ── Main exported tab component ────────────────────────────────────────────────
export default function PricingRequestsTab() {
    const [tickets, setTickets] = useState<PricingTicket[]>(INITIAL_TICKETS)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [priceModal, setPriceModal] = useState<PricingTicket | null>(null)
    const [archiveOpen, setArchiveOpen] = useState(false)
    const [archiveSearch, setArchiveSearch] = useState('')
    const [notifications, setNotifications] = useState<string[]>([])

    const role = CURRENT_USER.role
    const isManager = role === 'sales_manager'
    const isMD = role === 'executive'
    const isManagerOrMD = isManager || isMD
    const isRep = role === 'sales_rep'

    const myTickets = useMemo(() => tickets.filter(t => isRep ? t.rep_id === CURRENT_USER.id : true), [tickets])
    const pending = useMemo(() => tickets.filter(t => t.status === 'pending'), [tickets])
    const closed = useMemo(() => {
        const base = isRep ? myTickets : tickets
        return base.filter(t => t.status !== 'pending').filter(t => !archiveSearch || t.customer.toLowerCase().includes(archiveSearch.toLowerCase()) || t.ref.toLowerCase().includes(archiveSearch.toLowerCase()))
    }, [tickets, myTickets, archiveSearch, isRep])

    function handleNewTicket(t: PricingTicket) { setTickets(prev => [t, ...prev]) }
    function handleConfirmPrice(price: number) {
        if (!priceModal) return
        setTickets(prev => prev.map(t => t.id === priceModal.id ? { ...t, status: 'priced', unit_price: price, priced_at: new Date().toISOString(), priced_by: CURRENT_USER.name } : t))
        setNotifications(prev => [`Your pricing request ${priceModal.ref} for ${priceModal.customer} has been priced at USD ${price.toFixed(2)} per unit.`, ...prev])
        setPriceModal(null)
    }

    const repActive = myTickets.filter(t => t.status === 'pending')

    // KPI data
    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const pricedThisMonth = tickets.filter(t => t.status === 'priced' && t.priced_at && t.priced_at >= firstOfMonth)
    const oldest = pending.length > 0 ? Math.max(...pending.map(t => daysBetween(t.created_at, now.toISOString()))) : 0
    const urgent = pending.filter(t => daysUntil(t.deadline) <= 3)

    return (
        <motion.div className="space-y-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

            {/* Sub-header actions */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-nexus-muted">{isRep ? 'Submit and track your pricing tickets' : 'Manage and price open requests from the team'}</p>
                {(isRep || isManager) && <button onClick={() => setDrawerOpen(true)} className="btn-primary btn-sm"><Plus className="w-3.5 h-3.5" />Request Pricing</button>}
            </div>

            {/* Notifications */}
            {notifications.length > 0 && (
                <div className="space-y-2">
                    {notifications.map((n, i) => (
                        <motion.div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                            <Bell className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-emerald-700 flex-1">{n}</p>
                            <button onClick={() => setNotifications(prev => prev.filter((_, j) => j !== i))} className="text-emerald-400 hover:text-emerald-600"><X className="w-3.5 h-3.5" /></button>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* KPI Strip — manager/MD only */}
            {isManagerOrMD && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Open Requests', value: pending.length, color: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock className="w-4 h-4" /> },
                        { label: 'Priced This Month', value: pricedThisMonth.length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <CheckCircle className="w-4 h-4" /> },
                        { label: 'Oldest Pending', value: `${oldest}d`, color: 'text-brand-600', bg: 'bg-brand-50', icon: <Tag className="w-4 h-4" /> },
                        { label: 'Urgent', value: urgent.length, color: 'text-red-500', bg: 'bg-red-50', icon: <AlertTriangle className="w-4 h-4" /> },
                    ].map((k, i) => (
                        <motion.div key={k.label} className="stat-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', k.bg, k.color)}>{k.icon}</div>
                            <div><p className="kpi-label">{k.label}</p><p className={cn('text-2xl font-display font-bold num mt-0.5', k.color)}>{k.value}</p></div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* MD/Manager: open queue */}
            {isManagerOrMD && (
                <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <div className="flex items-center justify-between p-5 border-b border-nexus-border">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center"><Clock className="w-4 h-4 text-amber-600" /></div>
                            <h2 className="font-display font-semibold text-sm text-nexus-ink">Open Queue</h2>
                            {pending.length > 0 && <span className="badge bg-amber-100 text-amber-700">{pending.length} pending</span>}
                        </div>
                    </div>
                    {pending.length === 0 ? (
                        <div className="p-10 text-center"><CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" /><p className="text-nexus-muted text-sm">All requests have been priced. Queue is clear.</p></div>
                    ) : (
                        <div className="table-wrapper rounded-none border-0">
                            <table className="table">
                                <thead><tr><th>Reference</th><th>Rep</th><th>Customer</th><th>Product</th><th>Qty</th><th>Design</th><th>Deadline</th><th>Waiting</th><th className="w-24"></th></tr></thead>
                                <tbody>{pending.map(t => <MDRow key={t.id} ticket={t} onSetPrice={setPriceModal} />)}</tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Rep: active tickets */}
            {isRep && (
                <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="p-5 border-b border-nexus-border"><h2 className="font-display font-semibold text-sm text-nexus-ink">My Active Requests</h2></div>
                    {repActive.length === 0 ? (
                        <div className="p-8 text-center"><Tag className="w-7 h-7 text-nexus-light mx-auto mb-2" /><p className="text-nexus-muted text-sm">No open requests. Use "Request Pricing" to submit one.</p></div>
                    ) : (
                        <div className="table-wrapper rounded-none border-0">
                            <table className="table">
                                <thead><tr><th>Reference</th><th>Customer</th><th>Product</th><th>Qty</th><th>Design</th><th>Deadline</th><th>Submitted</th><th>Status</th><th className="w-8"></th></tr></thead>
                                <tbody>{repActive.map(t => <RepRow key={t.id} ticket={t} />)}</tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Closed & Archived */}
            {(isRep || isManager) && (
                <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <button onClick={() => setArchiveOpen(o => !o)} className="w-full flex items-center justify-between p-5 hover:bg-surface-muted transition-colors rounded-2xl">
                        <div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-slate-400" /></div><span className="font-display font-semibold text-sm text-nexus-ink">Closed &amp; Archived</span><span className="badge bg-slate-100 text-slate-500">{closed.length} tickets</span></div>
                        {archiveOpen ? <ChevronUp className="w-4 h-4 text-nexus-muted" /> : <ChevronDown className="w-4 h-4 text-nexus-muted" />}
                    </button>
                    <AnimatePresence>
                        {archiveOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                                <div className="px-5 pb-3 border-t border-nexus-border pt-4"><div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-light" /><input className="input pl-9" placeholder="Search by customer or reference…" value={archiveSearch} onChange={e => setArchiveSearch(e.target.value)} /></div></div>
                                {closed.length === 0 ? (
                                    <p className="px-5 pb-5 text-nexus-muted text-sm">No archived tickets match your search.</p>
                                ) : (
                                    <div className="table-wrapper rounded-none border-0 border-t border-nexus-border">
                                        <table className="table">
                                            <thead><tr><th>Reference</th><th>Customer</th><th>Product</th><th>Qty</th><th>Design</th><th>Deadline</th><th>Submitted</th><th>Status</th><th className="w-8"></th></tr></thead>
                                            <tbody>{closed.map(t => <RepRow key={t.id} ticket={t} />)}</tbody>
                                        </table>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}

            <SubmitDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSubmit={handleNewTicket} />
            {priceModal && <SetPriceModal ticket={priceModal} onConfirm={handleConfirmPrice} onClose={() => setPriceModal(null)} />}
        </motion.div>
    )
}

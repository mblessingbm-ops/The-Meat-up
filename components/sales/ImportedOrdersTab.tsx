'use client'

// ─── components/sales/ImportedOrdersTab.tsx ───────────────────────────────────
// Self-contained Imported Orders tab — extracted from the old standalone list page.

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Plus, Search, Eye, DollarSign, Clock, CheckCircle, TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    MOCK_IMPORTED_ORDERS,
    STATUS_COLORS, STATUS_LABELS,
    calcMargin, marginColor,
    type OrderStatus,
} from '@/lib/imported-orders'

// ── Mock current user — swap with real session ─────────────────────────────────
const CURRENT_USER = {
    id: 'exec1',
    name: 'Kingstone Mhako',
    role: 'executive' as 'executive' | 'sales_manager' | 'sales_rep' | 'data_capture' | 'admin',
    rep_id: '',
}

const IS_MANAGER = CURRENT_USER.role === 'sales_manager'
const IS_EXEC = CURRENT_USER.role === 'executive' || CURRENT_USER.role === 'admin'
const IS_REP = CURRENT_USER.role === 'sales_rep'

const CURRENT_MONTH_START = new Date(new Date('2026-03-06').getFullYear(), new Date('2026-03-06').getMonth(), 1)

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount)
}
function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending_manager', label: 'Awaiting Manager' },
    { value: 'pending_executive', label: 'Awaiting Executive' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' },
]

export default function ImportedOrdersTab() {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    const baseOrders = useMemo(() =>
        IS_REP ? MOCK_IMPORTED_ORDERS.filter(o => o.rep_id === CURRENT_USER.rep_id) : MOCK_IMPORTED_ORDERS,
        []
    )

    const filtered = useMemo(() =>
        baseOrders.filter(o =>
            (statusFilter === 'all' || o.status === statusFilter) &&
            (!search ||
                o.client_name.toLowerCase().includes(search.toLowerCase()) ||
                o.ref.toLowerCase().includes(search.toLowerCase()) ||
                o.rep_name.toLowerCase().includes(search.toLowerCase()) ||
                o.product_description.toLowerCase().includes(search.toLowerCase())
            )
        ),
        [baseOrders, search, statusFilter]
    )

    const displayOrders = useMemo(() => {
        if (!IS_EXEC) return filtered
        const awaitingMe = filtered.filter(o => o.status === 'pending_executive')
        const rest = filtered.filter(o => o.status !== 'pending_executive')
        return [...awaitingMe, ...rest]
    }, [filtered])

    // KPIs
    const openOrders = baseOrders.filter(o => o.status === 'pending_manager' || o.status === 'pending_executive').length
    const awaitingMySig = IS_EXEC
        ? baseOrders.filter(o => o.status === 'pending_executive').length
        : IS_MANAGER
            ? baseOrders.filter(o => o.status === 'pending_manager').length
            : 0
    const approvedOrders = baseOrders.filter(o => {
        const trail = o.signing_trail.find(e => e.stage === 'approved')
        return trail && new Date(trail.timestamp) >= CURRENT_MONTH_START
    })
    const approvedThisMonth = approvedOrders.length
    const totalValueThisMonth = approvedOrders.reduce((s, o) => s + o.client_charge, 0)

    const showKPI = IS_EXEC || IS_MANAGER
    const canCreate = IS_REP || IS_MANAGER || CURRENT_USER.role === 'data_capture' || IS_EXEC

    return (
        <motion.div className="space-y-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

            {/* Sub-header: description + New Order button */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-nexus-muted">Amrod &amp; KMQ orders — two-stage countersigning workflow</p>
                {canCreate && (
                    <Link href="/dashboard/sales/imported-orders/new">
                        <button className="btn-primary btn-sm"><Plus className="w-3.5 h-3.5" />New Order</button>
                    </Link>
                )}
            </div>

            {/* KPI Strip */}
            {showKPI && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Open Orders', value: openOrders, icon: <Clock className="w-4 h-4" />, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'Pending at any stage' },
                        { label: 'Awaiting My Signature', value: awaitingMySig, icon: <CheckCircle className="w-4 h-4" />, color: awaitingMySig > 0 ? 'text-purple-600' : 'text-nexus-muted', bg: awaitingMySig > 0 ? 'bg-purple-50' : 'bg-surface-muted', sub: awaitingMySig > 0 ? 'Action required' : 'All clear' },
                        { label: 'Approved This Month', value: approvedThisMonth, icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'March 2026' },
                        { label: 'Value This Month', value: formatCurrency(totalValueThisMonth), icon: <DollarSign className="w-4 h-4" />, color: 'text-brand-600', bg: 'bg-brand-50', sub: 'Client charge total' },
                    ].map((k, i) => (
                        <motion.div key={k.label} className="stat-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', k.bg, k.color)}>{k.icon}</div>
                            <div><p className="kpi-label">{k.label}</p><p className={cn('text-lg font-display font-bold num mt-0.5', k.color)}>{k.value}</p>{k.sub && <p className="text-[10px] text-nexus-muted mt-0.5">{k.sub}</p>}</div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Awaiting-signature banner */}
            {awaitingMySig > 0 && (
                <motion.div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <p className="text-sm text-purple-700 font-medium">
                        {awaitingMySig} order{awaitingMySig > 1 ? 's' : ''} require{awaitingMySig === 1 ? 's' : ''} your signature — shown at the top of the list below.
                    </p>
                </motion.div>
            )}

            {/* Table card */}
            <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                {/* Toolbar */}
                <div className="p-4 border-b border-nexus-border flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-light" />
                        <input className="input pl-9" placeholder="Search orders, clients, reps…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                        {STATUS_FILTERS.map(sf => (
                            <button key={sf.value} onClick={() => setStatusFilter(sf.value)} className={cn('badge cursor-pointer text-xs transition-all', statusFilter === sf.value ? 'bg-brand-600 text-white' : 'bg-surface-muted text-nexus-slate hover:bg-nexus-border border border-nexus-border')}>
                                {sf.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="table-wrapper rounded-none border-0">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Order Ref</th><th>Supplier</th><th>Client</th>
                                {!IS_REP && <th>Rep</th>}
                                <th>Product</th><th>Supplier Cost</th><th>Client Charge</th><th>Margin</th><th>Status</th><th>Submitted</th><th className="w-16"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayOrders.length === 0 && (
                                <tr>
                                    <td colSpan={11} className="text-center py-10 text-nexus-muted text-sm">
                                        <TrendingUp className="w-10 h-10 mx-auto mb-2 text-nexus-border" />No orders match your filters.
                                    </td>
                                </tr>
                            )}
                            {displayOrders.map(order => {
                                const margin = calcMargin(order.supplier_cost, order.client_charge)
                                const isAwaitingMe = IS_EXEC && order.status === 'pending_executive'
                                return (
                                    <tr key={order.id} className={cn(isAwaitingMe && 'bg-purple-50 border-l-4 border-purple-400')}>
                                        <td className="font-semibold num text-brand-600 whitespace-nowrap">
                                            {order.ref}
                                            {isAwaitingMe && <span className="ml-2 badge bg-purple-100 text-purple-700 text-[10px] py-0">Sign required</span>}
                                        </td>
                                        <td>
                                            <span className={cn('badge text-xs', order.supplier === 'Amrod' ? 'bg-orange-100 text-orange-700' : order.supplier === 'KMQ' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600')}>
                                                {order.supplier}
                                            </span>
                                        </td>
                                        <td className="font-medium text-nexus-ink">{order.client_name}</td>
                                        {!IS_REP && <td className="text-nexus-slate text-sm">{order.rep_name}</td>}
                                        <td className="text-nexus-muted text-sm max-w-[200px]"><p className="line-clamp-2">{order.product_description}</p></td>
                                        <td className="num text-nexus-slate text-sm">{formatCurrency(order.supplier_cost)}</td>
                                        <td className="num font-semibold text-nexus-ink">{formatCurrency(order.client_charge)}</td>
                                        <td><span className={cn('font-bold num text-sm', marginColor(margin))}>{margin.toFixed(1)}%</span></td>
                                        <td><span className={cn('badge capitalize text-xs', STATUS_COLORS[order.status as OrderStatus])}>{STATUS_LABELS[order.status as OrderStatus]}</span></td>
                                        <td className="text-nexus-muted text-sm whitespace-nowrap">
                                            {order.signing_trail[0] ? formatDate(order.signing_trail[0].timestamp) : formatDate(order.created_at)}
                                        </td>
                                        <td>
                                            <Link href={`/dashboard/sales/imported-orders/${order.id}`}>
                                                <button className="btn-icon rounded-lg" title="View order"><Eye className="w-3.5 h-3.5" /></button>
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="px-4 py-3 border-t border-nexus-border text-xs text-nexus-muted">
                    {displayOrders.length} order{displayOrders.length !== 1 ? 's' : ''} shown
                </div>
            </motion.div>
        </motion.div>
    )
}

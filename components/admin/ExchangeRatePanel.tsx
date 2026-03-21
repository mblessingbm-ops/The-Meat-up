'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpDown, ChevronDown, ChevronUp, Clock, Edit3, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    getCurrentRate, getRateHistory, setExchangeRate, fmtRateDateTime, fmtRateDate,
    type ExchangeRateEntry,
} from '@/lib/exchange-rate'
import toast from 'react-hot-toast'

// role-based: admin/exec can edit, accountant read-only, others hidden
type PanelRole = 'admin' | 'executive' | 'accountant'

export default function ExchangeRatePanel({ role }: { role: PanelRole }) {
    const [current, setCurrent] = useState<ExchangeRateEntry>(getCurrentRate())
    const [history, setHistory] = useState<ExchangeRateEntry[]>(getRateHistory())
    const [editing, setEditing] = useState(false)
    const [inputRate, setInputRate] = useState('')
    const [saving, setSaving] = useState(false)
    const [showHistory, setShowHistory] = useState(false)

    const canEdit = role === 'admin' || role === 'executive'

    async function handleSave() {
        const r = parseFloat(inputRate)
        if (isNaN(r) || r <= 0) { toast.error('Please enter a valid exchange rate.'); return }
        setSaving(true)
        await new Promise(res => setTimeout(res, 450))
        const updater = role === 'admin' ? 'Stanley Mwangi' : 'Kingstone Mhako'
        const entry = setExchangeRate(r, updater)
        setCurrent(entry)
        setHistory(getRateHistory())
        setSaving(false)
        setEditing(false)
        setInputRate('')
        toast.success(`Exchange rate updated — 1 USD = ${r.toFixed(2)} ZAR`)
    }

    return (
        <div className="card p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <ArrowUpDown className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="font-display font-bold text-nexus-ink">ZAR / USD Exchange Rate</h3>
                </div>
                {canEdit && !editing && (
                    <button onClick={() => { setEditing(true); setInputRate(current.rate.toFixed(2)) }} className="btn-secondary btn-sm">
                        <Edit3 className="w-3.5 h-3.5" />Update Rate
                    </button>
                )}
            </div>

            {/* Current rate display */}
            <div className="flex items-center gap-4 p-4 bg-surface-muted rounded-xl border border-nexus-border">
                <div>
                    <p className="text-xs text-nexus-muted mb-0.5">Current Rate</p>
                    <p className="text-2xl font-display font-bold text-nexus-ink num">
                        1 USD = <span className="text-emerald-600">{current.rate.toFixed(2)}</span> ZAR
                    </p>
                    <p className="text-xs text-nexus-muted mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last updated by {current.set_by} on {fmtRateDateTime(current.set_at)}
                    </p>
                </div>
            </div>

            {/* Inline edit form */}
            <AnimatePresence>
                {editing && canEdit && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-nexus-ink font-medium">1 USD =</span>
                                <input
                                    type="number" min={1} step={0.01}
                                    className="input w-36 text-sm"
                                    value={inputRate}
                                    onChange={e => setInputRate(e.target.value)}
                                    placeholder="18.20"
                                    autoFocus
                                />
                                <span className="text-sm text-nexus-ink font-medium">ZAR</span>
                            </div>
                            <p className="text-xs text-nexus-muted italic">
                                This rate will be applied to all new Imported Orders created today. It does not retroactively change previously saved orders.
                            </p>
                            <div className="flex gap-2">
                                <button onClick={handleSave} disabled={saving} className="btn-primary btn-sm">
                                    {saving ? 'Saving…' : <><Check className="w-3.5 h-3.5" />Save Rate</>}
                                </button>
                                <button onClick={() => { setEditing(false); setInputRate('') }} className="btn-secondary btn-sm">
                                    <X className="w-3.5 h-3.5" />Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Rate history collapsible */}
            <div>
                <button
                    onClick={() => setShowHistory(v => !v)}
                    className="flex items-center gap-1.5 text-sm text-brand-600 font-medium hover:text-brand-700 transition-colors"
                >
                    {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    View rate history
                </button>
                <AnimatePresence>
                    {showHistory && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                            className="overflow-hidden mt-3"
                        >
                            <div className="table-wrapper rounded-xl border border-nexus-border">
                                <table className="table text-xs">
                                    <thead>
                                        <tr><th>Date</th><th>Rate</th><th>Set by</th></tr>
                                    </thead>
                                    <tbody>
                                        {history.map((h, i) => (
                                            <tr key={i}>
                                                <td className="text-nexus-muted whitespace-nowrap">{fmtRateDate(h.set_at)}</td>
                                                <td className="font-semibold num text-nexus-ink">1 USD = {h.rate.toFixed(2)} ZAR</td>
                                                <td className="text-nexus-muted">{h.set_by}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

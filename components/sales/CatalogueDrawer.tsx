'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, ChevronDown, ChevronUp, Download, Check, AlertTriangle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    INITIAL_CATALOGUE_DOCS, isExpired, isExpiringSoon,
    SUPPLIER_BADGE_COLORS, DOC_TYPE_BADGE_COLORS, DOC_TYPE_LABELS,
    type CatalogueDoc, type CatalogueDocType,
} from '@/lib/catalogue'

function fmtDate(d?: string) {
    if (!d) return ''
    return new Date(d).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface DrawerProps {
    supplier: string   // 'Amrod' | 'KMQ' | 'Other'
    onClose: () => void
    onCopyToForm: (productName: string, supplierCost: number | '') => void
    currentProductDesc?: string
}

// ── Per-doc accordion row inside the drawer ────────────────────────────────
function DrawerDocRow({
    doc, onCopyToForm, currentProductDesc,
}: {
    doc: CatalogueDoc
    onCopyToForm: (productName: string, supplierCost: number | '') => void
    currentProductDesc?: string
}) {
    const expired = isExpired(doc)
    const expiringSoon = isExpiringSoon(doc)
    const [open, setOpen] = useState(false)
    const [copyProduct, setCopyProduct] = useState(currentProductDesc ?? '')
    const [copyCost, setCopyCost] = useState<number | ''>('')
    const [copied, setCopied] = useState(false)

    function handleCopy() {
        onCopyToForm(copyProduct, copyCost)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className={cn('border border-nexus-border rounded-xl overflow-hidden', expired && 'opacity-60')}>
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-start gap-3 p-3 text-left hover:bg-surface-muted transition-colors"
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        {expired && <span className="badge bg-red-100 text-red-600 text-[9px]">Expired</span>}
                        {expiringSoon && !expired && <span className="badge bg-amber-100 text-amber-700 text-[9px]"><AlertTriangle className="w-2.5 h-2.5 inline" />Expiring soon</span>}
                    </div>
                    <p className="text-sm font-semibold text-nexus-ink leading-tight">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-nexus-muted">
                        <span>{fmtDate(doc.uploaded_at)}</span>
                        {doc.valid_until && <span className={cn(expired ? 'text-red-500' : expiringSoon ? 'text-amber-600' : '')}>· Valid until {fmtDate(doc.valid_until)}</span>}
                        <span>· {doc.uploaded_by}</span>
                    </div>
                    {doc.notes && (
                        <p className="text-[11px] text-nexus-muted mt-1 line-clamp-2">{doc.notes}</p>
                    )}
                </div>
                {open ? <ChevronUp className="w-4 h-4 text-nexus-muted flex-shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-nexus-muted flex-shrink-0 mt-0.5" />}
            </button>

            {/* Expanded PDF area + copy bar */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        {/* PDF placeholder */}
                        <div className="border-t border-nexus-border bg-surface-muted flex items-center justify-center min-h-[180px] flex-col gap-3">
                            <FileText className="w-12 h-12 text-nexus-border" />
                            <p className="text-sm text-nexus-muted text-center">
                                PDF preview not available<br />
                                <button className="text-brand-600 hover:underline inline-flex items-center gap-1"><Download className="w-3 h-3" />Download to view</button>
                            </p>
                        </div>

                        {/* Copy to Form floating bar */}
                        <div className="border-t border-nexus-border bg-surface p-3 space-y-2">
                            <p className="text-[11px] font-semibold text-nexus-muted uppercase tracking-wider">Copy to Order Form</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[11px] text-nexus-muted">Product Name</label>
                                    <input
                                        className="input text-xs mt-0.5"
                                        value={copyProduct}
                                        onChange={e => setCopyProduct(e.target.value)}
                                        placeholder="Product name from catalogue…"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] text-nexus-muted">Supplier Cost (USD)</label>
                                    <div className="relative mt-0.5">
                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-nexus-muted text-xs">$</span>
                                        <input
                                            type="number" min={0} step={0.01}
                                            className="input text-xs pl-5"
                                            value={copyCost}
                                            onChange={e => setCopyCost(e.target.value === '' ? '' : Number(e.target.value))}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleCopy}
                                className={cn(
                                    'w-full btn-sm font-semibold transition-all rounded-lg text-xs',
                                    copied
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-brand-600 text-white hover:bg-brand-700'
                                )}
                            >
                                {copied
                                    ? <><Check className="w-3.5 h-3.5" />Copied to Form!</>
                                    : 'Copy to Order Form'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ── Main Catalogue Drawer ───────────────────────────────────────────────────
export default function CatalogueDrawer({ supplier, onClose, onCopyToForm, currentProductDesc }: DrawerProps) {
    const [activeTab, setActiveTab] = useState<CatalogueDocType>('catalogue')

    const supplierDocs = INITIAL_CATALOGUE_DOCS.filter(d => d.supplier === supplier)

    const tabs: { key: CatalogueDocType; label: string }[] = [
        { key: 'catalogue', label: 'Catalogues' },
        { key: 'supplier_quote', label: 'Supplier Quotes' },
        { key: 'order_reference', label: 'Order References' },
    ]

    const tabDocs = supplierDocs.filter(d => d.doc_type === activeTab)
    // active first, expired at bottom
    const sorted = [
        ...tabDocs.filter(d => !isExpired(d)).sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at)),
        ...tabDocs.filter(d => isExpired(d)).sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at)),
    ]

    return (
        <>
            {/* Backdrop (transparent — form stays visible/interactive) */}
            <div className="fixed inset-0 z-40" onClick={onClose} />

            {/* Drawer */}
            <motion.aside
                className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] bg-surface border-l border-nexus-border shadow-lift flex flex-col"
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-nexus-border flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white',
                            supplier === 'Amrod' ? 'bg-blue-500' : supplier === 'KMQ' ? 'bg-teal-500' : 'bg-slate-500'
                        )}>
                            {supplier[0]}
                        </div>
                        <div>
                            <h2 className="font-display font-bold text-nexus-ink text-sm">{supplier} Reference Library</h2>
                            <p className="text-[11px] text-nexus-muted">{supplierDocs.length} document{supplierDocs.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn-icon rounded-xl"><X className="w-4 h-4" /></button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-nexus-border flex-shrink-0">
                    {tabs.map(t => {
                        const count = supplierDocs.filter(d => d.doc_type === t.key).length
                        return (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key)}
                                className={cn(
                                    'flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px',
                                    activeTab === t.key
                                        ? 'border-brand-600 text-brand-600'
                                        : 'border-transparent text-nexus-muted hover:text-nexus-ink'
                                )}
                            >
                                {t.label}
                                {count > 0 && <span className={cn('ml-1 badge text-[9px]', activeTab === t.key ? 'bg-brand-50 text-brand-600' : 'bg-surface-muted text-nexus-muted')}>{count}</span>}
                            </button>
                        )
                    })}
                </div>

                {/* Doc list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {sorted.length === 0 ? (
                        <div className="text-center py-12 space-y-2">
                            <Clock className="w-10 h-10 text-nexus-border mx-auto" />
                            <p className="text-sm text-nexus-muted">No {DOC_TYPE_LABELS[activeTab].toLowerCase()}s for {supplier}.</p>
                        </div>
                    ) : (
                        sorted.map(doc => (
                            <DrawerDocRow
                                key={doc.id}
                                doc={doc}
                                onCopyToForm={onCopyToForm}
                                currentProductDesc={currentProductDesc}
                            />
                        ))
                    )}
                </div>
            </motion.aside>
        </>
    )
}

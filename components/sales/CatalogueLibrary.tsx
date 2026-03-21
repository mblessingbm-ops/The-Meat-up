'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    BookOpen, Plus, Download, Eye, X, Trash2, ChevronRight,
    FileText, AlertTriangle, Upload, Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    INITIAL_CATALOGUE_DOCS, isExpired, isExpiringSoon,
    SUPPLIER_BADGE_COLORS, DOC_TYPE_BADGE_COLORS, DOC_TYPE_LABELS,
    type CatalogueDoc, type CatalogueSupplier, type CatalogueDocType,
} from '@/lib/catalogue'
import toast from 'react-hot-toast'
import { MOCK_CUSTOMERS } from '@/lib/customers'

const ALL_CLIENTS = MOCK_CUSTOMERS.map(c => c.name).sort((a, b) => a.localeCompare(b))

const COMPLETED_ORDERS = [
    'IMP-2026-0001', 'IMP-2026-0002', 'IMP-2026-0003', 'IMP-2026-0004',
    'IMP-2025-0041', 'IMP-2025-0037',
]

const CURRENT_USER_NAME = 'Lucia'
const CAN_DELETE_ANY = true  // executive/manager

const TODAY_STR = '2026-03-06'

function fmtDate(d?: string) {
    if (!d) return ''
    return new Date(d).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({
    onClose, onUpload,
}: {
    onClose: () => void
    onUpload: (doc: CatalogueDoc) => void
}) {
    const [title, setTitle] = useState('')
    const [supplier, setSupplier] = useState<CatalogueSupplier>('Amrod')
    const [docType, setDocType] = useState<CatalogueDocType>('catalogue')
    const [validFrom, setValidFrom] = useState('')
    const [validUntil, setValidUntil] = useState('')
    const [linkedClient, setLinkedClient] = useState('')
    const [linkedOrder, setLinkedOrder] = useState('')
    const [notes, setNotes] = useState('')
    const [fileName, setFileName] = useState('')
    const fileRef = useRef<HTMLInputElement>(null)
    const [saving, setSaving] = useState(false)

    async function handleSave() {
        if (!title.trim()) { toast.error('Document title is required'); return }
        if (!fileName) { toast.error('Please attach a file'); return }
        setSaving(true)
        await new Promise(r => setTimeout(r, 400))
        const doc: CatalogueDoc = {
            id: `cat_${Date.now()}`,
            title: title.trim(),
            supplier, doc_type: docType,
            uploaded_by: CURRENT_USER_NAME,
            uploaded_by_full: 'Lucia Chiwanza',
            uploaded_at: TODAY_STR,
            valid_from: validFrom || undefined,
            valid_until: validUntil || undefined,
            linked_client: linkedClient || undefined,
            linked_order: linkedOrder || undefined,
            notes: notes.trim() || undefined,
            file_name: fileName,
        }
        onUpload(doc)
        toast.success(`${title} uploaded successfully.`)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div
                className="bg-surface rounded-2xl shadow-lift w-full max-w-[520px] max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-nexus-border">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                            <Upload className="w-4 h-4 text-indigo-600" />
                        </div>
                        <h2 className="font-display font-bold text-nexus-ink">Upload Document</h2>
                    </div>
                    <button onClick={onClose} className="btn-icon rounded-xl"><X className="w-4 h-4" /></button>
                </div>

                <div className="p-5 space-y-4">
                    <div>
                        <label className="label">Document Title <span className="text-red-500">*</span></label>
                        <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Amrod 2026 Q1 Catalogue" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Supplier</label>
                            <select className="input" value={supplier} onChange={e => setSupplier(e.target.value as CatalogueSupplier)}>
                                {(['Amrod', 'KMQ', 'Other'] as CatalogueSupplier[]).map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">Document Type</label>
                            <select className="input" value={docType} onChange={e => setDocType(e.target.value as CatalogueDocType)}>
                                {Object.entries(DOC_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Valid From <span className="text-nexus-muted text-xs">(optional)</span></label>
                            <input type="date" className="input" value={validFrom} onChange={e => setValidFrom(e.target.value)} />
                        </div>
                        <div>
                            <label className="label">Valid Until <span className="text-nexus-muted text-xs">(optional)</span></label>
                            <input type="date" className="input" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className="label">Linked Client <span className="text-nexus-muted text-xs">(optional)</span></label>
                        <select className="input" value={linkedClient} onChange={e => setLinkedClient(e.target.value)}>
                            <option value="">— None —</option>
                            {ALL_CLIENTS.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>

                    {docType === 'order_reference' && (
                        <div>
                            <label className="label">Linked Order <span className="text-nexus-muted text-xs">(optional)</span></label>
                            <select className="input" value={linkedOrder} onChange={e => setLinkedOrder(e.target.value)}>
                                <option value="">— None —</option>
                                {COMPLETED_ORDERS.map(o => <option key={o}>{o}</option>)}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="label">Notes <span className="text-nexus-muted text-xs">(optional)</span></label>
                        <textarea className="input resize-none min-h-[70px]" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any context about this document…" />
                    </div>

                    <div>
                        <label className="label">File (PDF or image, max 10MB) <span className="text-red-500">*</span></label>
                        {fileName ? (
                            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                <FileText className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm text-emerald-700 flex-1 truncate">{fileName}</span>
                                <button onClick={() => setFileName('')} className="btn-icon rounded-md text-nexus-muted"><X className="w-3.5 h-3.5" /></button>
                            </div>
                        ) : (
                            <button
                                onClick={() => fileRef.current?.click()}
                                className="w-full flex flex-col items-center gap-2 p-5 border-2 border-dashed border-nexus-border rounded-xl hover:border-brand-400 hover:bg-surface-muted transition-colors"
                            >
                                <Upload className="w-5 h-5 text-nexus-light" />
                                <span className="text-sm text-nexus-muted">Click to attach file</span>
                            </button>
                        )}
                        <input ref={fileRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg"
                            onChange={e => { if (e.target.files?.[0]) setFileName(e.target.files[0].name) }} />
                    </div>
                </div>

                <div className="flex gap-3 p-5 border-t border-nexus-border">
                    <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                        {saving ? 'Uploading…' : 'Upload Document'}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

// ── Document Card ─────────────────────────────────────────────────────────────
function DocCard({
    doc, onView, onDelete, canDeleteAny,
}: {
    doc: CatalogueDoc
    onView: (d: CatalogueDoc) => void
    onDelete: (id: string) => void
    canDeleteAny: boolean
}) {
    const expired = isExpired(doc)
    const expiringSoon = isExpiringSoon(doc)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const canDelete = canDeleteAny || doc.uploaded_by === CURRENT_USER_NAME

    return (
        <motion.div
            layout
            className={cn(
                'relative flex-shrink-0 w-[220px] rounded-xl border border-nexus-border p-4 flex flex-col gap-2.5 bg-surface group scroll-snap-align-start transition-all',
                expired && 'opacity-60'
            )}
        >
            {/* Expired badge */}
            {expired && (
                <span className="absolute top-2 right-2 badge bg-red-100 text-red-600 text-[9px] font-bold">Expired</span>
            )}

            {/* Delete button (hover) */}
            {canDelete && !showDeleteConfirm && (
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="absolute top-2 left-2 btn-icon rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-nexus-muted hover:text-red-500"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            )}

            {/* Delete confirm */}
            {showDeleteConfirm && (
                <div className="absolute inset-0 bg-surface rounded-xl border border-red-200 p-3 z-10 flex flex-col justify-center gap-3">
                    <p className="text-xs text-nexus-ink font-medium text-center">Remove this document?</p>
                    <div className="flex gap-2">
                        <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary btn-sm flex-1 text-xs">Cancel</button>
                        <button onClick={() => onDelete(doc.id)} className="btn-sm flex-1 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors">Confirm</button>
                    </div>
                </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5">
                <span className={cn('badge text-[10px]', SUPPLIER_BADGE_COLORS[doc.supplier])}>{doc.supplier}</span>
                <span className={cn('badge text-[10px]', DOC_TYPE_BADGE_COLORS[doc.doc_type])}>{DOC_TYPE_LABELS[doc.doc_type]}</span>
            </div>

            {/* Title */}
            <p className="text-sm font-semibold text-nexus-ink leading-tight line-clamp-2">{doc.title}</p>

            {/* Meta */}
            <div className="flex flex-col gap-0.5 text-[11px] text-nexus-muted flex-1">
                <span>Uploaded {fmtDate(doc.uploaded_at)}</span>
                <span>By {doc.uploaded_by}</span>
                {doc.valid_until && !expired && (
                    <span className={cn(expiringSoon ? 'text-amber-600 font-medium' : '')}>
                        {expiringSoon && <AlertTriangle className="w-2.5 h-2.5 inline mr-0.5" />}
                        Valid until {fmtDate(doc.valid_until)}
                    </span>
                )}
                {doc.linked_client && <span>Client: {doc.linked_client}</span>}
            </div>

            {/* Actions */}
            <div className="flex gap-1.5 mt-auto pt-2 border-t border-nexus-border">
                <button
                    onClick={() => onView(doc)}
                    className="btn-secondary btn-sm flex-1 text-xs"
                >
                    <Eye className="w-3 h-3" />View
                </button>
                <button className="btn-icon rounded-lg border border-nexus-border" title="Download">
                    <Download className="w-3.5 h-3.5" />
                </button>
            </div>
        </motion.div>
    )
}

// ── PDF Viewer Placeholder ────────────────────────────────────────────────────
function PdfViewer({ doc, onClose }: { doc: CatalogueDoc; onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div
                className="bg-surface rounded-2xl shadow-lift w-full max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col"
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-nexus-border">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-nexus-ink text-sm">{doc.title}</p>
                            <p className="text-[11px] text-nexus-muted">{doc.file_name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="btn-secondary btn-sm text-xs"><Download className="w-3 h-3" />Download</button>
                        <button onClick={onClose} className="btn-icon rounded-xl"><X className="w-4 h-4" /></button>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center bg-surface-muted min-h-[400px]">
                    <div className="text-center space-y-3">
                        <FileText className="w-16 h-16 text-nexus-border mx-auto" />
                        <div>
                            <p className="font-semibold text-nexus-ink">{doc.file_name}</p>
                            <p className="text-sm text-nexus-muted mt-1">PDF preview not available — download to view</p>
                        </div>
                        <button className="btn-primary btn-sm"><Download className="w-3.5 h-3.5" />Download PDF</button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

// ── Main CatalogueLibrary Component ──────────────────────────────────────────
export default function CatalogueLibrary() {
    const [docs, setDocs] = useState<CatalogueDoc[]>(() => {
        // Expired docs sort to bottom, active first by uploaded_at desc
        const active = INITIAL_CATALOGUE_DOCS.filter(d => !isExpired(d)).sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at))
        const expired = INITIAL_CATALOGUE_DOCS.filter(d => isExpired(d)).sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at))
        return [...active, ...expired]
    })

    const [supplierFilter, setSupplierFilter] = useState<'All' | 'Amrod' | 'KMQ'>('All')
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [viewingDoc, setViewingDoc] = useState<CatalogueDoc | null>(null)
    const [showAll, setShowAll] = useState(false)

    function addDoc(doc: CatalogueDoc) {
        setDocs(prev => {
            const active = [doc, ...prev.filter(d => !isExpired(d))].sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at))
            const expired = prev.filter(d => isExpired(d))
            return [...active, ...expired]
        })
    }

    function deleteDoc(id: string) {
        setDocs(prev => prev.filter(d => d.id !== id))
        toast.success('Document removed.')
    }

    const filtered = docs.filter(d =>
        supplierFilter === 'All' || d.supplier === supplierFilter
    )

    const CARD_LIMIT = 8
    const visible = showAll ? filtered : filtered.slice(0, CARD_LIMIT)
    const hasMore = filtered.length > CARD_LIMIT

    return (
        <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        >
            {/* Section header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <h2 className="font-display font-semibold text-sm text-nexus-ink">Catalogues & References</h2>
                    <span className="badge bg-surface-muted text-nexus-muted text-[10px]">{docs.length}</span>
                </div>
                <div className="flex items-center gap-3">
                    {/* Supplier filter */}
                    <div className="flex gap-1">
                        {(['All', 'Amrod', 'KMQ'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setSupplierFilter(f)}
                                className={cn(
                                    'badge cursor-pointer text-xs transition-all',
                                    supplierFilter === f ? 'bg-brand-600 text-white' : 'bg-surface-muted text-nexus-slate border border-nexus-border hover:bg-nexus-border'
                                )}
                            >{f}</button>
                        ))}
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="btn-primary btn-sm text-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />Upload
                    </button>
                </div>
            </div>

            {/* Scrolling card row */}
            {filtered.length === 0 ? (
                <div className="p-8 text-center bg-surface-muted rounded-xl border border-nexus-border">
                    <FileText className="w-10 h-10 mx-auto text-nexus-border mb-2" />
                    <p className="text-sm text-nexus-muted">No documents for this filter.</p>
                </div>
            ) : (
                <div
                    className="flex gap-3 overflow-x-auto pb-2"
                    style={{ scrollSnapType: 'x mandatory' }}
                >
                    {visible.map(doc => (
                        <DocCard
                            key={doc.id}
                            doc={doc}
                            onView={setViewingDoc}
                            onDelete={deleteDoc}
                            canDeleteAny={CAN_DELETE_ANY}
                        />
                    ))}
                    {hasMore && !showAll && (
                        <button
                            onClick={() => setShowAll(true)}
                            className="flex-shrink-0 w-[120px] rounded-xl border-2 border-dashed border-nexus-border flex flex-col items-center justify-center gap-2 text-nexus-muted hover:border-brand-400 hover:text-brand-600 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                            <span className="text-xs font-medium">View all {filtered.length}</span>
                        </button>
                    )}
                </div>
            )}

            {/* Upload modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <UploadModal onClose={() => setShowUploadModal(false)} onUpload={addDoc} />
                )}
            </AnimatePresence>

            {/* PDF viewer */}
            <AnimatePresence>
                {viewingDoc && (
                    <PdfViewer doc={viewingDoc} onClose={() => setViewingDoc(null)} />
                )}
            </AnimatePresence>
        </motion.div>
    )
}

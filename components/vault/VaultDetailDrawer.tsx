'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Download, FileText, Clock, AlertTriangle, Tag, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    CATEGORY_LABELS, CATEGORY_BADGE, COMPANY_BADGE,
    daysUntilExpiry, expiryLabel, expiryColor, getDocStatus,
    type VaultDoc,
} from '@/lib/vault'
import dynamic from 'next/dynamic'

const BankingDetailsLetter = dynamic(() => import('@/components/vault/BankingDetailsLetter'), { ssr: false })

function fmtDate(d?: string) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex gap-3">
            <span className="text-sm text-nexus-muted w-36 flex-shrink-0">{label}</span>
            <span className="text-sm text-nexus-ink font-medium flex-1">{children}</span>
        </div>
    )
}

export default function VaultDetailDrawer({
    doc, onClose,
}: {
    doc: VaultDoc
    onClose: () => void
}) {
    const [showHistory, setShowHistory] = useState(false)
    const days = daysUntilExpiry(doc)
    const status = getDocStatus(doc)
    const expLabel = expiryLabel(doc)
    const expColor = expiryColor(doc)

    const linkedEntityDisplay =
        doc.linked_to === 'company_wide' ? 'Company-wide'
            : doc.linked_entity || '—'

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

            {/* Drawer */}
            <motion.aside
                className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[520px] bg-surface border-l border-nexus-border shadow-lift flex flex-col"
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-5 border-b border-nexus-border flex-shrink-0">
                    <div className="flex-1 pr-4">
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            <span className={cn('badge text-xs', CATEGORY_BADGE[doc.category])}>{CATEGORY_LABELS[doc.category]}</span>
                            <span className={cn('badge text-xs', COMPANY_BADGE[doc.company])}>{doc.company.toUpperCase()}</span>
                        </div>
                        <h2 className="font-display font-bold text-nexus-ink leading-tight">{doc.title}</h2>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button className="btn-secondary btn-sm text-xs"><Download className="w-3 h-3" />Download</button>
                        <button onClick={onClose} className="btn-icon rounded-xl"><X className="w-4 h-4" /></button>
                    </div>
                </div>

                {/* Expired banner */}
                {status === 'expired' && (
                    <div className="bg-red-50 border-b border-red-200 px-5 py-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-700 font-medium">
                            This document expired on {fmtDate(doc.expiry_date)}. Please upload a renewed version.
                        </p>
                    </div>
                )}

                {/* Expiring soon banner */}
                {status === 'expiring_soon' && (
                    <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <p className="text-sm text-amber-700 font-medium">{expLabel} — action may be required.</p>
                    </div>
                )}

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto">
                    {/* Details */}
                    <div className="p-5 space-y-3 border-b border-nexus-border">
                        <Row label="Category">{CATEGORY_LABELS[doc.category]}</Row>
                        <Row label="Document Type">{doc.doc_type}</Row>
                        <Row label="Company">{doc.company}</Row>
                        <Row label="Linked To">{linkedEntityDisplay}</Row>
                        <Row label="Uploaded By">{doc.uploaded_by_full}</Row>
                        <Row label="Upload Date">{fmtDate(doc.uploaded_at)}</Row>
                        {doc.last_updated_by && (
                            <Row label="Last Updated">{doc.last_updated_by} · {fmtDate(doc.last_updated_at)}</Row>
                        )}
                        {doc.issue_date && <Row label="Issue Date">{fmtDate(doc.issue_date)}</Row>}
                        {doc.expiry_date && (
                            <Row label="Expiry Date">
                                <span className={expColor}>{expLabel}</span>
                            </Row>
                        )}
                        {doc.renewal_alert_days && doc.expiry_date && (
                            <Row label="Renewal Alert">
                                <span className="text-amber-700">{doc.renewal_alert_days} days before expiry</span>
                            </Row>
                        )}
                    </div>

                    {/* Notes */}
                    {doc.notes && (
                        <div className="p-5 border-b border-nexus-border">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-nexus-muted mb-2">Notes</p>
                            <p className="text-sm text-nexus-ink leading-relaxed">{doc.notes}</p>
                        </div>
                    )}

                    {/* Tags */}
                    {doc.tags.length > 0 && (
                        <div className="p-5 border-b border-nexus-border">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-nexus-muted mb-2 flex items-center gap-1"><Tag className="w-3 h-3" />Tags</p>
                            <div className="flex flex-wrap gap-1.5">
                                {doc.tags.map(t => (
                                    <span key={t} className="badge bg-surface-muted text-nexus-slate border border-nexus-border text-xs">{t}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Version history */}
                    <div className="p-5 border-b border-nexus-border">
                        <button
                            onClick={() => setShowHistory(v => !v)}
                            className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-nexus-muted hover:text-nexus-ink transition-colors w-full"
                        >
                            <History className="w-3 h-3" />Version History
                            {doc.version_history.length > 0 && (
                                <span className="badge bg-surface-muted text-nexus-muted text-[10px] ml-1">{doc.version_history.length}</span>
                            )}
                        </button>
                        {showHistory && (
                            <div className="mt-3 space-y-2">
                                {doc.version_history.length === 0 ? (
                                    <p className="text-sm text-nexus-muted">No previous versions.</p>
                                ) : (
                                    doc.version_history.map((v, i) => (
                                        <div key={i} className="flex items-center justify-between p-2.5 bg-surface-muted rounded-lg">
                                            <div>
                                                <p className="text-xs font-medium text-nexus-ink">{v.file_name}</p>
                                                <p className="text-[11px] text-nexus-muted">{v.uploaded_by} · {fmtDate(v.uploaded_at)}</p>
                                            </div>
                                            <button className="btn-icon rounded-md text-nexus-muted"><Download className="w-3.5 h-3.5" /></button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* PDF Viewer — live letter for banking confirmation, placeholder for all others */}
                    <div className="p-5">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-nexus-muted mb-3">Document Preview</p>
                        {doc.id === 'vk7' ? (
                            <BankingDetailsLetter />
                        ) : (
                            <div className="border border-nexus-border rounded-xl bg-surface-muted flex flex-col items-center justify-center min-h-[220px] gap-3">
                                <FileText className="w-14 h-14 text-nexus-border" />
                                <div className="text-center">
                                    <p className="text-sm font-medium text-nexus-ink">{doc.file_name}</p>
                                    <p className="text-xs text-nexus-muted mt-1">PDF preview not available — download to view</p>
                                </div>
                                <button className="btn-secondary btn-sm text-xs"><Download className="w-3 h-3" />Download PDF</button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.aside>
        </>
    )
}

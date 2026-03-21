'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, FileText, Plus, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    CATEGORY_LABELS, SUGGESTED_TAGS,
    type VaultCategory, type VaultCompany, type LinkedToType, type VaultDoc,
} from '@/lib/vault'
import toast from 'react-hot-toast'
import { MOCK_CUSTOMERS } from '@/lib/customers'

const ALL_CLIENTS = MOCK_CUSTOMERS.map(c => c.name).sort((a, b) => a.localeCompare(b))
const ALL_SUPPLIERS = [
    'TotalFab Textiles', 'ZimTrim Supplies', 'Safari Packaging Ltd', 'Afritex Holdings',
    'Harare Embroidery & Print', 'Zimpack Industries', 'Bulawayo Textile Mills',
]

type UserRole = 'executive' | 'admin' | 'accountant' | 'sales_manager' | 'sales_rep' | 'data_capture' | 'hr_manager' | 'supply_chain_staff'
const CURRENT_USER = { name: 'Ashleigh', full: 'Ashleigh Kurira', role: 'accountant' as UserRole }
const IS_EXEC = (CURRENT_USER.role === 'executive' || CURRENT_USER.role === 'admin')

// Tag chip input
function TagInput({ tags, onChange, category }: { tags: string[]; onChange: (v: string[]) => void; category: VaultCategory }) {
    const [input, setInput] = useState('')

    function addTag(t: string) {
        const clean = t.trim()
        if (!clean || tags.includes(clean)) return
        onChange([...tags, clean])
        setInput('')
    }

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {tags.map(t => (
                    <span key={t} className="badge bg-surface-muted text-nexus-slate border border-nexus-border flex items-center gap-1 text-xs">
                        {t}
                        <button onClick={() => onChange(tags.filter(x => x !== t))} className="hover:text-red-500 ml-0.5">×</button>
                    </span>
                ))}
            </div>
            <input
                className="input text-sm"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(input) } }}
                placeholder="Type and press Enter to add a tag…"
            />
            <div className="flex flex-wrap gap-1">
                <span className="text-[11px] text-nexus-muted">Suggested:</span>
                {SUGGESTED_TAGS[category].filter(s => !tags.includes(s)).map(s => (
                    <button key={s} onClick={() => addTag(s)} className="badge bg-surface-muted text-nexus-slate border border-nexus-border text-[10px] hover:bg-nexus-border transition-colors cursor-pointer">
                        + {s}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default function VaultUploadModal({
    onClose, onUpload, currentCompany,
}: {
    onClose: () => void
    onUpload: (doc: VaultDoc) => void
    currentCompany: VaultCompany
}) {
    const [title, setTitle] = useState('')
    const [docType, setDocType] = useState('')
    const [category, setCategory] = useState<VaultCategory>('compliance')
    const [company, setCompany] = useState<VaultCompany>(currentCompany)
    const [linkedTo, setLinkedTo] = useState<LinkedToType>('company_wide')
    const [linkedEntity, setLinkedEntity] = useState('')
    const [issueDate, setIssueDate] = useState('')
    const [expiryDate, setExpiryDate] = useState('')
    const [renewalAlert, setRenewalAlert] = useState(true)
    const [alertDays, setAlertDays] = useState<30 | 14 | 7 | 60>(30)
    const [tags, setTags] = useState<string[]>([])
    const [notes, setNotes] = useState('')
    const [fileName, setFileName] = useState('')
    const [saving, setSaving] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)
    const [showRestrict, setShowRestrict] = useState(false)

    // Rep-restricted category options
    const role = CURRENT_USER.role
    const categoryOptions = (role === 'sales_rep')
        ? (['contracts', 'sla'] as VaultCategory[])
        : (['compliance', 'contracts', 'sla', 'legal'] as VaultCategory[])

    async function handleSave() {
        if (!title.trim()) { toast.error('Document title is required'); return }
        if (!docType.trim()) { toast.error('Document type is required'); return }
        if (!fileName) { toast.error('Please attach a file'); return }
        setSaving(true)
        await new Promise(r => setTimeout(r, 400))
        const doc: VaultDoc = {
            id: `v_${Date.now()}`,
            title: title.trim(), doc_type: docType.trim(),
            category, company, linked_to: linkedTo,
            linked_entity: linkedTo !== 'company_wide' ? linkedEntity : undefined,
            issue_date: issueDate || undefined,
            expiry_date: expiryDate || undefined,
            renewal_alert_days: expiryDate && renewalAlert ? alertDays : undefined,
            tags, notes: notes.trim() || undefined,
            file_name: fileName,
            uploaded_by: CURRENT_USER.name,
            uploaded_by_full: CURRENT_USER.full,
            uploaded_at: '2026-03-06',
            version_history: [],
        }
        onUpload(doc)
        toast.success(`${title} added to the ${company} vault.`)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div
                className="bg-surface rounded-2xl shadow-lift w-full max-w-[580px] max-h-[90vh] overflow-y-auto"
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

                <div className="p-5 space-y-5">

                    {/* Section 1 — Identity */}
                    <div className="space-y-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-nexus-muted">Document Identity</p>
                        <div>
                            <label className="label">Document Title <span className="text-red-500">*</span></label>
                            <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. ZIMRA Tax Clearance Certificate 2026" />
                        </div>
                        <div>
                            <label className="label">Document Type <span className="text-red-500">*</span></label>
                            <input className="input" value={docType} onChange={e => setDocType(e.target.value)} placeholder="e.g. Tax Clearance Certificate" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="label">Category</label>
                                <select className="input" value={category} onChange={e => setCategory(e.target.value as VaultCategory)}>
                                    {categoryOptions.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">Company <span className="text-red-500">*</span></label>
                                <select className="input" value={company} onChange={e => setCompany(e.target.value as VaultCompany)}>
                                    {(['Kingsport', 'Bralyn', 'SGA'] as VaultCompany[]).map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2 — Entity */}
                    <div className="space-y-3 pt-3 border-t border-nexus-border">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-nexus-muted">Entity Linking</p>
                        <div>
                            <label className="label">Linked To</label>
                            <select className="input" value={linkedTo} onChange={e => setLinkedTo(e.target.value as LinkedToType)}>
                                <option value="company_wide">Company-wide</option>
                                <option value="client">Client</option>
                                <option value="supplier">Supplier</option>
                            </select>
                        </div>
                        {linkedTo === 'client' && (
                            <div>
                                <label className="label">Client</label>
                                <select className="input" value={linkedEntity} onChange={e => setLinkedEntity(e.target.value)}>
                                    <option value="">— Select client —</option>
                                    {ALL_CLIENTS.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                        )}
                        {linkedTo === 'supplier' && (
                            <div>
                                <label className="label">Supplier</label>
                                <select className="input" value={linkedEntity} onChange={e => setLinkedEntity(e.target.value)}>
                                    <option value="">— Select supplier —</option>
                                    {ALL_SUPPLIERS.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Section 3 — Dates */}
                    <div className="space-y-3 pt-3 border-t border-nexus-border">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-nexus-muted">Dates & Alerts</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="label">Issue Date <span className="text-nexus-muted text-xs">(optional)</span></label>
                                <input type="date" className="input" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
                            </div>
                            <div>
                                <label className="label">Expiry Date <span className="text-nexus-muted text-xs">(optional)</span></label>
                                <input type="date" className="input" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
                            </div>
                        </div>
                        {expiryDate && (
                            <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-amber-800">Renewal Alert</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <select
                                        className="input input-sm text-xs py-1"
                                        value={alertDays}
                                        onChange={e => setAlertDays(Number(e.target.value) as 7 | 14 | 30 | 60)}
                                        disabled={!renewalAlert}
                                    >
                                        {[7, 14, 30, 60].map(d => <option key={d} value={d}>{d} days before expiry</option>)}
                                    </select>
                                    <input type="checkbox" checked={renewalAlert} onChange={e => setRenewalAlert(e.target.checked)} className="w-4 h-4 accent-amber-600" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section 4 — Metadata */}
                    <div className="space-y-3 pt-3 border-t border-nexus-border">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-nexus-muted">Metadata</p>
                        <div>
                            <label className="label">Tags</label>
                            <TagInput tags={tags} onChange={setTags} category={category} />
                        </div>
                        <div>
                            <label className="label">Notes <span className="text-nexus-muted text-xs">(optional)</span></label>
                            <textarea className="input resize-none min-h-[65px]" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any context about this document…" />
                        </div>
                        <div>
                            <label className="label">File (PDF or image, max 20MB) <span className="text-red-500">*</span></label>
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

                    {/* Section 5 — Visibility (exec/Lucia only) */}
                    {IS_EXEC && (
                        <div className="space-y-2 pt-3 border-t border-nexus-border">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-nexus-muted">Visibility Override</p>
                                <button onClick={() => setShowRestrict(v => !v)} className={cn('text-xs font-semibold', showRestrict ? 'text-red-600' : 'text-brand-600')}>
                                    {showRestrict ? 'Remove restriction' : 'Restrict visibility'}
                                </button>
                            </div>
                            {showRestrict && (
                                <p className="text-xs text-nexus-muted">Role-based restriction is configured post-upload. Document defaults to standard access for your current role.</p>
                            )}
                        </div>
                    )}
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

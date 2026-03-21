'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Download, Settings, Check, X as XIcon, Search, Eye, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  MOCK_QUOTES, CURRENT_QUOTE_USER, computeQuoteStatus, daysRemaining,
  formatQuoteDate, STATUS_BADGE, STATUS_LABEL, COMPANY_DETAILS, COMPANY_BANK_DETAILS,
  type Quote, type QuoteCompany, type QuoteStatus,
  DEFAULT_QUOTE_SETTINGS, VAT_RATE,
} from '@/lib/quotations'
import { MOCK_BANK_ACCOUNTS, type BankAccount } from '@/lib/quotation-bank-accounts'
import { generateQuotePDF } from '@/lib/generateQuotePDF'
import QuotationBuilder from '@/components/quotations/QuotationBuilder'
import KingsportTemplate from '@/components/quotations/KingsportTemplate'
import BraylnTemplate from '@/components/quotations/BraylnTemplate'
import SGATemplate from '@/components/quotations/SGATemplate'

// ─── Settings Drawer ──────────────────────────────────────────────────────────
function SettingsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selectedCo, setSelectedCo] = useState<QuoteCompany>('Kingsport')
  const co = COMPANY_DETAILS[selectedCo]
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/40 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed right-0 top-0 bottom-0 w-[420px] bg-surface z-50 shadow-lift flex flex-col"
            initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }} transition={{ type: 'spring', damping: 26, stiffness: 280 }}>
            <div className="flex items-center justify-between p-5 border-b border-nexus-border">
              <div>
                <h2 className="font-display font-bold text-base text-nexus-ink">Quotation Settings</h2>
                <p className="text-xs text-nexus-muted mt-0.5">Company defaults & details</p>
              </div>
              <button onClick={onClose} className="btn-icon rounded-lg"><XIcon className="w-4 h-4" /></button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto space-y-5">
              {/* Company selector */}
              <div className="flex gap-1.5">
                {(['Kingsport', 'Bralyn', 'SGA'] as QuoteCompany[]).map(c => (
                  <button key={c} onClick={() => setSelectedCo(c)}
                    className={cn('badge cursor-pointer text-xs transition-all', selectedCo === c ? 'bg-brand-600 text-white' : 'bg-surface-muted text-nexus-slate border border-nexus-border hover:bg-nexus-border')}>
                    {c}
                  </button>
                ))}
              </div>
              <div className="bg-surface-muted rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-nexus-muted uppercase tracking-wider">Company Details</p>
                <div><label className="label">Full Name</label><div className="input bg-white text-nexus-slate text-sm">{co.full_name}</div></div>
                <div><label className="label">Address</label><div className="input bg-white text-nexus-slate text-sm">{co.address}</div></div>
                <div><label className="label">Telephone(s)</label><div className="input bg-white text-nexus-slate text-sm">{co.telephones.join(' / ')}</div></div>
                <div><label className="label">Email</label><div className="input bg-white text-nexus-slate text-sm">{co.email}</div></div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><p className="text-nexus-muted mb-1">TIN</p><p className="font-mono text-nexus-ink">{co.tin}</p></div>
                  <div><p className="text-nexus-muted mb-1">VAT Reg</p><p className="font-mono text-nexus-ink">{co.vat_reg}</p></div>
                  <div><p className="text-nexus-muted mb-1">Co. Reg</p><p className="font-mono text-nexus-ink">{co.company_reg}</p></div>
                </div>
              </div>
              <div className="bg-surface-muted rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-nexus-muted uppercase tracking-wider">Banking Details</p>
                <p className="text-xs text-nexus-muted leading-relaxed">{COMPANY_BANK_DETAILS[selectedCo]}</p>
              </div>
              <div className="bg-surface-muted rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-nexus-muted uppercase tracking-wider">Defaults</p>
                <div className="text-xs space-y-1.5">
                  <div className="flex justify-between"><span className="text-nexus-muted">Validity</span><span className="font-medium text-nexus-ink">{DEFAULT_QUOTE_SETTINGS[selectedCo].defaultValidityDays} days</span></div>
                  <div className="flex justify-between"><span className="text-nexus-muted">Payment Terms</span><span className="font-medium text-nexus-ink">{DEFAULT_QUOTE_SETTINGS[selectedCo].defaultPaymentTerms}</span></div>
                </div>
                <div className="pt-2 border-t border-nexus-border">
                  <p className="text-xs font-bold text-nexus-muted uppercase tracking-wider mb-2">VAT Rate</p>
                  <div className="flex items-center gap-2">
                    <div className="input bg-white text-nexus-ink font-mono text-sm flex-1">{(VAT_RATE * 100).toFixed(1)}%</div>
                    <span className="text-xs text-nexus-muted">(15.5%)</span>
                  </div>
                  <p className="text-[10px] text-nexus-muted mt-1.5 leading-relaxed">
                    To update the VAT rate, change <code className="bg-slate-100 px-1 rounded">VAT_RATE</code> in <code className="bg-slate-100 px-1 rounded">lib/quotations.ts</code>. This updates the rate everywhere — builder, templates, and PDF.
                  </p>
                </div>
              </div>

              {/* Bank Accounts \u2014 Kingsport only for now */}
              {selectedCo === 'Kingsport' && (
                <div className="bg-surface-muted rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-nexus-muted uppercase tracking-wider">Bank Accounts</p>
                  <p className="text-[10px] text-nexus-muted">Accounts available in the Quotation Builder payment dropdown.</p>
                  <div className="space-y-2">
                    {MOCK_BANK_ACCOUNTS.filter((a: BankAccount) => a.company === 'Kingsport').map((acc: BankAccount) => (
                      <div key={acc.id} className="bg-white rounded-lg p-3 border border-nexus-border text-xs space-y-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-nexus-ink">{acc.bank}</p>
                          <div className="flex gap-1">
                            {acc.is_incomplete && (
                              <span className="flex items-center gap-0.5 badge bg-amber-100 text-amber-700 text-[10px]">
                                <AlertTriangle className="w-2.5 h-2.5" />Incomplete
                              </span>
                            )}
                            <span className="badge bg-emerald-100 text-emerald-700 text-[10px]">Active</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
                          <div className="flex gap-1"><span className="text-nexus-muted">Account No:</span><span className="font-mono text-nexus-ink">{acc.account_number}</span></div>
                          {acc.account_type && <div className="flex gap-1"><span className="text-nexus-muted">Type:</span><span>{acc.account_type}</span></div>}
                          <div className="flex gap-1"><span className="text-nexus-muted">Branch:</span><span>{acc.branch}</span></div>
                          {acc.branch_code && <div className="flex gap-1"><span className="text-nexus-muted">Branch Code:</span><span className="font-mono">{acc.branch_code}</span></div>}
                          {acc.sort_code && <div className="flex gap-1"><span className="text-nexus-muted">Sort Code:</span><span className="font-mono">{acc.sort_code}</span></div>}
                          {acc.swift_code && <div className="flex gap-1"><span className="text-nexus-muted">Swift:</span><span className="font-mono">{acc.swift_code}</span></div>}
                        </div>
                        {acc.incomplete_note && (
                          <p className="text-[10px] text-amber-600 mt-1 leading-relaxed">⚠ {acc.incomplete_note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedCo !== 'Kingsport' && (
                <div className="bg-surface-muted rounded-xl p-4">
                  <p className="text-xs font-bold text-nexus-muted uppercase tracking-wider mb-2">Bank Accounts</p>
                  <p className="text-xs text-nexus-muted">Bank accounts for {selectedCo} will be added in a future session.</p>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-nexus-border">
              <p className="text-xs text-nexus-muted text-center">Contact your system administrator to update company details.</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Quote Preview Modal ──────────────────────────────────────────────────────
function QuotePreviewModal({ quote, onClose, onDownload }: { quote: Quote; onClose: () => void; onDownload: () => void }) {
  const templateId = `quote-preview-modal-${quote.id}`
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col max-h-[95vh] w-auto max-w-[900px]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div>
            <p className="font-bold text-slate-900">{quote.quote_number}</p>
            <p className="text-xs text-slate-500">{quote.client_name} · {formatQuoteDate(quote.quote_date)}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onDownload} className="btn-secondary btn-sm"><Download className="w-3.5 h-3.5" />Download PDF</button>
            <button onClick={onClose} className="btn-icon rounded-lg"><XIcon className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="overflow-y-auto p-4">
          <div id={templateId} style={{ transform: 'scale(0.76)', transformOrigin: 'top left', width: '794px', marginBottom: '-185px' }}>
            {quote.company === 'Kingsport' && <KingsportTemplate quote={quote as any} />}
            {quote.company === 'Bralyn' && <BraylnTemplate quote={quote as any} />}
            {quote.company === 'SGA' && <SGATemplate quote={quote as any} />}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main QuotationsTab ───────────────────────────────────────────────────────
export default function QuotationsTab() {
  const userAccess = CURRENT_QUOTE_USER
  const [quotes, setQuotes] = useState<Quote[]>(MOCK_QUOTES)
  const [companyFilter, setCompanyFilter] = useState<'All' | QuoteCompany>('All')
  const [search, setSearch] = useState('')
  const [showBuilder, setShowBuilder] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [previewQuote, setPreviewQuote] = useState<Quote | null>(null)

  // Apply access filter + compute status
  const visibleCompanies = userAccess.canView
  const accessibleFilters: Array<'All' | QuoteCompany> = ['All', ...visibleCompanies]

  const liveQuotes = quotes.map(q => ({ ...q, status: computeQuoteStatus(q) }))

  const filtered = liveQuotes.filter(q =>
    visibleCompanies.includes(q.company) &&
    (companyFilter === 'All' || q.company === companyFilter) &&
    (!search || q.client_name.toLowerCase().includes(search.toLowerCase()) ||
      q.quote_number.toLowerCase().includes(search.toLowerCase()) ||
      q.description.toLowerCase().includes(search.toLowerCase()))
  )

  // Default sort: draft → active → sent → expired
  const STATUS_ORDER: Record<QuoteStatus, number> = { draft: 0, active: 1, sent: 2, accepted: 3, declined: 4, expired: 5 }
  const sorted = [...filtered].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])

  // KPI counts (all accessible companies)
  const now = new Date()
  const thisMonth = liveQuotes.filter(q => visibleCompanies.includes(q.company) && new Date(q.created_at).getMonth() === now.getMonth() && new Date(q.created_at).getFullYear() === now.getFullYear())
  const kpis = [
    { label: 'Total This Month', value: thisMonth.length, color: 'text-slate-700' },
    { label: 'Active', value: liveQuotes.filter(q => visibleCompanies.includes(q.company) && q.status === 'active').length, color: 'text-green-600' },
    { label: 'Expired', value: liveQuotes.filter(q => visibleCompanies.includes(q.company) && q.status === 'expired').length, color: 'text-amber-600' },
    { label: 'Accepted', value: liveQuotes.filter(q => visibleCompanies.includes(q.company) && q.status === 'accepted').length, color: 'text-emerald-600' },
    { label: 'Draft', value: liveQuotes.filter(q => visibleCompanies.includes(q.company) && q.status === 'draft').length, color: 'text-slate-500' },
  ]

  function handleSaveQuote(q: Quote) {
    setQuotes(prev => {
      const idx = prev.findIndex(x => x.id === q.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = q; return next }
      return [q, ...prev]
    })
  }

  function markStatus(quoteId: string, status: QuoteStatus) {
    setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status } : q))
    const label = STATUS_LABEL[status]
    toast.success(`Quote marked as ${label}.`)
  }

  async function downloadQuotePDF(quote: Quote) {
    const templateId = `pdf-hidden-${quote.id}`
    try {
      await generateQuotePDF(templateId, quote)
      toast.success('PDF downloaded.')
    } catch {
      toast.error('Could not generate PDF.')
    }
  }

  const COMPANY_BADGE: Record<QuoteCompany, string> = {
    Kingsport: 'bg-rose-100 text-rose-700',
    Bralyn: 'bg-blue-100 text-blue-700',
    SGA: 'bg-teal-100 text-teal-700',
  }

  if (showBuilder) {
    return (
      <QuotationBuilder
        onClose={() => setShowBuilder(false)}
        onSave={handleSaveQuote}
        initialCompany={userAccess.canGenerate[0]}
      />
    )
  }

  return (
    <>
      {/* ── Tool bar ── */}
      <div className="p-4 border-b border-nexus-border flex flex-wrap items-center gap-3">
        {/* KPI strip */}
        <div className="flex gap-4 flex-1">
          {kpis.map(k => (
            <div key={k.label} className="flex flex-col">
              <span className={cn('text-lg font-bold font-display num leading-tight', k.color)}>{k.value}</span>
              <span className="text-[10px] text-nexus-muted whitespace-nowrap">{k.label}</span>
            </div>
          ))}
        </div>

        {/* Company filter */}
        <div className="flex gap-1">
          {accessibleFilters.map(f => (
            <button key={f} onClick={() => setCompanyFilter(f)}
              className={cn('badge cursor-pointer text-xs transition-all', companyFilter === f ? 'bg-brand-600 text-white' : 'bg-surface-muted text-nexus-slate border border-nexus-border hover:bg-nexus-border')}>
              {f}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nexus-light" />
          <input className="input pl-8 w-48" placeholder="Search quotes…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Settings (admins only) */}
        {userAccess.isAdmin && (
          <button onClick={() => setShowSettings(true)} className="btn-icon rounded-lg" title="Quotation Settings">
            <Settings className="w-4 h-4" />
          </button>
        )}

        {/* New Quotation */}
        {userAccess.canGenerate.length > 0 && (
          <button onClick={() => setShowBuilder(true)} className="btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" />New Quotation
          </button>
        )}
      </div>

      {/* ── Quotes Table ── */}
      <div className="table-wrapper rounded-none border-0">
        <table className="table">
          <thead>
            <tr>
              <th>Quote No.</th>
              <th>Company</th>
              <th>Client</th>
              <th>Description</th>
              <th className="text-right">Amount</th>
              <th>Valid Until</th>
              <th className="text-right">Days Left</th>
              <th>Status</th>
              <th>Created By</th>
              <th className="w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(q => {
              const days = daysRemaining(q.valid_until)
              const showMarkActions = q.status === 'sent' || q.status === 'active'
              return (
                <tr key={q.id}>
                  <td>
                    <span className="font-mono text-xs font-bold text-nexus-ink">{q.quote_number}</span>
                  </td>
                  <td>
                    <span className={cn('badge text-[10px]', COMPANY_BADGE[q.company])}>{q.company === 'SGA' ? 'SGA' : q.company}</span>
                  </td>
                  <td>
                    <div className="font-medium text-nexus-ink text-sm">{q.client_name}</div>
                    {q.client_attention && <div className="text-xs text-nexus-muted">{q.client_attention}</div>}
                  </td>
                  <td className="text-nexus-muted text-sm max-w-[180px] truncate" title={q.description}>{q.description}</td>
                  <td className="text-right">
                    <span className="font-mono font-semibold text-nexus-ink text-sm">
                      ${q.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="text-[10px] text-nexus-muted">{q.vat_mode === 'inclusive' ? 'VAT Incl.' : q.vat_mode === 'exclusive' ? 'VAT Excl.' : 'Zero Rated'}</div>
                  </td>
                  <td className="text-nexus-muted text-sm whitespace-nowrap">{formatQuoteDate(q.valid_until)}</td>
                  <td className="text-right">
                    {q.status === 'expired' || q.status === 'declined' || q.status === 'accepted' ? (
                      <span className="text-nexus-light text-xs">—</span>
                    ) : (
                      <span className={cn('num font-bold text-sm', days <= 3 ? 'text-red-500' : days <= 7 ? 'text-amber-600' : 'text-nexus-ink')}>
                        {days}d
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={cn('badge text-[10px]', STATUS_BADGE[q.status])}>{STATUS_LABEL[q.status]}</span>
                    {q.status === 'accepted' && (
                      <div className="w-2 h-2 rounded-full bg-emerald-400 inline-block ml-1.5 animate-pulse" />
                    )}
                  </td>
                  <td className="text-nexus-muted text-sm">{q.created_by}</td>
                  <td>
                    <div className="flex gap-1 items-center">
                      {/* Preview */}
                      <button onClick={() => setPreviewQuote(q)} className="btn-icon rounded-lg w-7 h-7" title="Preview">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {/* Download PDF */}
                      <button onClick={() => downloadQuotePDF(q)} className="btn-icon rounded-lg w-7 h-7" title="Download PDF">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {/* Accept/Decline — only on sent/active */}
                      {showMarkActions && (
                        <>
                          <button onClick={() => markStatus(q.id, 'accepted')} className="btn-icon rounded-lg w-7 h-7 text-emerald-600 hover:bg-emerald-50" title="Mark as Accepted">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => markStatus(q.id, 'declined')} className="btn-icon rounded-lg w-7 h-7 text-red-500 hover:bg-red-50" title="Mark as Declined">
                            <XIcon className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                    {/* Hidden template for pdf export — off-screen */}
                    <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', zIndex: -1 }} id={`pdf-hidden-${q.id}`}>
                      {q.company === 'Kingsport' && <KingsportTemplate quote={q as any} forPDF />}
                      {q.company === 'Bralyn' && <BraylnTemplate quote={q as any} forPDF />}
                      {q.company === 'SGA' && <SGATemplate quote={q as any} forPDF />}
                    </div>
                  </td>
                </tr>
              )
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={10} className="py-16 text-center text-nexus-muted">
                  <p className="font-medium">No quotations found</p>
                  <p className="text-xs mt-1">Try adjusting your filters or create a new quotation</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-nexus-border text-xs text-nexus-muted">
        {sorted.length} quotation{sorted.length !== 1 ? 's' : ''} shown
      </div>

      {/* Settings Drawer */}
      <SettingsDrawer open={showSettings} onClose={() => setShowSettings(false)} />

      {/* Preview Modal */}
      {previewQuote && (
        <QuotePreviewModal
          quote={previewQuote}
          onClose={() => setPreviewQuote(null)}
          onDownload={() => downloadQuotePDF(previewQuote)}
        />
      )}
    </>
  )
}

'use client'

import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, X, Download, Eye, Save, Loader2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  type Quote, type QuoteCompany, type QuoteLineItem, type VATMode, type UnitType,
  COMPANY_DETAILS, DEFAULT_QUOTE_SETTINGS, CURRENT_QUOTE_USER,
  getTodayISO, addDays, formatQuoteDate, getNextQuoteNumber, VAT_RATE,
} from '@/lib/quotations'
import { generateQuotePDF } from '@/lib/generateQuotePDF'
import KingsportTemplate from './KingsportTemplate'
import BraylnTemplate from './BraylnTemplate'
import SGATemplate from './SGATemplate'
import { MOCK_BANK_ACCOUNTS, bankAccountLabel, getActiveBankAccounts, type BankAccount } from '@/lib/quotation-bank-accounts'

interface QuotationBuilderProps {
  onClose: () => void
  onSave: (quote: Quote) => void
  initialCompany?: QuoteCompany
}

const PAYMENT_TERMS_PRESETS = ['30 Days', '14 Days', '7 Days', 'Cash on Delivery', 'Advance Payment', 'Custom']
const UNIT_OPTIONS: UnitType[] = ['Units', 'Metres', 'Kilograms', 'Sets', 'Pairs', 'Boxes', 'Rolls', 'Cones', 'Litres', 'Other']

function nextLineId() { return `li_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` }

function emptyLine(): QuoteLineItem {
  return { id: nextLineId(), description: '', qty: 1, unit: 'Units', unit_price: 0, amount: 0 }
}

function calcLine(item: Omit<QuoteLineItem, 'amount'>): QuoteLineItem {
  return { ...item, amount: Math.round(item.qty * item.unit_price * 100) / 100 }
}

export default function QuotationBuilder({ onClose, onSave, initialCompany }: QuotationBuilderProps) {
  const userAccess = CURRENT_QUOTE_USER
  const accessibleCompanies = userAccess.canGenerate

  // ── Form State ──────────────────────────────────────────────────────────────
  const [company, setCompany] = useState<QuoteCompany>(
    initialCompany ?? (accessibleCompanies[0] ?? 'Kingsport')
  )
  const [clientName, setClientName] = useState('')
  const [clientAttention, setClientAttention] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [validityDays, setValidityDays] = useState<7 | 14 | 30>(
    DEFAULT_QUOTE_SETTINGS[company].defaultValidityDays
  )
  const [paymentTerms, setPaymentTerms] = useState(DEFAULT_QUOTE_SETTINGS[company].defaultPaymentTerms)
  const [customPaymentTerms, setCustomPaymentTerms] = useState('')
  const [deliveryTerms, setDeliveryTerms] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState(DEFAULT_QUOTE_SETTINGS[company].defaultSpecialInstructions)
  const [vatMode, setVatMode] = useState<VATMode>('inclusive')
  const [includeBankDetails, setIncludeBankDetails] = useState(true)
  // Bank account selector — Kingsport has individual accounts; default to first active account
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string | null>(
    getActiveBankAccounts('Kingsport')[0]?.id ?? null
  )
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([emptyLine()])
  const [saving, setSaving] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const today = getTodayISO()
  const validUntil = addDays(today, validityDays)

  // Derived totals
  const subtotal = lineItems.reduce((s, i) => s + i.amount, 0)
  // Inclusive: VAT back-calculated from gross price
  const vatAmount = vatMode === 'inclusive'
    ? subtotal - (subtotal / (1 + VAT_RATE))
    : vatMode === 'exclusive'
    ? subtotal * VAT_RATE
    : 0
  const total = vatMode === 'exclusive' ? subtotal + vatAmount : subtotal

  const quoteNumber = useRef(getNextQuoteNumber(company, new Date().getFullYear()))

  // When company changes, update quote number and defaults
  function handleCompanyChange(c: QuoteCompany) {
    setCompany(c)
    quoteNumber.current = getNextQuoteNumber(c, new Date().getFullYear())
    const defaults = DEFAULT_QUOTE_SETTINGS[c]
    setValidityDays(defaults.defaultValidityDays)
    setPaymentTerms(defaults.defaultPaymentTerms)
    setSpecialInstructions(defaults.defaultSpecialInstructions)
    // Reset bank account to first active account for the new company
    const accounts = getActiveBankAccounts(c)
    setSelectedBankAccountId(accounts[0]?.id ?? null)
  }

  // ── Line Item Operations ───────────────────────────────────────────────────
  function updateLine(id: string, field: keyof QuoteLineItem, value: string | number) {
    setLineItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const updated = { ...item, [field]: value }
      return calcLine(updated)
    }))
  }
  function addLine() { setLineItems(prev => [...prev, emptyLine()]) }
  function removeLine(id: string) { setLineItems(prev => prev.filter(i => i.id !== id)) }

  // ── Build quote object ─────────────────────────────────────────────────────
  function buildQuote(status: Quote['status']): Quote {
    const effectivePaymentTerms = paymentTerms === 'Custom' ? customPaymentTerms : paymentTerms
    const computedVatAmount = vatMode === 'inclusive'
      ? subtotal - (subtotal / (1 + VAT_RATE))
      : vatMode === 'exclusive'
      ? subtotal * VAT_RATE
      : 0
    const computedTotal = vatMode === 'exclusive' ? subtotal + computedVatAmount : subtotal
    // Resolve the selected bank account (undefined for Bralyn/SGA until added)
    const selectedAccount = includeBankDetails
      ? MOCK_BANK_ACCOUNTS.find(a => a.id === selectedBankAccountId)
      : undefined
    return {
      id: `q_${Date.now()}`,
      quote_number: quoteNumber.current,
      company,
      client_name: clientName,
      client_attention: clientAttention,
      client_address: clientAddress,
      description: lineItems[0]?.description || 'Quotation',
      line_items: lineItems,
      subtotal: Math.round(subtotal * 100) / 100,
      vat_mode: vatMode,
      vat_amount: Math.round(computedVatAmount * 100) / 100,
      total: Math.round(computedTotal * 100) / 100,
      currency: 'USD',
      validity_days: validityDays,
      quote_date: today,
      valid_until: validUntil,
      payment_terms: effectivePaymentTerms,
      delivery_terms: deliveryTerms,
      special_instructions: specialInstructions,
      include_bank_details: includeBankDetails,
      selected_bank_account: selectedAccount as any,
      status,
      created_by: userAccess.userName,
      created_at: new Date().toISOString(),
    }
  }

  async function handleSaveDraft() {
    if (!clientName.trim()) { toast.error('Client name is required.'); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    const q = buildQuote('draft')
    onSave(q)
    toast.success(`${q.quote_number} saved as draft.`)
    setSaving(false)
    onClose()
  }

  async function handleGeneratePDF(andClose = true) {
    if (!clientName.trim()) { toast.error('Client name is required.'); return }
    setGeneratingPDF(true)
    const q = buildQuote('draft')
    // Small delay to let preview render
    await new Promise(r => setTimeout(r, 400))
    try {
      const templateId = `quote-template-${company.toLowerCase()}`
      await generateQuotePDF(templateId, q)
      onSave(q)
      toast.success('PDF generated and downloaded.')
      if (andClose) onClose()
    } catch (err) {
      toast.error('PDF generation failed. Please try again.')
      console.error(err)
    } finally {
      setGeneratingPDF(false)
    }
  }

  // Build partial quote for live preview
  const activeBankAccounts = getActiveBankAccounts(company)
  const resolvedBankAccount = includeBankDetails
    ? MOCK_BANK_ACCOUNTS.find(a => a.id === selectedBankAccountId)
    : undefined
  const previewQuote: any = {
    company,
    quote_number: quoteNumber.current,
    client_name: clientName || 'Client Name',
    client_attention: clientAttention,
    client_address: clientAddress,
    line_items: lineItems.filter(i => i.description),
    subtotal: Math.round(subtotal * 100) / 100,
    vat_mode: vatMode,
    vat_amount: Math.round((vatMode === 'inclusive'
      ? subtotal - (subtotal / (1 + VAT_RATE))
      : vatMode === 'exclusive'
      ? subtotal * VAT_RATE
      : 0) * 100) / 100,
    total: Math.round((vatMode === 'exclusive' ? subtotal * (1 + VAT_RATE) : subtotal) * 100) / 100,
    currency: 'USD',
    validity_days: validityDays,
    quote_date: today,
    valid_until: validUntil,
    payment_terms: paymentTerms === 'Custom' ? customPaymentTerms : paymentTerms,
    delivery_terms: deliveryTerms,
    special_instructions: specialInstructions,
    include_bank_details: includeBankDetails,
    selected_bank_account: resolvedBankAccount,
    created_by: userAccess.userName,
  }

  const fmtUSD = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="btn-icon rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-bold text-slate-900 text-base">New Quotation</h1>
            <p className="text-xs text-slate-500">{quoteNumber.current}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPreviewMode(p => !p)} className="btn-secondary btn-sm">
            <Eye className="w-3.5 h-3.5" />{previewMode ? 'Hide Preview' : 'Full Preview'}
          </button>
          <button onClick={handleSaveDraft} disabled={saving} className="btn-secondary btn-sm">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save as Draft
          </button>
          <button onClick={() => handleGeneratePDF(true)} disabled={generatingPDF} className="btn-primary btn-sm">
            {generatingPDF ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Generate & Download PDF
          </button>
        </div>
      </div>

      {/* ── Main area: form (60%) + preview (40%) ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ─ FORM (left) ─ */}
        <div className={cn('overflow-y-auto flex-shrink-0 transition-all duration-300', previewMode ? 'w-0 opacity-0 pointer-events-none' : 'w-full max-w-[60%]')}>
          <div className="p-6 space-y-8 max-w-2xl">

            {/* Section 1 — Quote Identity */}
            <section>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quote Identity</h2>
              <div className="space-y-4">

                {/* Company selector */}
                {accessibleCompanies.length > 1 ? (
                  <div>
                    <label className="label">Company</label>
                    <select className="select" value={company} onChange={e => handleCompanyChange(e.target.value as QuoteCompany)}>
                      {accessibleCompanies.map(c => <option key={c} value={c}>{COMPANY_DETAILS[c].full_name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="label">Company</label>
                    <div className="input bg-slate-50 text-slate-500 select-none">{COMPANY_DETAILS[company].full_name}</div>
                  </div>
                )}

                {/* Quote No + Date (read-only) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Quote Number</label>
                    <div className="input bg-slate-50 text-slate-500 font-mono select-none">{quoteNumber.current}</div>
                  </div>
                  <div>
                    <label className="label">Quote Date</label>
                    <div className="input bg-slate-50 text-slate-500 select-none">{formatQuoteDate(today)}</div>
                  </div>
                </div>

                {/* Validity segmented control */}
                <div>
                  <label className="label">Valid For</label>
                  <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                    {([7, 14, 30] as const).map(d => (
                      <button key={d} onClick={() => setValidityDays(d)}
                        className={cn('flex-1 py-2 rounded-lg text-sm font-medium transition-all', validityDays === d ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
                        {d} Days
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    This quote is valid until <strong>{formatQuoteDate(validUntil)}</strong>.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 — Client Details */}
            <section>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Client Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="label">Client Name <span className="text-red-500">*</span></label>
                  <input className="input" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. MOHCC or Acme Corp" />
                </div>
                <div>
                  <label className="label">Attention</label>
                  <input className="input" value={clientAttention} onChange={e => setClientAttention(e.target.value)} placeholder="e.g. The Procurement Manager" />
                </div>
                <div>
                  <label className="label">Client Address <span className="text-slate-400 font-normal">(optional)</span></label>
                  <textarea className="input resize-none h-20" value={clientAddress} onChange={e => setClientAddress(e.target.value)} placeholder="Client's postal or physical address" />
                </div>
              </div>
            </section>

            {/* Section 3 — Line Items */}
            <section>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Line Items</h2>
              <div className="space-y-0 rounded-xl border border-slate-200 overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[28px_1fr_72px_80px_100px_100px_28px] gap-2 px-3 py-2 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <div>#</div><div>Description</div><div className="text-right">Qty</div>
                  <div>Unit</div><div className="text-right">Unit Price</div><div className="text-right">Amount</div><div />
                </div>

                {lineItems.map((item, i) => (
                  <div key={item.id} className="grid grid-cols-[28px_1fr_72px_80px_100px_100px_28px] gap-2 px-3 py-2 border-b border-slate-100 items-center">
                    <div className="text-xs text-slate-400 text-center">{i + 1}</div>
                    <input
                      className="text-sm border-none outline-none bg-transparent w-full"
                      value={item.description}
                      onChange={e => updateLine(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                      tabIndex={(i * 5) + 1}
                    />
                    <input
                      className="text-sm border border-slate-200 rounded-lg px-2 py-1 w-full text-right font-mono"
                      type="number" min="0" step="1"
                      value={item.qty}
                      onChange={e => updateLine(item.id, 'qty', parseFloat(e.target.value) || 0)}
                      tabIndex={(i * 5) + 2}
                    />
                    <select
                      className="text-xs border border-slate-200 rounded-lg px-1 py-1.5 w-full bg-white"
                      value={item.unit}
                      onChange={e => updateLine(item.id, 'unit', e.target.value)}
                      tabIndex={(i * 5) + 3}
                    >
                      {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <input
                      className="text-sm border border-slate-200 rounded-lg px-2 py-1 w-full text-right font-mono"
                      type="number" min="0" step="0.01"
                      value={item.unit_price}
                      onChange={e => updateLine(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                      tabIndex={(i * 5) + 4}
                    />
                    <div className="text-sm font-semibold text-right font-mono text-slate-700">
                      {fmtUSD(item.amount)}
                    </div>
                    <button onClick={() => removeLine(item.id)} className="text-slate-300 hover:text-red-400 transition-colors flex items-center justify-center">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <div className="px-3 py-2">
                  <button onClick={addLine} className="text-brand-600 text-sm font-medium flex items-center gap-1 hover:text-brand-700 transition-colors">
                    <Plus className="w-3.5 h-3.5" />Add Item
                  </button>
                </div>
              </div>

              {/* Totals */}
              <div className="mt-3 flex justify-end">
                <div className="w-[260px] bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="flex justify-between px-4 py-2 text-sm text-slate-600">
                    <span>Subtotal</span><span className="font-mono">{fmtUSD(subtotal)}</span>
                  </div>

                  {/* VAT mode toggle */}
                  <div className="border-t border-slate-100 px-4 py-2">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1.5">VAT</p>
                    <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
                    {([['inclusive', '15.5% Incl.'], ['exclusive', '15.5% Excl.'], ['zero', 'Zero Rated']] as [VATMode, string][]).map(([m, label]) => (
                      <button key={m} onClick={() => setVatMode(m)}
                        className={cn('flex-1 py-1.5 rounded-md text-[11px] font-medium transition-all', vatMode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {vatMode === 'inclusive' && (
                    <p className="text-[10px] text-slate-400 mt-1">VAT (15.5%) included in above prices: {fmtUSD(vatMode === 'inclusive' ? subtotal - (subtotal / (1 + VAT_RATE)) : 0)}</p>
                  )}
                  {vatMode === 'exclusive' && (
                    <p className="text-[10px] text-slate-400 mt-1">VAT @ 15.5%: {fmtUSD(subtotal * VAT_RATE)} — Total incl. VAT: {fmtUSD(subtotal * (1 + VAT_RATE))}</p>
                  )}
                  {vatMode === 'zero' && (
                    <p className="text-[10px] text-slate-400 mt-1">Zero rated for VAT purposes.</p>
                  )}
                  </div>

                  <div className="flex justify-between px-4 py-3 bg-slate-900 text-white font-bold">
                    <span className="text-sm">TOTAL (USD)</span>
                    <span className="font-mono text-base">{fmtUSD(total)}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 — Terms & Instructions */}
            <section>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Terms & Instructions</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Payment Terms</label>
                  <select className="select" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)}>
                    {PAYMENT_TERMS_PRESETS.map(t => <option key={t}>{t}</option>)}
                  </select>
                  {paymentTerms === 'Custom' && (
                    <input className="input mt-2" value={customPaymentTerms} onChange={e => setCustomPaymentTerms(e.target.value)} placeholder="Enter custom payment terms…" />
                  )}
                </div>
                <div>
                  <label className="label">Delivery Terms <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input className="input" value={deliveryTerms} onChange={e => setDeliveryTerms(e.target.value)} placeholder="e.g. Delivery within 10 working days of order confirmation." />
                </div>
                <div>
                  <label className="label">Special Instructions <span className="text-slate-400 font-normal">(optional)</span></label>
                  <textarea className="input resize-none h-24" value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} placeholder="Any branding specs, tender conditions, packaging requirements…" />
                </div>
                {/* Payment Account section — Kingsport has individual bank accounts; others use generic toggle */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Include bank details</p>
                      <p className="text-xs text-slate-500 mt-0.5">Show payment account on the quotation.</p>
                    </div>
                    <button
                      onClick={() => setIncludeBankDetails(p => !p)}
                      className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none', includeBankDetails ? 'bg-brand-600' : 'bg-slate-300')}
                    >
                      <span className={cn('inline-block h-4 w-4 rounded-full bg-white shadow transition-transform', includeBankDetails ? 'translate-x-6' : 'translate-x-1')} />
                    </button>
                  </div>

                  {includeBankDetails && activeBankAccounts.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="label">Payment Account</label>
                      <select
                        className="select"
                        value={selectedBankAccountId ?? ''}
                        onChange={e => setSelectedBankAccountId(e.target.value || null)}
                      >
                        {activeBankAccounts.map(acc => (
                          <option key={acc.id} value={acc.id}>{bankAccountLabel(acc)}</option>
                        ))}
                      </select>
                      {resolvedBankAccount && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          Account {resolvedBankAccount.account_number} · Swift: {resolvedBankAccount.swift_code}
                          {resolvedBankAccount.branch_code ? ` · Branch: ${resolvedBankAccount.branch_code}` : ''}
                          {resolvedBankAccount.sort_code ? ` · Sort: ${resolvedBankAccount.sort_code}` : ''}
                        </p>
                      )}
                    </div>
                  )}

                  {includeBankDetails && activeBankAccounts.length === 0 && (
                    <p className="text-xs text-amber-600">No bank accounts configured for {COMPANY_DETAILS[company].short_name}.</p>
                  )}
                </div>
              </div>
            </section>

            {/* Bottom actions */}
            <div className="flex gap-3 pb-8">
              <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSaveDraft} disabled={saving} className="btn-secondary flex-1">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save as Draft</>}
              </button>
              <button onClick={() => handleGeneratePDF(true)} disabled={generatingPDF} className="btn-primary flex-1">
                {generatingPDF ? <><Loader2 className="w-4 h-4 animate-spin" />Generating…</> : <><Download className="w-4 h-4" />Download PDF</>}
              </button>
            </div>
          </div>
        </div>

        {/* ─ LIVE PREVIEW (right, always visible) ─ */}
        <div className={cn(
          'flex-1 bg-slate-200 overflow-y-auto flex flex-col items-center py-6 gap-4 transition-all duration-300 border-l border-slate-300',
          previewMode ? 'w-full' : 'min-w-0'
        )}>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Live Preview</div>
          <div style={{ transform: 'scale(0.72)', transformOrigin: 'top center', width: '794px', marginBottom: '-200px' }}>
            {company === 'Kingsport' && <KingsportTemplate quote={previewQuote} />}
            {company === 'Bralyn' && <BraylnTemplate quote={previewQuote} />}
            {company === 'SGA' && <SGATemplate quote={previewQuote} />}
          </div>
        </div>
      </div>
    </div>
  )
}

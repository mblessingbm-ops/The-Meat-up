'use client'

/**
 * GenerateInvoiceModal
 *
 * Unified invoice creation form for both accounting and sales modules.
 *
 * Features:
 *  • Fiscal invoice — auto-submitted to ZIMRA on save
 *  • Non-fiscal invoice — for VAT-exempt customers (government, NGOs, diplomatic)
 *  • Auto-switches invoice type when a VAT-exempt customer is selected
 *  • Line item builder with auto-calculated totals
 *  • Post-creation shows ZIMRA receipt details + PDF download button
 */

import { useState, useEffect, useCallback } from 'react'
import {
  X, Plus, Trash2, FileText, CheckCircle2,
  AlertTriangle, RefreshCw, Download, Loader2,
  Building2, ShieldOff, Receipt,
} from 'lucide-react'
import { useSession } from 'next-auth/react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Customer {
  id:                   string
  name:                 string
  email?:               string
  tin?:                 string
  vat_number?:          string
  is_vat_exempt:        boolean
  vat_exemption_reason?: string
  payment_terms?:       number
}

interface LineItem {
  id:          string   // client-side only
  description: string
  quantity:    number
  unitPrice:   number
  lineTotal:   number
  taxPercent:  number
  taxID:       number
  taxCode:     string
  hsCode:      string
}

interface CreatedInvoice {
  id:                      string
  invoice_number:          string
  invoice_type:            'fiscal' | 'non_fiscal'
  total_amount:            number
  fiscal_status?:          string
  zimra_receipt_id?:       number
  zimra_fiscal_day_no?:    number
  zimra_receipt_global_no?: number
  zimra_verification_code?: string
  zimra_qr_code_url?:      string
  zimra_error_code?:       string
  zimra_error_message?:    string
}

interface Props {
  open:          boolean
  onClose:       () => void
  onCreated:     (invoice: CreatedInvoice) => void
  dealId?:       string     // pre-fill if coming from Sales
  customerId?:   string     // pre-fill if coming from Sales
  prefillAmount?: number    // pre-fill from deal value
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  { value: 'BankTransfer',  label: 'Bank Transfer' },
  { value: 'Cash',          label: 'Cash' },
  { value: 'Card',          label: 'Card' },
  { value: 'MobileWallet',  label: 'Mobile Wallet (EcoCash/InnBucks)' },
  { value: 'Credit',        label: 'Credit' },
  { value: 'Other',         label: 'Other' },
]

const EXEMPTION_REASONS = [
  'Government entity',
  'Diplomatic mission',
  'NGO / Non-profit organisation',
  'Donor-funded project',
  'Export sale (zero-rated)',
  'Special exemption (attach certificate)',
]

const TAX_OPTIONS = [
  { label: '15% VAT (Standard)',    taxPercent: 15, taxID: 1, taxCode: 'C' },
  { label: '0% VAT (Zero-rated)',   taxPercent: 0,  taxID: 2, taxCode: 'B' },
  { label: 'Exempt',                taxPercent: 0,  taxID: 3, taxCode: 'A' },
]

const DEFAULT_TAX = TAX_OPTIONS[0]

function uid() { return Math.random().toString(36).slice(2) }

function blankLine(): LineItem {
  return {
    id: uid(), description: '', quantity: 1, unitPrice: 0,
    lineTotal: 0, taxPercent: DEFAULT_TAX.taxPercent,
    taxID: DEFAULT_TAX.taxID, taxCode: DEFAULT_TAX.taxCode, hsCode: '',
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function GenerateInvoiceModal({
  open, onClose, onCreated, dealId, customerId, prefillAmount,
}: Props) {
  const { data: session } = useSession()

  // Form state
  const [customers,     setCustomers]     = useState<Customer[]>([])
  const [selectedCust,  setSelectedCust]  = useState<Customer | null>(null)
  const [custSearch,    setCustSearch]    = useState('')
  const [showCustDrop,  setShowCustDrop]  = useState(false)
  const [invoiceType,   setInvoiceType]   = useState<'fiscal' | 'non_fiscal'>('fiscal')
  const [currency,      setCurrency]      = useState<'USD' | 'ZWG'>('USD')
  const [paymentMethod, setPaymentMethod] = useState('BankTransfer')
  const [issueDate,     setIssueDate]     = useState(new Date().toISOString().split('T')[0])
  const [dueDate,       setDueDate]       = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0]
  })
  const [lineItems,     setLineItems]     = useState<LineItem[]>([blankLine()])
  const [notes,         setNotes]         = useState('')
  const [exemptReason,  setExemptReason]  = useState('')
  const [buyerTin,      setBuyerTin]      = useState('')
  const [buyerVat,      setBuyerVat]      = useState('')

  // UI state
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const [created,       setCreated]       = useState<CreatedInvoice | null>(null)
  const [pdfLoading,    setPdfLoading]    = useState(false)

  // ── Load customers ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    fetch('/api/sales/customers?limit=200')
      .then(r => r.json())
      .then(d => setCustomers(d.customers ?? []))
      .catch(() => {})
  }, [open])

  // ── Pre-fill customerId from prop ───────────────────────────────────────────
  useEffect(() => {
    if (customerId && customers.length) {
      const c = customers.find(x => x.id === customerId)
      if (c) applyCustomer(c)
    }
  }, [customerId, customers]) // eslint-disable-line

  // ── Reset on close ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      setCreated(null); setError(null); setLoading(false)
      setLineItems([blankLine()])
      setSelectedCust(null); setCustSearch(''); setInvoiceType('fiscal')
      setCurrency('USD'); setPaymentMethod('BankTransfer')
      setNotes(''); setExemptReason(''); setBuyerTin(''); setBuyerVat('')
      const d = new Date(); d.setDate(d.getDate() + 30)
      setIssueDate(new Date().toISOString().split('T')[0])
      setDueDate(d.toISOString().split('T')[0])
    }
  }, [open])

  // ── Auto-set due date from customer payment_terms ───────────────────────────
  const applyCustomer = useCallback((c: Customer) => {
    setSelectedCust(c)
    setCustSearch(c.name)
    setShowCustDrop(false)
    setBuyerTin(c.tin ?? '')
    setBuyerVat(c.vat_number ?? '')
    if (c.is_vat_exempt) {
      setInvoiceType('non_fiscal')
      setExemptReason(c.vat_exemption_reason ?? EXEMPTION_REASONS[0])
      setLineItems(items => items.map(i => ({ ...i, taxPercent: 0, taxID: 3, taxCode: 'A' })))
    } else {
      setInvoiceType('fiscal')
      setLineItems(items => items.map(i => ({ ...i, taxPercent: 15, taxID: 1, taxCode: 'C' })))
    }
    if (c.payment_terms) {
      const d = new Date()
      d.setDate(d.getDate() + c.payment_terms)
      setDueDate(d.toISOString().split('T')[0])
    }
  }, [])

  // ── Pre-fill single line from deal amount ───────────────────────────────────
  useEffect(() => {
    if (prefillAmount && prefillAmount > 0) {
      setLineItems([{ ...blankLine(), description: 'Service / Goods per agreement', unitPrice: prefillAmount, lineTotal: prefillAmount }])
    }
  }, [prefillAmount])

  // ── Line item helpers ───────────────────────────────────────────────────────
  const updateLine = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(prev => prev.map(l => {
      if (l.id !== id) return l
      const updated = { ...l, [field]: value }
      if (field === 'quantity' || field === 'unitPrice') {
        updated.lineTotal = Number(updated.quantity) * Number(updated.unitPrice)
      }
      if (field === 'taxPercent') {
        const opt = TAX_OPTIONS.find(t => t.taxPercent === Number(value)) ?? DEFAULT_TAX
        updated.taxID   = opt.taxID
        updated.taxCode = opt.taxCode
      }
      return updated
    }))
  }

  const addLine    = () => setLineItems(p => [...p, blankLine()])
  const removeLine = (id: string) => setLineItems(p => p.filter(l => l.id !== id))

  // ── Derived totals ──────────────────────────────────────────────────────────
  const subtotal = lineItems.reduce((s, l) => s + l.lineTotal, 0)
  const taxTotal = invoiceType === 'non_fiscal' ? 0 : lineItems.reduce((s, l) => {
    if (!l.taxPercent) return s
    return s + l.lineTotal * (l.taxPercent / (100 + l.taxPercent))
  }, 0)
  const total = subtotal  // tax-inclusive; subtotal already contains tax

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedCust) { setError('Please select a customer.'); return }
    if (lineItems.some(l => !l.description || l.lineTotal <= 0)) {
      setError('All line items must have a description and a positive amount.'); return
    }
    if (invoiceType === 'non_fiscal' && !exemptReason) {
      setError('Please provide a VAT exemption reason.'); return
    }

    setLoading(true); setError(null)

    const body = {
      _userId:   (session?.user as { id?: string })?.id   ?? '',
      _userName: session?.user?.name  ?? '',
      _userRole: (session?.user as { role?: string })?.role ?? '',
      customer_id:      selectedCust.id,
      invoice_type:     invoiceType,
      currency,
      payment_method:   paymentMethod,
      issue_date:       issueDate,
      due_date:         dueDate,
      amount:           subtotal,
      tax_amount:       taxTotal,
      total_amount:     total,
      line_items:       lineItems.map(({ id: _id, ...rest }) => rest),
      notes:            notes || undefined,
      deal_id:          dealId  || undefined,
      exemption_reason: invoiceType === 'non_fiscal' ? exemptReason : undefined,
      buyer_name:       selectedCust.name,
      buyer_tin:        buyerTin  || undefined,
      buyer_vat_number: buyerVat  || undefined,
    }

    try {
      const res = await fetch('/api/accounting/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) { setError(data.error ?? 'Failed to create invoice'); setLoading(false); return }

      setCreated(data.invoice)
      onCreated(data.invoice)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  // ── Retry fiscalisation ─────────────────────────────────────────────────────
  const handleRetry = async () => {
    if (!created) return
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/accounting/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action:    'retry_fiscalise',
          id:        created.id,
          _userId:   (session?.user as { id?: string })?.id   ?? '',
          _userName: session?.user?.name  ?? '',
          _userRole: (session?.user as { role?: string })?.role ?? '',
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setCreated(data.invoice)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  // ── Download PDF ────────────────────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    if (!created) return
    setPdfLoading(true)
    try {
      const res = await fetch(`/api/accounting/invoices/pdf?id=${created.id}`)
      if (!res.ok) { setError('Failed to generate PDF'); return }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = `${created.invoice_number}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(String(e))
    } finally {
      setPdfLoading(false)
    }
  }

  // ── Filtered customer dropdown ──────────────────────────────────────────────
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(custSearch.toLowerCase())
  ).slice(0, 12)

  if (!open) return null

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl max-h-[95vh] overflow-y-auto bg-white rounded-2xl shadow-2xl flex flex-col">

        {/* ── Modal header ── */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gray-900 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <span className="text-white font-semibold text-base">
              {created ? 'Invoice Created' : 'Generate Invoice'}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Success view ── */}
        {created ? (
          <div className="flex-1 p-6 space-y-5">
            {/* Status banner */}
            {created.invoice_type === 'non_fiscal' ? (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <ShieldOff className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-800">Non-Fiscal Invoice Created</p>
                  <p className="text-sm text-amber-700 mt-0.5">
                    This invoice was <strong>not submitted to ZIMRA</strong> as the customer is VAT-exempt.
                  </p>
                </div>
              </div>
            ) : created.fiscal_status === 'fiscalised' ? (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-800">Fiscalised Successfully</p>
                  <p className="text-sm text-emerald-700 mt-0.5">
                    Invoice <strong>{created.invoice_number}</strong> has been submitted to and verified by ZIMRA.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-800">ZIMRA Submission Failed</p>
                  <p className="text-sm text-red-700 mt-0.5">{created.zimra_error_message ?? 'Unknown error'}</p>
                  <button
                    onClick={handleRetry}
                    disabled={loading}
                    className="mt-2 flex items-center gap-1.5 text-sm text-red-700 font-medium hover:text-red-900 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Retry Fiscalisation
                  </button>
                </div>
              </div>
            )}

            {/* Invoice reference card */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Invoice Reference</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  created.invoice_type === 'non_fiscal'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {created.invoice_type === 'non_fiscal' ? 'Non-Fiscal' : 'Fiscal'}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{created.invoice_number}</p>

              {/* ZIMRA details */}
              {created.invoice_type === 'fiscal' && created.fiscal_status === 'fiscalised' && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm border-t border-gray-200 pt-3">
                  {created.zimra_receipt_id && (
                    <>
                      <span className="text-gray-500">ZIMRA Receipt ID</span>
                      <span className="font-mono font-semibold text-gray-900">{created.zimra_receipt_id}</span>
                    </>
                  )}
                  {created.zimra_fiscal_day_no && (
                    <>
                      <span className="text-gray-500">Fiscal Day No.</span>
                      <span className="font-semibold text-gray-900">{created.zimra_fiscal_day_no}</span>
                    </>
                  )}
                  {created.zimra_receipt_global_no && (
                    <>
                      <span className="text-gray-500">Global Receipt No.</span>
                      <span className="font-semibold text-gray-900">{created.zimra_receipt_global_no}</span>
                    </>
                  )}
                  {created.zimra_verification_code && (
                    <>
                      <span className="text-gray-500">Verification Code</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-800 break-all">
                        {created.zimra_verification_code}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-700 transition-colors disabled:opacity-60"
              >
                {pdfLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Download className="w-4 h-4" />}
                Download PDF
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (

        /* ── Create form ── */
        <div className="flex-1 p-6 space-y-5">

          {/* Invoice type toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setInvoiceType('fiscal'); setLineItems(p => p.map(l => ({ ...l, taxPercent: 15, taxID: 1, taxCode: 'C' }))) }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                invoiceType === 'fiscal'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <Receipt className="w-4 h-4" />
              Fiscal Invoice (ZIMRA)
            </button>
            <button
              type="button"
              onClick={() => { setInvoiceType('non_fiscal'); setLineItems(p => p.map(l => ({ ...l, taxPercent: 0, taxID: 3, taxCode: 'A' }))) }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                invoiceType === 'non_fiscal'
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <ShieldOff className="w-4 h-4" />
              Non-Fiscal (VAT Exempt)
            </button>
          </div>

          {/* Non-fiscal exemption reason */}
          {invoiceType === 'non_fiscal' && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 space-y-2">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">VAT Exemption Reason</p>
              <select
                value={exemptReason}
                onChange={e => setExemptReason(e.target.value)}
                className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">— Select reason —</option>
                {EXEMPTION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          )}

          {/* Customer */}
          <div className="space-y-1 relative">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Customer *</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={custSearch}
                onChange={e => { setCustSearch(e.target.value); setSelectedCust(null); setShowCustDrop(true) }}
                onFocus={() => setShowCustDrop(true)}
                placeholder="Search customer..."
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            {showCustDrop && filteredCustomers.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                {filteredCustomers.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => applyCustomer(c)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 text-left"
                  >
                    <span className="font-medium text-gray-900">{c.name}</span>
                    {c.is_vat_exempt && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
                        VAT Exempt
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {selectedCust?.is_vat_exempt && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠ This customer is VAT-exempt — invoice type set to Non-Fiscal.
              </p>
            )}
          </div>

          {/* Buyer TIN / VAT — optional override */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Buyer TIN</label>
              <input value={buyerTin} onChange={e => setBuyerTin(e.target.value)}
                placeholder="e.g. 2000012345"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Buyer VAT No.</label>
              <input value={buyerVat} onChange={e => setBuyerVat(e.target.value)}
                placeholder="e.g. 220012345"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
          </div>

          {/* Dates + currency + payment */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Issue Date</label>
              <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value as 'USD' | 'ZWG')}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                <option value="USD">USD — US Dollar</option>
                <option value="ZWG">ZWG — Zimbabwe Gold</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Payment Method</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>

          {/* Line items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Line Items</label>
              <button type="button" onClick={addLine}
                className="flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:text-emerald-800 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Line
              </button>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <span>Description</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Unit Price</span>
              {invoiceType === 'fiscal' && <span className="text-center">VAT</span>}
              <span className="text-right">Total</span>
              <span />
            </div>

            {lineItems.map(line => (
              <div key={line.id} className="grid gap-2 items-center bg-gray-50 rounded-xl p-2"
                style={{ gridTemplateColumns: invoiceType === 'fiscal' ? '2fr 0.6fr 0.9fr 0.7fr 0.9fr auto' : '2fr 0.6fr 0.9fr 0.9fr auto' }}>
                <input value={line.description}
                  onChange={e => updateLine(line.id, 'description', e.target.value)}
                  placeholder="Item description"
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white" />
                <input type="number" min="0.01" step="any" value={line.quantity}
                  onChange={e => updateLine(line.id, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white" />
                <input type="number" min="0" step="any" value={line.unitPrice}
                  onChange={e => updateLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white" />
                {invoiceType === 'fiscal' && (
                  <select value={line.taxPercent}
                    onChange={e => updateLine(line.id, 'taxPercent', Number(e.target.value))}
                    className="w-full px-1 py-1.5 border border-gray-200 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
                    {TAX_OPTIONS.map(t => <option key={t.taxID} value={t.taxPercent}>{t.label}</option>)}
                  </select>
                )}
                <span className="text-sm font-semibold text-gray-800 text-right px-1">
                  {currency} {line.lineTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <button type="button" onClick={() => removeLine(line.id)}
                  disabled={lineItems.length === 1}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal (tax-incl.)</span>
                <span>{currency} {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>{invoiceType === 'non_fiscal' ? 'VAT (Exempt)' : 'VAT'}</span>
                <span>{invoiceType === 'non_fiscal' ? '—' : `${currency} ${taxTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-2">
                <span>Total Due</span>
                <span>{currency} {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="Payment instructions, bank details, reference numbers..."
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>

          {/* ZIMRA notice */}
          {invoiceType === 'fiscal' && (
            <div className="flex items-start gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <FileText className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-emerald-700">
                This invoice will be <strong>automatically submitted to ZIMRA</strong> upon saving. Ensure the fiscal day is open before proceeding.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1 sticky bottom-0 bg-white pb-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm text-white transition-colors disabled:opacity-60 ${
                invoiceType === 'fiscal'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-amber-500 hover:bg-amber-600'
              }`}>
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {invoiceType === 'fiscal' ? 'Submitting to ZIMRA...' : 'Creating Invoice...'}</>
                : <><Receipt className="w-4 h-4" /> {invoiceType === 'fiscal' ? 'Create & Fiscalise' : 'Create Non-Fiscal Invoice'}</>}
            </button>
          </div>

        </div>
        )}
      </div>
    </div>
  )
}

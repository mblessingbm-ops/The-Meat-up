'use client'
// components/payments/PendingReconciliationQueue.tsx
// Pending reconciliation sub-tab in Accounting → Customer Invoices
// Visible to accountants and executives only

import { useState } from 'react'
import { Paperclip, CheckCircle2, XCircle, Building2, Banknote, Smartphone, CreditCard, Clock, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_PAYMENTS } from '@/lib/payments-mock'
import type { PaymentRecord } from '@/types/payments'
import { PAYMENT_METHOD_LABELS } from '@/types/payments'
import ReconcileDialog from './ReconcileDialog'

const METHOD_ICONS = {
  BankTransfer: Building2,
  Cash: Banknote,
  MobileWallet: Smartphone,
  Credit: CreditCard,
}

const COMPANY_BADGES: Record<string, string> = {
  Kingsport: 'bg-indigo-100 text-indigo-700',
  Bralyn: 'bg-emerald-100 text-emerald-700',
  SGA: 'bg-orange-100 text-orange-700',
}

function fmtAmt(n: number, currency: 'USD' | 'ZWG') {
  const f = n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return currency === 'ZWG' ? `ZWG ${f}` : `USD ${f}`
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

interface Props {
  accountantName?: string
  accountantId?: string
}

export default function PendingReconciliationQueue({
  accountantName = 'Ashleigh Kurira',
  accountantId = 'ashleigh-kurira',
}: Props) {
  const [payments, setPayments] = useState<PaymentRecord[]>(
    MOCK_PAYMENTS.filter(p => p.status === 'pending_reconciliation')
  )
  const [filterCompany, setFilterCompany] = useState('All')
  const [filterMethod, setFilterMethod] = useState('All')
  const [filterProof, setFilterProof] = useState('All')
  const [filterRep, setFilterRep] = useState('All')
  const [dialogTarget, setDialogTarget] = useState<{ payment: PaymentRecord; mode: 'reconcile' | 'reject' } | null>(null)

  const reps = Array.from(new Set(payments.map(p => p.recordedByName))).sort()

  const filtered = payments.filter(p => {
    if (filterCompany !== 'All' && p.company !== filterCompany) return false
    if (filterMethod !== 'All' && p.paymentMethod !== filterMethod) return false
    if (filterProof === 'With proof' && p.proofOfPayment.length === 0) return false
    if (filterProof === 'Without proof' && p.proofOfPayment.length > 0) return false
    if (filterRep !== 'All' && p.recordedByName !== filterRep) return false
    return true
  })

  function handleReconcile(paymentId: string, notes: string) {
    setPayments(prev => prev.filter(p => p.id !== paymentId))
  }

  function handleReject(paymentId: string, reason: string) {
    setPayments(prev => prev.filter(p => p.id !== paymentId))
  }

  const usdTotal = payments.filter(p => p.currency === 'USD').reduce((s, p) => s + p.amountPaid, 0)
  const zwgTotal = payments.filter(p => p.currency === 'ZWG').reduce((s, p) => s + p.amountPaid, 0)
  const withProof = payments.filter(p => p.proofOfPayment.length > 0).length
  const withoutProof = payments.filter(p => p.proofOfPayment.length === 0).length

  return (
    <>
      {/* Summary bar */}
      <div className="mx-4 my-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-800">{payments.length}</span>
            <span className="text-slate-500">payment{payments.length !== 1 ? 's' : ''} pending</span>
          </div>
          {usdTotal > 0 && <span className="text-slate-600 font-mono">USD {usdTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>}
          {zwgTotal > 0 && <span className="text-slate-600 font-mono">ZWG {zwgTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>}
          <span className="text-slate-400">·</span>
          <span className="text-slate-500"><span className="font-semibold text-slate-700">{withProof}</span> with proof</span>
          <span className="text-slate-500"><span className="font-semibold text-amber-600">{withoutProof}</span> without proof</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 px-4 pb-3">
        {/* Company */}
        <select className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
          value={filterCompany} onChange={e => setFilterCompany(e.target.value)}>
          {['All', 'Kingsport', 'Bralyn', 'SGA'].map(c => <option key={c}>{c}</option>)}
        </select>
        {/* Submitted by */}
        <select className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
          value={filterRep} onChange={e => setFilterRep(e.target.value)}>
          <option value="All">All reps</option>
          {reps.map(r => <option key={r}>{r}</option>)}
        </select>
        {/* Method */}
        <select className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
          value={filterMethod} onChange={e => setFilterMethod(e.target.value)}>
          <option value="All">All methods</option>
          <option value="BankTransfer">Bank Transfer</option>
          <option value="Cash">Cash</option>
          <option value="MobileWallet">EcoCash / Mobile</option>
          <option value="Credit">Credit</option>
        </select>
        {/* Proof */}
        <select className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
          value={filterProof} onChange={e => setFilterProof(e.target.value)}>
          {['All', 'With proof', 'Without proof'].map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-300" />
          <p className="font-semibold text-slate-600">No payments pending reconciliation</p>
          <p className="text-sm">All submissions are up to date.</p>
        </div>
      ) : (
        <div className="table-wrapper rounded-none border-0">
          <table className="table text-xs">
            <thead>
              <tr>
                <th>Client</th>
                <th>Invoice</th>
                <th>Invoice Total</th>
                <th>Amount</th>
                <th>Balance After</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Bank Account</th>
                <th>Payment Date</th>
                <th>Submitted By</th>
                <th>Submitted</th>
                <th>Proof</th>
                <th className="w-36">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const MethodIcon = METHOD_ICONS[p.paymentMethod]
                const ref = p.transferReference ?? p.mobileReference ?? p.cashReceiptNumber ?? '—'
                const balanceAfter = p.outstandingBefore - p.amountPaid
                const isFullPay = balanceAfter <= 0
                return (
                  <tr key={p.id}>
                    <td>
                      <p className="font-semibold text-slate-800">{p.clientName}</p>
                      <span className={cn('badge text-[10px] mt-0.5', COMPANY_BADGES[p.company])}>{p.company}</span>
                    </td>
                    <td className="font-mono text-brand-600 font-semibold">{p.invoiceNo}</td>
                    <td className="num">{fmtAmt(p.invoiceTotal, p.currency)}</td>
                    <td className="num font-bold text-emerald-700">{fmtAmt(p.amountPaid, p.currency)}</td>
                    <td className={cn('num font-semibold', isFullPay ? 'text-emerald-600' : 'text-amber-600')}>
                      {isFullPay ? 'Paid in full' : fmtAmt(balanceAfter, p.currency)}
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <MethodIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{PAYMENT_METHOD_LABELS[p.paymentMethod]}</span>
                      </div>
                    </td>
                    <td className="font-mono text-slate-600">{ref}</td>
                    <td className="text-slate-500 max-w-[120px] truncate" title={p.bankAccountReceived}>
                      {p.bankAccountReceived ? p.bankAccountReceived.split(' — ')[0] : '—'}
                    </td>
                    <td className="text-slate-600">{new Date(p.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td>
                      <p className="text-slate-700">{p.recordedByName}</p>
                      <p className="text-slate-400 text-[10px]">{p.recordedByRole.replace('_', ' ')}</p>
                    </td>
                    <td title={new Date(p.recordedAt).toLocaleString('en-GB')} className="text-slate-500 whitespace-nowrap">
                      {formatRelative(p.recordedAt)}
                    </td>
                    <td>
                      {p.proofOfPayment.length > 0 ? (
                        <span className="flex items-center gap-1 text-slate-600">
                          <Paperclip className="w-3 h-3" /> {p.proofOfPayment.length}
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setDialogTarget({ payment: p, mode: 'reconcile' })}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />Reconcile
                        </button>
                        <button
                          onClick={() => setDialogTarget({ payment: p, mode: 'reject' })}
                          className="px-2.5 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {dialogTarget && (
        <ReconcileDialog
          payment={dialogTarget.payment}
          mode={dialogTarget.mode}
          accountantName={accountantName}
          accountantId={accountantId}
          onClose={() => setDialogTarget(null)}
          onReconcile={handleReconcile}
          onReject={handleReject}
        />
      )}
    </>
  )
}

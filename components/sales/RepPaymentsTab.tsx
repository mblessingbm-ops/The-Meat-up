'use client'
// components/sales/RepPaymentsTab.tsx
// "Payments" tab for sales reps — shows their own submitted payment records
// Reps see: all their submitted payments, status (pending/reconciled/rejected), outstanding balances

import { useState } from 'react'
import { Building2, Banknote, Smartphone, CreditCard, CheckCircle2, Clock, XCircle, Paperclip, RefreshCw, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_PAYMENTS, MOCK_INVOICE_PAYMENT_SUMMARIES } from '@/lib/payments-mock'
import type { PaymentRecord } from '@/types/payments'
import { PAYMENT_METHOD_LABELS } from '@/types/payments'

const METHOD_ICONS = {
  BankTransfer: Building2,
  Cash: Banknote,
  MobileWallet: Smartphone,
  Credit: CreditCard,
}

const STATUS_CONFIG = {
  reconciled: { label: 'Reconciled', pill: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  pending_reconciliation: { label: 'Pending', pill: 'bg-amber-100 text-amber-700', icon: Clock },
  rejected: { label: 'Rejected', pill: 'bg-red-100 text-red-600', icon: XCircle },
}

// For demo, filter to Thandeka Madeya's payments (mock current rep)
const CURRENT_REP_ID = 'thandeka-madeya'
const CURRENT_REP_NAME = 'Thandeka Madeya'

function fmtAmt(n: number, currency: 'USD' | 'ZWG') {
  const f = n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return currency === 'ZWG' ? `ZWG ${f}` : `USD ${f}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

interface RepPaymentsTabProps {
  repId?: string
  repName?: string
}

export default function RepPaymentsTab({
  repId = CURRENT_REP_ID,
  repName = CURRENT_REP_NAME,
}: RepPaymentsTabProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'reconciled' | 'pending_reconciliation' | 'rejected'>('all')
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null)

  // In a real app, filter by recordedByUserId
  const allPayments = MOCK_PAYMENTS.filter(p => p.recordedByName === repName)
  const filtered = allPayments.filter(p => statusFilter === 'all' || p.status === statusFilter)

  const pendingCount = allPayments.filter(p => p.status === 'pending_reconciliation').length
  const reconciledCount = allPayments.filter(p => p.status === 'reconciled').length
  const rejectedCount = allPayments.filter(p => p.status === 'rejected').length
  const totalReconciled = allPayments.filter(p => p.status === 'reconciled' && p.currency === 'USD').reduce((s, p) => s + p.amountPaid, 0)

  return (
    <div className="flex flex-col gap-0">
      {/* KPI strip */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-nexus-border">
        {[
          { label: 'Total Payments', value: allPayments.length.toString(), color: 'text-brand-600', bg: 'bg-brand-50' },
          { label: 'Reconciled', value: reconciledCount.toString(), color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending', value: pendingCount.toString(), color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'USD Confirmed', value: `$${totalReconciled.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-brand-700', bg: 'bg-brand-50' },
        ].map(k => (
          <div key={k.label} className={cn('rounded-xl p-3 flex items-center gap-3 border border-nexus-border', k.bg)}>
            <div>
              <p className="text-[10px] text-nexus-muted font-medium uppercase tracking-wide">{k.label}</p>
              <p className={cn('text-xl font-display font-bold num mt-0.5', k.color)}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rejection alert */}
      {rejectedCount > 0 && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">{rejectedCount} payment{rejectedCount > 1 ? 's' : ''} rejected — action required</p>
            <p className="text-xs text-red-600 mt-0.5">Review the rejection reason below and resubmit with corrected details.</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="px-4 pt-4 pb-2 flex gap-1.5 flex-wrap">
        {(['all', 'reconciled', 'pending_reconciliation', 'rejected'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'badge cursor-pointer text-xs transition-all whitespace-nowrap',
              statusFilter === s ? 'bg-brand-600 text-white' : 'bg-surface-muted text-nexus-slate hover:bg-nexus-border border border-nexus-border'
            )}
          >
            {s === 'all' ? 'All' : s === 'pending_reconciliation' ? 'Pending' : s === 'reconciled' ? 'Reconciled' : 'Rejected'}
            {s === 'pending_reconciliation' && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white rounded-full px-1 text-[9px] font-bold">{pendingCount}</span>
            )}
            {s === 'rejected' && rejectedCount > 0 && (
              <span className="ml-1.5 bg-red-500 text-white rounded-full px-1 text-[9px] font-bold">{rejectedCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-slate-200" />
          <p className="font-semibold text-slate-600">No payments {statusFilter !== 'all' ? `with status "${statusFilter}"` : ''}</p>
        </div>
      )}

      {/* Payment cards */}
      {filtered.length > 0 && (
        <div className="px-4 pb-4 pt-2 space-y-3">
          {filtered.map(payment => {
            const MethodIcon = METHOD_ICONS[payment.paymentMethod]
            const statusCfg = STATUS_CONFIG[payment.status]
            const StatusIcon = statusCfg.icon
            const isExpanded = expandedPayment === payment.id
            const ref = payment.transferReference ?? payment.mobileReference ?? payment.cashReceiptNumber

            return (
              <div
                key={payment.id}
                className={cn(
                  'rounded-xl border overflow-hidden',
                  payment.status === 'rejected' ? 'border-red-200 bg-red-50/30' :
                  payment.status === 'pending_reconciliation' ? 'border-amber-200 bg-amber-50/20' :
                  'border-nexus-border bg-white'
                )}
              >
                {/* Header row */}
                <button
                  className="w-full text-left p-4 flex items-start gap-3"
                  onClick={() => setExpandedPayment(isExpanded ? null : payment.id)}
                >
                  {/* Method icon */}
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <MethodIcon className="w-4 h-4 text-slate-500" />
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-nexus-ink text-sm">{payment.clientName}</span>
                      <span className="font-mono text-xs text-brand-600">{payment.invoiceNo}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-nexus-muted">
                      <span>{PAYMENT_METHOD_LABELS[payment.paymentMethod]}</span>
                      {ref && <><span>·</span><span className="font-mono text-slate-600">{ref}</span></>}
                      <span>·</span>
                      <span>{fmtDate(payment.paymentDate)}</span>
                    </div>
                  </div>

                  {/* Amount + status */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-nexus-ink text-sm">{fmtAmt(payment.amountPaid, payment.currency)}</p>
                    <span className={cn('badge text-[10px] mt-0.5 inline-flex items-center gap-1', statusCfg.pill)}>
                      <StatusIcon className="w-2.5 h-2.5" />{statusCfg.label}
                    </span>
                  </div>

                  <ChevronRight className={cn('w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5 transition-transform', isExpanded && 'rotate-90')} />
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-4 py-3 space-y-2.5 text-sm bg-slate-50/50">

                    {/* Reconciled confirmation */}
                    {payment.status === 'reconciled' && (
                      <div className="flex items-center gap-2 text-emerald-600 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirmed by <strong>{payment.reconciledByName}</strong> · {formatRelative(payment.reconciledAt!)}</span>
                        {payment.reconciliationNotes && <span className="text-emerald-500 italic">— &ldquo;{payment.reconciliationNotes}&rdquo;</span>}
                      </div>
                    )}

                    {/* Pending message */}
                    {payment.status === 'pending_reconciliation' && (
                      <div className="flex items-center gap-2 text-amber-600 text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Awaiting reconciliation by the accounts team · Submitted {formatRelative(payment.recordedAt)}</span>
                      </div>
                    )}

                    {/* Rejection detail */}
                    {payment.status === 'rejected' && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-red-600 text-xs font-semibold">
                          <XCircle className="w-3.5 h-3.5" />
                          Rejected by {payment.rejectedByName} · {formatRelative(payment.rejectedAt!)}
                        </div>
                        <p className="text-xs text-red-600">{payment.rejectionReason}</p>
                        <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors">
                          <RefreshCw className="w-3 h-3" />Resubmit Payment
                        </button>
                      </div>
                    )}

                    {/* Proof of payment files */}
                    {payment.proofOfPayment.length > 0 && (
                      <div>
                        <p className="text-xs text-nexus-muted mb-1.5 flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />Proof of payment
                        </p>
                        <div className="flex gap-2">
                          {payment.proofOfPayment.map(f => (
                            <a key={f.id} href={f.url} target="_blank" rel="noreferrer">
                              {f.fileType.startsWith('image/') && f.url ? (
                                <img src={f.url} alt={f.fileName} className="w-14 h-14 object-cover rounded-lg border border-slate-200 hover:opacity-75 transition-opacity" />
                              ) : (
                                <div className="w-14 h-14 bg-red-50 rounded-lg border border-red-100 flex items-center justify-center hover:opacity-75 transition-opacity">
                                  <span className="text-red-400 text-[10px] font-bold">PDF</span>
                                </div>
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bank account */}
                    {payment.bankAccountReceived && (
                      <p className="text-xs text-nexus-muted">Bank: <span className="text-nexus-ink">{payment.bankAccountReceived}</span></p>
                    )}

                    {/* Outstanding balance note */}
                    <div className="flex items-center gap-3 text-xs pt-1 border-t border-slate-100">
                      <span className="text-nexus-muted">Invoice total: <span className="font-semibold text-nexus-ink">{fmtAmt(payment.invoiceTotal, payment.currency)}</span></span>
                      <span className="text-nexus-muted">·</span>
                      <span className="text-nexus-muted">
                        Outstanding: <span className={cn('font-semibold', payment.outstandingBefore - payment.amountPaid <= 0 ? 'text-emerald-600' : 'text-amber-600')}>
                          {payment.outstandingBefore - payment.amountPaid <= 0 ? 'Paid in full' : fmtAmt(payment.outstandingBefore - payment.amountPaid, payment.currency)}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

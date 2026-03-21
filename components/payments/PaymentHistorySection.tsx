'use client'
// components/payments/PaymentHistorySection.tsx
// Collapsible payment history section for invoice detail view

import { useState } from 'react'
import { ChevronDown, ChevronUp, Building2, Banknote, Smartphone, CreditCard, CheckCircle2, Clock, XCircle, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PaymentRecord, InvoicePaymentSummary } from '@/types/payments'
import { PAYMENT_METHOD_LABELS } from '@/types/payments'
import ProofOfPaymentViewer from './ProofOfPaymentViewer'
import ReconcileDialog from './ReconcileDialog'

interface PaymentHistorySectionProps {
  summary: InvoicePaymentSummary
  currency: 'USD' | 'ZWG'
  isAccountant?: boolean
  accountantName?: string
  accountantId?: string
  onReconcile?: (paymentId: string, notes: string) => void
  onReject?: (paymentId: string, reason: string) => void
}

const METHOD_ICONS = {
  BankTransfer: Building2,
  Cash: Banknote,
  MobileWallet: Smartphone,
  Credit: CreditCard,
}

const STATUS_PILLS = {
  reconciled: 'bg-emerald-100 text-emerald-700',
  pending_reconciliation: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-600',
}
const STATUS_LABELS = {
  reconciled: 'RECONCILED',
  pending_reconciliation: 'PENDING VERIFICATION',
  rejected: 'REJECTED',
}

function fmtAmt(n: number, currency: 'USD' | 'ZWG') {
  const f = n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return currency === 'ZWG' ? `ZWG ${f}` : `USD ${f}`
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function PaymentHistorySection({
  summary, currency, isAccountant = false,
  accountantName = 'Ashleigh Kurira', accountantId = 'ashleigh-kurira',
  onReconcile, onReject,
}: PaymentHistorySectionProps) {
  const [expanded, setExpanded] = useState(summary.paymentHistory.length > 0)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerFiles, setViewerFiles] = useState<PaymentRecord['proofOfPayment']>([])
  const [viewerIdx, setViewerIdx] = useState(0)
  const [reconcileTarget, setReconcileTarget] = useState<{ payment: PaymentRecord; mode: 'reconcile' | 'reject' } | null>(null)

  function openViewer(files: PaymentRecord['proofOfPayment'], idx = 0) {
    setViewerFiles(files)
    setViewerIdx(idx)
    setViewerOpen(true)
  }

  const sorted = [...summary.paymentHistory].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  )

  return (
    <>
      {/* Section header */}
      <div className="border-t border-slate-100 mt-4">
        <button
          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
          onClick={() => setExpanded(e => !e)}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700">Payment History</span>
            {summary.paymentHistory.length > 0 && (
              <span className="badge bg-slate-100 text-slate-600 text-[10px] font-semibold">
                {summary.paymentHistory.length} payment{summary.paymentHistory.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {expanded && (
          <div className="px-5 pb-5 space-y-4">

            {/* Empty state */}
            {sorted.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No payment records yet.</p>
            )}

            {/* Payment entries */}
            {sorted.map(payment => {
              const MethodIcon = METHOD_ICONS[payment.paymentMethod]
              const reference = payment.transferReference ?? payment.mobileReference ?? payment.cashReceiptNumber
              return (
                <div key={payment.id} className={cn(
                  'rounded-xl border p-4 space-y-2.5',
                  payment.status === 'pending_reconciliation' ? 'border-amber-200 bg-amber-50/30' :
                  payment.status === 'rejected' ? 'border-red-100 bg-red-50/20' :
                  'border-slate-100 bg-white'
                )}>
                  {/* Row 1: pill + date + amount */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', STATUS_PILLS[payment.status])}>
                        {STATUS_LABELS[payment.status]}
                      </span>
                      <span className="text-xs text-slate-500">{fmtDate(payment.paymentDate)}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800 whitespace-nowrap">
                      {fmtAmt(payment.amountPaid, payment.currency)}
                    </span>
                  </div>

                  {/* Row 2: method + ref */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MethodIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{PAYMENT_METHOD_LABELS[payment.paymentMethod]}</span>
                    {reference && <span className="font-mono text-slate-600">· Ref: {reference}</span>}
                    {payment.bankAccountReceived && (
                      <span className="text-slate-400 truncate">· {payment.bankAccountReceived.split(' — ')[0]}</span>
                    )}
                  </div>

                  {/* Row 3: recorded by */}
                  <p className="text-xs text-slate-400">
                    Recorded by <span className="text-slate-600 font-medium">{payment.recordedByName}</span> ({payment.recordedByRole.replace('_', ' ')}) on {fmtDateTime(payment.recordedAt)}
                  </p>

                  {/* Reconciliation info */}
                  {payment.status === 'reconciled' && payment.reconciledByName && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Reconciled by <span className="font-medium">{payment.reconciledByName}</span> on {fmtDateTime(payment.reconciledAt!)}
                      {payment.reconciliationNotes && <span className="text-emerald-500"> — &ldquo;{payment.reconciliationNotes}&rdquo;</span>}
                    </p>
                  )}

                  {/* Rejection info */}
                  {payment.status === 'rejected' && payment.rejectedByName && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Rejected by <span className="font-medium">{payment.rejectedByName}</span> — &ldquo;{payment.rejectionReason}&rdquo;
                    </p>
                  )}

                  {/* Proof thumbnails */}
                  {payment.proofOfPayment.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {payment.proofOfPayment.map((file, i) => (
                        <button key={file.id} onClick={() => openViewer(payment.proofOfPayment, i)} className="group">
                          {file.fileType.startsWith('image/') && file.url ? (
                            <img src={file.url} alt={file.fileName} className="w-12 h-12 object-cover rounded-lg border border-slate-200 group-hover:opacity-75 transition-opacity" />
                          ) : (
                            <div className="w-12 h-12 bg-red-50 rounded-lg border border-red-100 flex items-center justify-center">
                              <span className="text-red-400 text-[9px] font-bold">PDF</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Accountant inline actions for pending */}
                  {isAccountant && payment.status === 'pending_reconciliation' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setReconcileTarget({ payment, mode: 'reconcile' })}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />Reconcile
                      </button>
                      <button
                        onClick={() => setReconcileTarget({ payment, mode: 'reject' })}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />Reject
                      </button>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Balance summary */}
            <div className="border border-slate-100 rounded-xl p-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Total</span>
                <span className="font-medium text-slate-700">{fmtAmt(summary.invoiceTotal, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Paid</span>
                <span className="font-medium text-emerald-600">{fmtAmt(summary.totalReconciled, currency)}</span>
              </div>
              {summary.totalPending > 0 && (
                <div className="flex justify-between">
                  <span className="text-amber-600">Pending Verification</span>
                  <span className="font-medium text-amber-600">{fmtAmt(summary.totalPending, currency)}</span>
                </div>
              )}
              <div className="border-t border-slate-100 pt-1.5 flex justify-between font-bold">
                <span className="text-slate-700">Outstanding Balance</span>
                <span className={cn(summary.outstandingBalance === 0 ? 'text-emerald-600' : 'text-slate-800')}>
                  {fmtAmt(summary.outstandingBalance, currency)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Proof viewer */}
      <ProofOfPaymentViewer
        files={viewerFiles}
        initialIndex={viewerIdx}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />

      {/* Reconcile / Reject dialog */}
      {reconcileTarget && (
        <ReconcileDialog
          payment={reconcileTarget.payment}
          mode={reconcileTarget.mode}
          accountantName={accountantName}
          accountantId={accountantId}
          onClose={() => setReconcileTarget(null)}
          onReconcile={onReconcile}
          onReject={onReject}
        />
      )}
    </>
  )
}

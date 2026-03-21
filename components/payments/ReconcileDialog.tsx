'use client'
// components/payments/ReconcileDialog.tsx
// Two-in-one: Reconcile confirmation + Reject dialog for accountants

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, XCircle, AlertCircle, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PAYMENT_METHOD_LABELS, type PaymentRecord } from '@/types/payments'
import ProofOfPaymentViewer from './ProofOfPaymentViewer'
import { addNotification } from '@/lib/notifications-store'
import toast from 'react-hot-toast'

interface ReconcileDialogProps {
  payment: PaymentRecord
  mode: 'reconcile' | 'reject'
  accountantName: string
  accountantId: string
  onClose: () => void
  onReconcile?: (paymentId: string, notes: string) => void
  onReject?: (paymentId: string, reason: string) => void
}

function fmtAmt(n: number, currency: 'USD' | 'ZWG') {
  const f = n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return currency === 'ZWG' ? `ZWG ${f}` : `USD ${f}`
}

export default function ReconcileDialog({
  payment, mode, accountantName, accountantId, onClose, onReconcile, onReject
}: ReconcileDialogProps) {
  const [notes, setNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIdx, setViewerIdx] = useState(0)

  const canConfirm = mode === 'reconcile' || rejectionReason.trim().length > 0

  async function handleAction() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))

    if (mode === 'reconcile') {
      onReconcile?.(payment.id, notes)
      addNotification({
        id: `notif-${Date.now()}`,
        type: 'payment_reconciled',
        priority: 'standard',
        targetRoles: ['sales_rep', 'data_capture', 'sales_manager'],
        targetUserId: payment.recordedBy,
        message: `✓ Payment reconciled — Your ${fmtAmt(payment.amountPaid, payment.currency)} payment record for ${payment.clientName} (Invoice ${payment.invoiceNo}) has been reconciled by ${accountantName}.`,
        invoiceId: payment.invoiceId,
        invoiceNo: payment.invoiceNo,
        paymentId: payment.id,
        createdAt: new Date().toISOString(),
        read: false,
      })
      toast.success(`Payment ${fmtAmt(payment.amountPaid, payment.currency)} reconciled.`)
    } else {
      onReject?.(payment.id, rejectionReason)
      addNotification({
        id: `notif-${Date.now()}`,
        type: 'payment_rejected',
        priority: 'high',
        targetRoles: ['sales_rep', 'data_capture', 'sales_manager'],
        targetUserId: payment.recordedBy,
        message: `⚠️ Payment record rejected — ${payment.clientName} (Invoice ${payment.invoiceNo}) — ${fmtAmt(payment.amountPaid, payment.currency)} was rejected by ${accountantName}. Reason: '${rejectionReason}'. Please review and resubmit.`,
        invoiceId: payment.invoiceId,
        invoiceNo: payment.invoiceNo,
        paymentId: payment.id,
        rejectionReason,
        createdAt: new Date().toISOString(),
        read: false,
        action: 'resubmit',
      })
      toast.success('Payment rejected. Rep has been notified.')
    }

    setSaving(false)
    onClose()
  }

  const isReconcile = mode === 'reconcile'

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className={cn(
            'flex items-center justify-between px-5 py-4 border-b',
            isReconcile ? 'border-emerald-100 bg-emerald-50' : 'border-red-100 bg-red-50'
          )}>
            <div className="flex items-center gap-2.5">
              {isReconcile
                ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                : <XCircle className="w-5 h-5 text-red-500" />
              }
              <h2 className="font-bold text-slate-800 text-sm">
                {isReconcile ? 'Confirm Reconciliation' : 'Reject Payment'}
              </h2>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/60 rounded-lg transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Payment summary */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Client</span>
                <span className="font-semibold text-slate-800">{payment.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice</span>
                <span className="font-semibold text-slate-800">{payment.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold text-emerald-700">{fmtAmt(payment.amountPaid, payment.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Method</span>
                <span className="text-slate-700">{PAYMENT_METHOD_LABELS[payment.paymentMethod]}</span>
              </div>
              {payment.transferReference && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Reference</span>
                  <span className="font-mono text-slate-700 text-xs">{payment.transferReference}</span>
                </div>
              )}
              {payment.mobileReference && (
                <div className="flex justify-between">
                  <span className="text-slate-500">EcoCash Ref</span>
                  <span className="font-mono text-slate-700 text-xs">{payment.mobileReference}</span>
                </div>
              )}
              {payment.bankAccountReceived && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Account</span>
                  <span className="text-slate-700 text-xs text-right max-w-[60%]">{payment.bankAccountReceived}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Payment date</span>
                <span className="text-slate-700">{new Date(payment.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted by</span>
                <span className="text-slate-700">{payment.recordedByName}</span>
              </div>
            </div>

            {/* Proof of payment thumbnails */}
            {payment.proofOfPayment.length > 0 ? (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Proof of Payment ({payment.proofOfPayment.length} file{payment.proofOfPayment.length > 1 ? 's' : ''})</p>
                <div className="flex flex-wrap gap-2">
                  {payment.proofOfPayment.map((file, i) => (
                    <button
                      key={file.id}
                      className="relative group"
                      onClick={() => { setViewerIdx(i); setViewerOpen(true) }}
                    >
                      {file.fileType.startsWith('image/') && file.url ? (
                        <img src={file.url} alt={file.fileName} className="w-16 h-16 object-cover rounded-lg border border-slate-200 group-hover:opacity-80 transition-opacity" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-red-50 border border-red-100 flex flex-col items-center justify-center gap-1">
                          <span className="text-red-400 text-[10px] font-bold">PDF</span>
                          <span className="text-slate-400 text-[9px] text-center px-1 truncate w-full">{file.fileName}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-5 h-5 text-white drop-shadow" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                No proof of payment attached by rep
              </div>
            )}

            {/* Reconciliation notes */}
            {isReconcile && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Reconciliation notes <span className="text-slate-300">(optional)</span></label>
                <textarea
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  rows={2}
                  placeholder="e.g. Verified against Stanbic statement 14 March 2026"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            )}

            {/* Rejection reason */}
            {!isReconcile && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Reason for rejection <span className="text-red-400">*</span></label>
                <textarea
                  className={cn(
                    'w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none',
                    rejectionReason.trim() === '' ? 'border-red-200' : 'border-slate-200'
                  )}
                  rows={3}
                  placeholder="e.g. Transfer reference not found in bank statement / Amount on proof does not match / Proof belongs to a different invoice"
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2.5 pt-1">
              <button onClick={onClose} disabled={saving} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={!canConfirm || saving}
                className={cn(
                  'flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2',
                  canConfirm && !saving
                    ? isReconcile ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                )}
              >
                {saving ? 'Processing…' : isReconcile ? 'Confirm Reconciliation' : 'Reject Payment'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <ProofOfPaymentViewer
        files={payment.proofOfPayment}
        initialIndex={viewerIdx}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </>
  )
}

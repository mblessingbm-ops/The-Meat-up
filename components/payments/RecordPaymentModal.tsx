'use client'
// components/payments/RecordPaymentModal.tsx
// Full two-column payment recording modal per spec Part 3

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, CreditCard, Banknote, Smartphone, Building2, Upload,
  FileText, ImageIcon, Trash2, AlertCircle, Info, CheckCircle2, Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  KINGSPORT_BANK_ACCOUNTS, PAYMENT_METHOD_LABELS, formatFileSize,
  type PaymentMethod, type PaymentRecord, type ProofOfPaymentFile, type KingsportBankAccount
} from '@/types/payments'
import { addNotification } from '@/lib/notifications-store'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InvoiceForPayment {
  id: string
  invoice_number: string
  customer_name: string
  currency: 'USD' | 'ZWG'
  total_amount: number
  issue_date: string
  company?: 'Kingsport' | 'Bralyn' | 'SGA'
  // Payment summary (if any payments already made)
  totalReconciled?: number
  totalPending?: number
}

interface RecordPaymentModalProps {
  invoice: InvoiceForPayment
  userRole: string
  userName: string
  userId: string
  onClose: () => void
  onSuccess?: (payment: Partial<PaymentRecord>) => void
  // Resubmit mode — pre-fill from a rejected payment
  rejectedPayment?: Partial<PaymentRecord>
}

const MAX_FILES = 5
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

const METHOD_ICONS: Record<PaymentMethod, typeof CreditCard> = {
  BankTransfer: Building2,
  Cash: Banknote,
  MobileWallet: Smartphone,
  Credit: CreditCard,
}

function fmtAmt(n: number, currency: 'USD' | 'ZWG') {
  const f = n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return currency === 'ZWG' ? `ZWG ${f}` : `USD ${f}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RecordPaymentModal({
  invoice, userRole, userName, userId, onClose, onSuccess, rejectedPayment
}: RecordPaymentModalProps) {
  const outstandingBalance = invoice.total_amount - (invoice.totalReconciled ?? 0)

  // ── Form state ──
  const [amount, setAmount] = useState(
    rejectedPayment?.amountPaid?.toFixed(2) ?? outstandingBalance.toFixed(2)
  )
  const [paymentDate, setPaymentDate] = useState(
    rejectedPayment?.paymentDate ?? new Date().toISOString().slice(0, 10)
  )
  const [method, setMethod] = useState<PaymentMethod>(
    rejectedPayment?.paymentMethod ?? 'BankTransfer'
  )
  const [bankAccount, setBankAccount] = useState<KingsportBankAccount | ''>(
    (rejectedPayment?.bankAccountReceived as KingsportBankAccount) ?? ''
  )
  const [transferRef, setTransferRef] = useState(rejectedPayment?.transferReference ?? '')
  const [mobileRef, setMobileRef] = useState(rejectedPayment?.mobileReference ?? '')
  const [cashReceipt, setCashReceipt] = useState(rejectedPayment?.cashReceiptNumber ?? '')
  const [notes, setNotes] = useState(rejectedPayment?.notes ?? '')
  const [files, setFiles] = useState<ProofOfPaymentFile[]>([])
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [fileErrors, setFileErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const isAccountant = ['accountant', 'executive'].includes(userRole)
  const amountNum = parseFloat(amount) || 0
  const isFullPayment = amountNum >= outstandingBalance
  const remainder = outstandingBalance - amountNum

  // ── Validation ──
  const amountError = amountNum > outstandingBalance
    ? `Amount exceeds the outstanding balance of ${fmtAmt(outstandingBalance, invoice.currency)}. For overpayments, contact your accountant.`
    : ''

  const today = new Date().toISOString().slice(0, 10)
  const dateError = paymentDate > today
    ? 'Payment date cannot be in the future.'
    : paymentDate < invoice.issue_date
    ? 'Payment date cannot be before the invoice issue date.'
    : ''

  const methodValid = (() => {
    if (method === 'BankTransfer') return bankAccount !== '' && transferRef.trim() !== ''
    if (method === 'MobileWallet') return mobileRef.trim() !== ''
    return true // Cash and Credit have no required extra fields
  })()

  const canSubmit =
    amountNum > 0 &&
    !amountError &&
    paymentDate !== '' &&
    !dateError &&
    methodValid

  // ── File handling ──
  function processFiles(newFiles: File[]) {
    const errors: string[] = []
    const toAdd: ProofOfPaymentFile[] = []

    for (const file of newFiles) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: unsupported file type. Use JPG, PNG, WebP, or PDF.`)
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name} is too large. Maximum size is 10MB.`)
        continue
      }
      if (files.length + toAdd.length >= MAX_FILES) {
        errors.push('Maximum 5 files allowed.')
        break
      }
      toAdd.push({
        id: `pop-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        url: URL.createObjectURL(file), // TODO: Replace with Supabase Storage upload
      })
    }

    setFileErrors(errors)
    if (toAdd.length > 0) setFiles(prev => [...prev, ...toAdd])
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    processFiles(Array.from(e.dataTransfer.files))
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) processFiles(Array.from(e.target.files))
    e.target.value = '' // reset so same file can be re-added
  }

  function removeFile(id: string) {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  // ── Submit ──
  async function handleSubmit() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))

    const company = invoice.company ?? 'Kingsport'
    const payment: Partial<PaymentRecord> = {
      id: `pay-${Date.now()}`,
      invoiceId: invoice.id,
      invoiceNo: invoice.invoice_number,
      company,
      clientName: invoice.customer_name,
      currency: invoice.currency,
      invoiceTotal: invoice.total_amount,
      amountPaid: amountNum,
      outstandingBefore: outstandingBalance,
      outstandingAfter: outstandingBalance,
      paymentDate,
      paymentMethod: method,
      bankAccountReceived: method === 'BankTransfer' ? bankAccount as KingsportBankAccount : undefined,
      transferReference: method === 'BankTransfer' ? transferRef : undefined,
      mobileReference: method === 'MobileWallet' ? mobileRef : undefined,
      cashReceiptNumber: method === 'Cash' ? cashReceipt : undefined,
      notes: notes || undefined,
      proofOfPayment: files,
      recordedBy: userId,
      recordedByName: userName,
      recordedByRole: userRole,
      recordedAt: new Date().toISOString(),
      status: isAccountant ? 'reconciled' : 'pending_reconciliation',
    }

    if (isAccountant) {
      // Fast-track: Record & Reconcile immediately
      payment.reconciledBy = userId
      payment.reconciledByName = userName
      payment.reconciledAt = new Date().toISOString()
      payment.outstandingAfter = Math.max(0, outstandingBalance - amountNum)
    } else {
      // Notify accountant
      const accountant = company === 'SGA' ? 'Nothando Ncube' : 'Ashleigh Kurira'
      addNotification({
        id: `notif-${Date.now()}`,
        type: 'payment_submitted',
        priority: 'high',
        targetRoles: ['accountant', 'executive'],
        message: `💳 Payment recorded — ${userName} has submitted a payment of ${fmtAmt(amountNum, invoice.currency)} from ${invoice.customer_name} (Invoice ${invoice.invoice_number}). Proof of payment ${files.length > 0 ? 'attached' : 'not attached'}. Awaiting your reconciliation.`,
        invoiceId: invoice.id,
        invoiceNo: invoice.invoice_number,
        paymentId: payment.id!,
        createdAt: new Date().toISOString(),
        read: false,
      })

      toast.success(
        `Payment submitted — ${fmtAmt(amountNum, invoice.currency)} from ${invoice.customer_name} is pending reconciliation by your accountant.`
      )
    }

    setSaving(false)
    onSuccess?.(payment)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base">Record Payment</h2>
              <p className="text-xs text-slate-500">{invoice.invoice_number} · {invoice.customer_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Resubmit notice */}
        {rejectedPayment && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <strong>Resubmitting rejected payment.</strong> Previous reason: &ldquo;<em>{rejectedPayment.rejectionReason}</em>&rdquo;. Please correct and resubmit.
            </p>
          </div>
        )}

        {/* Body — two columns */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">

            {/* ── LEFT: Payment Details ── */}
            <div className="p-6 space-y-5">
              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Amount Received</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {invoice.currency}
                  </span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    className={cn(
                      'w-full pl-16 pr-4 py-2.5 border rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500',
                      amountError ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    )}
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                {amountError && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{amountError}
                  </p>
                )}
                {!amountError && amountNum > 0 && (
                  <div className={cn('mt-1.5 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
                    isFullPayment ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  )}>
                    {isFullPayment ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {isFullPayment
                      ? 'Full payment'
                      : `Partial payment — ${fmtAmt(remainder, invoice.currency)} will remain outstanding`
                    }
                  </div>
                )}
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-0.5">Date client paid</label>
                <p className="text-[10px] text-slate-400 mb-1.5">Use the actual payment date, not today if different</p>
                <input
                  type="date"
                  className={cn(
                    'w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500',
                    dateError ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  )}
                  value={paymentDate}
                  max={today}
                  min={invoice.issue_date}
                  onChange={e => setPaymentDate(e.target.value)}
                />
                {dateError && <p className="mt-1 text-xs text-red-600">{dateError}</p>}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Payment Method</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['BankTransfer', 'Cash', 'MobileWallet', 'Credit'] as PaymentMethod[]).map(m => {
                    const Icon = METHOD_ICONS[m]
                    return (
                      <button
                        key={m}
                        onClick={() => setMethod(m)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left',
                          method === m
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        )}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {PAYMENT_METHOD_LABELS[m]}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Conditional method fields */}
              {method === 'BankTransfer' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Paid into <span className="text-red-400">*</span></label>
                    <select
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      value={bankAccount}
                      onChange={e => setBankAccount(e.target.value as KingsportBankAccount)}
                    >
                      <option value="">Select bank account…</option>
                      {KINGSPORT_BANK_ACCOUNTS.map(acc => (
                        <option key={acc} value={acc}>{acc}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Transfer Reference / RTGS Ref <span className="text-red-400">*</span></label>
                    <input
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. ZB20250312001"
                      value={transferRef}
                      onChange={e => setTransferRef(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {method === 'Cash' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Receipt Number <span className="text-slate-300">(optional)</span></label>
                  <input
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Optional — cash receipt number if issued"
                    value={cashReceipt}
                    onChange={e => setCashReceipt(e.target.value)}
                  />
                </div>
              )}

              {method === 'MobileWallet' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Transaction Reference <span className="text-red-400">*</span></label>
                  <input
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. EC20250315-8821"
                    value={mobileRef}
                    onChange={e => setMobileRef(e.target.value)}
                  />
                </div>
              )}

              {method === 'Credit' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                  This amount will be applied as a credit against <strong>{invoice.customer_name}</strong>&apos;s account balance. The accountant will confirm during reconciliation.
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes <span className="text-slate-300">(optional)</span></label>
                <textarea
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  rows={3}
                  maxLength={500}
                  placeholder="Any additional notes — e.g. partial payment per arrangement, client promised balance by [date]..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
                <p className="text-[10px] text-slate-300 text-right mt-0.5">{notes.length}/500</p>
              </div>
            </div>

            {/* ── RIGHT: Proof of Payment ── */}
            <div className="p-6 space-y-4 flex flex-col">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-3">Proof of Payment</label>

                {/* Drop zone */}
                <div
                  className={cn(
                    'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
                    dragOver ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  )}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600">Attach proof of payment</p>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG or PDF · Max 10MB per file · Up to 5 files</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES.join(',')}
                  multiple
                  className="hidden"
                  onChange={handleFileInput}
                />

                {/* Mobile camera button */}
                <button
                  className="mt-2 w-full py-2 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 md:hidden"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  📷 Take Photo
                </button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>

              {/* File errors */}
              {fileErrors.map((err, i) => (
                <p key={i} className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />{err}
                </p>
              ))}

              {/* Uploaded files */}
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map(file => (
                    <div key={file.id} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
                      {file.fileType.startsWith('image/') ? (
                        <img
                          src={file.url}
                          alt={file.fileName}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-red-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{file.fileName}</p>
                        <p className="text-xs text-slate-400">{formatFileSize(file.fileSize)}</p>
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Info banner for reps/data_capture */}
              {['sales_rep', 'data_capture'].includes(userRole) && (
                <div className="mt-auto p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2 text-xs text-blue-700">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  Proof of payment is strongly recommended. Your accountant will verify this before reconciling.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Invoice context */}
          <p className="text-xs text-slate-400">
            Invoice <span className="font-semibold text-slate-600">{invoice.invoice_number}</span>
            {' · '}{invoice.customer_name}
            {' · '}{invoice.currency} {invoice.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            {' · '}Outstanding: <span className="font-semibold text-slate-700">{fmtAmt(outstandingBalance, invoice.currency)}</span>
          </p>

          {/* Actions */}
          <div className="flex gap-2.5 flex-shrink-0">
            <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || saving}
              className={cn(
                'px-5 py-2 rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2',
                canSubmit && !saving
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-sm'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              )}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 animate-spin" />Saving…
                </span>
              ) : isAccountant ? 'Record & Reconcile' : 'Submit Payment'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

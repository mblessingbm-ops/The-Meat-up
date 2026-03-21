'use client'
// components/invoices/FiscalisationModal.tsx
// Two-panel modal for accountants to validate and submit invoices to ZIMRA

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, ShieldCheck, AlertTriangle, CheckCircle, XCircle,
  Loader2, ExternalLink, RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  validateForFiscalisation,
  getZimraErrorMessage,
  type InvoiceForValidation,
} from '@/lib/zimra/pre-submission-validator'
import { formatVerificationCode } from '@/lib/invoices/calculate-vat'
import toast from 'react-hot-toast'

interface InvoiceForFiscalisation {
  id: string
  invoiceNumber: string
  clientName: string
  clientTIN?: string
  clientVATNumber?: string
  repName: string
  currency: 'USD' | 'ZWG'
  totalAmount: number
  vatAmount: number
  issueDate: string
  lineItems: Array<{
    description: string
    hsCode?: string
    taxID?: number
    taxPercent?: number
    quantity: number
    unitPrice: number
    lineTotal: number
  }>
}

interface FiscalisationModalProps {
  invoice: InvoiceForFiscalisation
  onClose: () => void
  onSuccess: (result: {
    zimraReceiptID: number
    zimraFiscalDayNo: number
    zimraReceiptGlobalNo: number
    zimraReceiptCounter: number
    zimraVerificationCode: string
    zimraQrCodeUrl: string
    zimraSubmissionDate: string
  }) => void
}

export function FiscalisationModal({ invoice, onClose, onSuccess }: FiscalisationModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validationInput: InvoiceForValidation = {
    invoiceNo: invoice.invoiceNumber,
    clientName: invoice.clientName,
    clientTIN: invoice.clientTIN,
    clientVATNumber: invoice.clientVATNumber,
    invoiceType: 'fiscal',
    currency: invoice.currency,
    totalAmount: invoice.totalAmount,
    lineItems: invoice.lineItems,
  }

  const validation = validateForFiscalisation(validationInput)
  const canSubmit = validation.valid && !submitting

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/zimra/receipt/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice: {
            invoiceNo: invoice.invoiceNumber,
            currency: invoice.currency,
            totalAmount: invoice.totalAmount,
            lineItems: invoice.lineItems,
            buyerTIN: invoice.clientTIN,
            buyerName: invoice.clientName,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        const errMsg = getZimraErrorMessage(data.errorCode ?? '')
        setSubmitError(errMsg)
        toast.error(`ZIMRA submission failed: ${errMsg}`)
        return
      }

      toast.success(`Invoice ${invoice.invoiceNumber} fiscalised — Receipt No. ${data.receiptGlobalNo}`)

      onSuccess({
        zimraReceiptID: data.receiptID,
        zimraFiscalDayNo: data.fiscalDayNo,
        zimraReceiptGlobalNo: data.receiptGlobalNo,
        zimraReceiptCounter: data.receiptCounter,
        zimraVerificationCode: data.verificationCode ?? '',
        zimraQrCodeUrl: data.qrCodeUrl ?? '',
        zimraSubmissionDate: data.serverDate ?? new Date().toISOString(),
      })
    } catch {
      const msg = 'Unable to reach ZIMRA. Check your connection and try again.'
      setSubmitError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={() => !submitting && onClose()}
      >
        <motion.div
          className="bg-[var(--bg-surface)] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '90vh' }}
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[var(--border-default)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  Fiscalise Invoice
                </h2>
                <p style={{ fontFamily: 'var(--font-primary)', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>
                  {invoice.invoiceNumber} · {invoice.clientName}
                </p>
              </div>
            </div>
            {!submitting && (
              <button onClick={onClose} className="btn-icon rounded-lg">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Two-panel body */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-[1fr_200px] divide-x divide-[var(--border-subtle)]">

              {/* Left — validation panel */}
              <div className="p-5 space-y-4">
                <h3 style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-tertiary)',
                }}>
                  Pre-Submission Check
                </h3>

                {/* Validation items */}
                <div className="space-y-2.5">
                  {/* TIN check */}
                  <ValidationRow
                    ok={!!invoice.clientTIN && /^\d{10}$/.test(invoice.clientTIN)}
                    blocking={!invoice.clientTIN}
                    label={invoice.clientTIN
                      ? `Client TIN on file: ${invoice.clientTIN}`
                      : `Client TIN missing for ${invoice.clientName}`
                    }
                  />

                  {/* HS codes */}
                  <ValidationRow
                    ok={invoice.lineItems.every(l => !!l.hsCode)}
                    blocking={invoice.lineItems.some(l => !l.hsCode)}
                    label={invoice.lineItems.every(l => !!l.hsCode)
                      ? 'All HS codes complete'
                      : `${invoice.lineItems.filter(l => !l.hsCode).length} line item(s) missing HS codes`
                    }
                  />

                  {/* Tax IDs */}
                  <ValidationRow
                    ok={invoice.lineItems.every(l => !!l.taxID)}
                    blocking={invoice.lineItems.some(l => !l.taxID)}
                    label={invoice.lineItems.every(l => !!l.taxID)
                      ? `VAT rate: 15.5% (Tax ID: ${invoice.lineItems[0]?.taxID ?? '—'})`
                      : 'Tax IDs missing — run device config sync'
                    }
                  />

                  {/* ZIMRA day status (mock — always open in dev) */}
                  <ValidationRow ok label="ZIMRA fiscal day: OPEN" />

                  {/* Warnings */}
                  {validation.warnings.map((w, i) => (
                    <ValidationRow key={i} warning label={w.message} />
                  ))}
                </div>

                {/* Overall status */}
                <div className={cn(
                  'mt-4 p-3 rounded-xl border text-sm',
                  validation.valid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                )}>
                  {validation.valid ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 600 }}>
                        Ready to submit to ZIMRA
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <p style={{ fontFamily: 'var(--font-primary)', fontWeight: 700 }}>
                          Cannot submit until errors are resolved
                        </p>
                        {validation.errors.filter(e => e.blocking).map((e, i) => (
                          <p key={i} style={{ fontFamily: 'var(--font-primary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            {e.message}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit error (network / ZIMRA error) */}
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start gap-2 text-red-700">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <p style={{ fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: '0.8125rem' }}>
                          ZIMRA Submission Failed
                        </p>
                        <p style={{ fontFamily: 'var(--font-primary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          {submitError}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right — invoice summary */}
              <div className="p-5 space-y-3 bg-[var(--bg-subtle)]">
                <h3 style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-tertiary)',
                }}>
                  Invoice Summary
                </h3>
                <SummaryRow label="Invoice No." value={invoice.invoiceNumber} mono />
                <SummaryRow label="Client" value={invoice.clientName} />
                <SummaryRow label="Sent by" value={invoice.repName} />
                <SummaryRow label="Currency" value={invoice.currency} mono />
                <div className="h-px bg-[var(--border-subtle)] my-2" />
                <SummaryRow
                  label="Amount"
                  value={`${invoice.currency} ${(invoice.totalAmount - invoice.vatAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  mono
                />
                <SummaryRow
                  label="VAT @ 15.5%"
                  value={`${invoice.currency} ${invoice.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  mono
                />
                <SummaryRow
                  label="Total"
                  value={`${invoice.currency} ${invoice.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  mono
                  bold
                />
                <div className="h-px bg-[var(--border-subtle)] my-2" />
                <p style={{ fontFamily: 'var(--font-primary)', fontSize: '0.6875rem', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                  Submit to:
                </p>
                <a
                  href="https://fdmsapitest.zimra.co.zw/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                  style={{ fontFamily: 'var(--font-primary)', fontSize: '0.6875rem' }}
                >
                  ZIMRA FDMS (test)
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-5 border-t border-[var(--border-default)] bg-[var(--bg-subtle)]">
            <button onClick={onClose} disabled={submitting} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all',
                canSubmit
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              )}
              style={{ fontFamily: 'var(--font-primary)' }}
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Submitting to ZIMRA…</>
              ) : submitError ? (
                <><RefreshCw className="w-4 h-4" />Retry Submission</>
              ) : (
                <><ShieldCheck className="w-4 h-4" />Submit to ZIMRA</>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function ValidationRow({
  ok,
  blocking,
  warning,
  label,
}: {
  ok?: boolean
  blocking?: boolean
  warning?: boolean
  label: string
}) {
  if (warning) {
    return (
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
        <span style={{ fontFamily: 'var(--font-primary)', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {label}
        </span>
      </div>
    )
  }
  return (
    <div className="flex items-start gap-2.5">
      {ok ? (
        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle className={cn('w-3.5 h-3.5 flex-shrink-0 mt-0.5', blocking ? 'text-red-500' : 'text-amber-500')} />
      )}
      <span style={{
        fontFamily: 'var(--font-primary)',
        fontSize: '0.8125rem',
        color: !ok && blocking ? '#991B1B' : 'var(--text-secondary)',
        lineHeight: 1.4,
        fontWeight: !ok && blocking ? 600 : undefined,
      }}>
        {label}
      </span>
    </div>
  )
}

function SummaryRow({ label, value, mono, bold }: { label: string; value: string; mono?: boolean; bold?: boolean }) {
  return (
    <div>
      <p style={{ fontFamily: 'var(--font-primary)', fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{label}</p>
      <p style={{
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-primary)',
        fontSize: '0.8125rem',
        color: 'var(--text-primary)',
        fontWeight: bold ? 700 : 500,
        marginTop: '0.125rem',
      }}>
        {value}
      </p>
    </div>
  )
}

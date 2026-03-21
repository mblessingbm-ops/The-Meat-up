'use client'
// components/payments/PaymentProgressBar.tsx
// Thin progress indicator shown on partially_paid invoice cards and detail views

import { cn } from '@/lib/utils'

interface PaymentProgressBarProps {
  currency: 'USD' | 'ZWG'
  invoiceTotal: number
  totalReconciled: number
  totalPending: number
  compact?: boolean  // When true, omits text labels (for tight card layouts)
}

function fmtAmt(n: number, currency: 'USD' | 'ZWG') {
  const formatted = n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return currency === 'ZWG' ? `ZWG ${formatted}` : `USD ${formatted}`
}

export default function PaymentProgressBar({
  currency, invoiceTotal, totalReconciled, totalPending, compact = false
}: PaymentProgressBarProps) {
  const pct = invoiceTotal > 0 ? Math.min((totalReconciled / invoiceTotal) * 100, 100) : 0
  const outstanding = invoiceTotal - totalReconciled

  return (
    <div className="w-full">
      {/* 4px progress bar */}
      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {!compact && (
        <div className="mt-1 space-y-0.5">
          <p className="text-[10px] text-slate-500">
            <span className="text-emerald-600 font-semibold">{fmtAmt(totalReconciled, currency)}</span>
            {' '}of {fmtAmt(invoiceTotal, currency)} paid
            {' · '}
            <span className="font-semibold text-slate-700">{fmtAmt(outstanding, currency)} outstanding</span>
          </p>
          {totalPending > 0 && (
            <p className="text-[10px] text-amber-600 font-medium">
              {fmtAmt(totalPending, currency)} pending verification
            </p>
          )}
        </div>
      )}
    </div>
  )
}

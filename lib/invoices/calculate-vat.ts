// lib/invoices/calculate-vat.ts
// VAT calculation utilities for fiscal and non-fiscal invoices

import type { InvoiceType } from '@/types/invoices'

export interface LineItemVAT {
  lineTotal: number     // Unit price × quantity
  vatRate: number       // 15.5 for fiscal, 0 for zero_rated/internal
  vatAmount: number     // VAT component (inclusive or exclusive)
  netAmount: number     // Net before VAT
  grossAmount: number   // Total including VAT
}

export interface InvoiceTotals {
  subtotal: number      // Net of all lines (excl. VAT)
  totalVAT: number      // Sum of all VAT amounts
  grandTotal: number    // Grand total (incl. VAT)
  vatRate: number       // VAT rate applied
  currency: 'USD' | 'ZWG'
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Calculate VAT for a single line item.
 * @param taxInclusive - If true, VAT is embedded in unitPrice (prices include VAT).
 *                       If false, VAT is added on top.
 * Kingsport default: tax-inclusive pricing
 */
export function calculateLineVAT(
  unitPrice: number,
  quantity: number,
  invoiceType: InvoiceType,
  taxInclusive: boolean = true
): LineItemVAT {
  const vatRate = invoiceType === 'fiscal' ? 15.5 : 0
  const lineTotal = round2(unitPrice * quantity)

  if (vatRate === 0) {
    return {
      lineTotal,
      vatRate: 0,
      vatAmount: 0,
      netAmount: lineTotal,
      grossAmount: lineTotal,
    }
  }

  if (taxInclusive) {
    // Tax-inclusive: VAT is embedded in the price
    // VAT = Total × Rate / (100 + Rate)
    const vatAmount = lineTotal * vatRate / (100 + vatRate)
    return {
      lineTotal,
      vatRate,
      vatAmount: round2(vatAmount),
      netAmount: round2(lineTotal - vatAmount),
      grossAmount: lineTotal,     // Already inclusive
    }
  } else {
    // Tax-exclusive: VAT added on top
    const vatAmount = lineTotal * vatRate / 100
    return {
      lineTotal,
      vatRate,
      vatAmount: round2(vatAmount),
      netAmount: lineTotal,
      grossAmount: round2(lineTotal + vatAmount),
    }
  }
}

/**
 * Calculate invoice totals from an array of line items.
 */
export function calculateInvoiceTotals(
  lines: Array<{ unitPrice: number; quantity: number }>,
  invoiceType: InvoiceType,
  currency: 'USD' | 'ZWG' = 'USD',
  taxInclusive: boolean = true
): InvoiceTotals {
  const vatRate = invoiceType === 'fiscal' ? 15.5 : 0

  const lineVATs = lines.map(l => calculateLineVAT(l.unitPrice, l.quantity, invoiceType, taxInclusive))

  const subtotal = round2(lineVATs.reduce((s, l) => s + l.netAmount, 0))
  const totalVAT = round2(lineVATs.reduce((s, l) => s + l.vatAmount, 0))
  const grandTotal = round2(lineVATs.reduce((s, l) => s + l.grossAmount, 0))

  return { subtotal, totalVAT, grandTotal, vatRate, currency }
}

/**
 * Format a verification code in XXXX-XXXX-XXXX-XXXX pattern.
 */
export function formatVerificationCode(code: string): string {
  const clean = code.replace(/-/g, '').toUpperCase()
  const parts = [clean.slice(0, 4), clean.slice(4, 8), clean.slice(8, 12), clean.slice(12, 16)]
  return parts.filter(Boolean).join('-')
}

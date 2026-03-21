// types/invoices.ts
// Invoice types, fiscal status, and VAT classification for the Kingsport fiscal invoice system

export type InvoiceType =
  | 'fiscal'        // Standard — submitted to ZIMRA with 15.5% VAT
  | 'zero_rated'    // Foreign/international customer — not submitted to ZIMRA
  | 'internal'      // Inter-company (Kingsport ↔ Bralyn ↔ SGA) — not submitted to ZIMRA

export type FiscalStatus =
  | 'not_required'          // Invoice type is zero_rated or internal
  | 'pending_fiscalisation' // Rep has sent invoice, awaiting accountant action
  | 'fiscalising'           // Submission in progress
  | 'fiscalised'            // Successfully submitted to ZIMRA
  | 'fiscalisation_failed'  // ZIMRA rejected — error recorded
  | 'credit_note_raised'    // A credit note has been raised against this invoice

export type CustomerVATStatus =
  | 'vat_registered'  // Domestic customer — standard 15.5% VAT
  | 'zero_rated'      // Foreign/international — zero-rated
  | 'internal'        // Another Kingsport group entity

export interface InvoiceLineItem {
  id: string
  description: string
  hsCode?: string         // 8-digit HS code — required for fiscal invoices
  quantity: number
  unitPrice: number
  lineTotal: number
  taxID?: number          // ZIMRA tax ID (1 = standard, 2 = zero-rated)
  taxPercent?: number     // 15.5 for fiscal, 0 for zero_rated/internal
  taxCode?: string        // 'A' for standard, 'B' for zero-rated
  vatAmount?: number
  netAmount?: number
}

export interface FiscalInvoiceData {
  invoiceType: InvoiceType
  fiscalStatus: FiscalStatus
  // ZIMRA fields — populated after successful fiscalisation
  zimraReceiptID?: number
  zimraFiscalDayNo?: number
  zimraReceiptGlobalNo?: number
  zimraReceiptCounter?: number
  zimraVerificationCode?: string
  zimraQrCodeUrl?: string
  zimraSubmissionDate?: string
  zimraServerSignature?: string
  zimraErrorCode?: string
  zimraErrorMessage?: string
}

// Fiscal status badge config
export const FISCAL_STATUS_BADGE: Record<FiscalStatus, { label: string; colour: string; textColour: string }> = {
  pending_fiscalisation: { label: 'Pending Fiscal',  colour: '#FEF3C7', textColour: '#92400E' },
  fiscalising:           { label: 'Submitting…',     colour: '#DBEAFE', textColour: '#1E40AF' },
  fiscalised:            { label: 'Fiscalised ✓',    colour: '#D1FAE5', textColour: '#065F46' },
  fiscalisation_failed:  { label: 'Failed ⚠',        colour: '#FEE2E2', textColour: '#991B1B' },
  not_required:          { label: 'Not Required',    colour: '#F1F5F9', textColour: '#475569' },
  credit_note_raised:    { label: 'Credit Raised',   colour: '#F3E8FF', textColour: '#6B21A8' },
}

export function getInvoiceTypeLabel(invoiceType: InvoiceType): string {
  return {
    fiscal:     'FISCAL TAX INVOICE',
    zero_rated: 'TAX INVOICE — ZERO RATED',
    internal:   'INTERNAL TAX INVOICE',
  }[invoiceType]
}

export function getVATRate(invoiceType: InvoiceType): number {
  return invoiceType === 'fiscal' ? 15.5 : 0
}

export function requiresZIMRASubmission(invoiceType: InvoiceType): boolean {
  return invoiceType === 'fiscal'
}

export function determineInvoiceTypeFromVAT(vatStatus: CustomerVATStatus): InvoiceType {
  if (vatStatus === 'internal') return 'internal'
  if (vatStatus === 'zero_rated') return 'zero_rated'
  return 'fiscal'
}

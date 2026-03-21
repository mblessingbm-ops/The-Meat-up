// lib/zimra/pre-submission-validator.ts
// Validates an invoice before submitting to ZIMRA — runs in the fiscalisation modal

export interface ValidationError {
  field: string
  message: string
  blocking: boolean // true = cannot fiscalise until resolved
  actionLabel?: string
  actionHref?: string
}

export interface ValidationWarning {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean      // True if no blocking errors
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface InvoiceForValidation {
  invoiceNo: string
  clientName: string
  clientTIN?: string
  clientVATNumber?: string
  invoiceType: 'fiscal' | 'zero_rated' | 'internal'
  currency: 'USD' | 'ZWG'
  totalAmount: number
  lineItems: Array<{
    description: string
    hsCode?: string
    taxID?: number
    taxPercent?: number
  }>
}

export function validateForFiscalisation(invoice: InvoiceForValidation): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // ── Blocking errors ──────────────────────────────────────────────────────────

  // 1. Client TIN required
  if (!invoice.clientTIN || invoice.clientTIN.trim() === '') {
    errors.push({
      field: 'client.tinNumber',
      message: `Client TIN number is missing for ${invoice.clientName}. Add TIN to client profile before fiscalising.`,
      blocking: true,
      actionLabel: 'Go to Client Profile',
    })
  } else if (!/^\d{10}$/.test(invoice.clientTIN.trim())) {
    errors.push({
      field: 'client.tinNumber',
      message: `TIN "${invoice.clientTIN}" is invalid — must be exactly 10 digits.`,
      blocking: true,
    })
  }

  // 2. HS codes required on all fiscal invoice line items
  const missingHS = invoice.lineItems.filter(li => !li.hsCode || li.hsCode.trim() === '')
  if (missingHS.length > 0) {
    errors.push({
      field: 'lineItems.hsCode',
      message: `${missingHS.length} line item${missingHS.length > 1 ? 's are' : ' is'} missing HS ${missingHS.length > 1 ? 'codes' : 'code'}: ${missingHS.map(li => `"${li.description}"`).join(', ')}.`,
      blocking: true,
    })
  }

  // 3. Tax IDs required
  const missingTaxID = invoice.lineItems.filter(li => !li.taxID)
  if (missingTaxID.length > 0) {
    errors.push({
      field: 'lineItems.taxID',
      message: `${missingTaxID.length} line item${missingTaxID.length > 1 ? 's are' : ' is'} missing ZIMRA tax IDs. Run device config sync to refresh tax rates.`,
      blocking: true,
    })
  }

  // 4. Amount must be positive
  if (invoice.totalAmount <= 0) {
    errors.push({
      field: 'totalAmount',
      message: 'Invoice total must be greater than zero.',
      blocking: true,
    })
  }

  // ── Non-blocking warnings ────────────────────────────────────────────────────

  // Client VAT number not on file
  if (!invoice.clientVATNumber || invoice.clientVATNumber.trim() === '') {
    warnings.push({
      field: 'client.vatNumber',
      message: 'Client VAT number not recorded — invoice will be submitted without buyer VAT number.',
    })
  }

  return {
    valid: errors.filter(e => e.blocking).length === 0,
    errors,
    warnings,
  }
}

// ZIMRA error code → human readable message
export const ZIMRA_ERROR_MESSAGES: Record<string, string> = {
  RCPT001: 'Invalid receipt format. Check all required fields are populated.',
  RCPT002: 'Receipt counter sequence error. The counter must be sequential.',
  RCPT003: 'Invalid fiscal day number. The fiscal day may not be open.',
  RCPT004: 'Currency not supported. Only USD and ZWG are accepted.',
  RCPT005: 'Tax rate mismatch. The tax ID and tax percent do not match ZIMRA records.',
  RCPT006: 'Buyer TIN is invalid or not registered with ZIMRA.',
  RCPT007: 'HS code not found in ZIMRA tariff schedule.',
  RCPT008: 'Receipt total does not match sum of line items.',
  RCPT009: 'Device is not registered or certificate has expired.',
  RCPT010: 'Fiscal day is closed. Open a new fiscal day before submitting.',
  RCPT011: 'Invalid signature. Device certificate may be corrupted.',
  RCPT012: 'Submission rate limit exceeded. Try again in 30 seconds.',
  RCPT013: 'This invoice number already exists in ZIMRA. Use a unique invoice number.',
  RCPT014: 'Credit note reference receipt ID not found.',
  RCPT015: 'Credit note amount exceeds original receipt amount.',
}

export function getZimraErrorMessage(errorCode: string): string {
  return ZIMRA_ERROR_MESSAGES[errorCode] ?? `ZIMRA error: ${errorCode}. Contact system support if this persists.`
}

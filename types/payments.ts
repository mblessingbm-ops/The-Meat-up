// types/payments.ts

export type PaymentMethod = 'BankTransfer' | 'Cash' | 'MobileWallet' | 'Credit'

export type PaymentStatus =
  | 'pending_reconciliation'   // Submitted by rep, awaiting accountant action
  | 'reconciled'               // Confirmed by accountant, balance updated
  | 'rejected'                 // Rejected by accountant, rep must resubmit

export type KingsportBankAccount =
  | 'Stanbic Bank — FCA Nostro — 9140001219757'
  | 'CBZ Bank — Corporate — 01124052670014'
  | 'First Capital Bank — 21573058690'
  | 'FBC Bank — 2270000290265'

export const KINGSPORT_BANK_ACCOUNTS: KingsportBankAccount[] = [
  'Stanbic Bank — FCA Nostro — 9140001219757',
  'CBZ Bank — Corporate — 01124052670014',
  'First Capital Bank — 21573058690',
  'FBC Bank — 2270000290265',
]

export interface ProofOfPaymentFile {
  id: string
  fileName: string
  fileType: string        // MIME type: image/jpeg | image/png | image/webp | application/pdf
  fileSize: number        // bytes
  uploadedAt: string      // ISO datetime
  url: string             // Supabase Storage URL when live; object URL / base64 for mock
}

export interface PaymentRecord {
  id: string
  invoiceId: string
  invoiceNo: string             // Denormalised for display
  company: 'Kingsport' | 'Bralyn' | 'SGA'
  clientName: string
  currency: 'USD' | 'ZWG'
  invoiceTotal: number
  amountPaid: number
  outstandingBefore: number
  outstandingAfter: number      // Meaningful only once reconciled
  paymentDate: string           // ISO date — when client actually paid
  paymentMethod: PaymentMethod

  // Bank Transfer only
  bankAccountReceived?: KingsportBankAccount
  transferReference?: string

  // EcoCash / Mobile only
  mobileReference?: string

  // Cash only
  cashReceiptNumber?: string

  // All methods
  notes?: string
  proofOfPayment: ProofOfPaymentFile[]

  // Audit trail
  recordedBy: string
  recordedByName: string
  recordedByRole: string
  recordedAt: string

  // Reconciliation
  status: PaymentStatus
  reconciledBy?: string
  reconciledByName?: string
  reconciledAt?: string
  reconciliationNotes?: string

  // Rejection
  rejectedBy?: string
  rejectedByName?: string
  rejectedAt?: string
  rejectionReason?: string
}

// Updated invoice status values
export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'partially_paid'           // One or more reconciled payments, balance remaining
  | 'pending_reconciliation'   // Full payment submitted by rep, awaiting accountant
  | 'paid'                     // Fully reconciled, zero balance
  | 'overdue'                  // Past due date, unpaid or partially paid
  | 'cancelled'

// Attached to every invoice object
export interface InvoicePaymentSummary {
  invoiceTotal: number
  totalReconciled: number   // Sum of reconciled payments only
  totalPending: number      // Sum of pending (unreconciled) payments
  outstandingBalance: number // invoiceTotal - totalReconciled only (pending never deducts)
  paymentHistory: PaymentRecord[]
}

// Helper: format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Helper: accountant routing by company
export function getAccountantForCompany(company: 'Kingsport' | 'Bralyn' | 'SGA'): string {
  // TODO: Replace with configurable accountant assignment when Supabase is live
  return company === 'SGA' ? 'Nothando Ncube' : 'Ashleigh Kurira'
}

// Payment method display labels and icons reference
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  BankTransfer: 'Bank Transfer',
  Cash: 'Cash',
  MobileWallet: 'EcoCash / Mobile',
  Credit: 'Credit',
}

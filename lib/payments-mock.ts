// lib/payments-mock.ts
// Mock payment records — seed data for development
// TODO: Replace with Supabase read when DB is live

import type { PaymentRecord, InvoicePaymentSummary } from '@/types/payments'

// ─── Reconciled Payments ───────────────────────────────────────────────────────

export const MOCK_PAYMENTS: PaymentRecord[] = [
  // Payment 1 — Full payment, reconciled (UNDP)
  {
    id: 'pay-001',
    invoiceId: 'inv-042',
    invoiceNo: 'KIN-2025-0042',
    company: 'Kingsport',
    clientName: 'UNDP',
    currency: 'USD',
    invoiceTotal: 15000,
    amountPaid: 15000,
    outstandingBefore: 15000,
    outstandingAfter: 0,
    paymentDate: '2026-03-10',
    paymentMethod: 'BankTransfer',
    bankAccountReceived: 'Stanbic Bank — FCA Nostro — 9140001219757',
    transferReference: 'ZB20260310001',
    proofOfPayment: [],
    recordedBy: 'thandeka-madeya',
    recordedByName: 'Thandeka Madeya',
    recordedByRole: 'sales_rep',
    recordedAt: '2026-03-10T09:15:00',
    status: 'reconciled',
    reconciledBy: 'ashleigh-kurira',
    reconciledByName: 'Ashleigh Kurira',
    reconciledAt: '2026-03-10T11:30:00',
    reconciliationNotes: 'Verified against Stanbic statement 10 March 2026',
  },

  // Payment 2 — Full payment, reconciled (CBZ Bank client)
  {
    id: 'pay-002',
    invoiceId: 'inv-038',
    invoiceNo: 'KIN-2025-0038',
    company: 'Kingsport',
    clientName: 'CBZ Bank',
    currency: 'USD',
    invoiceTotal: 8500,
    amountPaid: 8500,
    outstandingBefore: 8500,
    outstandingAfter: 0,
    paymentDate: '2026-03-08',
    paymentMethod: 'BankTransfer',
    bankAccountReceived: 'CBZ Bank — Corporate — 01124052670014',
    transferReference: 'CBZ20260308-4421',
    proofOfPayment: [],
    recordedBy: 'lucia-chiwanza',
    recordedByName: 'Lucia Chiwanza',
    recordedByRole: 'sales_manager',
    recordedAt: '2026-03-08T10:30:00',
    status: 'reconciled',
    reconciledBy: 'nothando-ncube',
    reconciledByName: 'Nothando Ncube',
    reconciledAt: '2026-03-08T14:00:00',
  },

  // ─── BAT Zimbabwe — 3 payments (USD 12,000 invoice) ─────────────────────────
  // Invoice KIN-2025-0044 | Total: USD 12,000

  // Payment A — reconciled (USD 5,000)
  {
    id: 'pay-003',
    invoiceId: 'inv-044',
    invoiceNo: 'KIN-2025-0044',
    company: 'Kingsport',
    clientName: 'BAT Zimbabwe',
    currency: 'USD',
    invoiceTotal: 12000,
    amountPaid: 5000,
    outstandingBefore: 12000,
    outstandingAfter: 7000,
    paymentDate: '2026-03-01',
    paymentMethod: 'BankTransfer',
    bankAccountReceived: 'Stanbic Bank — FCA Nostro — 9140001219757',
    transferReference: 'ZB20260301007',
    proofOfPayment: [],
    recordedBy: 'thandeka-madeya',
    recordedByName: 'Thandeka Madeya',
    recordedByRole: 'sales_rep',
    recordedAt: '2026-03-01T14:20:00',
    status: 'reconciled',
    reconciledBy: 'ashleigh-kurira',
    reconciledByName: 'Ashleigh Kurira',
    reconciledAt: '2026-03-02T09:00:00',
  },

  // Payment B — reconciled (USD 4,000)
  {
    id: 'pay-004',
    invoiceId: 'inv-044',
    invoiceNo: 'KIN-2025-0044',
    company: 'Kingsport',
    clientName: 'BAT Zimbabwe',
    currency: 'USD',
    invoiceTotal: 12000,
    amountPaid: 4000,
    outstandingBefore: 7000,
    outstandingAfter: 3000,
    paymentDate: '2026-03-10',
    paymentMethod: 'BankTransfer',
    bankAccountReceived: 'Stanbic Bank — FCA Nostro — 9140001219757',
    transferReference: 'ZB20260310015',
    proofOfPayment: [],
    recordedBy: 'thandeka-madeya',
    recordedByName: 'Thandeka Madeya',
    recordedByRole: 'sales_rep',
    recordedAt: '2026-03-10T16:10:00',
    status: 'reconciled',
    reconciledBy: 'ashleigh-kurira',
    reconciledByName: 'Ashleigh Kurira',
    reconciledAt: '2026-03-11T08:45:00',
  },
  // Invoice state after Payment B: status=partially_paid | outstandingBalance=3000 | totalReconciled=9000

  // ─── Pending Reconciliation ────────────────────────────────────────────────

  // Pending 1 — Full payment, with proof (Natpharm)
  {
    id: 'pay-005',
    invoiceId: 'inv-055',
    invoiceNo: 'KIN-2025-0055',
    company: 'Kingsport',
    clientName: 'Natpharm',
    currency: 'USD',
    invoiceTotal: 6750,
    amountPaid: 6750,
    outstandingBefore: 6750,
    outstandingAfter: 6750,
    paymentDate: '2026-03-15',
    paymentMethod: 'BankTransfer',
    bankAccountReceived: 'CBZ Bank — Corporate — 01124052670014',
    transferReference: 'ZB20260315004',
    proofOfPayment: [
      {
        id: 'pop-001',
        fileName: 'natpharm_remittance_march.pdf',
        fileType: 'application/pdf',
        fileSize: 245000,
        uploadedAt: '2026-03-15T08:45:00',
        url: '',
      },
    ],
    recordedBy: 'thandeka-madeya',
    recordedByName: 'Thandeka Madeya',
    recordedByRole: 'sales_rep',
    recordedAt: '2026-03-15T08:45:00',
    status: 'pending_reconciliation',
  },

  // Pending 2 — Partial payment, no proof (ZINARA)
  {
    id: 'pay-006',
    invoiceId: 'inv-049',
    invoiceNo: 'KIN-2025-0049',
    company: 'Kingsport',
    clientName: 'ZINARA',
    currency: 'USD',
    invoiceTotal: 4200,
    amountPaid: 2100,
    outstandingBefore: 4200,
    outstandingAfter: 4200,
    paymentDate: '2026-03-15',
    paymentMethod: 'MobileWallet',
    mobileReference: 'EC20260315-8821',
    proofOfPayment: [],
    recordedBy: 'spiwe-mandizha',
    recordedByName: 'Spiwe Mandizha',
    recordedByRole: 'sales_rep',
    recordedAt: '2026-03-15T11:20:00',
    status: 'pending_reconciliation',
  },

  // ─── Rejected ─────────────────────────────────────────────────────────────

  {
    id: 'pay-007',
    invoiceId: 'inv-037',
    invoiceNo: 'KIN-2025-0037',
    company: 'Kingsport',
    clientName: 'Grain Marketing Board',
    currency: 'USD',
    invoiceTotal: 4500,
    amountPaid: 4500,
    outstandingBefore: 4500,
    outstandingAfter: 4500,
    paymentDate: '2026-03-10',
    paymentMethod: 'BankTransfer',
    bankAccountReceived: 'CBZ Bank — Corporate — 01124052670014',
    transferReference: 'ZB20260310099',
    proofOfPayment: [],
    recordedBy: 'thandeka-madeya',
    recordedByName: 'Thandeka Madeya',
    recordedByRole: 'sales_rep',
    recordedAt: '2026-03-10T15:30:00',
    status: 'rejected',
    rejectedBy: 'ashleigh-kurira',
    rejectedByName: 'Ashleigh Kurira',
    rejectedAt: '2026-03-12T10:00:00',
    rejectionReason: 'Reference number ZB20260310099 not found in CBZ statement for 10 March. Please verify the correct RTGS reference and resubmit with proof of payment attached.',
  },
]

// ─── Invoice Payment Summaries ─────────────────────────────────────────────────

export const MOCK_INVOICE_PAYMENT_SUMMARIES: Record<string, InvoicePaymentSummary> = {
  'inv-042': {
    invoiceTotal: 15000,
    totalReconciled: 15000,
    totalPending: 0,
    outstandingBalance: 0,
    paymentHistory: MOCK_PAYMENTS.filter(p => p.invoiceId === 'inv-042'),
  },
  'inv-038': {
    invoiceTotal: 8500,
    totalReconciled: 8500,
    totalPending: 0,
    outstandingBalance: 0,
    paymentHistory: MOCK_PAYMENTS.filter(p => p.invoiceId === 'inv-038'),
  },
  'inv-044': {
    // BAT Zimbabwe — partially paid
    invoiceTotal: 12000,
    totalReconciled: 9000,
    totalPending: 0,
    outstandingBalance: 3000,
    paymentHistory: MOCK_PAYMENTS.filter(p => p.invoiceId === 'inv-044'),
  },
  'inv-055': {
    // Natpharm — pending full payment
    invoiceTotal: 6750,
    totalReconciled: 0,
    totalPending: 6750,
    outstandingBalance: 6750,
    paymentHistory: MOCK_PAYMENTS.filter(p => p.invoiceId === 'inv-055'),
  },
  'inv-049': {
    // ZINARA — pending partial
    invoiceTotal: 4200,
    totalReconciled: 0,
    totalPending: 2100,
    outstandingBalance: 4200,
    paymentHistory: MOCK_PAYMENTS.filter(p => p.invoiceId === 'inv-049'),
  },
  'inv-037': {
    // Grain Marketing Board — rejected, no reduction
    invoiceTotal: 4500,
    totalReconciled: 0,
    totalPending: 0,
    outstandingBalance: 4500,
    paymentHistory: MOCK_PAYMENTS.filter(p => p.invoiceId === 'inv-037'),
  },
}

// Helper: get payment summary for an invoice (returns defaults if not found)
export function getInvoicePaymentSummary(invoiceId: string): InvoicePaymentSummary {
  return MOCK_INVOICE_PAYMENT_SUMMARIES[invoiceId] ?? {
    invoiceTotal: 0,
    totalReconciled: 0,
    totalPending: 0,
    outstandingBalance: 0,
    paymentHistory: [],
  }
}

// Helper: get all pending payments for the reconciliation queue
export function getPendingPayments(): PaymentRecord[] {
  return MOCK_PAYMENTS.filter(p => p.status === 'pending_reconciliation')
}

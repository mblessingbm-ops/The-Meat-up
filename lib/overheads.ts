/**
 * lib/overheads.ts
 * Overhead costs data — Utilities, Rentals, Other Overheads, and overhead settings
 * Created March 2026
 * UPDATED March 2026: Added SplitRentalStanding + SplitRentalEntry for NHC split-currency rental
 */

export type OverheadStatus = 'draft' | 'posted'
export type UtilityType = 'Electricity' | 'Water' | 'Internet' | 'Telephone' | 'Other'
export type RentalType = 'Premises' | 'Equipment Lease' | 'Vehicle Lease' | 'Storage' | 'Other'
export type Company = 'Kingsport' | 'Bralyn' | 'SGA'

export interface UtilityEntry {
  id: string
  utilityType: UtilityType
  provider: string
  company: Company
  billingPeriod: string   // YYYY-MM
  amount: number
  invoiceReference?: string
  notes?: string
  postedBy: string
  status: OverheadStatus
  createdAt: string
}

export interface RentalEntry {
  id: string
  rentalType: RentalType
  description: string
  lessor: string
  company: Company
  billingPeriod: string
  amount: number
  leaseReference?: string
  nextReviewDate?: string
  notes?: string
  postedBy: string
  status: OverheadStatus
  createdAt: string
}

// ─── Split-Currency Rental Types (NHC pattern) ────────────────────────────────

/**
 * Standing contract record — defines the rental agreement itself, not a monthly entry.
 * One record per contract; monthly payment entries reference standingId.
 */
export interface SplitRentalStanding {
  id: string
  description: string
  lessor: string
  company: Company
  totalContractValueUSD: number   // Total monthly value in USD (e.g. 3400)
  usdComponent: number            // Fixed USD half (e.g. 1700)
  // ZWG component = USD equivalent at prevailing rate — entered manually each month
  paymentFrequency: 'Monthly'
  leaseReference?: string
  notes?: string
  isActive: boolean
  createdAt: string
}

/**
 * Monthly payment entry for a split-currency rental.
 * USD and ZWG amounts are stored as parallel ledger entries — never combined.
 */
export interface SplitRentalEntry {
  id: string
  standingId: string            // references SplitRentalStanding.id
  refNumber: string             // e.g. RNT-2026-03-001 — shared across both currency rows
  billingPeriod: string         // YYYY-MM
  usdAmount: number             // Fixed USD component
  zwgAmount: number             // ZWG equivalent (manual entry at prevailing rate)
  exchangeRateUsed?: number     // Rate applied (ZWG per USD) — audit reference only
  paymentDate: string
  paymentReference?: string
  postedBy: string
  status: OverheadStatus
  notes?: string
  createdAt: string
}

export interface OtherOverheadEntry {
  id: string
  category: string
  description: string
  company: Company
  billingPeriod: string
  amount: number
  reference?: string
  notes?: string
  postedBy: string
  status: OverheadStatus
  createdAt: string
}

export interface OverheadSettings {
  monthlyFuelBudget: number       // default: 695L × 1.71 × 4.33 ≈ 5147.47
  monthlyOverheadsBudget: number
  updatedBy: string
  updatedAt: string
}

// ─── Default Settings ──────────────────────────────────────────────────────────
export const DEFAULT_OVERHEAD_SETTINGS: OverheadSettings = {
  monthlyFuelBudget: 5147.47,
  monthlyOverheadsBudget: 8000.00,
  updatedBy: 'Ashleigh Kurira',
  updatedAt: '2026-01-01',
}

// ─── Mock Utilities ────────────────────────────────────────────────────────────
export const MOCK_UTILITIES: UtilityEntry[] = [
  {
    id: 'util-001', utilityType: 'Electricity', provider: 'ZESA', company: 'Kingsport',
    billingPeriod: '2026-02', amount: 320.00, invoiceReference: 'ZESA-2026-02-KP',
    postedBy: 'Ashleigh Kurira', status: 'posted', createdAt: '2026-03-05T08:00:00Z',
  },
  {
    id: 'util-002', utilityType: 'Internet', provider: 'ZOL', company: 'Kingsport',
    billingPeriod: '2026-02', amount: 85.00, invoiceReference: 'ZOL-FEB2026',
    postedBy: 'Ashleigh Kurira', status: 'posted', createdAt: '2026-03-05T08:05:00Z',
  },
  {
    id: 'util-003', utilityType: 'Water', provider: 'City of Harare', company: 'Kingsport',
    billingPeriod: '2026-02', amount: 45.00, invoiceReference: undefined,
    postedBy: 'Ashleigh Kurira', status: 'posted', createdAt: '2026-03-05T08:10:00Z',
  },
]

// ─── Mock Rentals — standard single-currency ──────────────────────────────────
export const MOCK_RENTALS: RentalEntry[] = [
  {
    id: 'rent-001', rentalType: 'Premises', description: 'Stand 41339 — Graniteside Premises',
    lessor: 'Graniteside Properties', company: 'Kingsport',
    billingPeriod: '2026-02', amount: 1200.00, leaseReference: 'LEASE-2023-KP-001',
    nextReviewDate: '2026-06-01',
    notes: 'Annual CPI escalation clause applies.',
    postedBy: 'Ashleigh Kurira', status: 'posted', createdAt: '2026-03-05T08:15:00Z',
  },
]

// ─── NHC Split-Currency Rental — Standing Record ─────────────────────────────
export const NHC_STANDING: SplitRentalStanding = {
  id: 'split-standing-nhc-001',
  description: 'National Handicraft Centre — Property Rental',
  lessor: 'National Handicraft Centre',
  company: 'Kingsport',
  totalContractValueUSD: 3400.00,
  usdComponent: 1700.00,
  paymentFrequency: 'Monthly',
  leaseReference: 'NHC-LEASE-KP-2026',
  notes: 'Split-currency lease. USD 1,700.00 fixed + ZWG equivalent of USD 1,700.00 at prevailing rate. ZWG amount must be entered manually by the accountant each month using RBZ or prevailing market rate on payment date.',
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
}

// ─── NHC Monthly Payment Entries ─────────────────────────────────────────────
// March 2026: ZWG 43,350.00 @ rate 25.50 ZWG per USD
export const MOCK_SPLIT_RENTALS: SplitRentalEntry[] = [
  {
    id: 'split-rent-nhc-2026-03',
    standingId: 'split-standing-nhc-001',
    refNumber: 'RNT-2026-03-001',
    billingPeriod: '2026-03',
    usdAmount: 1700.00,
    zwgAmount: 43350.00,          // USD 1,700 × 25.50
    exchangeRateUsed: 25.50,      // ZWG per USD — audit reference only
    paymentDate: '2026-03-01',
    paymentReference: 'NHC-MAR2026',
    postedBy: 'Ashleigh Kurira',
    status: 'posted',
    notes: undefined,
    createdAt: '2026-03-01T09:00:00Z',
  },
]

// ─── Mock Other Overheads ──────────────────────────────────────────────────────
export const MOCK_OTHER_OVERHEADS: OtherOverheadEntry[] = []

// ─── Helpers ───────────────────────────────────────────────────────────────────
/** Days until a date (positive = future, negative = past) */
export function daysUntilReview(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

/** Returns true if a review date is within the next 30 days */
export function isReviewSoon(dateStr: string): boolean {
  const d = daysUntilReview(dateStr)
  return d >= 0 && d <= 30
}

/** Format billing period YYYY-MM → "Feb 2026" */
export function formatPeriod(p: string): string {
  const [y, m] = p.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(m) - 1]} ${y}`
}

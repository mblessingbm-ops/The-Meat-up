// ─── Quotation System — Data Model & Utilities ─────────────────────────────────

export type QuoteCompany = 'Kingsport' | 'Bralyn' | 'SGA'

export type QuoteStatus = 'draft' | 'sent' | 'active' | 'accepted' | 'declined' | 'expired'

export type VATMode = 'inclusive' | 'exclusive' | 'zero'

/** Configurable VAT rate — update here if rate changes, propagates everywhere */
export const VAT_RATE = 0.155  // 15.5%

export type UnitType = 'Units' | 'Metres' | 'Kilograms' | 'Sets' | 'Pairs' | 'Boxes' | 'Rolls' | 'Cones' | 'Litres' | 'Other'

export interface QuoteLineItem {
  id: string
  description: string
  qty: number
  unit: UnitType
  unit_price: number
  amount: number // qty × unit_price
}

export interface Quote {
  id: string
  quote_number: string
  company: QuoteCompany
  client_name: string
  client_attention?: string
  client_address?: string
  description: string // short summary for table
  line_items: QuoteLineItem[]
  subtotal: number
  vat_mode: VATMode
  vat_amount: number
  total: number
  currency: 'USD'
  validity_days: 7 | 14 | 30
  quote_date: string // ISO
  valid_until: string // ISO
  payment_terms: string
  delivery_terms?: string
  special_instructions?: string
  include_bank_details: boolean
  /** The specific bank account chosen in the builder. Uses any to avoid circular dep with quotation-bank-accounts.ts */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selected_bank_account?: any
  status: QuoteStatus
  created_by: string
  created_at: string
}

// ─── Company Details ───────────────────────────────────────────────────────────

export interface CompanyDetails {
  full_name: string
  short_name: string
  address: string
  telephones: string[]
  email: string
  tin: string
  vat_reg: string
  company_reg: string
  color: string       // primary brand hex
  colorDark: string   // darker shade
  tagline: string
}

export const COMPANY_DETAILS: Record<QuoteCompany, CompanyDetails> = {
  Kingsport: {
    full_name: 'Kingsport Investments Private Limited',
    short_name: 'KINGSPORT INVESTMENTS PRIVATE LIMITED',
    address: '4 Grant Street, Harare, Zimbabwe',
    telephones: ['0242 781073', '0242 770712', '0242 770922', '0242 770607'],
    email: 'sales@kingsport.co.zw',
    tin: '2000130947',
    vat_reg: '220135644',
    company_reg: '6023/98',
    color: '#6B2737',
    colorDark: '#4A1A26',
    tagline: 'Workwear & Corporate Uniform Specialists',
  },
  Bralyn: {
    full_name: 'Bralyn Litho Printers (Pvt) Ltd',
    short_name: 'BRALYN LITHO PRINTERS (PVT) LTD',
    address: '27 Birmingham Road, Southerton, Harare, Zimbabwe',
    telephones: ['0242 779269', '0242 779270'],
    email: 'sales@bralyn.co.zw',
    tin: '2000410780',
    vat_reg: '22029420',
    company_reg: '3093/2009',
    color: '#1E3A5F',
    colorDark: '#12253D',
    tagline: 'Commercial Printing & Embroidery Specialists',
  },
  SGA: {
    full_name: 'Source Global Alliance (Pvt) Ltd',
    short_name: 'SOURCE GLOBAL ALLIANCE (PVT) LTD',
    address: '26 Simon Mazorodze Road, Southerton, Harare, Zimbabwe',
    telephones: ['0242 787865', '0242 787866'],
    email: 'sales@sga.co.zw',
    tin: '2000934222',
    vat_reg: '220300970',
    company_reg: '2077/2017',
    color: '#0F5C5C',
    colorDark: '#0A3E3E',
    tagline: 'Procurement & Supply Solutions',
  },
}

export const COMPANY_BANK_DETAILS: Record<QuoteCompany, string> = {
  Kingsport: 'Bank: CBZ Bank Ltd · Branch: Harare Main · Account Name: Kingsport Investments (Pvt) Ltd · Account No: 02130180280088 · Branch Code: 60-19-30',
  Bralyn: 'Bank: CBZ Bank Ltd · Branch: Harare Main · Account Name: Bralyn Litho Printers (Pvt) Ltd · Account No: 02130180380014 · Branch Code: 60-19-30',
  SGA: 'Bank: Stanbic Bank Zimbabwe · Branch: Harare · Account Name: Source Global Alliance (Pvt) Ltd · Account No: 9140005782500 · Branch Code: 60-30-30',
}

// ─── Access Control ────────────────────────────────────────────────────────────

export interface QuoteAccess {
  canView: QuoteCompany[]      // companies whose quotes this user can see
  canGenerate: QuoteCompany[]  // companies this user can create quotes for
  isAdmin: boolean             // can access settings
  userName: string
}

// Maps user identifiers to access rules
export const USER_QUOTE_ACCESS: Record<string, QuoteAccess> = {
  'kingstone.mhako': { canView: ['Kingsport', 'Bralyn', 'SGA'], canGenerate: ['Kingsport', 'Bralyn', 'SGA'], isAdmin: true, userName: 'Kingstone Mhako' },
  'lyn.mhako': { canView: ['Kingsport', 'Bralyn', 'SGA'], canGenerate: ['Kingsport', 'Bralyn', 'SGA'], isAdmin: true, userName: 'Lyn Mhako' },
  'blessing.mhako': { canView: ['Kingsport', 'Bralyn', 'SGA'], canGenerate: ['Kingsport', 'Bralyn', 'SGA'], isAdmin: true, userName: 'Blessing Mhako' },
  'energy.deshe': { canView: ['Kingsport', 'Bralyn', 'SGA'], canGenerate: ['Kingsport', 'Bralyn', 'SGA'], isAdmin: true, userName: 'Energy Deshe' },
  'lucia.chiwanza': { canView: ['Kingsport', 'Bralyn', 'SGA'], canGenerate: ['Kingsport', 'Bralyn', 'SGA'], isAdmin: true, userName: 'Lucia Chiwanza' },
  'tinotenda.kufinya': { canView: ['Kingsport'], canGenerate: ['Kingsport'], isAdmin: false, userName: 'Tinotenda Kufinya' },
  'marvelous.chimina': { canView: ['SGA'], canGenerate: ['SGA'], isAdmin: false, userName: 'Marvelous Chimina' },
  'debbie.mtandabare': { canView: ['SGA'], canGenerate: ['SGA'], isAdmin: false, userName: 'Debbie Mtandabare' },
  'priviledge.zimunya': { canView: ['SGA'], canGenerate: [], isAdmin: false, userName: 'Priviledge Zimunya' },
}

// Default CURRENT_USER for demo (executive — sees everything)
export const CURRENT_QUOTE_USER: QuoteAccess = {
  canView: ['Kingsport', 'Bralyn', 'SGA'],
  canGenerate: ['Kingsport', 'Bralyn', 'SGA'],
  isAdmin: true,
  userName: 'Kingstone Mhako',
}

// ─── Quote Number Sequences ────────────────────────────────────────────────────

export const MOCK_QUOTE_SEQUENCES: Record<QuoteCompany, Record<number, number>> = {
  Kingsport: { 2026: 2 },
  Bralyn: { 2026: 2 },
  SGA: { 2026: 2 },
}

const COMPANY_PREFIX: Record<QuoteCompany, string> = {
  Kingsport: 'KIN',
  Bralyn: 'BRL',
  SGA: 'SGA',
}

export function getNextQuoteNumber(company: QuoteCompany, year: number): string {
  const current = MOCK_QUOTE_SEQUENCES[company][year] ?? 0
  MOCK_QUOTE_SEQUENCES[company][year] = current + 1
  return `${COMPANY_PREFIX[company]}-QT-${year}-${String(current + 1).padStart(4, '0')}`
}

// ─── Date Utilities ────────────────────────────────────────────────────────────

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

export function formatQuoteDate(isoDate: string): string {
  const d = new Date(isoDate)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function getTodayISO(): string {
  // Use actual current date — never hardcoded
  return new Date().toISOString().slice(0, 10)
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function daysRemaining(validUntilISO: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const until = new Date(validUntilISO); until.setHours(0, 0, 0, 0)
  return Math.ceil((until.getTime() - today.getTime()) / 86400000)
}

// ─── Status Computation ────────────────────────────────────────────────────────

export function computeQuoteStatus(quote: Quote): QuoteStatus {
  // Draft is always draft until manually changed
  if (quote.status === 'draft') return 'draft'
  // Terminal states stay fixed
  if (quote.status === 'accepted' || quote.status === 'declined') return quote.status
  // Auto-expire past validity
  if (daysRemaining(quote.valid_until) < 0) return 'expired'
  return quote.status
}

// ─── Status Display ────────────────────────────────────────────────────────────

export const STATUS_BADGE: Record<QuoteStatus, string> = {
  draft: 'bg-slate-100 text-slate-500',
  sent: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  declined: 'bg-red-100 text-red-600',
  expired: 'bg-amber-100 text-amber-700',
}

export const STATUS_LABEL: Record<QuoteStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  active: 'Active',
  accepted: 'Accepted',
  declined: 'Declined',
  expired: 'Expired',
}

// ─── Mock Quotes ───────────────────────────────────────────────────────────────

export const MOCK_QUOTES: Quote[] = [
  // ── KINGSPORT ──
  {
    id: 'q1',
    quote_number: 'KIN-QT-2026-0001',
    company: 'Kingsport',
    client_name: 'MOHCC',
    client_attention: 'The Procurement Manager',
    description: '5,000x Printed Workwear',
    line_items: [
      { id: 'li1', description: 'Printed Workwear — Standard Issue', qty: 5000, unit: 'Units', unit_price: 2.96, amount: 14800 },
      { id: 'li2', description: 'Embroidered Logo — Chest & Back', qty: 5000, unit: 'Units', unit_price: 0.74, amount: 3700 },
    ],
    subtotal: 18500,
    vat_mode: 'inclusive',
    vat_amount: 2482.68,  // 18500 - (18500 / 1.155) @ 15.5%
    total: 18500,
    currency: 'USD',
    validity_days: 30,
    quote_date: '2026-03-01',
    valid_until: '2026-03-31',
    payment_terms: '30 Days',
    delivery_terms: 'Delivery within 15 working days of order confirmation and receipt of deposit.',
    special_instructions: 'All branding to comply with MOHCC specification sheet ref. MOH/B/2026/01.',
    include_bank_details: true,
    status: 'sent',
    created_by: 'Tinotenda Kufinya',
    created_at: '2026-03-01T09:00:00Z',
  },
  {
    id: 'q2',
    quote_number: 'KIN-QT-2026-0002',
    company: 'Kingsport',
    client_name: 'World Vision',
    client_attention: 'Procurement Department',
    description: '200x Raincoats',
    line_items: [
      { id: 'li3', description: 'Adult Raincoat — Yellow PVC', qty: 200, unit: 'Units', unit_price: 17.00, amount: 3400 },
    ],
    subtotal: 3400,
    vat_mode: 'exclusive',
    vat_amount: 0,
    total: 3400,
    currency: 'USD',
    validity_days: 14,
    quote_date: '2026-03-10',
    valid_until: '2026-03-24',
    payment_terms: '14 Days',
    include_bank_details: true,
    status: 'draft',
    created_by: 'Tinotenda Kufinya',
    created_at: '2026-03-10T11:30:00Z',
  },
  // ── BRALYN ──
  {
    id: 'q3',
    quote_number: 'BRL-QT-2026-0001',
    company: 'Bralyn',
    client_name: 'PSC',
    client_attention: 'The Procurement Manager',
    description: 'Commercial Printing — Annual Reports',
    line_items: [
      { id: 'li4', description: 'Annual Reports — Full Colour, A4, 48pp, Saddle-stitched', qty: 500, unit: 'Units', unit_price: 14.40, amount: 7200 },
    ],
    subtotal: 7200,
    vat_mode: 'inclusive',
    vat_amount: 966.23,   // 7200 - (7200 / 1.155) @ 15.5%
    total: 7200,
    currency: 'USD',
    validity_days: 30,
    quote_date: '2026-03-05',
    valid_until: '2026-04-04',
    payment_terms: '30 Days',
    delivery_terms: 'Delivery within 10 working days of print-ready artwork approval.',
    include_bank_details: true,
    status: 'active',
    created_by: 'Lucia Chiwanza',
    created_at: '2026-03-05T08:00:00Z',
  },
  {
    id: 'q4',
    quote_number: 'BRL-QT-2026-0002',
    company: 'Bralyn',
    client_name: 'ZINWA',
    client_attention: 'Procurement Officer',
    description: 'Embroidered Caps × 500',
    line_items: [
      { id: 'li5', description: 'Structured Cap — Navy, Embroidered Logo', qty: 500, unit: 'Units', unit_price: 5.50, amount: 2750 },
    ],
    subtotal: 2750,
    vat_mode: 'exclusive',
    vat_amount: 0,
    total: 2750,
    currency: 'USD',
    validity_days: 7,
    quote_date: '2026-03-01',
    valid_until: '2026-03-08',
    payment_terms: '7 Days',
    include_bank_details: true,
    status: 'sent', // will compute as expired on render
    created_by: 'Lucia Chiwanza',
    created_at: '2026-03-01T10:00:00Z',
  },
  // ── SGA ──
  {
    id: 'q5',
    quote_number: 'SGA-QT-2026-0001',
    company: 'SGA',
    client_name: 'Irvines',
    client_attention: 'Marketing Manager',
    description: 'Promotional T-Shirts × 300',
    line_items: [
      { id: 'li6', description: 'Cotton T-Shirt — White, Screen Printed 2-colour', qty: 300, unit: 'Units', unit_price: 7.00, amount: 2100 },
    ],
    subtotal: 2100,
    vat_mode: 'inclusive',
    vat_amount: 281.82,   // 2100 - (2100 / 1.155) @ 15.5%
    total: 2100,
    currency: 'USD',
    validity_days: 14,
    quote_date: '2026-03-08',
    valid_until: '2026-03-22',
    payment_terms: 'Advance Payment',
    include_bank_details: true,
    status: 'accepted',
    created_by: 'Marvelous Chimina',
    created_at: '2026-03-08T09:00:00Z',
  },
  {
    id: 'q6',
    quote_number: 'SGA-QT-2026-0002',
    company: 'SGA',
    client_name: 'Slice International',
    client_attention: 'Procurement',
    description: 'Bottle Drinks × 500 cases',
    line_items: [
      { id: 'li7', description: 'Assorted Bottle Drinks — 500ml × 24 per case', qty: 500, unit: 'Boxes', unit_price: 3.70, amount: 1850 },
    ],
    subtotal: 1850,
    vat_mode: 'exclusive',
    vat_amount: 0,
    total: 1850,
    currency: 'USD',
    validity_days: 7,
    quote_date: '2026-03-14',
    valid_until: '2026-03-21',
    payment_terms: 'Cash on Delivery',
    include_bank_details: false,
    status: 'draft',
    created_by: 'Debbie Mtandabare',
    created_at: '2026-03-14T14:00:00Z',
  },
]

// ─── Company Settings (mutable in settings drawer) ────────────────────────────

export const DEFAULT_QUOTE_SETTINGS: Record<QuoteCompany, {
  defaultValidityDays: 7 | 14 | 30
  defaultPaymentTerms: string
  defaultSpecialInstructions: string
}> = {
  Kingsport: { defaultValidityDays: 30, defaultPaymentTerms: '30 Days', defaultSpecialInstructions: '' },
  Bralyn: { defaultValidityDays: 30, defaultPaymentTerms: '30 Days', defaultSpecialInstructions: 'Prices quoted are exclusive of delivery unless stated.' },
  SGA: { defaultValidityDays: 14, defaultPaymentTerms: '30 Days', defaultSpecialInstructions: 'All prices quoted in USD unless otherwise stated.' },
}

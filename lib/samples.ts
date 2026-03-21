// ─── lib/samples.ts ────────────────────────────────────────────────────────────
// Sample Catalogue & Tracking — data types, mock records, and computed helpers.
// All dates relative to 06 March 2026 (system reference date).

// ─── Types ─────────────────────────────────────────────────────────────────────

export type SampleCategory =
  | 'Garments'
  | 'Caps'
  | 'PPE & Workwear'
  | 'Bags & Accessories'
  | 'Promotional Items'
  | 'Fabric Swatches'
  | 'Other'

export type SampleCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor'
export type SampleCompany = 'Kingsport' | 'Bralyn' | 'SGA'
export type SampleStatus = 'Active' | 'Retired'

export type CheckoutStatus = 'checked_out' | 'returned' | 'lost'

export type CheckoutPurpose =
  | 'Client Presentation'
  | 'Tender Submission'
  | 'Client Visit'
  | 'Trade Show'
  | 'Other'

export type RequestStatus = 'pending' | 'fulfilled' | 'cancelled'

export interface ClientVisit {
  id: string
  client: string
  visit_date: string
  notes?: string
}

export interface CheckoutRecord {
  checkout_id: string
  sample_id: string
  units_taken: number
  checked_out_by: string
  checked_out_by_id: string
  checkout_date: string
  expected_return_date: string
  client_visited: string
  purpose: CheckoutPurpose
  is_tender: boolean
  additional_clients: ClientVisit[]
  condition_on_checkout: SampleCondition
  condition_on_return?: SampleCondition
  status: CheckoutStatus
  returned_date?: string
  returned_by?: string
  notes?: string
  condition_flag?: boolean // true if returned in worse condition
}

export interface SampleRequest {
  request_id: string
  sample_id: string
  rep_id: string
  rep_name: string
  units_needed: number
  purpose: CheckoutPurpose
  is_tender: boolean
  client: string
  date_needed_by: string
  requested_on: string
  status: RequestStatus
  notes?: string
}

export interface Sample {
  id: string           // SMP-YYYY-NNNN
  name: string
  category: SampleCategory
  description?: string
  total_units: number
  condition: SampleCondition
  company: SampleCompany
  added_by: string
  added_date: string
  status: SampleStatus
  image?: string
  notes?: string
}

// ─── Mock Samples ───────────────────────────────────────────────────────────────

export const MOCK_SAMPLES: Sample[] = [
  {
    id: 'SMP-2026-0001',
    name: 'Navy Polo Shirt — Size L',
    category: 'Garments',
    description: 'Classic navy polo with embroidery-ready chest panel. Size L.',
    total_units: 3,
    condition: 'Excellent',
    company: 'Kingsport',
    added_by: 'Lucia Chiwanza',
    added_date: '2026-01-10',
    status: 'Active',
    notes: 'Popular with government clients.',
  },
  {
    id: 'SMP-2026-0002',
    name: 'Hi-Vis Reflective Vest — Size XL',
    category: 'PPE & Workwear',
    description: 'ANSI-compliant hi-vis orange vest with 3M reflective tape. Size XL.',
    total_units: 2,
    condition: 'Good',
    company: 'Kingsport',
    added_by: 'Tinotenda Kufinya',
    added_date: '2026-01-15',
    status: 'Active',
  },
  {
    id: 'SMP-2026-0003',
    name: 'Royal Blue Cap',
    category: 'Caps',
    description: 'Structured 6-panel cap in royal blue. Embroidery on front panel.',
    total_units: 5,
    condition: 'Excellent',
    company: 'Kingsport',
    added_by: 'Lucia Chiwanza',
    added_date: '2026-01-20',
    status: 'Active',
  },
  {
    id: 'SMP-2026-0004',
    name: 'Worksuit Jacket Royal Blue — Size 42',
    category: 'PPE & Workwear',
    description: 'Heavy-duty poly-cotton worksuit jacket. Size 42. Bralyn manufactured.',
    total_units: 1,
    condition: 'Excellent',
    company: 'Bralyn',
    added_by: 'Tinotenda Kufinya',
    added_date: '2026-02-01',
    status: 'Active',
  },
  {
    id: 'SMP-2026-0005',
    name: 'Embroidered Golf Shirt — Size M',
    category: 'Garments',
    description: 'Corporate golf shirt with piqué weave. Embroidery-ready. Size M.',
    total_units: 4,
    condition: 'Excellent',
    company: 'Kingsport',
    added_by: 'Lucia Chiwanza',
    added_date: '2026-02-05',
    status: 'Active',
  },
  {
    id: 'SMP-2026-0006',
    name: 'Tote Bag Sample',
    category: 'Bags & Accessories',
    description: 'Natural canvas tote, 38×42cm. Screen print zone on front face.',
    total_units: 3,
    condition: 'Good',
    company: 'Kingsport',
    added_by: 'Tinotenda Kufinya',
    added_date: '2026-01-25',
    status: 'Active',
    notes: 'Condition flag on last return — returned Fair vs Good on departure.',
  },
  {
    id: 'SMP-2026-0007',
    name: 'Fabric Swatch Set — Lacoste Colours',
    category: 'Fabric Swatches',
    description: 'Full colour card of Lacoste piqué swatches — 24 standard colours.',
    total_units: 1,
    condition: 'Good',
    company: 'Kingsport',
    added_by: 'Lucia Chiwanza',
    added_date: '2026-02-10',
    status: 'Active',
  },
  {
    id: 'SMP-2026-0008',
    name: 'Printed Cap — White',
    category: 'Caps',
    description: 'Unstructured white 5-panel cap. Screen print zone on front.',
    total_units: 6,
    condition: 'Excellent',
    company: 'Bralyn',
    added_by: 'Tinotenda Kufinya',
    added_date: '2026-02-12',
    status: 'Active',
  },
]

// ─── Mock Checkout Records ──────────────────────────────────────────────────────
// Reference date: 06 March 2026
// "Due back in N days" from 06 March 2026

export const MOCK_CHECKOUTS: CheckoutRecord[] = [
  // SMP-0001: 1 unit to Sylvester Chigova, MOHCC, TENDER, due in 4 days (10 Mar 2026)
  {
    checkout_id: 'CHK-2026-0001',
    sample_id: 'SMP-2026-0001',
    units_taken: 1,
    checked_out_by: 'Sylvester Chigova',
    checked_out_by_id: 'sylvester',
    checkout_date: '2026-02-28',
    expected_return_date: '2026-03-10',
    client_visited: 'Ministry of Health (MOHCC)',
    purpose: 'Tender Submission',
    is_tender: true,
    additional_clients: [],
    condition_on_checkout: 'Excellent',
    status: 'checked_out',
    notes: 'Submitted for MOHCC tender — 50,000 polo shirts.',
  },
  // SMP-0002: 1 unit to Dudzai Ndemera, Schweppes, OVERDUE (3 days: was due 03 Mar 2026)
  {
    checkout_id: 'CHK-2026-0002',
    sample_id: 'SMP-2026-0002',
    units_taken: 1,
    checked_out_by: 'Dudzai Ndemera',
    checked_out_by_id: 'dudzai',
    checkout_date: '2026-02-20',
    expected_return_date: '2026-03-03',
    client_visited: 'Schweppes',
    purpose: 'Client Presentation',
    is_tender: false,
    additional_clients: [],
    condition_on_checkout: 'Good',
    status: 'checked_out',
    notes: 'Client requested PPE samples for warehouse staff uniform review.',
  },
  // SMP-0002: 1 unit to Sandra Mwanza, Econet Holdings, due tomorrow (07 Mar 2026)
  {
    checkout_id: 'CHK-2026-0003',
    sample_id: 'SMP-2026-0002',
    units_taken: 1,
    checked_out_by: 'Sandra Mwanza',
    checked_out_by_id: 'sandra',
    checkout_date: '2026-02-25',
    expected_return_date: '2026-03-07',
    client_visited: 'Econet Holdings',
    purpose: 'Client Visit',
    is_tender: false,
    additional_clients: [],
    condition_on_checkout: 'Good',
    status: 'checked_out',
  },
  // SMP-0003: 2 units to Yolanda Chigaigai, UNICEF, TENDER, due in 7 days (13 Mar 2026)
  {
    checkout_id: 'CHK-2026-0004',
    sample_id: 'SMP-2026-0003',
    units_taken: 2,
    checked_out_by: 'Yolanda Chigaigai',
    checked_out_by_id: 'yolanda',
    checkout_date: '2026-03-01',
    expected_return_date: '2026-03-13',
    client_visited: 'UNICEF',
    purpose: 'Tender Submission',
    is_tender: true,
    additional_clients: [],
    condition_on_checkout: 'Excellent',
    status: 'checked_out',
    notes: 'UNICEF tender — branded caps for field teams.',
  },
  // SMP-0006: 1 unit to Priviledge Zimunya, Irvines — RETURNED last week, condition flag
  {
    checkout_id: 'CHK-2026-0005',
    sample_id: 'SMP-2026-0006',
    units_taken: 1,
    checked_out_by: 'Priviledge Zimunya',
    checked_out_by_id: 'priviledge',
    checkout_date: '2026-02-10',
    expected_return_date: '2026-02-28',
    client_visited: 'Irvines',
    purpose: 'Client Presentation',
    is_tender: false,
    additional_clients: [],
    condition_on_checkout: 'Good',
    condition_on_return: 'Fair',
    status: 'returned',
    returned_date: '2026-02-27',
    returned_by: 'Lucia Chiwanza',
    notes: 'Returned with light staining on front panel.',
    condition_flag: true,
  },
  // SMP-0007: 1 unit to Lucia Chiwanza, TelOne, due in 10 days (16 Mar 2026)
  // Chain of custody: TelOne + OK Zimbabwe visits
  {
    checkout_id: 'CHK-2026-0006',
    sample_id: 'SMP-2026-0007',
    units_taken: 1,
    checked_out_by: 'Lucia Chiwanza',
    checked_out_by_id: 'lucia',
    checkout_date: '2026-02-24',
    expected_return_date: '2026-03-16',
    client_visited: 'TelOne',
    purpose: 'Client Presentation',
    is_tender: false,
    additional_clients: [
      {
        id: 'cv-0001',
        client: 'TelOne',
        visit_date: '2026-02-24',
        notes: 'Initial presentation — swatch set reviewed by procurement.',
      },
      {
        id: 'cv-0002',
        client: 'OK Zimbabwe',
        visit_date: '2026-03-02',
        notes: 'Follow-up client visit — OK Zimbabwe uniform review.',
      },
    ],
    condition_on_checkout: 'Good',
    status: 'checked_out',
    notes: 'Swatch set being shared across two clients during this checkout.',
  },
]

// ─── Mock Sample Requests / Waitlist ───────────────────────────────────────────

export const MOCK_REQUESTS: SampleRequest[] = [
  // SMP-0003: Waitlist — Thandeka Madeya, BAT, non-tender
  {
    request_id: 'REQ-2026-0001',
    sample_id: 'SMP-2026-0003',
    rep_id: 'thandeka',
    rep_name: 'Thandeka Madeya',
    units_needed: 1,
    purpose: 'Client Presentation',
    is_tender: false,
    client: 'British American Tobacco',
    date_needed_by: '2026-03-20',
    requested_on: '2026-03-04',
    status: 'pending',
    notes: 'Need cap sample for BAT corporate identity review.',
  },
  // SMP-0005: Pending request — Ernest Mutizwa, Ministry of Industry, TENDER
  {
    request_id: 'REQ-2026-0002',
    sample_id: 'SMP-2026-0005',
    rep_id: 'ernest',
    rep_name: 'Ernest Mutizwa',
    units_needed: 1,
    purpose: 'Tender Submission',
    is_tender: true,
    client: 'Ministry of Industry and Commerce',
    date_needed_by: '2026-03-18',
    requested_on: '2026-03-03',
    status: 'pending',
    notes: 'Ministry tender — golf shirts for executive staff.',
  },
  // SMP-0005: Pending request — Chiedza Jowa, Petrotrade, non-tender
  {
    request_id: 'REQ-2026-0003',
    sample_id: 'SMP-2026-0005',
    rep_id: 'chiedza',
    rep_name: 'Chiedza Jowa',
    units_needed: 1,
    purpose: 'Client Visit',
    is_tender: false,
    client: 'Petrotrade',
    date_needed_by: '2026-03-25',
    requested_on: '2026-03-05',
    status: 'pending',
    notes: 'Petrotrade uniform committee meeting.',
  },
]

// ─── History log entries (augments checkout records for timeline) ───────────────

export interface HistoryEntry {
  id: string
  sample_id: string
  type: 'catalogued' | 'checked_out' | 'returned' | 'client_visit' | 'condition_flag' | 'retired'
  date: string
  actor: string
  description: string
  checkout_id?: string
}

export const MOCK_HISTORY: HistoryEntry[] = [
  // SMP-0001
  { id: 'h001', sample_id: 'SMP-2026-0001', type: 'catalogued', date: '2026-01-10', actor: 'Lucia Chiwanza', description: 'Sample catalogued. 3 units added.' },
  { id: 'h002', sample_id: 'SMP-2026-0001', type: 'checked_out', date: '2026-02-28', actor: 'Lucia Chiwanza', description: 'Checked out to Sylvester Chigova — 1 unit. Client: MOHCC. Purpose: Tender Submission. TENDER flagged.', checkout_id: 'CHK-2026-0001' },
  // SMP-0002
  { id: 'h003', sample_id: 'SMP-2026-0002', type: 'catalogued', date: '2026-01-15', actor: 'Tinotenda Kufinya', description: 'Sample catalogued. 2 units added.' },
  { id: 'h004', sample_id: 'SMP-2026-0002', type: 'checked_out', date: '2026-02-20', actor: 'Tinotenda Kufinya', description: 'Checked out to Dudzai Ndemera — 1 unit. Client: Schweppes. Purpose: Client Presentation.', checkout_id: 'CHK-2026-0002' },
  { id: 'h005', sample_id: 'SMP-2026-0002', type: 'checked_out', date: '2026-02-25', actor: 'Lucia Chiwanza', description: 'Checked out to Sandra Mwanza — 1 unit. Client: Econet Holdings. Purpose: Client Visit.', checkout_id: 'CHK-2026-0003' },
  // SMP-0003
  { id: 'h006', sample_id: 'SMP-2026-0003', type: 'catalogued', date: '2026-01-20', actor: 'Lucia Chiwanza', description: 'Sample catalogued. 5 units added.' },
  { id: 'h007', sample_id: 'SMP-2026-0003', type: 'checked_out', date: '2026-03-01', actor: 'Lucia Chiwanza', description: 'Checked out to Yolanda Chigaigai — 2 units. Client: UNICEF. Purpose: Tender Submission. TENDER flagged.', checkout_id: 'CHK-2026-0004' },
  // SMP-0005
  { id: 'h008', sample_id: 'SMP-2026-0005', type: 'catalogued', date: '2026-02-05', actor: 'Lucia Chiwanza', description: 'Sample catalogued. 4 units added.' },
  // SMP-0006
  { id: 'h009', sample_id: 'SMP-2026-0006', type: 'catalogued', date: '2026-01-25', actor: 'Tinotenda Kufinya', description: 'Sample catalogued. 3 units added.' },
  { id: 'h010', sample_id: 'SMP-2026-0006', type: 'checked_out', date: '2026-02-10', actor: 'Tinotenda Kufinya', description: 'Checked out to Priviledge Zimunya — 1 unit. Client: Irvines. Purpose: Client Presentation.', checkout_id: 'CHK-2026-0005' },
  { id: 'h011', sample_id: 'SMP-2026-0006', type: 'returned', date: '2026-02-27', actor: 'Lucia Chiwanza', description: 'Returned by Priviledge Zimunya — 1 unit. Condition on return: Fair (was Good). Condition flag raised.', checkout_id: 'CHK-2026-0005' },
  { id: 'h012', sample_id: 'SMP-2026-0006', type: 'condition_flag', date: '2026-02-27', actor: 'Lucia Chiwanza', description: 'Condition flag: returned in Fair condition vs Good on departure. Light staining noted on front panel.' },
  // SMP-0007
  { id: 'h013', sample_id: 'SMP-2026-0007', type: 'catalogued', date: '2026-02-10', actor: 'Lucia Chiwanza', description: 'Sample catalogued. 1 unit added.' },
  { id: 'h014', sample_id: 'SMP-2026-0007', type: 'checked_out', date: '2026-02-24', actor: 'Lucia Chiwanza', description: 'Checked out to Lucia Chiwanza — 1 unit. Client: TelOne. Purpose: Client Presentation.', checkout_id: 'CHK-2026-0006' },
  { id: 'h015', sample_id: 'SMP-2026-0007', type: 'client_visit', date: '2026-02-24', actor: 'Lucia Chiwanza', description: 'Client visit logged: TelOne — procurement review of swatch set.', checkout_id: 'CHK-2026-0006' },
  { id: 'h016', sample_id: 'SMP-2026-0007', type: 'client_visit', date: '2026-03-02', actor: 'Lucia Chiwanza', description: 'Client visit logged: OK Zimbabwe — uniform review during same checkout.', checkout_id: 'CHK-2026-0006' },
]

// ─── Computed helpers ───────────────────────────────────────────────────────────

/** Units currently checked out (active, not returned/lost) */
export function getCheckedOutUnits(sampleId: string, checkouts: CheckoutRecord[]): number {
  return checkouts
    .filter(c => c.sample_id === sampleId && c.status === 'checked_out')
    .reduce((sum, c) => sum + c.units_taken, 0)
}

/** Available units = total_units - active checked-out units */
export function getAvailableUnits(sample: Sample, checkouts: CheckoutRecord[]): number {
  return Math.max(0, sample.total_units - getCheckedOutUnits(sample.id, checkouts))
}

/** True if expected_return_date < today and still checked_out */
export function isOverdue(checkout: CheckoutRecord): boolean {
  if (checkout.status !== 'checked_out') return false
  return new Date(checkout.expected_return_date) < new Date(new Date().toDateString())
}

/** Days remaining until expected return (negative = overdue) */
export function daysRemaining(checkout: CheckoutRecord): number {
  const diff = new Date(checkout.expected_return_date).getTime() - new Date(new Date().toDateString()).getTime()
  return Math.ceil(diff / 86_400_000)
}

/** Sort waitlist: is_tender DESC, then requested_on ASC */
export function getWaitlistQueue(sampleId: string, requests: SampleRequest[]): SampleRequest[] {
  return requests
    .filter(r => r.sample_id === sampleId && r.status === 'pending')
    .sort((a, b) => {
      if (a.is_tender !== b.is_tender) return a.is_tender ? -1 : 1
      return a.requested_on.localeCompare(b.requested_on)
    })
}

/** Colour coding for days remaining */
export function daysRemainingColor(days: number): string {
  if (days < 0) return 'text-red-600 font-bold'
  if (days <= 1) return 'text-red-500 font-semibold'
  if (days <= 4) return 'text-amber-600 font-semibold'
  return 'text-emerald-600'
}

export const CATEGORY_COLORS: Record<SampleCategory, string> = {
  'Garments': 'bg-blue-100 text-blue-700',
  'Caps': 'bg-purple-100 text-purple-700',
  'PPE & Workwear': 'bg-orange-100 text-orange-700',
  'Bags & Accessories': 'bg-teal-100 text-teal-700',
  'Promotional Items': 'bg-pink-100 text-pink-700',
  'Fabric Swatches': 'bg-amber-100 text-amber-700',
  'Other': 'bg-slate-100 text-slate-600',
}

export const COMPANY_COLORS: Record<SampleCompany, string> = {
  'Kingsport': 'bg-brand-100 text-brand-700',
  'Bralyn': 'bg-emerald-100 text-emerald-700',
  'SGA': 'bg-violet-100 text-violet-700',
}

export const CONDITION_COLORS: Record<SampleCondition, string> = {
  'Excellent': 'bg-emerald-100 text-emerald-700',
  'Good': 'bg-blue-100 text-blue-700',
  'Fair': 'bg-amber-100 text-amber-700',
  'Poor': 'bg-red-100 text-red-600',
}

export const ALL_REPS = [
  { id: 'lucia',    name: 'Lucia Chiwanza' },
  { id: 'sylvester',name: 'Sylvester Chigova' },
  { id: 'yolanda',  name: 'Yolanda Chigaigai' },
  { id: 'dudzai',   name: 'Dudzai Ndemera' },
  { id: 'sandra',   name: 'Sandra Mwanza' },
  { id: 'thandeka', name: 'Thandeka Madeya' },
  { id: 'chiedza',  name: 'Chiedza Jowa' },
  { id: 'priviledge', name: 'Priviledge Zimunya' },
  { id: 'ernest',   name: 'Ernest Mutizwa' },
  { id: 'spiwe',    name: 'Spiwe Mandizha' },
]

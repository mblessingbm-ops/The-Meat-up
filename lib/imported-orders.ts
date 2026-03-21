// ─── Imported Goods Orders — Data Layer ──────────────────────────────────────
// lib/imported-orders.ts

export type OrderStatus =
    | 'draft'
    | 'pending_manager'
    | 'pending_executive'
    | 'approved'
    | 'rejected'
    | 'completed'

export type Supplier = 'Amrod' | 'KMQ' | 'Mican' | 'Marchem' | 'Other'

export interface SigningEvent {
    stage: 'submitted' | 'manager_signed' | 'executive_signed' | 'approved' | 'rejected' | 'completed'
    actor_name: string
    actor_role: string
    timestamp: string
    note?: string // rejection reason
}

export interface ImportedOrder {
    id: string
    ref: string                     // IMP-2026-NNNN
    supplier: Supplier
    supplier_other?: string
    client_name: string
    rep_id: string
    rep_name: string
    product_description: string
    quantity: number
    unit_of_measure: 'Units' | 'Sets' | 'Boxes' | 'Packs'
    supplier_cost: number           // USD
    supplier_cost_zar?: number      // ZAR (if sourced from ZAR supplier)
    exchange_rate_snapshot?: {      // rate in use at time of order creation
        rate: number
        set_by: string
        set_at: string
    }
    client_charge: number           // USD
    delivery_deadline: string
    special_instructions?: string
    status: OrderStatus
    created_by: string
    created_by_role: string
    created_at: string
    updated_at: string
    signing_trail: SigningEvent[]
    // Document stubs (in prod: URLs; in mock: labels)
    doc_client_po?: string          // filename
    doc_supplier_quote?: string     // filename
    doc_proof_of_payment?: string   // filename
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function calcMargin(supplierCost: number, clientCharge: number): number {
    if (clientCharge <= 0) return 0
    return ((clientCharge - supplierCost) / clientCharge) * 100
}

export function marginColor(pct: number): string {
    if (pct < 10) return 'text-red-600'
    if (pct < 20) return 'text-amber-600'
    return 'text-emerald-600'
}

export function marginBg(pct: number): string {
    if (pct < 10) return 'bg-red-50 border-red-200'
    if (pct < 20) return 'bg-amber-50 border-amber-200'
    return 'bg-emerald-50 border-emerald-200'
}

export const STATUS_COLORS: Record<OrderStatus, string> = {
    draft: 'bg-slate-100 text-slate-500',
    pending_manager: 'bg-blue-100 text-blue-700',
    pending_executive: 'bg-purple-100 text-purple-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-600',
    completed: 'bg-teal-100 text-teal-700',
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
    draft: 'Draft',
    pending_manager: 'Awaiting Manager',
    pending_executive: 'Awaiting Executive',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
}

// ── SALES_REPS list (for data_capture rep picker) ─────────────────────────────
export const SALES_REPS = [
    { id: 'sr1', name: 'Thandeka Madeya' },
    { id: 'sr2', name: 'Yolanda Chigaigai' },
    { id: 'sr3', name: 'Chiedza Jowa' },
    { id: 'sr4', name: 'Dudzai Ndemera' },
    { id: 'sr5', name: 'Sylvester Chigova' },
    { id: 'sr6', name: 'Sandra Mwanza' },
    { id: 'sr7', name: 'Spiwe Mandizha' },
    { id: 'sr8', name: 'Priviledge Zimunya' },
    { id: 'sr9', name: 'Ernest Mutizwa' },
]

let _nextSeq = 7
export function nextOrderRef(): string {
    _nextSeq++
    return `IMP-2026-${String(_nextSeq).padStart(4, '0')}`
}

// ── Mock Data — 6 realistic imported orders ───────────────────────────────────
export const MOCK_IMPORTED_ORDERS: ImportedOrder[] = [
    // 1 — DRAFT — Sylvester Chigova / KMQ / MOHCC
    {
        id: 'io1',
        ref: 'IMP-2026-0001',
        supplier: 'KMQ',
        client_name: 'MOHCC',
        rep_id: 'sr5', rep_name: 'Sylvester Chigova',
        product_description: '500x branded promotional diaries A5 hardcover — Kingsport design, client logo embossed on cover. 200x wall calendars A2 full colour, 12-month, spiral bound.',
        quantity: 700,
        unit_of_measure: 'Units',
        supplier_cost: 1820.00,
        client_charge: 2366.00,
        delivery_deadline: '2026-03-28',
        special_instructions: 'Diaries must arrive before 31 March for Q2 distribution. All with MOHCC logo.',
        status: 'draft',
        created_by: 'Sylvester Chigova',
        created_by_role: 'sales_rep',
        created_at: '2026-03-04T08:00:00Z',
        updated_at: '2026-03-04T08:00:00Z',
        signing_trail: [],
        doc_client_po: undefined,
        doc_supplier_quote: 'KMQ_Quote_MOHCC_Diaries.pdf',
    },

    // 2 — PENDING MANAGER — Dudzai Ndemera / Amrod / Schweppes
    {
        id: 'io2',
        ref: 'IMP-2026-0002',
        supplier: 'Amrod',
        client_name: 'Schweppes',
        rep_id: 'sr4', rep_name: 'Dudzai Ndemera',
        product_description: '150x Amrod branded power banks 10,000mAh PB-200 model — Matt black with Schweppes Zimbabwe logo in white screen print. Supplied with micro-USB and USB-C cables per unit.',
        quantity: 150,
        unit_of_measure: 'Units',
        supplier_cost: 1980.00,
        client_charge: 2574.00,
        delivery_deadline: '2026-04-05',
        status: 'pending_manager',
        created_by: 'Dudzai Ndemera',
        created_by_role: 'sales_rep',
        created_at: '2026-03-03T11:30:00Z',
        updated_at: '2026-03-04T09:00:00Z',
        signing_trail: [
            { stage: 'submitted', actor_name: 'Dudzai Ndemera', actor_role: 'Sales Rep', timestamp: '2026-03-04T09:00:00Z' },
        ],
        doc_client_po: 'Schweppes_PO_Power_Banks_2026.pdf',
        doc_supplier_quote: 'Amrod_Quote_PB200_Schweppes.pdf',
    },

    // 3 — PENDING EXECUTIVE — Thandeka Madeya / Amrod / BAT
    {
        id: 'io3',
        ref: 'IMP-2026-0003',
        supplier: 'Amrod',
        client_name: 'BAT',
        rep_id: 'sr1', rep_name: 'Thandeka Madeya',
        product_description: '200x USB flash drives 16GB — BAT-branded silver metal twist-top. 200x branded polyester lanyards with metal clip and safety release — BAT Zimbabwe logo printed full colour.',
        quantity: 400,
        unit_of_measure: 'Units',
        supplier_cost: 1650.00,
        client_charge: 2145.00,
        delivery_deadline: '2026-04-10',
        status: 'pending_executive',
        created_by: 'Thandeka Madeya',
        created_by_role: 'sales_rep',
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-03T14:20:00Z',
        signing_trail: [
            { stage: 'submitted', actor_name: 'Thandeka Madeya', actor_role: 'Sales Rep', timestamp: '2026-03-01T10:00:00Z' },
            { stage: 'manager_signed', actor_name: 'Lucia Chiwanza', actor_role: 'Sales Manager', timestamp: '2026-03-03T14:20:00Z' },
        ],
        doc_client_po: 'BAT_PO_USB_Lanyards_March2026.pdf',
        doc_supplier_quote: 'Amrod_USB_Lanyard_Quote.pdf',
    },

    // 4 — APPROVED — Yolanda Chigaigai / KMQ / UNICEF
    {
        id: 'io4',
        ref: 'IMP-2026-0004',
        supplier: 'KMQ',
        client_name: 'UNICEF',
        rep_id: 'sr2', rep_name: 'Yolanda Chigaigai',
        product_description: '300x branded caps — structured 6-panel cotton twill, UNICEF blue with embroidered logo front and back. 200x tote bags — natural canvas 38x42cm, screen-printed UNICEF logo in blue.',
        quantity: 500,
        unit_of_measure: 'Units',
        supplier_cost: 2250.00,
        client_charge: 2925.00,
        delivery_deadline: '2026-03-15',
        status: 'approved',
        created_by: 'Yolanda Chigaigai',
        created_by_role: 'sales_rep',
        created_at: '2026-02-20T09:00:00Z',
        updated_at: '2026-02-28T16:00:00Z',
        signing_trail: [
            { stage: 'submitted', actor_name: 'Yolanda Chigaigai', actor_role: 'Sales Rep', timestamp: '2026-02-20T09:00:00Z' },
            { stage: 'manager_signed', actor_name: 'Lucia Chiwanza', actor_role: 'Sales Manager', timestamp: '2026-02-24T11:00:00Z' },
            { stage: 'executive_signed', actor_name: 'Kingstone Mhako', actor_role: 'Managing Director', timestamp: '2026-02-28T16:00:00Z' },
            { stage: 'approved', actor_name: 'Kingstone Mhako', actor_role: 'Managing Director', timestamp: '2026-02-28T16:00:00Z' },
        ],
        doc_client_po: 'UNICEF_PO_Caps_Bags.pdf',
        doc_supplier_quote: 'KMQ_Caps_Bags_Quote.pdf',
    },

    // 5 — REJECTED — Chiedza Jowa / Amrod / Farm & City
    {
        id: 'io5',
        ref: 'IMP-2026-0005',
        supplier: 'Amrod',
        client_name: 'Farm & City',
        rep_id: 'sr3', rep_name: 'Chiedza Jowa',
        product_description: '100x branded golf umbrellas — auto-open 60" windproof frame, Farm & City colour palette (green/yellow), printed panels with logo. Fibreglass shaft, rubber handle.',
        quantity: 100,
        unit_of_measure: 'Units',
        supplier_cost: 1200.00,
        client_charge: 1560.00,
        delivery_deadline: '2026-03-20',
        status: 'rejected',
        created_by: 'Chiedza Jowa',
        created_by_role: 'sales_rep',
        created_at: '2026-02-25T08:00:00Z',
        updated_at: '2026-02-27T10:30:00Z',
        signing_trail: [
            { stage: 'submitted', actor_name: 'Chiedza Jowa', actor_role: 'Sales Rep', timestamp: '2026-02-25T08:00:00Z' },
            { stage: 'rejected', actor_name: 'Lucia Chiwanza', actor_role: 'Sales Manager', timestamp: '2026-02-27T10:30:00Z', note: 'Client PO attached is outdated (Jan 2026 version). Please resubmit with the current signed PO from the Farm & City procurement officer. Also confirm umbrella colour spec in writing from the client.' },
        ],
        doc_client_po: 'FarmCity_PO_Jan2026_OUTDATED.pdf',
        doc_supplier_quote: 'Amrod_Umbrella_Quote.pdf',
    },

    // 6 — COMPLETED — Sandra Mwanza / KMQ / TM Msasa
    {
        id: 'io6',
        ref: 'IMP-2026-0006',
        supplier: 'KMQ',
        client_name: 'TM Msasa',
        rep_id: 'sr6', rep_name: 'Sandra Mwanza',
        product_description: '800x branded aprons — heavy duty cotton twill, TM Supermarkets blue, screen-printed chest logo + name badge patch. 200x branded staff cap — structured navy, embroidered TM logo.',
        quantity: 1000,
        unit_of_measure: 'Units',
        supplier_cost: 3100.00,
        client_charge: 4030.00,
        delivery_deadline: '2026-02-28',
        status: 'completed',
        created_by: 'Sandra Mwanza',
        created_by_role: 'sales_rep',
        created_at: '2026-02-01T09:00:00Z',
        updated_at: '2026-02-26T17:00:00Z',
        signing_trail: [
            { stage: 'submitted', actor_name: 'Sandra Mwanza', actor_role: 'Sales Rep', timestamp: '2026-02-01T09:00:00Z' },
            { stage: 'manager_signed', actor_name: 'Lucia Chiwanza', actor_role: 'Sales Manager', timestamp: '2026-02-05T14:00:00Z' },
            { stage: 'executive_signed', actor_name: 'Kingstone Mhako', actor_role: 'Managing Director', timestamp: '2026-02-07T09:30:00Z' },
            { stage: 'approved', actor_name: 'Kingstone Mhako', actor_role: 'Managing Director', timestamp: '2026-02-07T09:30:00Z' },
            { stage: 'completed', actor_name: 'Sandra Mwanza', actor_role: 'Sales Rep', timestamp: '2026-02-26T17:00:00Z' },
        ],
        doc_client_po: 'TM_Msasa_PO_Aprons_Caps.pdf',
        doc_supplier_quote: 'KMQ_Aprons_Caps_Quote.pdf',
        doc_proof_of_payment: 'TM_Msasa_EFT_Confirmation.pdf',
    },
]

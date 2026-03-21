// ─── lib/production.ts ────────────────────────────────────────────────────────
// Types, helpers, and mock data for the Production Order Tracker module.
// All state is local/mock — no Supabase wiring yet.

export type ProductionStage =
    | 'received'
    | 'in_production'
    | 'quality_check'
    | 'ready_for_dispatch'
    | 'delivered'

export type Priority = 'urgent' | 'high' | 'normal'

export type DeptStatus = 'pending' | 'in_progress' | 'completed'

export type Department =
    | 'Caps Department'
    | 'Sewing Department'
    | 'Dispatch Department'
    | 'Bralyn Printing'
    | 'Bralyn Embroidery'
    | 'Bralyn Litho'

export const ALL_DEPARTMENTS: Department[] = [
    'Caps Department',
    'Sewing Department',
    'Dispatch Department',
    'Bralyn Printing',
    'Bralyn Embroidery',
    'Bralyn Litho',
]

export interface DeptStep {
    department: Department
    status: DeptStatus
    units_in?: number
    units_out?: number
    started_at?: string  // ISO
    completed_at?: string
    completed_by?: string
    notes?: string
}

export interface ActivityEntry {
    id: string
    action: string
    user: string
    timestamp: string
    type: 'created' | 'stage_advanced' | 'dept_started' | 'dept_completed' | 'priority_changed' | 'note_added' | 'draft_saved'
}

export interface ProductionOrder {
    id: string
    ref: string              // PRD-YYYY-NNNN
    stage: ProductionStage
    priority: Priority
    client_name: string
    deal_ref: string         // sales deal reference
    rep_name: string
    deal_value: number
    product_description: string
    total_quantity: number
    unit_of_measure: 'Units' | 'Sets' | 'Pairs' | 'Boxes'
    units_completed: number
    delivery_deadline: string // ISO date
    internal_notes?: string
    dept_sequence: DeptStep[]
    activity_log: ActivityEntry[]
    created_at: string
    created_by: string
    is_draft?: boolean
}

// ─── Stage metadata ────────────────────────────────────────────────────────────
export const STAGE_LABELS: Record<ProductionStage, string> = {
    received: 'Received',
    in_production: 'In Production',
    quality_check: 'Quality Check',
    ready_for_dispatch: 'Ready for Dispatch',
    delivered: 'Delivered',
}

export const STAGE_ORDER: ProductionStage[] = [
    'received', 'in_production', 'quality_check', 'ready_for_dispatch', 'delivered',
]

export function nextStage(current: ProductionStage): ProductionStage | null {
    const i = STAGE_ORDER.indexOf(current)
    return i < STAGE_ORDER.length - 1 ? STAGE_ORDER[i + 1] : null
}

export const STAGE_COLORS: Record<ProductionStage, string> = {
    received: 'bg-slate-100 text-slate-600',
    in_production: 'bg-brand-100 text-brand-700',
    quality_check: 'bg-amber-100 text-amber-700',
    ready_for_dispatch: 'bg-emerald-100 text-emerald-700',
    delivered: 'bg-purple-100 text-purple-700',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
    urgent: 'bg-red-100 text-red-700',
    high: 'bg-amber-100 text-amber-700',
    normal: 'bg-slate-100 text-slate-500',
}

export const PRIORITY_BORDER: Record<Priority, string> = {
    urgent: 'border-l-4 border-red-400',
    high: 'border-l-4 border-amber-400',
    normal: '',
}

export const PRIORITY_SORT: Record<Priority, number> = { urgent: 0, high: 1, normal: 2 }

// ─── Deadline helpers ──────────────────────────────────────────────────────────
const TODAY = new Date('2026-03-06').setHours(0, 0, 0, 0)

export function daysRemaining(deadline: string): number {
    return Math.ceil((new Date(deadline).setHours(0, 0, 0, 0) - TODAY) / 86400000)
}

export function deadlineColor(days: number): string {
    if (days < 0) return 'bg-red-100 text-red-600'
    if (days <= 1) return 'bg-red-100 text-red-600'
    if (days <= 4) return 'bg-amber-100 text-amber-700'
    return 'bg-emerald-100 text-emerald-700'
}

export function deadlineLabel(days: number): string {
    if (days < 0) return `${Math.abs(days)}d overdue`
    if (days === 0) return 'Due today'
    if (days === 1) return '1d left'
    return `${days}d left`
}

// ─── Current dept (for in_production cards) ───────────────────────────────────
export function currentDept(order: ProductionOrder): Department | null {
    const active = order.dept_sequence.find(s => s.status === 'in_progress')
    if (active) return active.department
    const next = order.dept_sequence.find(s => s.status === 'pending')
    return next?.department ?? null
}

// ─── Next ref ─────────────────────────────────────────────────────────────────
export function nextOrderRef(orders: ProductionOrder[]): string {
    const year = 2026
    const nums = orders.filter(o => o.ref.startsWith(`PRD-${year}`)).map(o => parseInt(o.ref.split('-')[2] ?? '0'))
    return `PRD-${year}-${(Math.max(0, ...nums) + 1).toString().padStart(4, '0')}`
}

// ─── Mock data ────────────────────────────────────────────────────────────────
export const MOCK_PRODUCTION_ORDERS: ProductionOrder[] = [
    // 1. URGENT — UNICEF floppy hats, in_production, deadline in 2 days
    {
        id: 'prd1',
        ref: 'PRD-2026-0001',
        stage: 'in_production',
        priority: 'urgent',
        client_name: 'UNICEF',
        deal_ref: 'INV-106998',
        rep_name: 'Yolanda Chigaigai',
        deal_value: 1368.68,
        product_description: '2000x floppy hats — UNICEF branding, tan canvas, printed logo on front panel, adjustable strap',
        total_quantity: 2000,
        unit_of_measure: 'Units',
        units_completed: 800,
        delivery_deadline: '2026-03-08',
        dept_sequence: [
            { department: 'Sewing Department', status: 'in_progress', units_in: 2000, started_at: '2026-03-04T08:00:00Z' },
            { department: 'Dispatch Department', status: 'pending' },
        ],
        activity_log: [
            { id: 'a1', action: 'Production order PRD-2026-0001 created for UNICEF — 2000x floppy hats · Deadline: 8 Mar 2026 · Priority: Urgent', user: 'Tinotenda Kufinya', timestamp: '2026-03-03T07:30:00Z', type: 'created' },
            { id: 'a2', action: 'Sewing Department marked In Progress — 2000 units entered', user: 'Lucia Chiwanza', timestamp: '2026-03-04T08:05:00Z', type: 'dept_started' },
            { id: 'a3', action: 'Note: UNICEF wants daily progress updates ahead of the critical deadline. Expedite all steps.', user: 'Lucia Chiwanza', timestamp: '2026-03-04T08:10:00Z', type: 'note_added' },
        ],
        created_at: '2026-03-03T07:30:00Z',
        created_by: 'Tinotenda Kufinya',
    },

    // 2. URGENT — BAT jeans, quality_check globally, deadline in 3 days
    {
        id: 'prd2',
        ref: 'PRD-2026-0002',
        stage: 'quality_check',
        priority: 'urgent',
        client_name: 'BAT',
        deal_ref: 'INV-106970',
        rep_name: 'Thandeka Madeya',
        deal_value: 22723.26,
        product_description: '300x branded jeans — BAT corporate navy, embossed logo on back pocket, slim-fit cut, mixed sizes per sizing chart',
        total_quantity: 300,
        unit_of_measure: 'Units',
        units_completed: 300,
        delivery_deadline: '2026-03-09',
        dept_sequence: [
            { department: 'Sewing Department', status: 'completed', units_in: 300, units_out: 300, started_at: '2026-03-02T08:00:00Z', completed_at: '2026-03-05T16:00:00Z', completed_by: 'Lucia Chiwanza' },
            { department: 'Dispatch Department', status: 'pending' },
        ],
        activity_log: [
            { id: 'b1', action: 'Production order PRD-2026-0002 created for BAT — 300x jeans · Deadline: 9 Mar 2026 · Priority: Urgent', user: 'Tinotenda Kufinya', timestamp: '2026-03-01T09:00:00Z', type: 'created' },
            { id: 'b2', action: 'Sewing Department marked In Progress — 300 units entered', user: 'Lucia Chiwanza', timestamp: '2026-03-02T08:05:00Z', type: 'dept_started' },
            { id: 'b3', action: 'Sewing Department marked Complete — 300 units out. Stage advanced to Quality Check', user: 'Lucia Chiwanza', timestamp: '2026-03-05T16:00:00Z', type: 'dept_completed' },
        ],
        created_at: '2026-03-01T09:00:00Z',
        created_by: 'Tinotenda Kufinya',
    },

    // 3. HIGH — MOHCC printed workwear, in_production, deadline in 8 days
    {
        id: 'prd3',
        ref: 'PRD-2026-0003',
        stage: 'in_production',
        priority: 'high',
        client_name: 'MOHCC',
        deal_ref: 'INV-TBC-MOHCC',
        rep_name: 'Sylvester Chigova',
        deal_value: 164208.96,
        product_description: '5000x printed workwear — MOHCC logo full-chest Bralyn litho print, embroidered departmental badges on sleeves, green & white colourway',
        total_quantity: 5000,
        unit_of_measure: 'Units',
        units_completed: 1200,
        delivery_deadline: '2026-03-14',
        dept_sequence: [
            { department: 'Bralyn Printing', status: 'in_progress', units_in: 5000, started_at: '2026-03-03T08:00:00Z' },
            { department: 'Bralyn Embroidery', status: 'pending' },
            { department: 'Dispatch Department', status: 'pending' },
        ],
        activity_log: [
            { id: 'c1', action: 'Production order PRD-2026-0003 created for MOHCC — 5000x printed workwear · Deadline: 14 Mar 2026 · Priority: High', user: 'Tinotenda Kufinya', timestamp: '2026-03-02T10:00:00Z', type: 'created' },
            { id: 'c2', action: 'Bralyn Printing marked In Progress — 5000 units entered', user: 'Lucia Chiwanza', timestamp: '2026-03-03T08:05:00Z', type: 'dept_started' },
            { id: 'c3', action: 'Note: Confirm MOHCC Pantone colour codes before proceeding to Embroidery. See email from Sylvester 03/03.', user: 'Tinotenda Kufinya', timestamp: '2026-03-03T09:00:00Z', type: 'note_added' },
        ],
        created_at: '2026-03-02T10:00:00Z',
        created_by: 'Tinotenda Kufinya',
    },

    // 4. HIGH — Schweppes caps + T-shirts, in_production, deadline in 6 days
    {
        id: 'prd4',
        ref: 'PRD-2026-0004',
        stage: 'in_production',
        priority: 'high',
        client_name: 'Schweppes',
        deal_ref: 'INV-106966',
        rep_name: 'Dudzai Ndemera',
        deal_value: 1371.80,
        product_description: '400x promotional caps + 400x branded T-shirts — Schweppes green & yellow, screen-printed logo, structured cap front',
        total_quantity: 800,
        unit_of_measure: 'Units',
        units_completed: 0,
        delivery_deadline: '2026-03-12',
        dept_sequence: [
            { department: 'Caps Department', status: 'in_progress', units_in: 400, started_at: '2026-03-05T08:00:00Z' },
            { department: 'Bralyn Printing', status: 'pending' },
            { department: 'Dispatch Department', status: 'pending' },
        ],
        activity_log: [
            { id: 'd1', action: 'Production order PRD-2026-0004 created for Schweppes — 800x caps & T-shirts · Deadline: 12 Mar 2026 · Priority: High', user: 'Tinotenda Kufinya', timestamp: '2026-03-04T14:00:00Z', type: 'created' },
            { id: 'd2', action: 'Caps Department marked In Progress — 400 caps entered', user: 'Lucia Chiwanza', timestamp: '2026-03-05T08:05:00Z', type: 'dept_started' },
        ],
        created_at: '2026-03-04T14:00:00Z',
        created_by: 'Tinotenda Kufinya',
    },

    // 5. NORMAL — TM Msasa blouses, ready_for_dispatch
    {
        id: 'prd5',
        ref: 'PRD-2026-0005',
        stage: 'ready_for_dispatch',
        priority: 'normal',
        client_name: 'TM Msasa',
        deal_ref: 'INV-106991',
        rep_name: 'Sandra Mwanza',
        deal_value: 853.10,
        product_description: '250x blouses + 250x long trousers — TM Msasa staff uniform, corporate teal, embroidered name badge positioning on chest',
        total_quantity: 500,
        unit_of_measure: 'Units',
        units_completed: 500,
        delivery_deadline: '2026-03-10',
        dept_sequence: [
            { department: 'Sewing Department', status: 'completed', units_in: 500, units_out: 500, started_at: '2026-02-26T08:00:00Z', completed_at: '2026-03-02T17:00:00Z', completed_by: 'Lucia Chiwanza' },
            { department: 'Dispatch Department', status: 'completed', units_in: 500, units_out: 500, started_at: '2026-03-03T08:00:00Z', completed_at: '2026-03-04T12:00:00Z', completed_by: 'Tinotenda Kufinya' },
        ],
        activity_log: [
            { id: 'e1', action: 'Production order PRD-2026-0005 created for TM Msasa — 500x blouses & trousers · Deadline: 10 Mar 2026 · Priority: Normal', user: 'Tinotenda Kufinya', timestamp: '2026-02-25T10:00:00Z', type: 'created' },
            { id: 'e2', action: 'Sewing Department completed — 500 units out. Stage advanced to Quality Check', user: 'Lucia Chiwanza', timestamp: '2026-03-02T17:00:00Z', type: 'dept_completed' },
            { id: 'e3', action: 'Stage advanced: Quality Check → Ready for Dispatch', user: 'Lucia Chiwanza', timestamp: '2026-03-03T07:55:00Z', type: 'stage_advanced' },
        ],
        created_at: '2026-02-25T10:00:00Z',
        created_by: 'Tinotenda Kufinya',
    },

    // 6. NORMAL — ZIMRA straw hats, in_production
    {
        id: 'prd6',
        ref: 'PRD-2026-0006',
        stage: 'in_production',
        priority: 'normal',
        client_name: 'ZIMRA',
        deal_ref: 'INV-106946',
        rep_name: 'Yolanda Chigaigai',
        deal_value: 1839.34,
        product_description: '600x straw hats — ZIMRA branded, natural straw weave, navy ribbon trim, embossed ZIMRA crest on front',
        total_quantity: 600,
        unit_of_measure: 'Units',
        units_completed: 240,
        delivery_deadline: '2026-03-18',
        dept_sequence: [
            { department: 'Caps Department', status: 'in_progress', units_in: 600, started_at: '2026-03-04T08:00:00Z' },
            { department: 'Dispatch Department', status: 'pending' },
        ],
        activity_log: [
            { id: 'f1', action: 'Production order PRD-2026-0006 created for ZIMRA — 600x straw hats · Deadline: 18 Mar 2026 · Priority: Normal', user: 'Tinotenda Kufinya', timestamp: '2026-03-03T11:00:00Z', type: 'created' },
            { id: 'f2', action: 'Caps Department marked In Progress — 600 units entered', user: 'Lucia Chiwanza', timestamp: '2026-03-04T08:05:00Z', type: 'dept_started' },
        ],
        created_at: '2026-03-03T11:00:00Z',
        created_by: 'Tinotenda Kufinya',
    },

    // 7. NORMAL — Delta Lagers T-shirts + caps, received
    {
        id: 'prd7',
        ref: 'PRD-2026-0007',
        stage: 'received',
        priority: 'normal',
        client_name: 'Delta Lagers',
        deal_ref: 'INV-107001',
        rep_name: 'Yolanda Chigaigai',
        deal_value: 2217.60,
        product_description: '800x branded T-shirts + 400x caps — Delta Lagers gold & green, full-chest silk screen print, structured cap with embossed logo',
        total_quantity: 1200,
        unit_of_measure: 'Units',
        units_completed: 0,
        delivery_deadline: '2026-03-22',
        dept_sequence: [
            { department: 'Caps Department', status: 'pending' },
            { department: 'Bralyn Printing', status: 'pending' },
            { department: 'Dispatch Department', status: 'pending' },
        ],
        activity_log: [
            { id: 'g1', action: 'Production order PRD-2026-0007 created for Delta Lagers — 1200x T-shirts & caps · Deadline: 22 Mar 2026 · Priority: Normal', user: 'Tinotenda Kufinya', timestamp: '2026-03-05T09:00:00Z', type: 'created' },
            { id: 'g2', action: 'Note: Await Delta Lagers sign-off on artwork proof before entering Caps Department.', user: 'Tinotenda Kufinya', timestamp: '2026-03-05T09:05:00Z', type: 'note_added' },
        ],
        created_at: '2026-03-05T09:00:00Z',
        created_by: 'Tinotenda Kufinya',
    },

    // 8. COMPLETED — JF Kapnek G-shirts, delivered
    {
        id: 'prd8',
        ref: 'PRD-2026-0008',
        stage: 'delivered',
        priority: 'normal',
        client_name: 'JF Kapnek',
        deal_ref: 'INV-245',
        rep_name: 'Spiwe Mandizha',
        deal_value: 2108.45,
        product_description: '400x G-shirts — JF Kapnek charity branding, white moisture-wicking fabric, embroidered red cross + JF Kapnek text on chest',
        total_quantity: 400,
        unit_of_measure: 'Units',
        units_completed: 400,
        delivery_deadline: '2026-03-04',
        dept_sequence: [
            { department: 'Sewing Department', status: 'completed', units_in: 400, units_out: 400, started_at: '2026-02-24T08:00:00Z', completed_at: '2026-02-28T16:00:00Z', completed_by: 'Lucia Chiwanza' },
            { department: 'Dispatch Department', status: 'completed', units_in: 400, units_out: 400, started_at: '2026-03-01T08:00:00Z', completed_at: '2026-03-03T14:00:00Z', completed_by: 'Tinotenda Kufinya' },
        ],
        activity_log: [
            { id: 'h1', action: 'Production order PRD-2026-0008 created for JF Kapnek — 400x G-shirts · Deadline: 4 Mar 2026 · Priority: Normal', user: 'Tinotenda Kufinya', timestamp: '2026-02-23T10:00:00Z', type: 'created' },
            { id: 'h2', action: 'Sewing Department completed — 400 units out', user: 'Lucia Chiwanza', timestamp: '2026-02-28T16:00:00Z', type: 'dept_completed' },
            { id: 'h3', action: 'Stage advanced: Quality Check → Ready for Dispatch → Delivered', user: 'Lucia Chiwanza', timestamp: '2026-03-04T09:00:00Z', type: 'stage_advanced' },
        ],
        created_at: '2026-02-23T10:00:00Z',
        created_by: 'Tinotenda Kufinya',
    },
]

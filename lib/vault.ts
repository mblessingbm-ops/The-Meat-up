// lib/vault.ts — Document Vault data layer

export type VaultCategory = 'compliance' | 'contracts' | 'sla' | 'legal'
export type VaultCompany = 'Kingsport' | 'Bralyn' | 'SGA'
export type LinkedToType = 'client' | 'supplier' | 'company_wide'
export type DocStatus = 'active' | 'expiring_soon' | 'expired' | 'no_expiry'

export interface VaultVersion {
    file_name: string
    uploaded_by: string
    uploaded_by_full: string
    uploaded_at: string
    notes?: string
}

export interface VaultDoc {
    id: string
    title: string
    doc_type: string          // free text: "Tax Clearance Certificate" etc.
    category: VaultCategory
    company: VaultCompany
    linked_to: LinkedToType
    linked_entity?: string    // client or supplier name
    issue_date?: string
    expiry_date?: string
    renewal_alert_days?: number  // 7 | 14 | 30 | 60
    tags: string[]
    notes?: string
    file_name: string
    uploaded_by: string       // first name
    uploaded_by_full: string
    uploaded_at: string
    last_updated_by?: string
    last_updated_at?: string
    restricted_to?: string[]  // roles — if set, only these roles can see the doc
    version_history: VaultVersion[]
}

// ── Dates ─────────────────────────────────────────────────────────────────────
const TODAY = new Date('2026-03-06')

export function daysUntilExpiry(doc: VaultDoc): number | null {
    if (!doc.expiry_date) return null
    const exp = new Date(doc.expiry_date)
    return Math.ceil((exp.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24))
}

export function getDocStatus(doc: VaultDoc): DocStatus {
    const days = daysUntilExpiry(doc)
    if (days === null) return 'no_expiry'
    if (days < 0) return 'expired'
    if (days <= 30) return 'expiring_soon'
    return 'active'
}

export function expiryLabel(doc: VaultDoc): string | null {
    const days = daysUntilExpiry(doc)
    if (days === null) return null
    if (days < 0) return `Expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`
    if (days === 0) return 'Expires today'
    if (days === 1) return 'Expires tomorrow'
    if (days <= 30) return `Expires in ${days} days`
    return `Expires ${new Date(doc.expiry_date!).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

export function expiryColor(doc: VaultDoc): string {
    const status = getDocStatus(doc)
    if (status === 'expired') return 'text-red-600'
    if (status === 'expiring_soon') return 'text-amber-600'
    return 'text-emerald-600'
}

// ── Category config ───────────────────────────────────────────────────────────
export const CATEGORY_LABELS: Record<VaultCategory, string> = {
    compliance: 'Compliance & Tender',
    contracts: 'Contract',
    sla: 'Client SLA',
    legal: 'Legal & Registration',
}

export const CATEGORY_BADGE: Record<VaultCategory, string> = {
    compliance: 'bg-purple-100 text-purple-700',
    contracts: 'bg-blue-100 text-blue-700',
    sla: 'bg-teal-100 text-teal-700',
    legal: 'bg-amber-100 text-amber-700',
}

export const COMPANY_BADGE: Record<VaultCompany, string> = {
    Kingsport: 'bg-indigo-100 text-indigo-700',
    Bralyn: 'bg-emerald-100 text-emerald-700',
    SGA: 'bg-orange-100 text-orange-700',
}

export const STATUS_BADGE: Record<DocStatus, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    expiring_soon: 'bg-amber-100 text-amber-700',
    expired: 'bg-red-100 text-red-600',
    no_expiry: 'bg-slate-100 text-slate-500',
}

export const STATUS_LABEL: Record<DocStatus, string> = {
    active: 'Active',
    expiring_soon: 'Expiring Soon',
    expired: 'Expired',
    no_expiry: '—',
}

export const SUGGESTED_TAGS: Record<VaultCategory, string[]> = {
    compliance: ['ZIMRA', 'NSSA', 'Tender', 'Insurance', '2026'],
    contracts: ['Government', 'Supply', 'Annual'],
    sla: ['SLA', 'Branded', 'Annual'],
    legal: ['Legal', 'Registration', 'Certificate'],
}

// ── Mock data — 10 real documents ─────────────────────────────────────────────
export const INITIAL_VAULT_DOCS: VaultDoc[] = [
    // ── KINGSPORT ─────────────────────────────────────────────────────────────
    {
        id: 'vk1',
        title: 'ZIMRA Tax Clearance Certificate 2026',
        doc_type: 'Tax Clearance Certificate',
        category: 'compliance', company: 'Kingsport',
        linked_to: 'company_wide',
        issue_date: '2026-01-01', expiry_date: '2026-12-31',
        renewal_alert_days: 30,
        tags: ['ZIMRA', 'Tax', '2026', 'Tender'],
        notes: 'Valid for all tender submissions. Renew by December 2026.',
        file_name: 'ZIMRA_Tax_Clearance_2026_Kingsport.pdf',
        uploaded_by: 'Ashleigh', uploaded_by_full: 'Ashleigh Kurira',
        uploaded_at: '2026-01-05',
        version_history: [],
    },
    {
        id: 'vk2',
        title: 'NSSA Clearance Certificate Q1 2026',
        doc_type: 'NSSA Clearance Certificate',
        category: 'compliance', company: 'Kingsport',
        linked_to: 'company_wide',
        issue_date: '2026-01-01', expiry_date: '2026-03-15',  // 9 days — expiring soon
        tags: ['NSSA', 'Compliance', 'Tender'],
        file_name: 'NSSA_Clearance_Q1_2026_Kingsport.pdf',
        uploaded_by: 'Ashleigh', uploaded_by_full: 'Ashleigh Kurira',
        uploaded_at: '2026-01-05',
        version_history: [],
    },
    {
        id: 'vk3',
        title: 'Public Liability Insurance Certificate 2026',
        doc_type: 'Insurance Certificate',
        category: 'compliance', company: 'Kingsport',
        linked_to: 'company_wide',
        expiry_date: '2026-06-30',
        tags: ['Insurance', 'Tender'],
        file_name: 'Public_Liability_Insurance_2026_Kingsport.pdf',
        uploaded_by: 'Nothando', uploaded_by_full: 'Nothando Ncube',
        uploaded_at: '2026-01-10',
        version_history: [],
    },
    {
        id: 'vk4',
        title: 'Certificate of Incorporation — Kingsport Investments',
        doc_type: 'Certificate of Incorporation',
        category: 'legal', company: 'Kingsport',
        linked_to: 'company_wide',
        tags: ['Legal', 'Registration'],
        notes: 'Original certificate. No expiry.',
        file_name: 'Certificate_of_Incorporation_Kingsport.pdf',
        uploaded_by: 'Kingstone', uploaded_by_full: 'Kingstone Mhako',
        uploaded_at: '2025-01-01',
        version_history: [],
    },
    {
        id: 'vk7',
        title: 'Kingsport Investments — Banking Details Confirmation Letter',
        doc_type: 'Banking Confirmation',
        category: 'legal', company: 'Kingsport',
        linked_to: 'company_wide',
        tags: ['Banking', 'Stanbic', 'CBZ', 'First Capital', 'FBC', 'Finance'],
        notes: 'Official banking details confirmation for Kingsport Investments. Present to clients or suppliers requesting verified banking details.',
        file_name: 'Kingsport_Banking_Details_Confirmation_Letter_16Mar2026.pdf',
        uploaded_by: 'Ashleigh', uploaded_by_full: 'Ashleigh Kurira',
        uploaded_at: '2026-03-16',
        // No expiry_date — no expiry
        version_history: [],
        // Custom flag — tells VaultDetailDrawer to render the live letter component
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    {
        id: 'vk5',
        title: 'MOHCC Master Supply Agreement 2025',
        doc_type: 'Master Supply Agreement',
        category: 'contracts', company: 'Kingsport',
        linked_to: 'client', linked_entity: 'MOHCC',
        tags: ['Government', 'Supply', 'MOHCC'],
        notes: 'Covers all workwear and PPE supply. Review annually.',
        file_name: 'MOHCC_Master_Supply_Agreement_2025.pdf',
        uploaded_by: 'Sylvester', uploaded_by_full: 'Sylvester Chigova',
        uploaded_at: '2025-06-15',
        version_history: [],
    },
    {
        id: 'vk6',
        title: 'BAT Service Level Agreement — Branded Merchandise',
        doc_type: 'Service Level Agreement',
        category: 'sla', company: 'Kingsport',
        linked_to: 'client', linked_entity: 'BAT',
        expiry_date: '2026-12-31',
        renewal_alert_days: 60,
        tags: ['BAT', 'SLA', 'Branded'],
        file_name: 'BAT_SLA_Branded_Merchandise_2026.pdf',
        uploaded_by: 'Thandeka', uploaded_by_full: 'Thandeka Madeya',
        uploaded_at: '2026-01-20',
        version_history: [],
    },

    // ── BRALYN ────────────────────────────────────────────────────────────────
    {
        id: 'vb1',
        title: 'ZIMRA Tax Clearance Certificate 2026 — Bralyn',
        doc_type: 'Tax Clearance Certificate',
        category: 'compliance', company: 'Bralyn',
        linked_to: 'company_wide',
        issue_date: '2026-01-01', expiry_date: '2026-12-31',
        renewal_alert_days: 30,
        tags: ['ZIMRA', 'Tax', '2026', 'Tender'],
        file_name: 'ZIMRA_Tax_Clearance_2026_Bralyn.pdf',
        uploaded_by: 'Ashleigh', uploaded_by_full: 'Ashleigh Kurira',
        uploaded_at: '2026-01-05',
        version_history: [],
    },
    {
        id: 'vb2',
        title: 'NSSA Clearance Certificate Q1 2026 — Bralyn',
        doc_type: 'NSSA Clearance Certificate',
        category: 'compliance', company: 'Bralyn',
        linked_to: 'company_wide',
        expiry_date: '2026-02-15',   // EXPIRED
        tags: ['NSSA', 'Compliance'],
        notes: 'Requires renewal — Q2 certificate not yet received.',
        file_name: 'NSSA_Clearance_Q1_2026_Bralyn.pdf',
        uploaded_by: 'Nothando', uploaded_by_full: 'Nothando Ncube',
        uploaded_at: '2026-01-10',
        version_history: [],
    },
    {
        id: 'vb3',
        title: 'Certificate of Incorporation — Bralyn Manufacturing',
        doc_type: 'Certificate of Incorporation',
        category: 'legal', company: 'Bralyn',
        linked_to: 'company_wide',
        tags: ['Legal', 'Registration'],
        file_name: 'Certificate_of_Incorporation_Bralyn.pdf',
        uploaded_by: 'Kingstone', uploaded_by_full: 'Kingstone Mhako',
        uploaded_at: '2025-01-01',
        version_history: [],
    },
    {
        id: 'vb4',
        title: 'UNICEF Supply Framework Agreement',
        doc_type: 'Supply Framework Agreement',
        category: 'contracts', company: 'Bralyn',
        linked_to: 'client', linked_entity: 'UNICEF',
        expiry_date: '2026-12-31',
        renewal_alert_days: 30,
        tags: ['UNICEF', 'NGO', 'Supply'],
        notes: 'Annual framework. Covers bags, caps and uniforms.',
        file_name: 'UNICEF_Supply_Framework_Agreement_2026.pdf',
        uploaded_by: 'Yolanda', uploaded_by_full: 'Yolanda Chigaigai',
        uploaded_at: '2026-01-15',
        version_history: [],
    },
]

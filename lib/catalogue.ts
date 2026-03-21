// lib/catalogue.ts — Catalogue & Reference Library data layer

export type CatalogueSupplier = 'Amrod' | 'KMQ' | 'Other'
export type CatalogueDocType = 'catalogue' | 'supplier_quote' | 'order_reference'

export interface CatalogueDoc {
    id: string
    title: string
    supplier: CatalogueSupplier
    doc_type: CatalogueDocType
    uploaded_by: string       // first name only
    uploaded_by_full: string  // full name
    uploaded_at: string       // ISO date
    valid_from?: string
    valid_until?: string
    linked_client?: string
    linked_order?: string     // IMP-YYYY-NNNN
    notes?: string
    file_name: string
    file_url?: string         // mock — blob URL or placeholder
}

const TODAY = new Date('2026-03-06')

export function isExpired(doc: CatalogueDoc): boolean {
    if (!doc.valid_until) return false
    return new Date(doc.valid_until) < TODAY
}

export function isExpiringSoon(doc: CatalogueDoc): boolean {
    if (!doc.valid_until) return false
    const d = new Date(doc.valid_until)
    const diff = (d.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 14
}

export const DOC_TYPE_LABELS: Record<CatalogueDocType, string> = {
    catalogue: 'Catalogue',
    supplier_quote: 'Supplier Quote',
    order_reference: 'Order Reference',
}

export const SUPPLIER_BADGE_COLORS: Record<CatalogueSupplier, string> = {
    Amrod: 'bg-blue-100 text-blue-700',
    KMQ: 'bg-teal-100 text-teal-700',
    Other: 'bg-slate-100 text-slate-600',
}

export const DOC_TYPE_BADGE_COLORS: Record<CatalogueDocType, string> = {
    catalogue: 'bg-indigo-50 text-indigo-600',
    supplier_quote: 'bg-amber-50 text-amber-700',
    order_reference: 'bg-purple-50 text-purple-700',
}

// ── Mock data — 5 pre-populated documents ─────────────────────────────────────
export const INITIAL_CATALOGUE_DOCS: CatalogueDoc[] = [
    {
        id: 'cat1',
        title: 'Amrod 2026 Corporate Gifting Catalogue',
        supplier: 'Amrod',
        doc_type: 'catalogue',
        uploaded_by: 'Lucia',
        uploaded_by_full: 'Lucia Chiwanza',
        uploaded_at: '2026-01-05',
        valid_from: '2026-01-01',
        valid_until: '2026-12-31',
        notes: 'Latest catalogue. Covers all USB, power bank, bag and cap ranges.',
        file_name: 'Amrod_2026_Corporate_Gifting_Catalogue.pdf',
    },
    {
        id: 'cat2',
        title: 'Amrod Proforma — Schweppes Power Banks March 2026',
        supplier: 'Amrod',
        doc_type: 'supplier_quote',
        uploaded_by: 'Dudzai',
        uploaded_by_full: 'Dudzai Ndemera',
        uploaded_at: '2026-02-28',
        linked_client: 'Schweppes',
        linked_order: 'IMP-2026-0002',
        notes: 'Proforma received 28 Feb 2026. Prices valid for 30 days.',
        file_name: 'Amrod_Proforma_Schweppes_Power_Banks_Mar26.pdf',
    },
    {
        id: 'cat3',
        title: 'KMQ 2025 Product Range',
        supplier: 'KMQ',
        doc_type: 'catalogue',
        uploaded_by: 'Lucia',
        uploaded_by_full: 'Lucia Chiwanza',
        uploaded_at: '2025-12-15',
        valid_until: '2025-12-31',
        file_name: 'KMQ_2025_Product_Range.pdf',
    },
    {
        id: 'cat4',
        title: 'KMQ 2026 Updated Range',
        supplier: 'KMQ',
        doc_type: 'catalogue',
        uploaded_by: 'Thandeka',
        uploaded_by_full: 'Thandeka Madeya',
        uploaded_at: '2026-02-01',
        valid_from: '2026-02-01',
        valid_until: '2026-12-31',
        notes: 'New 2026 range. Caps, bags, diaries, and accessories. Supersedes the 2025 catalogue.',
        file_name: 'KMQ_2026_Updated_Range.pdf',
    },
    {
        id: 'cat5',
        title: 'KMQ Order — UNICEF Caps & Bags Jan 2026',
        supplier: 'KMQ',
        doc_type: 'order_reference',
        uploaded_by: 'Yolanda',
        uploaded_by_full: 'Yolanda Chigaigai',
        uploaded_at: '2026-01-28',
        linked_order: 'IMP-2026-0004',
        notes: 'Reference for repeat orders. Caps @ USD 3.20, bags @ USD 4.80. UNICEF branding specs attached.',
        file_name: 'KMQ_Order_UNICEF_Caps_Bags_Jan2026.pdf',
    },
]

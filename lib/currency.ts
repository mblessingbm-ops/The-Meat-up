// ─── lib/currency.ts ──────────────────────────────────────────────────────────
// Shared data layer for the dual-currency (USD / ZWG) feature + SGA entity.
// All figures derived from accounting module mock arrays — single source of truth.
//
// ENTITIES: Kingsport (USD + ZWG) | Bralyn (production) | SGA (USD only)
// SGA outstanding AR: USD 5,870.45 across 3 invoices (JF Kapnek, Chicken Slice, SACP)

export type Currency = 'USD' | 'ZWG'
export type CompanyEntity = 'Kingsport' | 'Bralyn' | 'SGA'

// ── Customer invoice type (mirrors accounting/page.tsx Invoice) ────────────────
export interface CurrencyInvoice {
    id: string; invoice_number: string; customer_name: string
    total_amount: number; currency: Currency; status: string
    issue_date: string; due_date: string; rep_name: string; product: string
    /** Which company entity this invoice belongs to */
    company?: CompanyEntity
}

// ── Supplier invoice (slimmed) ─────────────────────────────────────────────────
export interface CurrencySupplierInvoice {
    id: string; nexus_ref: string; supplier_name: string; category: string
    invoice_date: string; due_date: string; currency: Currency
    total_amount: number; status: 'draft' | 'unpaid' | 'overdue' | 'paid' | 'partial'
    company?: CompanyEntity
}

// ─── CUSTOMER INVOICES — Kingsport entity ─────────────────────────────────────
// NOTE: dn1 (SACP), pz1 (Chicken Slice), spw1 (JF Kapnek) moved to SGA_INVOICES
const KINGSPORT_INVOICES: CurrencyInvoice[] = [
    // Chiedza Jowa
    { id: 'cj1', invoice_number: 'INV-106921', customer_name: 'Farm & City', total_amount: 14748.50, currency: 'USD', status: 'overdue', issue_date: '2025-12-23', due_date: '2026-01-22', rep_name: 'Chiedza Jowa', product: 'T-Shirts', company: 'Kingsport' },
    { id: 'cj2', invoice_number: 'INV-106988', customer_name: 'Farm N City', total_amount: 9240.00, currency: 'USD', status: 'overdue', issue_date: '2026-02-20', due_date: '2026-03-22', rep_name: 'Chiedza Jowa', product: 'T-Shirts', company: 'Kingsport' },
    // Dudzai Ndemera — SACP moved to SGA
    { id: 'dn2', invoice_number: 'INV-106951', customer_name: 'JF Kapnek', total_amount: 7979.90, currency: 'USD', status: 'overdue', issue_date: '2026-01-23', due_date: '2026-02-22', rep_name: 'Dudzai Ndemera', product: 'T-Shirts / Floppy Hats', company: 'Kingsport' },
    { id: 'dn3', invoice_number: 'INV-106966', customer_name: 'Schweppes', total_amount: 1371.80, currency: 'USD', status: 'overdue', issue_date: '2026-02-04', due_date: '2026-03-06', rep_name: 'Dudzai Ndemera', product: 'Caps / T-Shirts', company: 'Kingsport' },
    { id: 'dn4', invoice_number: 'INV-106967', customer_name: 'Schweppes', total_amount: 4158.00, currency: 'USD', status: 'overdue', issue_date: '2026-02-05', due_date: '2026-03-07', rep_name: 'Dudzai Ndemera', product: 'Satchels', company: 'Kingsport' },
    { id: 'dn5', invoice_number: 'INV-106978', customer_name: 'NMB Bank', total_amount: 1154.88, currency: 'USD', status: 'overdue', issue_date: '2026-02-16', due_date: '2026-03-18', rep_name: 'Dudzai Ndemera', product: 'Snapper Frame', company: 'Kingsport' },
    { id: 'dn6', invoice_number: 'INV-106992', customer_name: 'Schweppes', total_amount: 204.89, currency: 'USD', status: 'sent', issue_date: '2026-02-23', due_date: '2026-03-25', rep_name: 'Dudzai Ndemera', product: 'Various Items', company: 'Kingsport' },
    { id: 'dn7', invoice_number: 'INV-107010', customer_name: 'Old Mutual', total_amount: 2887.50, currency: 'USD', status: 'sent', issue_date: '2026-03-03', due_date: '2026-04-02', rep_name: 'Dudzai Ndemera', product: 'T-Shirts', company: 'Kingsport' },
    // Lucia Chiwanza
    { id: 'lc1', invoice_number: 'INV-106980', customer_name: 'World Vision', total_amount: 269.92, currency: 'USD', status: 'overdue', issue_date: '2026-02-17', due_date: '2026-03-19', rep_name: 'Lucia Chiwanza', product: 'Raincoats', company: 'Kingsport' },
    { id: 'lc2', invoice_number: 'INV-106977', customer_name: 'TelOne', total_amount: 1779491.06, currency: 'ZWG', status: 'overdue', issue_date: '2026-02-16', due_date: '2026-03-18', rep_name: 'Lucia Chiwanza', product: 'Worksuits', company: 'Kingsport' },
    { id: 'lc3', invoice_number: 'INV-106989', customer_name: 'TelOne', total_amount: 325502.55, currency: 'ZWG', status: 'overdue', issue_date: '2026-02-20', due_date: '2026-03-22', rep_name: 'Lucia Chiwanza', product: 'Various Items', company: 'Kingsport' },
    // Priviledge Zimunya — Chicken Slice moved to SGA; Irvines stays Kingsport
    { id: 'pz2', invoice_number: 'INV-106994', customer_name: 'Irvines', total_amount: 2829.75, currency: 'USD', status: 'overdue', issue_date: '2026-02-24', due_date: '2026-03-26', rep_name: 'Priviledge Zimunya', product: 'T-Shirts', company: 'Kingsport' },
    // Sandra Mwanza
    { id: 'sm1', invoice_number: 'INV-106866', customer_name: 'TM Shurugwi', total_amount: 530.05, currency: 'USD', status: 'overdue', issue_date: '2025-12-12', due_date: '2026-01-11', rep_name: 'Sandra Mwanza', product: 'Blouse / Long Trousers', company: 'Kingsport' },
    { id: 'sm2', invoice_number: 'INV-106944', customer_name: 'TM Msasa', total_amount: 1161.59, currency: 'USD', status: 'overdue', issue_date: '2026-01-19', due_date: '2026-02-18', rep_name: 'Sandra Mwanza', product: 'Various Items', company: 'Kingsport' },
    { id: 'sm3', invoice_number: 'INV-106960', customer_name: 'TM Msasa', total_amount: 392.98, currency: 'USD', status: 'overdue', issue_date: '2026-02-03', due_date: '2026-03-05', rep_name: 'Sandra Mwanza', product: 'Various Items', company: 'Kingsport' },
    { id: 'sm4', invoice_number: 'INV-106990', customer_name: 'TM Msasa', total_amount: 236.43, currency: 'USD', status: 'sent', issue_date: '2026-02-23', due_date: '2026-03-25', rep_name: 'Sandra Mwanza', product: 'Blousers', company: 'Kingsport' },
    { id: 'sm5', invoice_number: 'INV-106991', customer_name: 'TM Msasa', total_amount: 853.10, currency: 'USD', status: 'sent', issue_date: '2026-02-23', due_date: '2026-03-25', rep_name: 'Sandra Mwanza', product: 'Blouse / Long Trousers', company: 'Kingsport' },
    { id: 'sm6', invoice_number: 'INV-107007', customer_name: 'EcoCash', total_amount: 12710.78, currency: 'USD', status: 'sent', issue_date: '2026-02-27', due_date: '2026-03-29', rep_name: 'Sandra Mwanza', product: 'Various Items', company: 'Kingsport' },
    // Spiwe Mandizha — JF Kapnek (INV-245) moved to SGA; no Kingsport invoices remain for Spiwe
    // Sylvester Chigova (Bralyn portfolio)
    { id: 'sc1', invoice_number: 'INV-TBC-ZINWA', customer_name: 'ZINWA', total_amount: 3565.00, currency: 'USD', status: 'overdue', issue_date: '2025-09-15', due_date: '2025-10-15', rep_name: 'Sylvester Chigova', product: 'T-Shirts', company: 'Bralyn' },
    { id: 'sc2', invoice_number: 'INV-TBC-PSC', customer_name: 'PSC', total_amount: 9753.00, currency: 'USD', status: 'overdue', issue_date: '2025-12-03', due_date: '2026-01-02', rep_name: 'Sylvester Chigova', product: 'Printing', company: 'Bralyn' },
    { id: 'sc3', invoice_number: 'INV-TBC-REA', customer_name: 'REA', total_amount: 4485.00, currency: 'USD', status: 'overdue', issue_date: '2025-12-15', due_date: '2026-01-14', rep_name: 'Sylvester Chigova', product: 'Printing', company: 'Bralyn' },
    { id: 'sc4', invoice_number: 'INV-TBC-MOHCC', customer_name: 'MOHCC', total_amount: 164208.96, currency: 'USD', status: 'overdue', issue_date: '2026-01-26', due_date: '2026-02-25', rep_name: 'Sylvester Chigova', product: 'Printing', company: 'Bralyn' },
    { id: 'sc5', invoice_number: 'INV-TBC-ZIMPOST', customer_name: 'ZIMPOST', total_amount: 1155.00, currency: 'USD', status: 'overdue', issue_date: '2026-01-26', due_date: '2026-02-25', rep_name: 'Sylvester Chigova', product: 'Printing', company: 'Bralyn' },
    { id: 'sc6', invoice_number: 'INV-TBC-ACZ-C', customer_name: 'ACZ', total_amount: 7010.00, currency: 'USD', status: 'sent', issue_date: '2026-03-02', due_date: '2026-04-01', rep_name: 'Sylvester Chigova', product: 'Calendars', company: 'Bralyn' },
    { id: 'sc7', invoice_number: 'INV-TBC-ACZ-D', customer_name: 'ACZ', total_amount: 798.00, currency: 'USD', status: 'sent', issue_date: '2026-03-02', due_date: '2026-04-01', rep_name: 'Sylvester Chigova', product: 'Diaries', company: 'Bralyn' },
    // Thandeka Madeya
    { id: 'tm1', invoice_number: 'INV-106970', customer_name: 'BAT', total_amount: 22723.26, currency: 'USD', status: 'overdue', issue_date: '2026-02-06', due_date: '2026-03-08', rep_name: 'Thandeka Madeya', product: 'Jeans', company: 'Kingsport' },
    // Yolanda Chigaigai
    { id: 'yc1', invoice_number: 'INV-106946', customer_name: 'ZIMRA', total_amount: 1839.34, currency: 'USD', status: 'overdue', issue_date: '2026-01-21', due_date: '2026-02-20', rep_name: 'Yolanda Chigaigai', product: 'Straw Hats', company: 'Kingsport' },
    { id: 'yc2', invoice_number: 'INV-106987', customer_name: 'PSH', total_amount: 2009.70, currency: 'USD', status: 'overdue', issue_date: '2026-02-18', due_date: '2026-03-20', rep_name: 'Yolanda Chigaigai', product: 'G-Shirts / T-Shirts', company: 'Kingsport' },
    { id: 'yc3', invoice_number: 'INV-106995', customer_name: 'Delta Lagers', total_amount: 60.06, currency: 'USD', status: 'sent', issue_date: '2026-02-24', due_date: '2026-03-26', rep_name: 'Yolanda Chigaigai', product: 'T-Shirts', company: 'Kingsport' },
    { id: 'yc4', invoice_number: 'INV-106998', customer_name: 'UNICEF', total_amount: 1368.68, currency: 'USD', status: 'sent', issue_date: '2026-02-26', due_date: '2026-03-28', rep_name: 'Yolanda Chigaigai', product: 'Floppy Hats', company: 'Kingsport' },
    { id: 'yc5', invoice_number: 'INV-107009', customer_name: 'PSI', total_amount: 1300.88, currency: 'USD', status: 'sent', issue_date: '2026-03-02', due_date: '2026-04-01', rep_name: 'Yolanda Chigaigai', product: 'G-Shirts / Caps', company: 'Kingsport' },
    { id: 'yc6', invoice_number: 'INV-TBC-LV', customer_name: 'Lowveld', total_amount: 2167.00, currency: 'USD', status: 'sent', issue_date: '2026-03-03', due_date: '2026-04-02', rep_name: 'Yolanda Chigaigai', product: 'Tees', company: 'Kingsport' },
    { id: 'yc7', invoice_number: 'INV-107011', customer_name: 'FBC', total_amount: 401.07, currency: 'USD', status: 'sent', issue_date: '2026-03-03', due_date: '2026-04-02', rep_name: 'Yolanda Chigaigai', product: 'Shirts', company: 'Kingsport' },
    { id: 'yc8', invoice_number: 'INV-107012', customer_name: 'UNICEF', total_amount: 13715.63, currency: 'USD', status: 'sent', issue_date: '2026-03-03', due_date: '2026-04-02', rep_name: 'Yolanda Chigaigai', product: 'T-Shirts', company: 'Kingsport' },
    { id: 'yc9', invoice_number: 'INV-106710', customer_name: 'Irvines', total_amount: 118.00, currency: 'USD', status: 'overdue', issue_date: '2025-11-05', due_date: '2025-12-05', rep_name: 'Yolanda Chigaigai', product: 'T-Shirts', company: 'Kingsport' },
    { id: 'yc10', invoice_number: 'INV-106787', customer_name: 'Delta Lagers', total_amount: 309.12, currency: 'USD', status: 'overdue', issue_date: '2025-11-21', due_date: '2025-12-21', rep_name: 'Yolanda Chigaigai', product: 'T-Shirts', company: 'Kingsport' },
    { id: 'yc11', invoice_number: 'INV-106788', customer_name: 'Delta Lagers', total_amount: 992.68, currency: 'USD', status: 'overdue', issue_date: '2025-11-21', due_date: '2025-12-21', rep_name: 'Yolanda Chigaigai', product: 'Caps / T-Shirts', company: 'Kingsport' },
    { id: 'yc12', invoice_number: 'INV-107001', customer_name: 'Delta Lagers', total_amount: 2217.60, currency: 'USD', status: 'sent', issue_date: '2026-02-27', due_date: '2026-03-29', rep_name: 'Yolanda Chigaigai', product: 'T-Shirts', company: 'Kingsport' },
    { id: 'yc13', invoice_number: 'INV-107002', customer_name: 'Delta Chibuku', total_amount: 3696.00, currency: 'USD', status: 'sent', issue_date: '2026-02-27', due_date: '2026-03-29', rep_name: 'Yolanda Chigaigai', product: 'T-Shirts', company: 'Kingsport' },
    { id: 'yc14', invoice_number: 'INV-107003', customer_name: 'Delta Chibuku', total_amount: 924.00, currency: 'USD', status: 'sent', issue_date: '2026-02-27', due_date: '2026-03-29', rep_name: 'Yolanda Chigaigai', product: 'T-Shirts', company: 'Kingsport' },
    { id: 'yc15', invoice_number: 'INV-107013', customer_name: 'Delta Lagers', total_amount: 450.45, currency: 'USD', status: 'sent', issue_date: '2026-03-03', due_date: '2026-04-02', rep_name: 'Yolanda Chigaigai', product: 'Caps', company: 'Kingsport' },
    { id: 'yc16', invoice_number: 'INV-107014', customer_name: 'Delta Lagers', total_amount: 3880.80, currency: 'USD', status: 'sent', issue_date: '2026-03-03', due_date: '2026-04-02', rep_name: 'Yolanda Chigaigai', product: 'T-Shirts', company: 'Kingsport' },
]

// ─── SGA CUSTOMER INVOICES ────────────────────────────────────────────────────
// These 3 invoices were previously filed under Kingsport — now attributed to SGA.
// SGA Total Outstanding AR: USD 5,870.45
export const SGA_INVOICES: CurrencyInvoice[] = [
    // Spiwe Mandizha — JF Kapnek (funds not yet disbursed per Nyarai)
    { id: 'sga1', invoice_number: 'INV-2026-0245', customer_name: 'JF Kapnek', total_amount: 2108.45, currency: 'USD', status: 'overdue', issue_date: '2026-01-26', due_date: '2026-02-25', rep_name: 'Spiwe Mandizha', product: 'G-Shirts', company: 'SGA' },
    // Priviledge Zimunya — Chicken Slice (payment expected 12 March — treat as amber)
    { id: 'sga2', invoice_number: 'INV-TBC-CS-SGA', customer_name: 'Chicken Slice', total_amount: 2182.00, currency: 'USD', status: 'sent', issue_date: '2026-02-26', due_date: '2026-03-12', rep_name: 'Priviledge Zimunya', product: 'Bottle Drinks', company: 'SGA' },
    // Dudzai Ndemera — SACP (borderline, due 04 Apr but flagged)
    { id: 'sga3', invoice_number: 'INV-TBC-SACP-SGA', customer_name: 'SACP', total_amount: 1580.00, currency: 'USD', status: 'sent', issue_date: '2026-03-05', due_date: '2026-04-04', rep_name: 'Dudzai Ndemera', product: 'Carrier Bags', company: 'SGA' },
]

// ─── Combined invoice array (used by accounting module for all-entity views) ──
export const CURRENCY_INVOICES: CurrencyInvoice[] = [
    ...KINGSPORT_INVOICES,
    ...SGA_INVOICES,
]

// ─── SUPPLIER INVOICES (from accounting/page.tsx MOCK_SINVOICES) ──────────────
export const CURRENCY_SUPPLIER_INVOICES: CurrencySupplierInvoice[] = [
    { id: 'sinv1', nexus_ref: 'SINV-2026-0001', supplier_name: 'TotalFab Textiles', category: 'Raw Materials', invoice_date: '2026-02-20', due_date: '2026-03-07', currency: 'USD', total_amount: 1621.50, status: 'overdue', company: 'Kingsport' },
    { id: 'sinv2', nexus_ref: 'SINV-2026-0002', supplier_name: 'ZimTrim Supplies', category: 'Trimmings', invoice_date: '2026-02-28', due_date: '2026-03-10', currency: 'USD', total_amount: 2783.00, status: 'unpaid', company: 'Kingsport' },
    { id: 'sinv3', nexus_ref: 'SINV-2026-0003', supplier_name: 'Safari Packaging Ltd', category: 'Packaging', invoice_date: '2026-02-25', due_date: '2026-03-27', currency: 'USD', total_amount: 1104.00, status: 'unpaid', company: 'Kingsport' },
    { id: 'sinv4', nexus_ref: 'SINV-2026-0004', supplier_name: 'Afritex Holdings', category: 'Raw Materials', invoice_date: '2026-01-15', due_date: '2026-02-14', currency: 'USD', total_amount: 2633.50, status: 'paid', company: 'Kingsport' },
    { id: 'sinv5', nexus_ref: 'SINV-2026-0005', supplier_name: 'Harare Embroidery & Print', category: 'Professional Services', invoice_date: '2026-02-10', due_date: '2026-03-11', currency: 'USD', total_amount: 667.00, status: 'paid', company: 'Kingsport' },
    { id: 'sinv6', nexus_ref: 'SINV-2026-0006', supplier_name: 'Zimpack Industries', category: 'Packaging', invoice_date: '2026-03-05', due_date: '2026-04-04', currency: 'USD', total_amount: 931.50, status: 'draft', company: 'Kingsport' },
]

// ─── TODAY (pinned for consistent mock calculations) ──────────────────────────
const TODAY = new Date('2026-03-06').setHours(0, 0, 0, 0)

function isAR(inv: CurrencyInvoice) { return inv.status !== 'paid' && inv.status !== 'cancelled' }
function isOverdueAR(inv: CurrencyInvoice) { return inv.status === 'overdue' || (isAR(inv) && new Date(inv.due_date).setHours(0, 0, 0, 0) <= TODAY) }
function isPayable(inv: CurrencySupplierInvoice) { return inv.status === 'unpaid' || inv.status === 'overdue' || inv.status === 'partial' }
function isOverduePayable(inv: CurrencySupplierInvoice) { return inv.status === 'overdue' || (isPayable(inv) && new Date(inv.due_date).setHours(0, 0, 0, 0) <= TODAY) }

// ─── Compute summary for a single currency (Kingsport entity only) ────────────
export interface CurrencySummary {
    totalAR: number
    overdueAR: number
    currentAR: number          // not yet due
    overdueARCount: number
    totalPayables: number
    overduePayables: number
    netPosition: number        // totalAR - totalPayables
}

export function computeSummary(cur: Currency): CurrencySummary {
    const arInvs = KINGSPORT_INVOICES.filter(i => i.currency === cur && isAR(i))
    const suppInvs = CURRENCY_SUPPLIER_INVOICES.filter(i => i.currency === cur && isPayable(i))

    const totalAR = arInvs.reduce((s, i) => s + i.total_amount, 0)
    const overdueAR = arInvs.filter(isOverdueAR).reduce((s, i) => s + i.total_amount, 0)
    const overdueARCount = arInvs.filter(isOverdueAR).length
    const currentAR = totalAR - overdueAR
    const totalPayables = suppInvs.reduce((s, i) => s + i.total_amount, 0)
    const overduePayables = suppInvs.filter(isOverduePayable).reduce((s, i) => s + i.total_amount, 0)

    return {
        totalAR, overdueAR, currentAR, overdueARCount,
        totalPayables, overduePayables,
        netPosition: totalAR - totalPayables,
    }
}

// ─── Compute SGA summary (USD only, no payables yet) ─────────────────────────
export function computeSGASummary(): CurrencySummary {
    const arInvs = SGA_INVOICES.filter(isAR)
    const totalAR = arInvs.reduce((s, i) => s + i.total_amount, 0)
    const overdueAR = arInvs.filter(isOverdueAR).reduce((s, i) => s + i.total_amount, 0)
    const overdueARCount = arInvs.filter(isOverdueAR).length
    const currentAR = totalAR - overdueAR
    return {
        totalAR, overdueAR, currentAR, overdueARCount,
        totalPayables: 0, overduePayables: 0,
        netPosition: totalAR,
    }
}

// ─── Per-rep receivables breakdown (Kingsport entity for a currency) ──────────
export interface RepReceivables {
    rep: string
    clients: string
    outstanding: number
    overdue: number
    overdueCount: number
    oldestInvoiceDate: string  // earliest issue_date among outstanding
    entity?: CompanyEntity
}

export function computeRepBreakdown(cur: Currency): RepReceivables[] {
    const invs = KINGSPORT_INVOICES.filter(i => i.currency === cur && isAR(i))
    const repMap: Record<string, CurrencyInvoice[]> = {}
    invs.forEach(i => { if (!repMap[i.rep_name]) repMap[i.rep_name] = []; repMap[i.rep_name].push(i) })
    return Object.entries(repMap).map(([rep, rInvs]) => ({
        rep,
        clients: Array.from(new Set(rInvs.map(i => i.customer_name))).join(', '),
        outstanding: rInvs.reduce((s, i) => s + i.total_amount, 0),
        overdue: rInvs.filter(isOverdueAR).reduce((s, i) => s + i.total_amount, 0),
        overdueCount: rInvs.filter(isOverdueAR).length,
        oldestInvoiceDate: rInvs.reduce((oldest, i) => i.issue_date < oldest ? i.issue_date : oldest, rInvs[0].issue_date),
        entity: 'Kingsport' as CompanyEntity,
    })).sort((a, b) => b.outstanding - a.outstanding)
}

// ─── Per-rep SGA receivables breakdown ───────────────────────────────────────
export function computeSGARepBreakdown(): RepReceivables[] {
    const invs = SGA_INVOICES.filter(isAR)
    const repMap: Record<string, CurrencyInvoice[]> = {}
    invs.forEach(i => { if (!repMap[i.rep_name]) repMap[i.rep_name] = []; repMap[i.rep_name].push(i) })
    return Object.entries(repMap).map(([rep, rInvs]) => ({
        rep,
        clients: Array.from(new Set(rInvs.map(i => i.customer_name))).join(', '),
        outstanding: rInvs.reduce((s, i) => s + i.total_amount, 0),
        overdue: rInvs.filter(isOverdueAR).reduce((s, i) => s + i.total_amount, 0),
        overdueCount: rInvs.filter(isOverdueAR).length,
        oldestInvoiceDate: rInvs.reduce((oldest, i) => i.issue_date < oldest ? i.issue_date : oldest, rInvs[0].issue_date),
        entity: 'SGA' as CompanyEntity,
    })).sort((a, b) => b.outstanding - a.outstanding)
}

// ─── Per-supplier payables breakdown ─────────────────────────────────────────
export interface SupplierPayables {
    supplier: string
    category: string
    outstanding: number
    overdue: number
    oldestDueDate: string
}

export function computeSupplierBreakdown(cur: Currency): SupplierPayables[] {
    const invs = CURRENCY_SUPPLIER_INVOICES.filter(i => i.currency === cur && isPayable(i))
    const map: Record<string, CurrencySupplierInvoice[]> = {}
    invs.forEach(i => { if (!map[i.supplier_name]) map[i.supplier_name] = []; map[i.supplier_name].push(i) })
    return Object.entries(map).map(([supplier, sInvs]) => ({
        supplier,
        category: sInvs[0].category,
        outstanding: sInvs.reduce((s, i) => s + i.total_amount, 0),
        overdue: sInvs.filter(isOverduePayable).reduce((s, i) => s + i.total_amount, 0),
        oldestDueDate: sInvs.reduce((oldest, i) => i.due_date < oldest ? i.due_date : oldest, sInvs[0].due_date),
    })).sort((a, b) => b.outstanding - a.outstanding)
}

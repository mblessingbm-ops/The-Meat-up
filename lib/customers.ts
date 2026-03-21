// ─── Shared Customer & CRM Data ───────────────────────────────────────────────
// Single source of truth for customer-to-rep assignments.
// Used by: Sales module, Accounting module, Rep Profiles, Pricing Requests, Dashboard.
// Updated: March 2026 — real client portfolios, shared accounts, Bralyn portfolio tag.

export interface Customer {
    id: string
    name: string
    email: string
    /** Primary account owner rep ID(s) — array to support shared accounts */
    rep_ids: string[]
    /** Human-readable rep name(s) */
    rep_names: string[]
    /** USD outstanding AR balance (from MOCK_INVOICES, current as at 06 Mar 2026) */
    ar_usd: number
    /** ZWG outstanding AR balance (TelOne only) */
    ar_zwg?: number
    /** true if any invoice is overdue */
    has_overdue: boolean
    /** ISO date of last deal update or visit */
    last_interaction: string
    /**
     * Sylvester Chigova's clients are tagged 'Bralyn' — sourced from the Bralyn
     * manufacturing entity. All other clients are Kingsport-side. Shared clients
     * where Sylvester is one of multiple reps are also tagged here for display.
     */
    portfolio?: 'Bralyn'
    /**
     * Cross-entity clients that appear in multiple company contexts.
     * e.g. ['Kingsport', 'SGA'] for clients traded through both entities.
     * If undefined, the client belongs to 'Kingsport' only.
     */
    company_entity?: ('Kingsport' | 'Bralyn' | 'SGA')[]
}

export const MOCK_CUSTOMERS: Customer[] = [

    // ═══════════════════════════════════════════════════════════════════════════
    // ── CHIEDZA JOWA (4 clients) ──────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'petrotrade', name: 'Petrotrade', email: 'accounts@petrotrade.co.zw',
        rep_ids: ['chiedza'], rep_names: ['Chiedza Jowa'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        // UNDP is shared: Chiedza, Thandeka, Yolanda, Sylvester (Bralyn)
        id: 'undp', name: 'UNDP', email: 'operations@undp.org',
        rep_ids: ['chiedza', 'thandeka', 'yolanda', 'sylvester'],
        rep_names: ['Chiedza Jowa', 'Thandeka Madeya', 'Yolanda Chigaigai', 'Sylvester Chigova'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
        portfolio: 'Bralyn', // Sylvester's relationship is Bralyn-side
    },
    {
        // Existing — kept with original AR balance
        id: 'farm-city', name: 'Farm & City', email: 'accounts@farmandcity.co.zw',
        rep_ids: ['chiedza'], rep_names: ['Chiedza Jowa'],
        ar_usd: 14748.50, has_overdue: true, last_interaction: '2026-03-01T09:00:00Z',
    },
    {
        // Existing duplicate entry kept as a separate store relationship
        id: 'farm-n-city', name: 'Farm N City', email: 'accounts@farmcity.co.zw',
        rep_ids: ['chiedza'], rep_names: ['Chiedza Jowa'],
        ar_usd: 9240.00, has_overdue: true, last_interaction: '2026-03-02T09:00:00Z',
    },
    {
        id: 'national-oil', name: 'National Oil Infrastructure Company', email: 'finance@noic.co.zw',
        rep_ids: ['chiedza'], rep_names: ['Chiedza Jowa'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ── THANDEKA MADEYA (10 clients) ─────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════
    // UNDP already listed above (shared)
    {
        id: 'lusitania', name: 'Lusitania', email: 'accounts@lusitania.co.zw',
        rep_ids: ['thandeka'], rep_names: ['Thandeka Madeya'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        id: 'fc-hunters', name: 'FC Hunters', email: 'admin@fchunters.co.zw',
        rep_ids: ['thandeka'], rep_names: ['Thandeka Madeya'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        // Existing — BAT, Thandeka
        id: 'bat', name: 'British American Tobacco', email: 'finance@bat.co.zw',
        rep_ids: ['thandeka'], rep_names: ['Thandeka Madeya'],
        ar_usd: 22723.26, has_overdue: true, last_interaction: '2026-03-01T09:00:00Z',
    },
    {
        // Shared: Thandeka & Sylvester. AR belongs to Sylvester's Bralyn account.
        id: 'mohcc', name: 'Ministry of Health (MOHCC)', email: 'finance@mohcc.gov.zw',
        rep_ids: ['thandeka', 'sylvester'], rep_names: ['Thandeka Madeya', 'Sylvester Chigova'],
        ar_usd: 164208.96, has_overdue: true, last_interaction: '2026-03-01T09:00:00Z',
        portfolio: 'Bralyn', // Sylvester's relationship is Bralyn-side
    },
    {
        id: 'natpharm', name: 'Natpharm', email: 'accounts@natpharm.co.zw',
        rep_ids: ['thandeka'], rep_names: ['Thandeka Madeya'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        id: 'cbz', name: 'CBZ', email: 'finance@cbz.co.zw',
        rep_ids: ['thandeka'], rep_names: ['Thandeka Madeya'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        id: 'grain-marketing-board', name: 'Grain Marketing Board', email: 'finance@gmb.co.zw',
        rep_ids: ['thandeka'], rep_names: ['Thandeka Madeya'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        // Existing — Thandeka
        id: 'zimpost', name: 'Zimpost', email: 'finance@zimpost.co.zw',
        rep_ids: ['thandeka'], rep_names: ['Thandeka Madeya'],
        ar_usd: 1155.00, has_overdue: true, last_interaction: '2026-03-01T09:00:00Z',
    },
    {
        id: 'mmcz', name: 'MMCZ', email: 'accounts@mmcz.co.zw',
        rep_ids: ['thandeka'], rep_names: ['Thandeka Madeya'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ── LUCIA CHIWANZA (8 clients) ────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════
    {
        // Existing
        id: 'world-vision', name: 'World Vision', email: 'finance@worldvision.co.zw',
        rep_ids: ['lucia'], rep_names: ['Lucia Chiwanza'],
        ar_usd: 269.92, has_overdue: true, last_interaction: '2026-03-01T09:00:00Z',
    },
    {
        id: 'camfed', name: 'CAMFED', email: 'accounts@camfed.org',
        rep_ids: ['lucia'], rep_names: ['Lucia Chiwanza'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        // Existing — ZWG invoice
        id: 'telone', name: 'TelOne', email: 'ap@telone.co.zw',
        rep_ids: ['lucia'], rep_names: ['Lucia Chiwanza'],
        ar_usd: 0, ar_zwg: 2104993.61, has_overdue: true, last_interaction: '2026-03-01T09:00:00Z',
    },
    {
        id: 'ok-zimbabwe', name: 'OK Zimbabwe', email: 'accounts@okzim.co.zw',
        rep_ids: ['lucia'], rep_names: ['Lucia Chiwanza'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        // Shared: Lucia & Sylvester (Bralyn)
        id: 'psc', name: 'Public Service Commission', email: 'finance@psc.co.zw',
        rep_ids: ['lucia', 'sylvester'], rep_names: ['Lucia Chiwanza', 'Sylvester Chigova'],
        ar_usd: 9753.00, has_overdue: true, last_interaction: '2026-03-01T09:00:00Z',
        portfolio: 'Bralyn',
    },
    {
        id: 'nssa', name: 'NSSA', email: 'accounts@nssa.org.zw',
        rep_ids: ['lucia'], rep_names: ['Lucia Chiwanza'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        id: 'zhrc', name: 'Zimbabwe Human Rights Commission', email: 'finance@zhrc.org.zw',
        rep_ids: ['lucia'], rep_names: ['Lucia Chiwanza'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        id: 'zesa-holdings', name: 'ZESA Holdings', email: 'accounts@zesa.co.zw',
        rep_ids: ['lucia'], rep_names: ['Lucia Chiwanza'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ── SANDRA MWANZA (8 clients) ─────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'tm-pick-n-pay', name: 'TM Pick N Pay', email: 'accounts@tmpicknpay.co.zw',
        rep_ids: ['sandra'], rep_names: ['Sandra Mwanza'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        // Existing TM stores grouped under Sandra
        id: 'tm-shurugwi', name: 'TM Shurugwi', email: 'accounts@tmshurug.co.zw',
        rep_ids: ['sandra'], rep_names: ['Sandra Mwanza'],
        ar_usd: 530.05, has_overdue: true, last_interaction: '2026-03-01T09:00:00Z',
    },
    {
        id: 'tm-msasa', name: 'TM Msasa', email: 'accounts@tmmsasa.co.zw',
        rep_ids: ['sandra'], rep_names: ['Sandra Mwanza'],
        ar_usd: 2644.10, has_overdue: true, last_interaction: '2026-03-01T09:00:00Z',
    },
    {
        id: 'petrozim', name: 'Petrozim', email: 'finance@petrozim.co.zw',
        rep_ids: ['sandra'], rep_names: ['Sandra Mwanza'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        id: 'econet-holdings', name: 'Econet Holdings', email: 'accounts@econet.co.zw',
        rep_ids: ['sandra'], rep_names: ['Sandra Mwanza'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        // Existing EcoCash (subsidiary of Econet) remains under Sandra
        id: 'ecocash', name: 'EcoCash', email: 'finance@ecocash.co.zw',
        rep_ids: ['sandra'], rep_names: ['Sandra Mwanza'],
        ar_usd: 12710.78, has_overdue: false, last_interaction: '2026-03-03T09:00:00Z',
    },
    {
        id: 'population-services', name: 'Population Services Zimbabwe', email: 'finance@psizim.org',
        rep_ids: ['sandra'], rep_names: ['Sandra Mwanza'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        id: 'traffic-safety', name: 'Traffic Safety Council', email: 'accounts@tsc.co.zw',
        rep_ids: ['sandra'], rep_names: ['Sandra Mwanza'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        id: 'total-energies', name: 'Total Energies', email: 'accounts@totalenergies.co.zw',
        rep_ids: ['sandra'], rep_names: ['Sandra Mwanza'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        id: 'stanbic', name: 'Stanbic Bank', email: 'finance@stanbic.co.zw',
        rep_ids: ['sandra'], rep_names: ['Sandra Mwanza'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        id: 'praz', name: 'PRAZ', email: 'accounts@praz.org.zw',
        rep_ids: ['sandra'], rep_names: ['Sandra Mwanza'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ── SPIWE MANDIZHA (5 clients) ────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'higher-life', name: 'Higher Life Foundation', email: 'accounts@higherlife.org.zw',
        rep_ids: ['spiwe'], rep_names: ['Spiwe Mandizha'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        // Existing — JF Kapnek shared Spiwe + Dudzai. Also appears under SGA (INV-2026-0245, Spiwe $2,108.45).
        id: 'jfkapnek', name: 'JF Kapnek', email: 'accounts@jfkapnek.co.zw',
        rep_ids: ['spiwe', 'dudzai'], rep_names: ['Spiwe Mandizha', 'Dudzai Ndemera'],
        ar_usd: 10088.35, has_overdue: true, last_interaction: '2026-02-20T09:00:00Z',
        company_entity: ['Kingsport', 'SGA'],
    },
    {
        id: 'netone', name: 'NetOne', email: 'finance@netone.co.zw',
        rep_ids: ['spiwe'], rep_names: ['Spiwe Mandizha'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        id: 'zinara', name: 'ZINARA', email: 'accounts@zinara.co.zw',
        rep_ids: ['spiwe'], rep_names: ['Spiwe Mandizha'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        id: 'afc-bank', name: 'AFC Bank', email: 'finance@afcbank.co.zw',
        rep_ids: ['spiwe'], rep_names: ['Spiwe Mandizha'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ── YOLANDA CHIGAIGAI (10 clients) ───────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════
    {
        // Existing
        id: 'unicef', name: 'UNICEF', email: 'supply@unicef.org.zw',
        rep_ids: ['yolanda'], rep_names: ['Yolanda Chigaigai'],
        ar_usd: 15084.31, has_overdue: false, last_interaction: '2026-03-03T09:00:00Z',
    },
    // UNDP shared (listed above)
    {
        // Existing
        id: 'psh', name: 'PSH', email: 'finance@psh.co.zw',
        rep_ids: ['yolanda'], rep_names: ['Yolanda Chigaigai'],
        ar_usd: 2009.70, has_overdue: true, last_interaction: '2026-03-01T09:00:00Z',
    },
    {
        id: 'who', name: 'World Health Organisation', email: 'finance@who.int',
        rep_ids: ['yolanda'], rep_names: ['Yolanda Chigaigai'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        id: 'unfpa', name: 'UNFPA', email: 'finance@unfpa.org',
        rep_ids: ['yolanda'], rep_names: ['Yolanda Chigaigai'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        // Existing
        id: 'fbc', name: 'FBC Bank', email: 'finance@fbc.co.zw',
        rep_ids: ['yolanda'], rep_names: ['Yolanda Chigaigai'],
        ar_usd: 401.07, has_overdue: false, last_interaction: '2026-03-03T09:00:00Z',
    },
    {
        id: 'delta-coca-cola', name: 'Delta Coca Cola', email: 'treasury@delta.co.zw',
        rep_ids: ['yolanda'], rep_names: ['Yolanda Chigaigai'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        // Existing
        id: 'delta-lagers', name: 'Delta Lagers', email: 'treasury@delta.co.zw',
        rep_ids: ['yolanda'], rep_names: ['Yolanda Chigaigai'],
        ar_usd: 7019.31, has_overdue: true, last_interaction: '2026-03-03T09:00:00Z',
    },
    {
        // Existing
        id: 'delta-chibuku', name: 'Delta Chibuku', email: 'treasury@delta.co.zw',
        rep_ids: ['yolanda'], rep_names: ['Yolanda Chigaigai'],
        ar_usd: 4620.00, has_overdue: false, last_interaction: '2026-03-03T09:00:00Z',
    },
    {
        // Delta Beverages parent company — Yolanda + Sylvester (Bralyn)
        id: 'delta-beverages', name: 'Delta Beverages', email: 'treasury@delta.co.zw',
        rep_ids: ['yolanda', 'sylvester'], rep_names: ['Yolanda Chigaigai', 'Sylvester Chigova'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
        portfolio: 'Bralyn',
    },
    {
        id: 'oag', name: 'Office of the Attorney General', email: 'accounts@oag.gov.zw',
        rep_ids: ['yolanda'], rep_names: ['Yolanda Chigaigai'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    // Keep existing Yolanda clients that carry AR
    {
        id: 'zimra', name: 'ZIMRA', email: 'accounts@zimra.co.zw',
        rep_ids: ['yolanda'], rep_names: ['Yolanda Chigaigai'],
        ar_usd: 1839.34, has_overdue: true, last_interaction: '2026-03-01T09:00:00Z',
    },
    {
        id: 'zimra2', name: 'ZIMRA (Refund Debtors)', email: 'accounts@zimra.co.zw',
        rep_ids: ['yolanda'], rep_names: ['Yolanda Chigaigai'],
        ar_usd: 420.75, has_overdue: true, last_interaction: '2026-03-01T09:00:00Z',
    },
    {
        id: 'psi', name: 'PSI', email: 'finance@psi.co.zw',
        rep_ids: ['yolanda'], rep_names: ['Yolanda Chigaigai'],
        ar_usd: 1300.88, has_overdue: false, last_interaction: '2026-03-03T09:00:00Z',
    },
    {
        id: 'lowveld', name: 'Lowveld', email: 'accounts@lowveld.co.zw',
        rep_ids: ['yolanda'], rep_names: ['Yolanda Chigaigai'],
        ar_usd: 2167.00, has_overdue: false, last_interaction: '2026-03-03T09:00:00Z',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ── DUDZAI NDEMERA (6 clients) ────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'cabs', name: 'CABS', email: 'finance@cabs.co.zw',
        rep_ids: ['dudzai'], rep_names: ['Dudzai Ndemera'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        // Existing (was "Old Mutual Digital" → now "Old Mutual")
        id: 'old-mutual', name: 'Old Mutual', email: 'finance@oldmutual.co.zw',
        rep_ids: ['dudzai'], rep_names: ['Dudzai Ndemera'],
        ar_usd: 2887.50, has_overdue: false, last_interaction: '2026-03-03T09:00:00Z',
    },
    {
        // Existing
        id: 'nmb', name: 'NMB Bank', email: 'accounts@nmbbank.co.zw',
        rep_ids: ['dudzai'], rep_names: ['Dudzai Ndemera'],
        ar_usd: 1154.88, has_overdue: true, last_interaction: '2026-03-01T09:00:00Z',
    },
    {
        // SGA invoice (INV-TBC-SACP-SGA, Dudzai, $1,580.00) — cross-entity client
        id: 'sacp', name: 'SACP', email: 'finance@sacp.co.zw',
        rep_ids: ['dudzai'], rep_names: ['Dudzai Ndemera'],
        ar_usd: 1580.00, has_overdue: false, last_interaction: '2026-03-05T08:00:00Z',
        company_entity: ['Kingsport', 'SGA'],
    },
    // JF Kapnek shared (listed under Spiwe above)
    {
        // Existing
        id: 'schweppes', name: 'Schweppes', email: 'finance@schweppes.co.zw',
        rep_ids: ['dudzai'], rep_names: ['Dudzai Ndemera'],
        ar_usd: 5734.69, has_overdue: true, last_interaction: '2026-03-01T09:00:00Z',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ── PRIVILEDGE ZIMUNYA (2 clients) ───────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════
    {
        // SGA invoice (INV-TBC-CS-SGA, Priviledge, $2,182.00) — cross-entity client (formerly 'Chicken Slice')
        id: 'slice-international', name: 'Slice International', email: 'accounts@slice.co.zw',
        rep_ids: ['priviledge'], rep_names: ['Priviledge Zimunya'],
        ar_usd: 2182.00, has_overdue: true, last_interaction: '2026-03-01T09:00:00Z',
        company_entity: ['Kingsport', 'SGA'],
    },
    {
        // Existing
        id: 'irvines', name: 'Irvines', email: 'finance@irvines.co.zw',
        rep_ids: ['priviledge'], rep_names: ['Priviledge Zimunya'],
        ar_usd: 2829.75, has_overdue: true, last_interaction: '2026-03-01T09:00:00Z',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ── ERNEST MUTIZWA (7 clients) ────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'ministry-industry', name: 'Ministry of Industry and Commerce', email: 'accounts@mic.gov.zw',
        rep_ids: ['ernest'], rep_names: ['Ernest Mutizwa'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        id: 'cimas', name: 'CIMAS Medical Group', email: 'finance@cimas.co.zw',
        rep_ids: ['ernest'], rep_names: ['Ernest Mutizwa'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        id: 'care-international', name: 'CARE International', email: 'accounts@care.org.zw',
        rep_ids: ['ernest'], rep_names: ['Ernest Mutizwa'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        id: 'ministry-sports', name: 'Ministry of Sports', email: 'accounts@sports.gov.zw',
        rep_ids: ['ernest'], rep_names: ['Ernest Mutizwa'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        id: 'src', name: 'Sports and Recreation Council', email: 'finance@src.org.zw',
        rep_ids: ['ernest'], rep_names: ['Ernest Mutizwa'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        id: 'zanu-pf', name: 'ZANU PF', email: 'accounts@zanupf.org.zw',
        rep_ids: ['ernest'], rep_names: ['Ernest Mutizwa'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },
    {
        id: 'mashonaland-tobacco', name: 'Mashonaland Tobacco Company', email: 'finance@mtc.co.zw',
        rep_ids: ['ernest'], rep_names: ['Ernest Mutizwa'],
        ar_usd: 0, has_overdue: false, last_interaction: '2026-03-06T08:00:00Z',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ── SYLVESTER CHIGOVA — BRALYN PORTFOLIO (5 clients) ─────────────────────
    // ═══════════════════════════════════════════════════════════════════════════
    // Ministry of Health (MOHCC) → listed above (shared with Thandeka)
    // UNDP → listed above (shared multi-rep)
    // Delta Beverages → listed above (shared with Yolanda)
    // Public Service Commission (PSC) → listed above (shared with Lucia)
    {
        // Existing — Sylvester sole rep
        id: 'zinwa', name: 'ZINWA', email: 'finance@zinwa.co.zw',
        rep_ids: ['sylvester'], rep_names: ['Sylvester Chigova'],
        ar_usd: 3565.00, has_overdue: true, last_interaction: '2026-03-01T09:00:00Z',
        portfolio: 'Bralyn',
    },
    // Legacy AR-bearing Sylvester clients retained even though not in new Bralyn portfolio
    {
        id: 'rea', name: 'REA', email: 'finance@rea.co.zw',
        rep_ids: ['sylvester'], rep_names: ['Sylvester Chigova'],
        ar_usd: 4485.00, has_overdue: true, last_interaction: '2026-03-01T09:00:00Z',
        portfolio: 'Bralyn',
    },
    {
        id: 'acz', name: 'ACZ', email: 'finance@acz.co.zw',
        rep_ids: ['sylvester'], rep_names: ['Sylvester Chigova'],
        ar_usd: 7808.00, has_overdue: false, last_interaction: '2026-03-03T09:00:00Z',
        portfolio: 'Bralyn',
    },
]

// ── Helper — get all clients for a rep ──────────────────────────────────────
export function getRepClients(repId: string): Customer[] {
    return MOCK_CUSTOMERS.filter(c => c.rep_ids.includes(repId))
}

// ── Helper — look up a customer by ID ───────────────────────────────────────
export function getCustomerById(id: string): Customer | undefined {
    return MOCK_CUSTOMERS.find(c => c.id === id)
}

// ── Helper — get Bralyn-portfolio clients for display tagging ────────────────
export function getBraylnClients(): Customer[] {
    return MOCK_CUSTOMERS.filter(c => c.portfolio === 'Bralyn')
}

// ── AR by Rep — used by executive dashboard ──────────────────────────────────
// These totals come from the invoice-level data in MOCK_INVOICES.
// New reps / new clients with no invoices show USD 0.00 until invoiced.
export const AR_BY_REP = [
    { rep: 'Sylvester Chigova', rep_id: 'sylvester', usd: 190974.96, zwg: 0 },
    { rep: 'Yolanda Chigaigai', rep_id: 'yolanda', usd: 22862.36, zwg: 0 },
    { rep: 'Chiedza Jowa', rep_id: 'chiedza', usd: 23988.50, zwg: 0 },
    { rep: 'Thandeka Madeya', rep_id: 'thandeka', usd: 22723.26, zwg: 0 },
    { rep: 'Dudzai Ndemera', rep_id: 'dudzai', usd: 19336.97, zwg: 0 },
    { rep: 'Sandra Mwanza', rep_id: 'sandra', usd: 15884.93, zwg: 0 },
    { rep: 'Spiwe Mandizha', rep_id: 'spiwe', usd: 2108.45, zwg: 0 },
    { rep: 'Priviledge Zimunya', rep_id: 'priviledge', usd: 5011.75, zwg: 0 },
    { rep: 'Ernest Mutizwa', rep_id: 'ernest', usd: 0, zwg: 0 },
    { rep: 'Lucia Chiwanza', rep_id: 'lucia', usd: 269.92, zwg: 2104993.61 },
]

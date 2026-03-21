// ─── lib/stock-data.ts ────────────────────────────────────────────────────────
// Real Kingsport stock data as at 06 March 2026.
// reorder_point = max(5, round(quantity_on_hand * 0.1))
// Source sheets preserved in comments against each section.

export interface StockItem {
    id: string; name: string; sku: string; category: string
    quantity_on_hand: number; reorder_point: number; unit_cost: number
    unit?: string; supplier_name?: string; last_updated?: string
    /** Short product/part code shown beneath the name in muted mono font */
    product_code?: string
    /** Supplier quoted price in South African Rand */
    supplier_price_zar?: number
    /** Supplier price in USD — null means not yet set, editable by exec/accountant */
    supplier_price_usd?: number | null
    /** Container volume label e.g. '5L' or '20L' */
    container_size?: string
    /** Quote reference number from the supplier */
    quote_ref?: string
}

const D = '2026-03-06'

function s(id: string, name: string, cat: string, qty: number, unit: string): StockItem {
    return {
        id, name, sku: id.toUpperCase(), category: cat,
        quantity_on_hand: qty, reorder_point: Math.max(5, Math.round(qty * 0.1)),
        unit_cost: 0, unit, last_updated: D
    }
}

const F = 'Fabrics'
const T = 'Trimmings'
const G = 'Finished Goods'
const P = 'Printing & Display'
const E = 'Equipment'
const SU = 'Sundries'

export const REAL_INVENTORY: StockItem[] = [
    // ── FABRICS ────────────────────────────────────────────────────────────────

    // Single Jersey (kgs) — source: Single Jersey sheet
    s('s1', 'Single Jersey — Mos Turq White', F, 76.05, 'kgs'),
    s('s2', 'Single Jersey — Mos Turq Black', F, 32.1, 'kgs'),
    s('s3', 'Single Jersey — Melange Grey', F, 658.6, 'kgs'),
    s('s4', 'Single Jersey — Interlock White', F, 119.7, 'kgs'),
    s('s5', 'Single Jersey — Interlock Purple', F, 20, 'kgs'),
    s('s6', 'Single Jersey — Grey', F, 4.3, 'kgs'),
    s('s7', 'Single Jersey — Navy Birds Eye', F, 180.9, 'kgs'),
    s('s8', 'Single Jersey — Charc Grey Mel/Kutaura', F, 138.9, 'kgs'),
    s('s9', 'Single Jersey — Lime', F, 5, 'kgs'),
    s('s10', 'Single Jersey — Cerise', F, 6, 'kgs'),
    s('s11', 'Single Jersey — Army Green', F, 10.7, 'kgs'),
    s('s12', 'Single Jersey — Sky', F, 3, 'kgs'),
    s('s13', 'Single Jersey — Navy', F, 3, 'kgs'),

    // Tracksuting & Reflective (mtrs)
    s('s14', 'Tracksuting — Maroon', F, 2616.3, 'mtrs'),
    s('s15', 'Tracksuting — G/Yellow', F, 35, 'mtrs'),
    s('s16', 'Tracksuting — Navy', F, 72, 'mtrs'),
    s('s17', 'Tracksuting — Charcoal Grey', F, 801, 'mtrs'),
    s('s18', 'Tracksuting — White', F, 66, 'mtrs'),
    s('s19', 'Tracksuting — Yellow', F, 380, 'mtrs'),
    s('s20', 'Tracksuting — Red', F, 1598, 'mtrs'),
    s('s21', 'Tracksuting — R/Blue', F, 429, 'mtrs'),
    s('s22', 'Tracksuting — Grey', F, 25, 'mtrs'),
    s('s23', 'Tracksuting — E/Green', F, 16, 'mtrs'),
    s('s24', 'Tracksuting — Black', F, 20, 'mtrs'),
    s('s25', 'Tracksuting — L/Grey', F, 162, 'mtrs'),
    s('s26', 'Tracksuting — B/Green', F, 68, 'mtrs'),
    s('s27', 'Tracksuting — Turquoise', F, 925, 'mtrs'),
    s('s28', 'Reflective — Lime', F, 35936, 'mtrs'),
    s('s29', 'Tracksuting — Orange', F, 98, 'mtrs'),
    s('s30', 'Lime Net', F, 5, 'mtrs'),
    s('s31', 'Black Net', F, 210, 'mtrs'),

    // Polostipe (mtrs)
    s('s32', 'Polostipe — Orange/Black', F, 2055.5, 'mtrs'),
    s('s33', 'Polostipe — B/Green/Black', F, 566.7, 'mtrs'),
    s('s34', 'Polostipe — Grey/Black', F, 11.5, 'mtrs'),
    s('s35', 'Polostipe — Sky/Navy', F, 1106.7, 'mtrs'),
    s('s36', 'Polostipe — Royal/Sky', F, 1875.4, 'mtrs'),

    // FD240 & FD280 (mtrs)
    s('s37', 'FD280 — R/Blue', F, 87, 'mtrs'),
    s('s38', 'FD280 — Emerald', F, 175, 'mtrs'),
    s('s39', 'FD240 — Sky', F, 568, 'mtrs'),
    s('s40', 'FD240 — Charcoal Grey', F, 60, 'mtrs'),
    s('s41', 'FD240 — Brown', F, 107, 'mtrs'),
    s('s42', 'FD240 — B/Green', F, 266, 'mtrs'),
    s('s43', 'FD240 — Army', F, 250, 'mtrs'),
    s('s44', 'FD240 — Brushed Jungle', F, 516, 'mtrs'),
    s('s45', 'FD240 — Jungle', F, 600, 'mtrs'),
    s('s46', 'FD240 — Navy', F, 5, 'mtrs'),
    s('s47', 'FD240 — Yellow', F, 238, 'mtrs'),
    s('s48', 'FD240 — Royal', F, 32, 'mtrs'),
    s('s49', 'FD240 — Turq', F, 150, 'mtrs'),
    s('s50', 'P130 — Sky', F, 80, 'mtrs'),
    s('s51', 'P130 — Sky (529)', F, 15, 'mtrs'),
    s('s52', 'P160 — E/Green', F, 20, 'mtrs'),
    s('s53', 'P160 — Red', F, 50, 'mtrs'),

    // Dropneedle (mtrs)
    s('s54', 'Dropneedle — Royal', F, 87, 'mtrs'),
    s('s55', 'Dropneedle — Orange', F, 50, 'mtrs'),
    s('s56', 'Dropneedle — Red', F, 1529.3, 'mtrs'),
    s('s57', 'Dropneedle — Navy', F, 50, 'mtrs'),
    s('s58', 'Dropneedle — E/Green', F, 813.6, 'mtrs'),
    s('s59', 'Dropneedle — B/Green', F, 866.6, 'mtrs'),
    s('s60', 'Dropneedle — White', F, 26, 'mtrs'),
    s('s61', 'Dropneedle — Lime', F, 493.8, 'mtrs'),
    s('s62', 'Dropneedle — Black', F, 14, 'mtrs'),

    // Sweat Management (mtrs) — unit_cost $1.30 across all colours. Source: SWEATMANAGEMENT sheet.
    // Total value: USD 36,930.66
    { ...s('s62b', 'Sweat Management — White', F, 24664.5, 'mtrs'), unit_cost: 1.30 },
    { ...s('s63', 'Sweat Management — B/Green', F, 1989.3, 'mtrs'), unit_cost: 1.30 },
    { ...s('s64', 'Sweat Management — G/Yellow', F, 392, 'mtrs'), unit_cost: 1.30 },
    { ...s('s65', 'Sweat Management — Yellow', F, 44.2, 'mtrs'), unit_cost: 1.30 },
    { ...s('s66', 'Sweat Management — E/Green', F, 1072.9, 'mtrs'), unit_cost: 1.30 },
    { ...s('s67', 'Sweat Management — R/Blue', F, 11, 'mtrs'), unit_cost: 1.30 },
    { ...s('s68', 'Sweat Management — Lime', F, 154, 'mtrs'), unit_cost: 1.30 },
    { ...s('s69', 'Sweat Management — Red', F, 7, 'mtrs'), unit_cost: 1.30 },
    { ...s('s70', 'Sweat Management — Purple', F, 14, 'mtrs'), unit_cost: 1.30 },
    { ...s('s71', 'Sweat Management — Maroon', F, 10, 'mtrs'), unit_cost: 1.30 },
    { ...s('s72', 'Sweat Management — Turq', F, 19.3, 'mtrs'), unit_cost: 1.30 },
    { ...s('s73', 'Sweat Management — Beige', F, 30, 'mtrs'), unit_cost: 1.30 },

    // Knitted Stripe (mts)
    s('s74', 'Knitted Stripe — White', F, 1616.8, 'mts'),
    s('s75', 'Knitted Stripe — Blush Red', F, 887.7, 'mts'),
    s('s76', 'Knitted Stripe — B/Green', F, 406.1, 'mts'),
    s('s77', 'Knitted Stripe — Jade', F, 364.9, 'mts'),

    // Knitted Stairs (mts)
    s('s78', 'Knitted Stairs — White', F, 68, 'mts'),
    s('s79', 'Knitted Stairs — Black', F, 1059.2, 'mts'),
    s('s80', 'Knitted Stairs — Red', F, 1101.8, 'mts'),

    // Shirt Materials (mtrs)
    s('s81', 'Shirt Material — Red', F, 18934.4, 'mtrs'),
    s('s82', 'Shirt Material — Orange', F, 2607.1, 'mtrs'),
    s('s83', 'Shirt Material — Green/Dark', F, 2909.6, 'mtrs'),
    s('s84', 'Shirt Material — Green/Bon', F, 1119, 'mtrs'),

    // Lacoste (mts)
    s('s85', 'Lacoste — Sky', F, 2529, 'mts'),
    s('s86', 'Lacoste — Yellow', F, 5987.3, 'mts'),
    s('s87', 'Lacoste — G/Yellow', F, 1195.3, 'mts'),
    s('s88', 'Lacoste — White', F, 69, 'mts'),
    s('s89', 'Lacoste — Red', F, 10, 'mts'),
    s('s90', 'Lacoste — Maroon', F, 2949.5, 'mts'),
    s('s91', 'Lacoste — Orange', F, 2550.7, 'mts'),
    s('s92', 'Lacoste — Turquoise', F, 1476.2, 'mts'),
    s('s93', 'Lacoste — B/Green', F, 1855.5, 'mts'),
    s('s94', 'Lacoste — Lime', F, 1333.6, 'mts'),
    s('s95', 'Lacoste — Black', F, 2054.4, 'mts'),
    s('s96', 'Lacoste — Navy', F, 87.5, 'mts'),
    s('s97', 'Lacoste — Cerise', F, 208, 'mts'),
    s('s98', 'Lacoste — Charcoal Grey', F, 475.9, 'mts'),
    s('s99', 'Lacoste — Light Grey', F, 1640.4, 'mts'),
    s('s100', 'Lacoste — R/Blue', F, 30, 'mts'),
    s('s101', 'Lacoste — E/Green', F, 964.7, 'mts'),
    s('s102', 'Lacoste — Pink', F, 1315.8, 'mts'),

    // Mandy (mts)
    s('s103', 'Mandy — Grey', F, 243, 'mts'),
    s('s104', 'Mandy — White', F, 380, 'mts'),
    s('s105', 'Mandy — Emerald', F, 107, 'mts'),
    s('s106', 'Mandy — Navy', F, 20, 'mts'),
    s('s107', 'Mandy — Brown', F, 65, 'mts'),
    s('s108', 'Mandy — Red', F, 50, 'mts'),

    // Hartel (mts)
    s('s109', 'Hartel — Khaki', F, 11085.9, 'mts'),
    s('s110', 'Hartel — Grey', F, 300, 'mts'),
    s('s111', 'Hartel — Navy', F, 550, 'mts'),

    // Chinese Drill (mts)
    s('s112', 'Chinese Drill — Red', F, 13, 'mts'),
    s('s113', 'Chinese Drill — Grey', F, 1057, 'mts'),
    s('s114', 'Chinese Drill — Black', F, 12, 'mts'),
    s('s115', 'Chinese Drill — Khaki', F, 30, 'mts'),
    s('s116', 'Chinese Drill — Emerald', F, 133, 'mts'),
    s('s117', 'Chinese Drill — Navy', F, 30, 'mts'),
    s('s118', 'Chinese Drill — B/Green', F, 180, 'mts'),
    s('s119', 'Chinese Drill — Brown', F, 90, 'mts'),
    s('s120', 'Chinese Drill — Orange', F, 15, 'mts'),
    s('s121', 'Chinese Drill — Royal', F, 9250, 'mts'),

    // Polycotton & Ponjee Lining (mts)
    s('s122', 'Polly Cotton — Sky', F, 187, 'mts'),
    s('s123', 'Polly Cotton — Red', F, 16, 'mts'),
    s('s124', 'Polly Cotton — Baby Pink', F, 100, 'mts'),
    s('s125', 'Ponjee Lining — Black', F, 197, 'mts'),
    s('s126', 'Ponjee Lining — B/Green', F, 190, 'mts'),
    s('s127', 'Ponjee Lining — Brown', F, 147, 'mts'),
    s('s128', 'Ponjee Lining — Sky', F, 50, 'mts'),
    s('s129', 'Ponjee Lining — Black (2)', F, 243, 'mts'),
    s('s130', 'Ponjee Lining — Orange', F, 205, 'mts'),
    s('s131', 'Ponjee Lining — Navy', F, 251, 'mts'),
    s('s132', 'Ponjee Lining — Royal', F, 45, 'mts'),

    // Acid Proof & Gabardine (mtrs)
    s('s133', 'Acid Proof — Navy', F, 1026.4, 'mtrs'),
    s('s134', 'Gabardine — Navy', F, 805.9, 'mtrs'),
    s('s135', 'Twill Heavy Grey — New', F, 1069.1, 'mtrs'),
    s('s136', 'Twill Light Grey', F, 7, 'mtrs'),
    s('s137', 'Twill Heavy Grey — Old', F, 535, 'mtrs'),

    // Suiting (mts)
    s('s138', 'Suiting — Black', F, 4802, 'mts'),
    s('s139', 'Suiting — TM', F, 208, 'mts'),
    s('s140', 'Suiting — Striped Grey', F, 150, 'mts'),

    // Oxford (mts)
    s('s141', 'Oxford — White', F, 89.5, 'mts'),

    // Ripstop Tent Fabric (mts)
    s('s142', 'Ripstop Tent Fabric — Thick', F, 783, 'mts'),
    s('s143', 'Ripstop Tent Fabric — Redyeing', F, 340, 'mts'),

    // Raincoat PVC (mts)
    s('s144', 'Raincoat PVC — Olive', F, 20, 'mts'),
    s('s145', 'Raincoat PVC — Navy', F, 900, 'mts'),

    // UNICEF Dress Materials (mts)
    s('s146', 'UNICEF Dress — Gingham Brown & White', F, 9774.66, 'mts'),
    s('s147', 'UNICEF Dress — Mandy Brown', F, 8844.2, 'mts'),

    // TM Materials (various)
    s('s148', 'TM — Poly Cotton/Plain Sky', F, 6099.1, 'mts'),
    s('s149', 'TM — Poly Cotton/Plain White', F, 60, 'mts'),
    s('s150', 'TM — Poly Cotton/Drill Navy', F, 1490.7, 'mts'),
    s('s151', 'TM — Drop Labels Pick N Pay 5CM', F, 10000, 'units'),
    s('s152', 'TM — Drop Labels Pick N Pay 7CM', F, 20000, 'units'),
    s('s153', 'TM — Woven Labels 5CM', F, 6000, 'units'),
    s('s154', 'TM — Woven Labels 3.5CM', F, 4000, 'units'),
    s('s155', 'TM — Sticker Polybags Clear', F, 7000, 'units'),
    s('s156', 'TM — Polyester Thread White', F, 765, 'cones'),
    s('s157', 'TM — Polyester Thread Sky Blue', F, 101.2, 'cones'),
    s('s158', 'TM — Polyester Thread Navy', F, 150, 'cones'),
    s('s159', 'TM — Pearl Buttons White', F, 55000, 'units'),
    s('s160', 'TM — Pants Button', F, 17000, 'units'),
    s('s161', 'TM — Paper Cards', F, 1600, 'units'),
    s('s162', 'TM — Metal Button Iron', F, 141000, 'units'),
    s('s163', 'TM — Shirt Vylen', F, 1500, 'rolls'),

    // ── TRIMMINGS ──────────────────────────────────────────────────────────────

    // Sewing Threads (cones)
    s('s164', 'Sewing Thread — Yellow', T, 840, 'cones'),
    s('s165', 'Sewing Thread — Red', T, 240, 'cones'),
    s('s166', 'Sewing Thread — Grey', T, 240, 'cones'),
    s('s167', 'Sewing Thread — Lime', T, 144, 'cones'),
    s('s168', 'Sewing Thread — Khaki', T, 480, 'cones'),
    s('s169', 'Sewing Thread — Ash Grey', T, 300, 'cones'),
    s('s170', 'Sewing Thread — Cream', T, 840, 'cones'),
    s('s171', 'Sewing Thread — B/Green', T, 48, 'cones'),
    s('s172', 'Sewing Thread — Sky', T, 30, 'cones'),
    s('s173', 'Sewing Thread — 1138 Brown', T, 36, 'cones'),
    s('s174', 'Sewing Thread — 1050 Red', T, 127, 'cones'),
    s('s175', 'Sewing Thread — 1097 Turquoise', T, 20, 'cones'),
    s('s176', 'Sewing Thread — 1333 Orange', T, 38, 'cones'),
    s('s177', 'Sewing Thread — 1063 Turquoise', T, 12, 'cones'),
    s('s178', 'Sewing Thread — 1156 Maroon', T, 70, 'cones'),
    s('s179', 'Sewing Thread — 1221 Olive', T, 12, 'cones'),
    s('s180', 'Sewing Thread — 1126 B.Green', T, 12, 'cones'),
    s('s181', 'Sewing Thread — 1080 Black', T, 12, 'cones'),
    s('s182', 'Sewing Thread — 1319 Grey', T, 15, 'cones'),
    s('s183', 'Sewing Thread — 1160 Brown', T, 12, 'cones'),
    s('s184', 'Sewing Thread — 1343 B.Green', T, 46, 'cones'),
    s('s185', 'Sewing Thread — 1005 Yellow', T, 120, 'cones'),
    s('s186', 'Sewing Thread — 1187 Gold', T, 96, 'cones'),
    s('s187', 'Sewing Thread — 1204 Navy', T, 116, 'cones'),
    s('s188', 'Sewing Thread — 1063 Sky', T, 10, 'cones'),
    s('s189', 'Sewing Thread — 1049 Red', T, 90, 'cones'),
    s('s190', 'Sewing Thread — 1455 Grey', T, 40, 'cones'),
    s('s191', 'Sewing Thread — 1180 Black', T, 80, 'cones'),
    s('s192', 'Sewing Thread — 1179 White', T, 12, 'cones'),
    s('s193', 'Sewing Thread — 1205 Sky', T, 100, 'cones'),
    s('s194', 'Sewing Thread — 1198 Sky', T, 20, 'cones'),
    s('s195', 'Sewing Thread — 1201 Royal', T, 40, 'cones'),
    s('s196', 'Sewing Thread — 1096 Turquoise', T, 20, 'cones'),
    s('s197', 'Sewing Thread — 1125 Lime Green', T, 20, 'cones'),
    s('s198', 'Sewing Thread — 1066 Royal', T, 24, 'cones'),
    s('s199', 'Sewing Thread — 1009 G.Yellow', T, 100, 'cones'),
    s('s200', 'Sewing Thread — 1306 Brown', T, 24, 'cones'),
    s('s201', 'Sewing Thread — 1206 Grey', T, 24, 'cones'),

    // Zips (units)
    s('s202', 'Zip Metal — White 75CM', T, 240, 'units'),
    s('s203', 'Zip Metal — Sky 75CM', T, 234, 'units'),
    s('s204', 'Zip Metal — Royal 75CM', T, 198, 'units'),
    s('s205', 'Zip Metal — White 20CM', T, 6650, 'units'),
    s('s206', 'Zip Metal — Orange 20CM', T, 12446, 'units'),
    s('s207', 'Zip Metal — Navy 20CM', T, 1100, 'units'),
    s('s208', 'Zip Metal — Sky 20CM', T, 8500, 'units'),
    s('s209', 'Zip Metal — Red 20CM', T, 10600, 'units'),
    s('s210', 'Zip Metal — Royal 20CM', T, 50, 'units'),
    s('s211', 'Zip Nylon — Navy 75CM', T, 1038, 'units'),

    // Elastics (rolls)
    s('s212', 'Elastic — White', T, 24, 'rolls'),
    s('s213', 'Elastic — Black', T, 0, 'rolls'),

    // Collars (units)
    s('s214', 'Collar — White', T, 12, 'units'),
    s('s215', 'Collar — Lime', T, 4608, 'units'),
    s('s216', 'Collar — Orange', T, 3101, 'units'),
    s('s217', 'Collar — Navy', T, 863, 'units'),
    s('s218', 'Collar — Black', T, 1183, 'units'),
    s('s219', 'Collar — R/Blue', T, 2386, 'units'),
    s('s220', 'Collar — S/Blue', T, 4796, 'units'),
    s('s221', 'Collar — Cerise', T, 56, 'units'),
    s('s222', 'Collar — Yellow', T, 5923, 'units'),
    s('s223', 'Collar — Red', T, 1685, 'units'),
    s('s224', 'Collar — Maroon', T, 1697, 'units'),
    s('s225', 'Collar — Turquoise', T, 524, 'units'),
    s('s226', 'Collar — B/Green', T, 922, 'units'),
    s('s227', 'Collar — E/Green', T, 119, 'units'),
    s('s228', 'Collar — G/Yellow', T, 484, 'units'),
    s('s229', 'Collar — Light Grey', T, 865, 'units'),
    s('s230', 'Collar — Charcoal Grey', T, 727, 'units'),
    s('s231', 'Collar — Jade', T, 367, 'units'),
    s('s232', 'Collar — Pink', T, 1289, 'units'),

    // Striped Collars (units)
    s('s233', 'Striped Collar — White/Black', T, 4475, 'units'),
    s('s234', 'Striped Collar — White/Emerald', T, 4116, 'units'),
    s('s235', 'Striped Collar — Red/White', T, 1700, 'units'),
    s('s236', 'Striped Collar — Black/White', T, 4558, 'units'),
    s('s237', 'Striped Collar — Navy/White', T, 2261, 'units'),
    s('s238', 'Striped Collar — Royal/White', T, 1738, 'units'),
    s('s239', 'Striped Collar — B/Green/White', T, 1920, 'units'),
    s('s240', 'Striped Collar — E/Green/White', T, 2717, 'units'),
    s('s241', 'Striped Collar — Sky/Navy', T, 3520, 'units'),
    s('s242', 'Striped Collar — Black/Orange', T, 4764, 'units'),
    s('s243', 'Striped Collar — Lime/Black', T, 3601, 'units'),
    s('s244', 'Striped Collar — Blush Red/Black', T, 1318, 'units'),
    s('s245', 'Striped Collar — Grey/Black', T, 891, 'units'),

    // Polstripe Collars (mts)
    s('s246', 'Polstripe Collar — Orange', T, 2136, 'mts'),
    s('s247', 'Polstripe Collar — B/Green', T, 925, 'mts'),
    s('s248', 'Polstripe Collar — Grey', T, 586, 'mts'),
    s('s249', 'Polstripe Collar — Sky', T, 1346, 'mts'),

    // Cuffs (units)
    s('s250', 'Cuff — Red/White', T, 2690, 'units'),
    s('s251', 'Cuff — Black/White', T, 9580, 'units'),
    s('s252', 'Cuff — Navy/White', T, 2696, 'units'),
    s('s253', 'Cuff — Royal/White', T, 2200, 'units'),
    s('s254', 'Cuff — B/Green/White', T, 4490, 'units'),
    s('s255', 'Cuff — Emerald/White', T, 7700, 'units'),
    s('s256', 'Cuff — Sky/Navy', T, 8400, 'units'),
    s('s257', 'Cuff — Black/Orange', T, 8000, 'units'),
    s('s258', 'Cuff — Lime/Black', T, 6800, 'units'),
    s('s259', 'Cuff — White/Black', T, 15240, 'units'),
    s('s260', 'Cuff — White/Navy', T, 3794, 'units'),
    s('s261', 'Cuff — White/Emerald', T, 6806, 'units'),
    s('s262', 'Cuff — Blush Red/Black', T, 3196, 'units'),
    s('s263', 'Cuff — B/Green', T, 3100, 'units'),

    // Reflectors (rolls)
    s('s264', 'Reflector Tape — Lime 25MM', T, 54, 'rolls'),
    s('s265', 'Reflector Tape — Orange', T, 34, 'rolls'),
    s('s266', 'Reflector Tape — 12.5MM', T, 28, 'rolls'),

    // Vylen (rolls)
    s('s267', 'Paper Vylen', T, 564, 'rolls'),
    s('s268', 'Shirt Vylen', T, 1380, 'rolls'),
    s('s269', 'Hard Vylen/Cap', T, 31, 'rolls'),

    // Vynal & Polyflex (rolls)
    s('s270', 'Vynal', T, 153, 'rolls'),
    s('s271', 'Cap Fusing', T, 49, 'rolls'),
    s('s272', 'Polyflex — Clear', T, 21, 'rolls'),
    s('s273', 'Polyflex — Grey', T, 22, 'rolls'),

    // Kidney Belts (pairs)
    s('s274', 'Kidney Belt — S', T, 1, 'pairs'),
    s('s275', 'Kidney Belt — M', T, 36, 'pairs'),
    s('s276', 'Kidney Belt — L', T, 94, 'pairs'),
    s('s277', 'Kidney Belt — XL', T, 56, 'pairs'),
    s('s278', 'Kidney Belt — 2XL', T, 12, 'pairs'),
    s('s279', 'Kidney Belt — 3XL', T, 8, 'pairs'),

    // UNICEF Bag Materials (units)
    s('s280', 'UNICEF Bag — 600D B/Green', T, 420, 'units'),
    s('s281', 'UNICEF Bag — Sliders', T, 17500, 'units'),
    s('s282', 'UNICEF Bag — Threads', T, 621, 'units'),
    s('s283', 'UNICEF Bag — Velcro', T, 95, 'units'),
    s('s284', 'UNICEF Bag — Button Domes', T, 4940, 'units'),
    s('s285', 'UNICEF Bag — L/Webbing 35MM', T, 365, 'units'),
    s('s286', 'UNICEF Bag — L/Webbing 35MM Black', T, 211, 'units'),
    s('s287', 'UNICEF Bag — S/Webbing 25MM', T, 200, 'units'),
    s('s288', 'UNICEF Bag — Poly Binding 25MM', T, 4, 'units'),
    s('s289', 'UNICEF Bag — Ladder Locks', T, 1000, 'units'),

    // ── FINISHED GOODS ─────────────────────────────────────────────────────────

    // Worksuits — Trousers Royal Blue
    s('s290', 'Worksuit Trouser Royal Blue — Size 40', G, 24, 'units'),
    s('s291', 'Worksuit Trouser Royal Blue — Size 42', G, 100, 'units'),
    s('s292', 'Worksuit Trouser Royal Blue — Size 44', G, 17, 'units'),
    s('s293', 'Worksuit Trouser Royal Blue — Size 46', G, 12, 'units'),
    s('s294', 'Worksuit Trouser Royal Blue — Size 48', G, 1, 'units'),

    // Worksuits — Jackets Royal Blue
    s('s295', 'Worksuit Jacket Royal Blue — Size 40', G, 63, 'units'),
    s('s296', 'Worksuit Jacket Royal Blue — Size 42', G, 0, 'units'),
    s('s297', 'Worksuit Jacket Royal Blue — Size 44', G, 179, 'units'),
    s('s298', 'Worksuit Jacket Royal Blue — Size 46', G, 10, 'units'),
    s('s299', 'Worksuit Jacket Royal Blue — Size 48', G, 0, 'units'),

    // Worksuits — Dustcoats Navy Blue
    s('s300', 'Worksuit Dustcoat Navy Blue — Size 40', G, 58, 'units'),
    s('s301', 'Worksuit Dustcoat Navy Blue — Size 44', G, 70, 'units'),
    s('s302', 'Worksuit Dustcoat Navy Blue — Size 48', G, 41, 'units'),

    // Caps (units)
    s('s303', 'Cap — Royal', G, 93, 'units'),
    s('s304', 'Cap — Black', G, 31, 'units'),
    s('s305', 'Cap — Black/White', G, 102, 'units'),
    s('s306', 'Cap — White', G, 1800, 'units'),
    s('s307', 'Cap — Navy', G, 10, 'units'),
    s('s308', 'Cap — Emerald', G, 3347, 'units'),
    s('s309', 'Cap — White Peaks', G, 23800, 'units'),
    s('s310', 'Cap — Refined Tweed', G, 30, 'units'),

    // Raincoats (units)
    s('s311', 'Raincoat — Navy', G, 1419, 'units'),
    s('s312', 'Raincoat — B/Green', G, 977, 'units'),
    s('s313', 'Raincoat — Yellow', G, 949, 'units'),

    // ── PRINTING & DISPLAY ─────────────────────────────────────────────────────

    // Printing Inks (kgs)
    s('s314', 'Printing Ink — Underbase White', P, 60, 'kgs'),
    s('s315', 'Printing Ink — Mixing White', P, 35, 'kgs'),
    s('s316', 'Printing Ink — Highlight White', P, 20, 'kgs'),
    s('s317', 'Printing Ink — OP Lemon Yellow', P, 5, 'kgs'),
    s('s318', 'Printing Ink — OP Azure Blue', P, 5, 'kgs'),
    s('s319', 'Printing Ink — Soft Extender', P, 55, 'kgs'),
    s('s320', 'Printing Ink — OP Golden Yellow', P, 5, 'kgs'),
    s('s321', 'Printing Ink — OP Scarlet Red', P, 20, 'kgs'),
    s('s322', 'Printing Ink — OP Black', P, 60, 'kgs'),
    s('s323', 'Printing Ink — Process Magenta', P, 50, 'kgs'),
    s('s324', 'Printing Ink — Process Black', P, 20, 'kgs'),
    s('s325', 'Printing Ink — Process Cyan', P, 50, 'kgs'),
    s('s326', 'Printing Ink — Wine Red', P, 20, 'kgs'),
    s('s327', 'Printing Ink — Stretch Extender', P, 40, 'kgs'),
    s('s328', 'Printing Ink — OP Green', P, 40, 'kgs'),
    s('s329', 'Printing Ink — Golden Yellow', P, 10, 'kgs'),
    s('s330', 'Printing Ink — Process Yellow', P, 20, 'kgs'),
    s('s331', 'Printing Ink — OP Marine Blue', P, 5, 'kgs'),
    s('s332', 'Printing Ink — 4 Marpaste', P, 50, 'kgs'),
    s('s333', 'Printing Ink — Bleeding Grey', P, 30, 'kgs'),
    s('s334', 'Printing Ink — 6 Marprep', P, 10, 'kgs'),
    s('s335', 'Printing Ink — 7 Marfill', P, 5, 'kgs'),
    s('s336', 'Printing Ink — Screen Tacky', P, 25, 'kgs'),

    // Banners & Display (units)
    s('s337', 'Banner — Backdrop', P, 38, 'units'),
    s('s338', 'Banner — Delux Without Foot', P, 28, 'units'),
    s('s339', 'Banner — Economy With Foot', P, 285, 'units'),
    s('s340', 'Display — Gazebo Frames', P, 192, 'units'),
    s('s341', 'Display — PVC Rolls', P, 48, 'units'),
    s('s342', 'Display — X-Frame', P, 143, 'units'),

    // Snapper Frames (units)
    s('s343', 'Snapper Frame — Wall', P, 84, 'units'),
    s('s344', 'Snapper Frame — A1', P, 110, 'units'),
    s('s345', 'Snapper Frame — A2', P, 170, 'units'),
    s('s346', 'Snapper Frame — A4', P, 4, 'units'),

    // ── MARCHEM PRINTING CONSUMABLES ───────────────────────────────────────────
    // Supplier: Marchem Printing Solutions (Pty) Ltd, South Africa
    // Account: C-KIN001 · Quote: PRO-262107 · Dated: 01 Aug 2025
    // USD price not yet set — editable by executives and accountants.
    {
        ...s('m01', 'Uniflex Underbase White', P, 0, 'container'),
        product_code: 'UF-2015', supplier_name: 'Marchem Printing Solutions (Pty) Ltd',
        supplier_price_zar: 3649.80, supplier_price_usd: null,
        container_size: '20L', quote_ref: 'PRO-262107',
    },
    {
        ...s('m02', 'Uniflex Low Bleed White', P, 0, 'container'),
        product_code: 'UF-2100', supplier_name: 'Marchem Printing Solutions (Pty) Ltd',
        supplier_price_zar: 7295.20, supplier_price_usd: null,
        container_size: '20L', quote_ref: 'PRO-262107',
    },
    {
        ...s('m03', 'Uniflex Highlight White', P, 0, 'container'),
        product_code: 'UF-2400', supplier_name: 'Marchem Printing Solutions (Pty) Ltd',
        supplier_price_zar: 5284.40, supplier_price_usd: null,
        container_size: '20L', quote_ref: 'PRO-262107',
    },
    {
        ...s('m04', 'Uniflex Reducer', P, 0, 'container'),
        product_code: 'UF-3030', supplier_name: 'Marchem Printing Solutions (Pty) Ltd',
        supplier_price_zar: 1199.00, supplier_price_usd: null,
        container_size: '5L', quote_ref: 'PRO-262107',
    },
    {
        ...s('m05', 'Uniflex Opaque Lemon Yellow', P, 0, 'container'),
        product_code: 'UF-9101', supplier_name: 'Marchem Printing Solutions (Pty) Ltd',
        supplier_price_zar: 2004.15, supplier_price_usd: null,
        container_size: '5L', quote_ref: 'PRO-262107',
    },
    {
        ...s('m06', 'Uniflex Opaque Golden Yellow', P, 0, 'container'),
        product_code: 'UF-9102', supplier_name: 'Marchem Printing Solutions (Pty) Ltd',
        supplier_price_zar: 2517.90, supplier_price_usd: null,
        container_size: '5L', quote_ref: 'PRO-262107',
    },
    {
        ...s('m07', 'Uniflex Opaque Scarlet Red', P, 0, 'container'),
        product_code: 'UF-9201', supplier_name: 'Marchem Printing Solutions (Pty) Ltd',
        supplier_price_zar: 7923.30, supplier_price_usd: null,
        container_size: '20L', quote_ref: 'PRO-262107',
    },
    {
        ...s('m08', 'Uniflex Opaque Black', P, 0, 'container'),
        product_code: 'UF-9900', supplier_name: 'Marchem Printing Solutions (Pty) Ltd',
        supplier_price_zar: 4658.50, supplier_price_usd: null,
        container_size: '20L', quote_ref: 'PRO-262107',
    },
    {
        ...s('m09', 'Uniflex Process Magenta', P, 0, 'container'),
        product_code: 'UF-9399', supplier_name: 'Marchem Printing Solutions (Pty) Ltd',
        supplier_price_zar: 1640.10, supplier_price_usd: null,
        container_size: '5L', quote_ref: 'PRO-262107',
    },
    {
        ...s('m10', 'Uniflex Process Black', P, 0, 'container'),
        product_code: 'UF-9999', supplier_name: 'Marchem Printing Solutions (Pty) Ltd',
        supplier_price_zar: 1065.30, supplier_price_usd: null,
        container_size: '5L', quote_ref: 'PRO-262107',
    },
    {
        ...s('m11', 'Uniflex Process Yellow', P, 0, 'container'),
        product_code: 'UF-9199', supplier_name: 'Marchem Printing Solutions (Pty) Ltd',
        supplier_price_zar: 1260.60, supplier_price_usd: null,
        container_size: '5L', quote_ref: 'PRO-262107',
    },
    {
        ...s('m12', 'Marfill Solvent', P, 0, 'container'),
        product_code: 'MS-FIL-S', supplier_name: 'Marchem Printing Solutions (Pty) Ltd',
        supplier_price_zar: 473.10, supplier_price_usd: null,
        container_size: '5L', quote_ref: 'PRO-262107',
    },
    {
        ...s('m13', 'Marsolve', P, 0, 'container'),
        product_code: 'MS-SLV', supplier_name: 'Marchem Printing Solutions (Pty) Ltd',
        supplier_price_zar: 870.10, supplier_price_usd: null,
        container_size: '5L', quote_ref: 'PRO-262107',
    },

    // ── EQUIPMENT ──────────────────────────────────────────────────────────────

    // Sewing Machines (units)
    s('s347', 'Sewing Machine — Straight JK200-01', E, 7, 'units'),
    s('s348', 'Sewing Machine — Straight Heads', E, 6, 'units'),
    s('s349', 'Sewing Machine — Safety/Overlock 677055', E, 1, 'units'),
    s('s350', 'Sewing Machine — JK GT6 SD', E, 2, 'units'),
    s('s351', 'Sewing Machine — Overlock Heads', E, 1, 'units'),
    s('s352', 'Sewing Machine — 2 Needle Tape Attach 8842', E, 1, 'units'),
    s('s353', 'Sewing Machine — Elasticater 1408P', E, 1, 'units'),
    s('s354', 'Sewing Machine — Bartacker LK1850H', E, 3, 'units'),
    s('s355', 'Sewing Machine — Feed of Arm 928H', E, 3, 'units'),
    s('s356', 'Sewing Machine — Blind Stitch CM600-01', E, 3, 'units'),
    s('s357', 'Sewing Machine — Cap Eyelet ZK430D-HE', E, 2, 'units'),
    s('s358', 'Motor — Servo 550W', E, 4, 'units'),
    s('s359', 'Motor — Clutch 400W', E, 10, 'units'),
    s('s360', 'Motor — Induction', E, 38, 'units'),
    s('s361', 'Sewing Table — Overlock', E, 7, 'units'),
    s('s362', 'Sewing Table — Straight', E, 5, 'units'),
    s('s363', 'Heating Element', E, 10, 'units'),
    s('s364', 'Button Attach Machine', E, 4, 'units'),
    s('s365', 'Motor', E, 1, 'units'),

    // Safety Shoes (pairs)
    s('s366', 'Safety Shoe Highcut — Size 3', E, 1, 'pairs'),
    s('s367', 'Safety Shoe Highcut — Size 5', E, 1, 'pairs'),
    s('s368', 'Safety Shoe Highcut — Size 7', E, 14, 'pairs'),
    s('s369', 'Safety Shoe Lowcut — Size 5', E, 1, 'pairs'),
    s('s370', 'Safety Shoe Lowcut — Size 6', E, 3, 'pairs'),

    // ── SUNDRIES ───────────────────────────────────────────────────────────────
    s('s371', 'Disinfectant', SU, 433, 'Ltrs'),
    s('s372', 'Green Soap', SU, 817, 'units'),
    s('s373', 'Umbrella — Black & White', SU, 14, 'units'),
    s('s374', 'Raincoat Snap Button — Navy', SU, 429382, 'units'),
    s('s375', 'Raincoat Snap Button — Yellow', SU, 90150, 'units'),
    s('s376', 'Raincoat Sealing Tape 20MM', SU, 1139, 'units'),
]

export const STOCK_CATEGORIES_LIST = [
    'All', 'Fabrics', 'Trimmings', 'Finished Goods',
    'Printing & Display', 'Equipment', 'Sundries',
]

// ─── Category metadata for tile landing page ──────────────────────────────────
export interface CategoryMeta {
    displayName: string
    slug: string
    descriptor: string
    iconKey: string          // matches Lucide icon name used in the tile page
    barColor: string         // Tailwind bg class for the bottom colour bar
    tileAccentHover: string  // Tailwind ring/border class (unused — handled in UI)
}

export const CATEGORY_META: CategoryMeta[] = [
    { displayName: 'Fabrics', slug: 'fabrics', descriptor: 'Raw fabric rolls and knitted materials', iconKey: 'Layers', barColor: 'bg-blue-500', tileAccentHover: '' },
    { displayName: 'Trimmings', slug: 'trimmings', descriptor: 'Threads, zips, collars, cuffs, and accessories', iconKey: 'Scissors', barColor: 'bg-purple-500', tileAccentHover: '' },
    { displayName: 'Finished Goods', slug: 'finished-goods', descriptor: 'Ready-to-dispatch garments and products', iconKey: 'Package', barColor: 'bg-emerald-500', tileAccentHover: '' },
    { displayName: 'Printing & Display', slug: 'printing-display', descriptor: 'Printing inks, banners, frames, and display materials', iconKey: 'Printer', barColor: 'bg-orange-500', tileAccentHover: '' },
    { displayName: 'Equipment', slug: 'equipment', descriptor: 'Sewing machines, motors, and workshop equipment', iconKey: 'Wrench', barColor: 'bg-slate-500', tileAccentHover: '' },
    { displayName: 'Sundries', slug: 'sundries', descriptor: 'Cleaning products, soap, and miscellaneous items', iconKey: 'Box', barColor: 'bg-teal-500', tileAccentHover: '' },
]

/** Slug → display name, e.g. 'finished-goods' → 'Finished Goods' */
export const CATEGORY_SLUGS: Record<string, string> = Object.fromEntries(
    CATEGORY_META.map(m => [m.slug, m.displayName])
)

/** Display name → slug, e.g. 'Finished Goods' → 'finished-goods' */
export const SLUG_TO_CATEGORY: Record<string, string> = Object.fromEntries(
    CATEGORY_META.map(m => [m.displayName, m.slug])
)

/** Returns all inventory items for a given category display name */
export function getCategoryItems(categoryDisplayName: string) {
    return REAL_INVENTORY.filter(i => i.category === categoryDisplayName)
}

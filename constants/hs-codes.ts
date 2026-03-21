// constants/hs-codes.ts
// ZIMRA Harmonized System codes for Kingsport clothing products

export interface HSCode {
  code: string        // 8-digit code
  code4: string       // First 4 digits (chapter.heading)
  description: string
  category: string
}

export const KINGSPORT_HS_CODES: HSCode[] = [
  // ── T-Shirts ─────────────────────────────────────────────────────────────────
  { code: '61091000', code4: '6109', description: 'T-shirts, singlets and other vests — of cotton', category: 'T-Shirts' },
  { code: '61099000', code4: '6109', description: 'T-shirts, singlets and other vests — of other textile materials', category: 'T-Shirts' },

  // ── Polo / Golf Shirts ────────────────────────────────────────────────────────
  { code: '61051000', code4: '6105', description: "Men's shirts of cotton — knitted or crocheted", category: 'Polo / Golf Shirts' },
  { code: '61052000', code4: '6105', description: "Men's shirts of man-made fibres — knitted or crocheted", category: 'Polo / Golf Shirts' },
  { code: '61061000', code4: '6106', description: "Women's blouses and shirts — of cotton", category: 'Polo / Golf Shirts' },

  // ── Jackets / Outerwear ───────────────────────────────────────────────────────
  { code: '61012000', code4: '6101', description: "Men's overcoats and jackets — of cotton", category: 'Jackets' },
  { code: '61013000', code4: '6101', description: "Men's overcoats and jackets — of man-made fibres", category: 'Jackets' },
  { code: '62019300', code4: '6201', description: "Men's anoraks and similar articles — of man-made fibres", category: 'Jackets' },

  // ── Tracksuits ────────────────────────────────────────────────────────────────
  { code: '62113200', code4: '6211', description: 'Track suits — of cotton', category: 'Tracksuits' },
  { code: '62113300', code4: '6211', description: 'Track suits — of man-made fibres', category: 'Tracksuits' },

  // ── Vests / Workwear ──────────────────────────────────────────────────────────
  { code: '62101000', code4: '6210', description: 'Garments of felt or nonwovens — protective/workwear', category: 'Vests / Workwear' },
  { code: '62113900', code4: '6211', description: 'Other garments — of other textile materials', category: 'Vests / Workwear' },

  // ── School / Uniform ──────────────────────────────────────────────────────────
  { code: '61102000', code4: '6110', description: 'Jerseys, pullovers and similar — of cotton', category: 'School / Uniform' },
  { code: '61103000', code4: '6110', description: 'Jerseys and pullovers — of man-made fibres', category: 'School / Uniform' },

  // ── Headwear ──────────────────────────────────────────────────────────────────
  { code: '65050000', code4: '6505', description: 'Hats and other headgear — knitted or made from lace, felt or other textile fabric', category: 'Headwear' },

  // ── Bags / Accessories ────────────────────────────────────────────────────────
  { code: '42029200', code4: '4202', description: 'Trunks, cases, bags and similar containers — of textile materials', category: 'Bags / Accessories' },
]

// Keyword-based auto-suggest — returns best matching HS code for a product description
export function getDefaultHSCode(productType: string): HSCode | undefined {
  const kw = productType.toLowerCase()
  if (kw.includes('t-shirt') || kw.includes('tshirt') || kw.includes('tee')) return KINGSPORT_HS_CODES[0]
  if (kw.includes('polo') || kw.includes('golf shirt')) return KINGSPORT_HS_CODES[2]
  if (kw.includes("women's shirt") || kw.includes('blouse')) return KINGSPORT_HS_CODES[4]
  if (kw.includes('jacket') || kw.includes('anorak') || kw.includes('outerwear')) return KINGSPORT_HS_CODES[5]
  if (kw.includes('track') || kw.includes('tracksuit')) return KINGSPORT_HS_CODES[8]
  if (kw.includes('vest') || kw.includes('workwear') || kw.includes('worksuit') || kw.includes('overall')) return KINGSPORT_HS_CODES[10]
  if (kw.includes('jersey') || kw.includes('pullover') || kw.includes('jumper')) return KINGSPORT_HS_CODES[12]
  if (kw.includes('cap') || kw.includes('hat') || kw.includes('headgear') || kw.includes('floppy')) return KINGSPORT_HS_CODES[14]
  if (kw.includes('bag') || kw.includes('satchel') || kw.includes('tote')) return KINGSPORT_HS_CODES[15]
  if (kw.includes('shirt') || kw.includes('g-shirt')) return KINGSPORT_HS_CODES[2]
  return undefined
}

// Group codes by category for display
export const HS_CODES_BY_CATEGORY = KINGSPORT_HS_CODES.reduce<Record<string, HSCode[]>>((acc, hs) => {
  if (!acc[hs.category]) acc[hs.category] = []
  acc[hs.category].push(hs)
  return acc
}, {})

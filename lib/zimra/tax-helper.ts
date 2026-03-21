// lib/zimra/tax-helper.ts
// Resolves ZIMRA tax IDs from applicable taxes returned by getConfig

import type { ZimraTax } from '@/types/zimra'

/** Returns ZIMRA taxID for a given percentage. Throws if not found in active taxes. */
export function getTaxIDForPercent(percent: number, applicableTaxes: ZimraTax[]): number {
  const today = new Date().toISOString()
  const match = applicableTaxes.find(t =>
    t.taxPercent === percent &&
    t.taxValidFrom <= today &&
    (!t.taxValidTill || t.taxValidTill >= today)
  )
  if (!match) throw new Error(`No active ZIMRA tax found for ${percent}%. Run getConfig to refresh tax rates.`)
  return match.taxID
}

/** Returns taxID for exempt transactions (no taxPercent). */
export function getExemptTaxID(applicableTaxes: ZimraTax[]): number {
  const match = applicableTaxes.find(t => t.taxPercent === undefined || t.taxPercent === null)
  if (!match) throw new Error('No exempt tax category found in ZIMRA config.')
  return match.taxID
}

/** Returns taxID for 0% rated transactions. */
export function getZeroRatedTaxID(applicableTaxes: ZimraTax[]): number {
  const match = applicableTaxes.find(t => t.taxPercent === 0)
  if (!match) throw new Error('No zero-rated tax category found in ZIMRA config.')
  return match.taxID
}

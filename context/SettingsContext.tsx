'use client'
/**
 * context/SettingsContext.tsx
 * The Meat Up — global settings context, exposes zwg_enabled and usd_to_zwg_rate
 * to all modules so they can conditionally render ZWG UI.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Settings } from '@/types'

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS: Settings = {
  id: 'default',
  business_name: 'The Meat Up',
  admin_name: 'Admin',
  phone: '',
  email: '',
  address: '',
  invoice_prefix: 'TMU',
  invoice_start_number: 1,
  tax_rate: 0,
  logo_url: undefined,
  zwg_enabled: false,       // system is USD-only by default
  usd_to_zwg_rate: 1,       // only used when zwg_enabled=true
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface SettingsContextValue {
  settings: Settings
  updateSettings: (partial: Partial<Settings>) => void
  /** Convenience flag — true only when zwg is on AND there's a valid rate */
  zwgActive: boolean
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  zwgActive: false,
})

// ─── Provider ─────────────────────────────────────────────────────────────────
export function SettingsProvider({ children }: { children: ReactNode }) {
  // TODO: Load from Supabase settings row on mount
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...partial }))
    // TODO: persist to Supabase
  }, [])

  const zwgActive = settings.zwg_enabled && settings.usd_to_zwg_rate > 0

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, zwgActive }}>
      {children}
    </SettingsContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useSettings() {
  return useContext(SettingsContext)
}

/** Convert USD amount to ZWG using the stored rate. Returns null if ZWG inactive. */
export function useZWGAmount(usdAmount: number): string | null {
  const { zwgActive, settings } = useContext(SettingsContext)
  if (!zwgActive) return null
  const zwg = usdAmount * settings.usd_to_zwg_rate
  return `ZWG ${zwg.toLocaleString('en-ZW', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

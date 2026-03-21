// lib/exchange-rate.ts — ZAR/USD Exchange Rate management

export interface ExchangeRateEntry {
    rate: number          // ZAR per 1 USD
    set_by: string        // name of user who set it
    set_at: string        // ISO timestamp
}

export interface ExchangeRateSnapshot extends ExchangeRateEntry {
    // same shape, stored on order record at time of creation
}

// ── Shared state (module-level — simulates a backend store) ──────────────────
// In production this would be fetched from the DB. For mock, it's module state.

const INITIAL_HISTORY: ExchangeRateEntry[] = [
    { rate: 18.20, set_by: 'Kingstone Mhako', set_at: '2026-03-06T09:14:00Z' },
    { rate: 18.05, set_by: 'Kingstone Mhako', set_at: '2026-03-05T08:30:00Z' },
    { rate: 17.90, set_by: 'Ashleigh Kurira', set_at: '2026-03-04T07:55:00Z' },
    { rate: 18.15, set_by: 'Kingstone Mhako', set_at: '2026-03-03T08:10:00Z' },
    { rate: 17.75, set_by: 'Ashleigh Kurira', set_at: '2026-02-28T09:02:00Z' },
]

let _rateHistory: ExchangeRateEntry[] = [...INITIAL_HISTORY]

export function getCurrentRate(): ExchangeRateEntry {
    return _rateHistory[0]
}

export function getRateHistory(): ExchangeRateEntry[] {
    return _rateHistory.slice(0, 10)  // last 10
}

export function setExchangeRate(rate: number, setBy: string): ExchangeRateEntry {
    const entry: ExchangeRateEntry = {
        rate,
        set_by: setBy,
        set_at: new Date().toISOString(),
    }
    _rateHistory = [entry, ..._rateHistory]
    return entry
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function zarToUsd(zarAmount: number, rate: number): number {
    if (!rate || rate === 0) return 0
    return zarAmount / rate
}

export function fmtZAR(n: number): string {
    return `R ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function fmtRateDate(isoTs: string): string {
    return new Date(isoTs).toLocaleDateString('en-ZW', {
        day: '2-digit', month: 'short', year: 'numeric',
    })
}

export function fmtRateDateTime(isoTs: string): string {
    return new Date(isoTs).toLocaleDateString('en-ZW', {
        day: '2-digit', month: 'short', year: 'numeric',
    }) + ' at ' + new Date(isoTs).toLocaleTimeString('en-ZW', {
        hour: '2-digit', minute: '2-digit',
    })
}

// Whether today's rate has been set (compares date portion only)
export function hasTodayRate(): boolean {
    const today = '2026-03-06'  // fixed to system date
    return _rateHistory.some(r => r.set_at.startsWith(today))
}

// The four named ZAR suppliers
export const ZAR_SUPPLIERS = ['Amrod', 'KMQ', 'Mican', 'Marchem'] as const
export type ZarSupplier = typeof ZAR_SUPPLIERS[number]

export function isZarSupplier(supplier: string): boolean {
    return ZAR_SUPPLIERS.includes(supplier as ZarSupplier)
}

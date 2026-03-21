'use client'

/**
 * app/(dashboard)/dashboard/pl-summary/page.tsx
 * The Meat Up — P&L Summary
 * USD by default. Conditional ZWG column when zwg_enabled = true.
 */

import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useSettings } from '@/context/SettingsContext'

// ─── Mock Data ─────────────────────────────────────────────────────────────────
// TODO: Replace with Supabase queries (paid invoices = income, expense categories)
const MONTHLY_DATA = [
  { month: '2026-01', label: 'Jan 2026', income: 7722, cogs: 3194, opex: 1167 },
  { month: '2026-02', label: 'Feb 2026', income: 8833, cogs: 3667, opex: 1278 },
  { month: '2026-03', label: 'Mar 2026', income: 9015, cogs: 3722, opex: 1222 },
]

function calcPL(d: typeof MONTHLY_DATA[0]) {
  const gross_profit = d.income - d.cogs
  const net_profit = gross_profit - d.opex
  return {
    ...d,
    gross_profit,
    net_profit,
    gross_margin_pct: Math.round((gross_profit / d.income) * 100),
    net_margin_pct: Math.round((net_profit / d.income) * 100),
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtUSD(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

// ─── Row Component ────────────────────────────────────────────────────────────
interface PLRowProps {
  label: string
  usd: number
  zwg?: number | null
  isTotal?: boolean
  isNegative?: boolean
  isHeader?: boolean
  showPct?: number
}

function PLRow({ label, usd, zwg, isTotal, isNegative, isHeader, showPct }: PLRowProps) {
  const color = isTotal
    ? (usd >= 0 ? 'var(--accent)' : 'var(--danger)')
    : isNegative ? 'var(--danger)'
    : isHeader ? 'transparent'
    : 'var(--text-primary)'

  const cols = zwg != null ? '1fr 140px 130px 56px' : '1fr 140px 56px'

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: cols,
      padding: isTotal ? '0.875rem 1rem' : '0.5rem 1rem',
      background: isTotal ? 'var(--accent-subtle)' : 'transparent',
      borderBottom: '1px solid var(--border-subtle)',
      borderLeft: isTotal ? '3px solid var(--accent)' : 'none',
      alignItems: 'center',
    }}>
      <span style={{
        fontFamily: 'var(--font-primary)',
        fontWeight: isTotal ? 700 : isHeader ? 600 : 500,
        fontSize: isTotal ? '0.9375rem' : '0.875rem',
        color: isHeader ? 'var(--text-tertiary)' : 'var(--text-primary)',
        letterSpacing: isHeader ? '0.06em' : 0,
        textTransform: isHeader ? 'uppercase' : 'none',
      }}>
        {label}
      </span>

      {/* USD column */}
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontWeight: isTotal ? 700 : 500,
        fontSize: isTotal ? '1.0625rem' : '0.9375rem',
        color: isHeader ? 'var(--text-tertiary)' : isNegative ? 'var(--danger)' : isTotal ? color : 'var(--text-primary)',
        textAlign: 'right',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {isHeader ? 'USD' : fmtUSD(usd)}
      </span>

      {/* ZWG column — conditional */}
      {zwg != null && (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: isTotal ? 700 : 400,
          fontSize: isTotal ? '0.9375rem' : '0.8125rem',
          color: isHeader ? 'var(--text-tertiary)' : 'var(--text-tertiary)',
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {isHeader ? 'ZWG' : `ZWG ${zwg.toLocaleString('en-ZW', { minimumFractionDigits: 0 })}`}
        </span>
      )}

      {/* Margin % */}
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        fontSize: '0.8125rem',
        color: showPct != null ? (showPct >= 0 ? 'var(--success)' : 'var(--danger)') : 'transparent',
        textAlign: 'right',
      }}>
        {showPct != null ? `${showPct}%` : ''}
      </span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PLSummaryPage() {
  const { zwgActive, settings } = useSettings()
  const [period, setPeriod] = useState('2026-03')

  const raw = useMemo(() =>
    MONTHLY_DATA.find(d => d.month === period) ?? MONTHLY_DATA[MONTHLY_DATA.length - 1],
    [period]
  )
  const data = useMemo(() => calcPL(raw), [raw])

  const z = (usd: number) => zwgActive ? usd * settings.usd_to_zwg_rate : null

  return (
    <div style={{ maxWidth: '760px' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">P&L Summary</h1>
          <p className="page-subtitle">Profit & Loss — operational overview</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label className="label" style={{ margin: 0, color: 'var(--text-tertiary)' }}>Period</label>
          <select className="input" style={{ width: 'auto', minWidth: '150px' }} value={period} onChange={e => setPeriod(e.target.value)}>
            {MONTHLY_DATA.map(d => <option key={d.month} value={d.month}>{d.label}</option>)}
          </select>
        </div>
      </div>

      {/* KPI Chips */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Gross Margin', value: `${data.gross_margin_pct}%`, ok: data.gross_margin_pct > 0, icon: data.gross_margin_pct > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" /> },
          { label: 'Net Margin', value: `${data.net_margin_pct}%`, ok: data.net_margin_pct > 0, icon: data.net_margin_pct > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" /> },
          { label: 'Net Profit', value: fmtUSD(data.net_profit), ok: data.net_profit > 0, icon: data.net_profit > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" /> },
        ].map(chip => (
          <div key={chip.label} style={{
            padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)',
            background: chip.ok ? 'var(--success-subtle)' : 'var(--danger-subtle)',
            border: `1px solid ${chip.ok ? 'var(--success-border)' : 'var(--danger-border)'}`,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <span style={{ color: chip.ok ? 'var(--success)' : 'var(--danger)' }}>{chip.icon}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-primary)', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{chip.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', color: chip.ok ? 'var(--success)' : 'var(--danger)', fontVariantNumeric: 'tabular-nums' }}>{chip.value}</div>
            </div>
          </div>
        ))}
        {zwgActive && (
          <div style={{ padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-primary)', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Net Profit (ZWG)</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                ZWG {(data.net_profit * settings.usd_to_zwg_rate).toLocaleString('en-ZW', { minimumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* P&L Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Column header row */}
        <PLRow label="Item" usd={0} zwg={zwgActive ? 0 : null} isHeader showPct={0} />

        {/* Income */}
        <div style={{ padding: '0.5rem 1rem 0.25rem', background: 'var(--bg-subtle)' }}>
          <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '0.6875rem', color: 'var(--success)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>INCOME</span>
        </div>
        <PLRow label="Total Revenue (Paid Invoices)" usd={data.income} zwg={z(data.income)} />

        {/* COGS */}
        <div style={{ padding: '0.5rem 1rem 0.25rem', background: 'var(--bg-subtle)' }}>
          <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '0.6875rem', color: 'var(--warning)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>COST OF GOODS (COGS)</span>
        </div>
        <PLRow label="Stock Purchases" usd={data.cogs} zwg={z(data.cogs)} isNegative />

        {/* Gross Profit */}
        <PLRow label="Gross Profit" usd={data.gross_profit} zwg={z(data.gross_profit)} isTotal showPct={data.gross_margin_pct} />

        {/* OpEx */}
        <div style={{ padding: '0.5rem 1rem 0.25rem', background: 'var(--bg-subtle)' }}>
          <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '0.6875rem', color: 'var(--danger)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>OPERATING EXPENSES</span>
        </div>
        <PLRow label="Rent + Utilities + Wages + Other" usd={data.opex} zwg={z(data.opex)} isNegative />

        {/* Net Profit */}
        <PLRow label="Net Profit" usd={data.net_profit} zwg={z(data.net_profit)} isTotal showPct={data.net_margin_pct} />
      </div>

      <p style={{ fontFamily: 'var(--font-primary)', fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '1rem' }}>
        ⓘ Income = sum of paid invoices in period. COGS = stock purchase expenses. Operating expenses = all other paid expenses.
        {zwgActive && ` ZWG values calculated at 1 USD = ZWG ${settings.usd_to_zwg_rate.toLocaleString()}.`}
      </p>
    </div>
  )
}

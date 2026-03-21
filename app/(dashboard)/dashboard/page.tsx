'use client'

/**
 * app/(dashboard)/dashboard/page.tsx
 * The Meat Up — Owner Dashboard
 * USD-only. ZWG secondary values shown conditionally if zwg_enabled.
 */

import { useMemo } from 'react'
import { DollarSign, Package, FileText, CreditCard, TrendingUp, TrendingDown, AlertTriangle, RefreshCw } from 'lucide-react'
import { useSettings } from '@/context/SettingsContext'

// ─── Mock data (replace with Supabase queries) ─────────────────────────────────
const TODAY_DATE = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

const MOCK_LOW_STOCK = [
  { name: 'Beef Fillet', stock: 3.2, reorder: 5, unit: 'kg' },
  { name: 'Lamb Chops', stock: 2.8, reorder: 4, unit: 'kg' },
  { name: 'Pork Sausages', stock: 6, reorder: 10, unit: 'pack' },
  { name: 'Chicken Portions', stock: 8.5, reorder: 10, unit: 'kg' },
]

const MOCK_KPIS = {
  today_revenue: 395,         // USD
  stock_alerts: 4,
  outstanding_receivables: 2430,
  outstanding_payables: 945,
  mtd_income: 9015,
  mtd_expenses: 4944,
}
const MOCK_NET = MOCK_KPIS.mtd_income - MOCK_KPIS.mtd_expenses

const TREND = [
  { month: 'Oct', revenue: 6800 },
  { month: 'Nov', revenue: 7400 },
  { month: 'Dec', revenue: 8100 },
  { month: 'Jan', revenue: 7722 },
  { month: 'Feb', revenue: 8833 },
  { month: 'Mar', revenue: 9015 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtUSD(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}
function fmtUSDCompact(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}k`
  return fmtUSD(n)
}

// ─── Components ───────────────────────────────────────────────────────────────
interface KPICardProps {
  label: string
  value: string
  zwgValue?: string | null
  sub?: string
  icon: React.ReactNode
  danger?: boolean
  positive?: boolean
}
function KPICard({ label, value, zwgValue, sub, icon, danger, positive }: KPICardProps) {
  const accent = danger ? 'var(--danger)' : positive ? 'var(--success)' : 'var(--accent)'
  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: '0.6875rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
          {label}
        </span>
        <span style={{ color: accent, opacity: 0.7 }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.625rem', color: accent, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
          {value}
        </div>
        {zwgValue && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
            {zwgValue}
          </div>
        )}
        {sub && (
          <div style={{ fontFamily: 'var(--font-primary)', fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}

// Sparkline (inline SVG, no library needed)
function Sparkline({ data }: { data: { month: string; revenue: number }[] }) {
  const max = Math.max(...data.map(d => d.revenue))
  const min = Math.min(...data.map(d => d.revenue))
  const W = 220, H = 52
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((d.revenue - min) / (max - min || 1)) * H
    return `${x},${y}`
  })
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <polyline
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts.join(' ')}
      />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * W
        const y = H - ((d.revenue - min) / (max - min || 1)) * H
        return (
          <circle key={i} cx={x} cy={y} r={i === data.length - 1 ? 4 : 2.5}
            fill={i === data.length - 1 ? 'var(--accent)' : 'var(--bg-surface)'} stroke="var(--accent)" strokeWidth="1.5" />
        )
      })}
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { zwgActive, settings } = useSettings()

  const zwg = useMemo(() => (usd: number) =>
    zwgActive ? `ZWG ${(usd * settings.usd_to_zwg_rate).toLocaleString('en-ZW', { minimumFractionDigits: 0 })}` : null,
    [zwgActive, settings.usd_to_zwg_rate]
  )

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview — {TODAY_DATE}</p>
        </div>
        <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}>
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Low Stock Alert Strip */}
      {MOCK_LOW_STOCK.length > 0 && (
        <div style={{
          background: 'var(--danger-subtle)', border: '1px solid var(--danger-border)',
          borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem',
          marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
        }}>
          <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: 'var(--danger)', marginTop: '0.125rem' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--danger)' }}>
              {MOCK_LOW_STOCK.length} items below reorder level
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {MOCK_LOW_STOCK.map(item => (
                <span key={item.name} style={{
                  fontFamily: 'var(--font-primary)', fontSize: '0.8125rem', fontWeight: 500,
                  color: 'var(--text-secondary)', background: 'var(--bg-surface)',
                  padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  • {item.name} {item.stock}{item.unit} / {item.reorder}{item.unit} min
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <KPICard label="Today's Revenue" value={fmtUSD(MOCK_KPIS.today_revenue)}
          zwgValue={zwg(MOCK_KPIS.today_revenue)}
          icon={<DollarSign className="w-4 h-4" />} positive />
        <KPICard label="Stock Alerts" value={String(MOCK_KPIS.stock_alerts)}
          sub="items below reorder level"
          icon={<Package className="w-4 h-4" />} danger={MOCK_KPIS.stock_alerts > 0} />
        <KPICard label="Receivables" value={fmtUSDCompact(MOCK_KPIS.outstanding_receivables)}
          zwgValue={zwg(MOCK_KPIS.outstanding_receivables)}
          sub="owed to you"
          icon={<FileText className="w-4 h-4" />} positive />
        <KPICard label="Payables" value={fmtUSDCompact(MOCK_KPIS.outstanding_payables)}
          zwgValue={zwg(MOCK_KPIS.outstanding_payables)}
          sub="you owe suppliers"
          icon={<CreditCard className="w-4 h-4" />} danger />
        <KPICard label="Net Cash Position"
          value={fmtUSDCompact(MOCK_KPIS.outstanding_receivables - MOCK_KPIS.outstanding_payables)}
          zwgValue={zwg(MOCK_KPIS.outstanding_receivables - MOCK_KPIS.outstanding_payables)}
          sub="this month"
          icon={(MOCK_KPIS.outstanding_receivables - MOCK_KPIS.outstanding_payables) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          positive={(MOCK_KPIS.outstanding_receivables - MOCK_KPIS.outstanding_payables) >= 0} />
      </div>

      {/* Bottom Row: Monthly P&L + Revenue Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

        {/* Monthly P&L Card */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '1.125rem',
          }}>
            <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
              Monthly P&L — {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          {[
            { label: 'Income', value: MOCK_KPIS.mtd_income, color: 'var(--success)' },
            { label: 'Expenses', value: MOCK_KPIS.mtd_expenses, color: 'var(--danger)' },
            { label: 'Net', value: MOCK_NET, color: MOCK_NET >= 0 ? 'var(--accent)' : 'var(--danger)', bold: true },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.5625rem 0',
              borderBottom: row.label !== 'Net' ? '1px solid var(--border-subtle)' : 'none',
            }}>
              <span style={{ fontFamily: 'var(--font-primary)', fontWeight: row.bold ? 700 : 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: row.bold ? '0.875rem' : '0.8125rem' }}>
                {row.label}
              </span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: row.bold ? 700 : 600, fontSize: row.bold ? '1.0625rem' : '0.9375rem', color: row.color, fontVariantNumeric: 'tabular-nums' }}>
                  {fmtUSD(row.value)}
                </span>
                {zwgActive && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                    ZWG {(row.value * settings.usd_to_zwg_rate).toLocaleString('en-ZW', { minimumFractionDigits: 0 })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Trend Sparkline */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
              6-Month Revenue Trend
            </span>
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.625rem', color: 'var(--accent)', marginBottom: '0.75rem', fontVariantNumeric: 'tabular-nums' }}>
            {fmtUSDCompact(TREND[TREND.length - 1].revenue)}
            <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-tertiary)', marginLeft: '0.5rem' }}>Current month</span>
          </div>
          <Sparkline data={TREND} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem' }}>
            {TREND.map(d => (
              <span key={d.month} style={{ fontFamily: 'var(--font-primary)', fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{d.month}</span>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

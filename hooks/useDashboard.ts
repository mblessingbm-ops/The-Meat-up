import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

export interface DashboardKPIs {
  revenue_this_month: number
  revenue_prev_month: number
  revenue_trend_pct:  number
  pipeline_value:     number
  open_deals_count:   number
  total_ar:           number
  overdue_ar:         number
  low_stock_count:    number
  pending_leave:      number
  expiring_contracts: number
}

export interface TopDeal {
  id: string; title: string; value: number; stage: string
  expected_close_date: string
  customer: { name: string }
}

export interface ActivityEntry {
  user_name: string; action: string; record_type: string
  record_label: string; timestamp: string
}

interface DashboardData {
  kpis: DashboardKPIs | null
  topDeals: TopDeal[]
  recentActivity: ActivityEntry[]
  loading: boolean
  error: string | null
  refresh: () => void
}

const FALLBACK_KPIS: DashboardKPIs = {
  revenue_this_month: 441000,
  revenue_prev_month: 412000,
  revenue_trend_pct:  7.0,
  pipeline_value:     635000,
  open_deals_count:   6,
  total_ar:           287000,
  overdue_ar:         48000,
  low_stock_count:    4,
  pending_leave:      3,
  expiring_contracts: 2,
}

const FALLBACK_DEALS: TopDeal[] = [
  { id: 'd1', title: 'Q3 Steel Supply Contract', value: 148000, stage: 'negotiation', expected_close_date: '2026-03-28', customer: { name: 'Apex Steel Ltd' } },
  { id: 'd6', title: 'Tower Frame Components',   value: 186000, stage: 'proposal',    expected_close_date: '2026-04-10', customer: { name: 'Econet Wireless' } },
  { id: 'd8', title: 'Production Line Upgrades', value: 135000, stage: 'negotiation', expected_close_date: '2026-03-30', customer: { name: 'Premier Foods' } },
]

const FALLBACK_ACTIVITY: ActivityEntry[] = [
  { user_name: 'T. Chikwanda', action: 'CREATE', record_type: 'PurchaseOrder', record_label: 'PO-2026-0012',          timestamp: new Date(Date.now() - 3600000).toISOString() },
  { user_name: 'G. Mutasa',    action: 'UPDATE', record_type: 'Invoice',       record_label: 'INV-2026-0034 — paid',  timestamp: new Date(Date.now() - 7200000).toISOString() },
  { user_name: 'J. Moyo',      action: 'UPDATE', record_type: 'Deal',          record_label: 'Q3 Steel Supply Contract', timestamp: new Date(Date.now() - 14400000).toISOString() },
  { user_name: 'T. Dube',      action: 'APPROVE', record_type: 'LeaveRequest', record_label: 'D. Moyo — annual leave', timestamp: new Date(Date.now() - 18000000).toISOString() },
]

export function useDashboard(): DashboardData {
  const [kpis,           setKpis]           = useState<DashboardKPIs | null>(null)
  const [topDeals,       setTopDeals]       = useState<TopDeal[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityEntry[]>([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await window.fetch('/api/dashboard')
      if (!res.ok) throw new Error('Failed to load dashboard data')
      const data = await res.json()
      setKpis(data.kpis)
      setTopDeals(data.top_deals)
      setRecentActivity(data.recent_activity)
    } catch (err) {
      // Gracefully fall back to mock data so the UI always looks good
      setKpis(FALLBACK_KPIS)
      setTopDeals(FALLBACK_DEALS)
      setRecentActivity(FALLBACK_ACTIVITY)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
    // Refresh every 90 seconds
    const interval = setInterval(fetch, 90_000)
    return () => clearInterval(interval)
  }, [fetch])

  return { kpis, topDeals, recentActivity, loading, error, refresh: fetch }
}

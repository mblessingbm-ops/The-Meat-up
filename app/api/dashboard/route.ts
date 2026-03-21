import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const sb   = createSupabaseAdmin()
  const now  = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const curStart  = new Date(year, month - 1, 1).toISOString()
  const curEnd    = new Date(year, month, 0, 23, 59, 59).toISOString()
  const prevStart = new Date(year, month - 2, 1).toISOString()
  const prevEnd   = new Date(year, month - 1, 0, 23, 59, 59).toISOString()

  // Run all queries in parallel
  const [
    dealsThisMonth,
    dealsPrevMonth,
    openDeals,
    invoiceSummary,
    inventoryLow,
    leaveRequests,
    expiringContracts,
    auditRecent,
    topDeals,
  ] = await Promise.all([
    sb.from('deals').select('value').eq('stage', 'closed_won').gte('actual_close_date', curStart).lte('actual_close_date', curEnd),
    sb.from('deals').select('value').eq('stage', 'closed_won').gte('actual_close_date', prevStart).lte('actual_close_date', prevEnd),
    sb.from('deals').select('id,title,value,stage,customer:customers(name),rep:users(name)').not('stage', 'in', '("closed_won","closed_lost")').order('value', { ascending: false }).limit(5),
    sb.from('invoices').select('status, total_amount').neq('status', 'cancelled'),
    sb.rpc('count_low_stock'),
    sb.from('leave_requests').select('id').eq('status', 'pending'),
    sb.from('employees').select('id').not('contract_expiry', 'is', null).lt('contract_expiry', new Date(now.getFullYear(), now.getMonth() + 2, 1).toISOString()).gt('contract_expiry', now.toISOString()),
    sb.from('audit_logs').select('user_name, action, record_type, record_label, timestamp').order('timestamp', { ascending: false }).limit(8),
    sb.from('deals').select('id,title,value,stage,expected_close_date,customer:customers(name)').not('stage', 'in', '("closed_won","closed_lost")').order('value', { ascending: false }).limit(5),
  ])

  const revThisMonth  = (dealsThisMonth.data ?? []).reduce((s, d) => s + d.value, 0)
  const revPrevMonth  = (dealsPrevMonth.data  ?? []).reduce((s, d) => s + d.value, 0)
  const revTrend      = revPrevMonth === 0 ? 0 : ((revThisMonth - revPrevMonth) / revPrevMonth) * 100

  const invData       = invoiceSummary.data ?? []
  const totalAR       = invData.reduce((s, i) => s + i.total_amount, 0)
  const overdueAR     = invData.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total_amount, 0)
  const pipelineValue = (openDeals.data ?? []).reduce((s, d) => s + d.value, 0)

  return NextResponse.json({
    kpis: {
      revenue_this_month:  revThisMonth,
      revenue_prev_month:  revPrevMonth,
      revenue_trend_pct:   revTrend,
      pipeline_value:      pipelineValue,
      open_deals_count:    openDeals.data?.length ?? 0,
      total_ar:            totalAR,
      overdue_ar:          overdueAR,
      low_stock_count:     (inventoryLow.data as number | null) ?? 0,
      pending_leave:       leaveRequests.data?.length ?? 0,
      expiring_contracts:  expiringContracts.data?.length ?? 0,
    },
    top_deals:   topDeals.data ?? [],
    recent_activity: auditRecent.data ?? [],
  })
}

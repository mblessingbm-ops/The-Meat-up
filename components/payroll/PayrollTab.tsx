'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Users, Clock, AlertTriangle, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_RUNS, MOCK_LOANS, ALL_PAY_PROFILES } from '@/lib/payroll'
import PayrollRunsView from './PayrollRunsView'
import EmployeePaySetupView from './EmployeePaySetupView'
import LoansView from './LoansView'
import PayrollSettingsView from './PayrollSettingsView'

type SubTab = 'Payroll Runs' | 'Employee Pay Setup' | 'Loans & Advances' | 'Payroll Settings'
const SUB_TABS: SubTab[] = ['Payroll Runs', 'Employee Pay Setup', 'Loans & Advances', 'Payroll Settings']

function fmt(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface PayrollTabProps {
  userRole: string
}

export default function PayrollTab({ userRole }: PayrollTabProps) {
  const [sub, setSub] = useState<SubTab>('Payroll Runs')

  // Role flags
  const canView = ['executive', 'accountant', 'hr_officer'].includes(userRole)
  const canCreate = userRole === 'accountant'
  const canApprove = userRole === 'executive'
  const canManageLoans = ['accountant', 'hr_officer'].includes(userRole)
  const canEditSettings = userRole === 'accountant'
  const canEditPaySetup = ['accountant', 'hr_officer'].includes(userRole)

  if (!canView) {
    return (
      <div className="flex items-center justify-center py-20 text-nexus-muted">
        <p className="text-sm">You do not have access to payroll information.</p>
      </div>
    )
  }

  // KPI computations
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const thisMonthRuns = MOCK_RUNS.filter(r => {
    const d = new Date(r.periodEnd)
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear
  })
  const totalPayrollThisMonth = thisMonthRuns.reduce((s, r) => s + r.totalNet, 0)
  const employeesOnPayroll = ALL_PAY_PROFILES.filter(p => p.setupComplete).length
  const pendingApproval = MOCK_RUNS.filter(r => r.status === 'pending_approval').length
  const activeLoans = MOCK_LOANS.filter(l => l.status === 'active').length

  const kpis = [
    { label: 'Payroll This Month', value: fmt(totalPayrollThisMonth || 0), icon: <DollarSign className="w-4 h-4" />, color: 'text-brand-600', bg: 'bg-brand-50', sub: 'Net pay out' },
    { label: 'Employees on Payroll', value: employeesOnPayroll.toString(), icon: <Users className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Profiles complete' },
    { label: 'Pending Approval', value: pendingApproval.toString(), icon: <Clock className="w-4 h-4" />, color: pendingApproval > 0 ? 'text-amber-600' : 'text-nexus-muted', bg: pendingApproval > 0 ? 'bg-amber-50' : 'bg-slate-50', sub: 'Awaiting executive sign-off' },
    { label: 'Active Loans', value: activeLoans.toString(), icon: <AlertTriangle className="w-4 h-4" />, color: 'text-slate-600', bg: 'bg-slate-50', sub: 'Employees with balances' },
    { label: 'Next Run Due', value: '28 Mar 2026', icon: <Calendar className="w-4 h-4" />, color: 'text-nexus-ink', bg: 'bg-nexus-bg', sub: 'Monthly office payroll' },
  ]

  return (
    <div className="space-y-5">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 border-b border-nexus-border">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', k.bg, k.color)}>{k.icon}</div>
            <div>
              <p className="kpi-label text-[11px]">{k.label}</p>
              <p className={cn('font-display font-bold num text-lg mt-0.5 leading-none', k.color)}>{k.value}</p>
              <p className="text-[10px] text-nexus-muted mt-0.5">{k.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sub-navigation */}
      <div className="flex border-b border-nexus-border px-4 overflow-x-auto no-scrollbar">
        {SUB_TABS.map(tab => {
          const badge = tab === 'Payroll Runs' && pendingApproval > 0 ? pendingApproval : 0
          return (
            <button key={tab} onClick={() => setSub(tab)}
              className={cn('py-2.5 px-4 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap flex items-center gap-1.5',
                sub === tab ? 'border-brand-600 text-brand-600' : 'border-transparent text-nexus-muted hover:text-nexus-ink')}>
              {tab}
              {badge > 0 && <span className="badge bg-amber-100 text-amber-700 text-[10px] py-0">{badge}</span>}
            </button>
          )
        })}
      </div>

      {/* Sub-view content */}
      <div className="px-4 pb-6">
        {sub === 'Payroll Runs' && <PayrollRunsView canCreate={canCreate} canApprove={canApprove} />}
        {sub === 'Employee Pay Setup' && <EmployeePaySetupView canEdit={canEditPaySetup} />}
        {sub === 'Loans & Advances' && <LoansView canManage={canManageLoans} canWriteOff={canApprove} />}
        {sub === 'Payroll Settings' && <PayrollSettingsView canEdit={canEditSettings} />}
      </div>
    </div>
  )
}

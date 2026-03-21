'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Eye, CheckCircle, X, ChevronRight, ChevronLeft,
  FileText, Loader2, AlertTriangle, Filter, Download, Users
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  MOCK_RUNS, MOCK_LOANS, OFFICE_STAFF_PROFILES, PRODUCTION_PROFILES,
  ALL_PAY_PROFILES, DEFAULT_SETTINGS, calculatePayslip,
  type PayrollRun, type RunStatus, type RunType, type PayslipInput,
} from '@/lib/payroll'

const STATUS_STYLES: Record<RunStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  pending_approval: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700',
}
const STATUS_LABELS: Record<RunStatus, string> = {
  draft: 'Draft', pending_approval: 'Pending Approval', approved: 'Approved', paid: 'Paid',
}
const TYPE_LABELS: Record<RunType, string> = {
  weekly: 'Weekly', monthly: 'Monthly', combined: 'Combined',
}

function fmt(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ─── Run Detail Modal ──────────────────────────────────────────────────────────
function RunDetailModal({ run, onClose, canApprove }: { run: PayrollRun; onClose: () => void; canApprove: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-nexus-border">
          <div>
            <h3 className="font-display font-bold text-nexus-ink">{run.runId}</h3>
            <p className="text-xs text-nexus-muted mt-0.5">{TYPE_LABELS[run.runType]} · {formatDate(run.periodStart)} – {formatDate(run.periodEnd)}</p>
          </div>
          <button onClick={onClose} className="icon-btn"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Gross', value: fmt(run.totalGross), color: 'text-nexus-ink' },
              { label: 'Total Deductions', value: fmt(run.totalDeductions), color: 'text-red-600' },
              { label: 'Net Pay', value: fmt(run.totalNet), color: 'text-emerald-600' },
              { label: 'Employer Contributions', value: fmt(run.totalEmployerContributions), color: 'text-blue-600' },
            ].map(k => (
              <div key={k.label} className="bg-nexus-bg rounded-xl p-3">
                <p className="text-[11px] text-nexus-muted">{k.label}</p>
                <p className={cn('font-display font-bold text-base num mt-0.5', k.color)}>{k.value}</p>
              </div>
            ))}
          </div>
          <table className="table text-sm w-full">
            <tbody>
              {run.createdBy && <tr><td className="text-nexus-muted py-1.5">Created By</td><td className="font-medium">{run.createdBy}</td></tr>}
              {run.approvedBy && <tr><td className="text-nexus-muted py-1.5">Approved By</td><td className="font-medium">{run.approvedBy}</td></tr>}
              {run.approvedDate && <tr><td className="text-nexus-muted py-1.5">Approved Date</td><td>{formatDate(run.approvedDate)}</td></tr>}
              {run.paidDate && <tr><td className="text-nexus-muted py-1.5">Paid Date</td><td>{formatDate(run.paidDate)}</td></tr>}
              <tr><td className="text-nexus-muted py-1.5">Employees</td><td>{run.employeeCount}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="p-5 border-t border-nexus-border flex justify-between gap-3">
          {canApprove && run.status === 'pending_approval' && (
            <button className="btn-primary flex-1" onClick={() => { toast.success(`${run.runId} approved.`); onClose() }}>
              <CheckCircle className="w-4 h-4" /> Approve Run
            </button>
          )}
          {run.status === 'approved' && (
            <button className="btn-secondary flex-1" onClick={() => { toast.success('Payslips queued for generation.') }}>
              <FileText className="w-4 h-4" /> Generate Payslips
            </button>
          )}
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── New Run Wizard ────────────────────────────────────────────────────────────
interface RunConfig { type: RunType; periodStart: string; periodEnd: string; includeOT: boolean; notes: string }
type EmployeeRow = {
  profileId: string; name: string; department: string; company: string
  baseSalaryOrRate: number; hoursWorked: number; otHours: number
  allowancesTotal: number; bonus: number; loanDeduction: number
  gross: number; paye: number; aidsLevy: number; nssa: number; nec: number; net: number
}

function buildRows(config: RunConfig): EmployeeRow[] {
  const profiles = config.type === 'weekly'
    ? PRODUCTION_PROFILES
    : config.type === 'monthly'
    ? OFFICE_STAFF_PROFILES
    : ALL_PAY_PROFILES
  const settings = DEFAULT_SETTINGS
  return profiles.map(p => {
    const activeLoan = p.activeLoanId ? MOCK_LOANS.find(l => l.id === p.activeLoanId) : null
    const loanDeduction = activeLoan ? Math.min(activeLoan.instalment, activeLoan.balance) : 0
    const hourly = p.payStructure === 'hourly_rate'
    const isWeekly = config.type !== 'monthly'
    const inp: PayslipInput = {
      employeeId: p.employeeId,
      payStructure: p.payStructure,
      baseSalaryOrRate: hourly ? (p.hourlyRate ?? 0) : (p.baseSalary ?? 0),
      hoursWorked: hourly ? settings.standardHoursPerWeek : undefined,
      allowances: p.allowances,
      necApplicable: p.necApplicable,
      isWeekly,
      loanDeduction,
      settings,
    }
    const r = calculatePayslip(inp)
    return {
      profileId: p.employeeId, name: p.name, department: p.department, company: p.company,
      baseSalaryOrRate: inp.baseSalaryOrRate,
      hoursWorked: settings.standardHoursPerWeek, otHours: 0,
      allowancesTotal: (p.allowances ?? []).reduce((s, a) => s + a.amount, 0),
      bonus: 0, loanDeduction,
      gross: r.grossTotal, paye: r.paye, aidsLevy: r.aidsLevy,
      nssa: r.nssaEmployee, nec: r.necEmployee, net: r.netPay,
    }
  })
}

function NewRunWizard({ onClose, onSave }: { onClose: () => void; onSave: (run: PayrollRun) => void }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<RunConfig>({
    type: 'monthly',
    periodStart: '2026-03-01',
    periodEnd: '2026-03-31',
    includeOT: true,
    notes: '',
  })
  const [companyFilter, setCompanyFilter] = useState<string>('All')
  const rows = useMemo(() => step >= 2 ? buildRows(config) : [], [step, config])
  const filteredRows = companyFilter === 'All' ? rows : rows.filter(r => r.company === companyFilter)
  const totals = useMemo(() => rows.reduce((acc, r) => ({
    gross: acc.gross + r.gross, paye: acc.paye + r.paye, nssa: acc.nssa + r.nssa,
    nec: acc.nec + r.nec, net: acc.net + r.net,
    deductions: acc.deductions + r.paye + r.aidsLevy + r.nssa + r.nec + r.loanDeduction,
  }), { gross: 0, paye: 0, nssa: 0, nec: 0, net: 0, deductions: 0 }), [rows])

  const handleSubmit = (status: 'draft' | 'pending_approval') => {
    setLoading(true)
    setTimeout(() => {
      const now = new Date().getFullYear()
      const newRun: PayrollRun = {
        runId: `PAY-${now}-03-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        runType: config.type, periodStart: config.periodStart, periodEnd: config.periodEnd,
        companyScope: 'all', status,
        totalGross: totals.gross, totalDeductions: totals.deductions, totalNet: totals.net,
        totalEmployerContributions: totals.gross * 0.015,
        employeeCount: rows.length,
        createdBy: 'Ashleigh Kurira', notes: config.notes,
      }
      onSave(newRun)
      toast.success(status === 'draft' ? 'Saved as draft.' : 'Submitted for approval. Executives notified.')
      setLoading(false)
      onClose()
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-nexus-border flex-shrink-0">
          <div>
            <h3 className="font-display font-bold text-nexus-ink">New Payroll Run</h3>
            <div className="flex gap-4 mt-2">
              {[1,2,3].map(s => (
                <div key={s} className={cn('flex items-center gap-1.5 text-xs font-medium', step === s ? 'text-brand-600' : step > s ? 'text-emerald-600' : 'text-nexus-muted')}>
                  <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border',
                    step === s ? 'bg-brand-600 text-white border-brand-600' : step > s ? 'bg-emerald-500 text-white border-emerald-500' : 'border-nexus-border text-nexus-muted'
                  )}>{step > s ? '✓' : s}</div>
                  {['Configuration', 'Pay Input', 'Review'][s-1]}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="icon-btn"><X className="w-4 h-4" /></button>
        </div>

        {/* Step 1 — Config */}
        {step === 1 && (
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Run Type</label>
                <select className="input" value={config.type} onChange={e => setConfig(p => ({ ...p, type: e.target.value as RunType }))}>
                  <option value="monthly">Monthly (Office Staff)</option>
                  <option value="weekly">Weekly (Production)</option>
                  <option value="combined">Combined (All)</option>
                </select>
              </div>
              <div>
                <label className="form-label">Period Start</label>
                <input type="date" className="input" value={config.periodStart} onChange={e => setConfig(p => ({ ...p, periodStart: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Period End</label>
                <input type="date" className="input" value={config.periodEnd} onChange={e => setConfig(p => ({ ...p, periodEnd: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setConfig(p => ({ ...p, includeOT: !p.includeOT }))}
                className={cn('w-10 h-6 rounded-full transition-colors relative flex-shrink-0', config.includeOT ? 'bg-brand-600' : 'bg-slate-200')}>
                <span className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform', config.includeOT ? 'translate-x-5' : 'translate-x-1')} />
              </button>
              <span className="text-sm text-nexus-ink">Include Overtime Input</span>
            </div>
            <div>
              <label className="form-label">Notes (optional)</label>
              <textarea className="input h-20 resize-none" value={config.notes} onChange={e => setConfig(p => ({ ...p, notes: e.target.value }))} placeholder="Internal notes for this payroll run…" />
            </div>
          </div>
        )}

        {/* Step 2 — Pay Input */}
        {step === 2 && (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-nexus-border flex-shrink-0">
              <Filter className="w-3.5 h-3.5 text-nexus-muted" />
              {['All','Kingsport','Bralyn','SGA'].map(c => (
                <button key={c} onClick={() => setCompanyFilter(c)}
                  className={cn('px-3 py-1 rounded-full text-xs font-medium transition-colors', companyFilter === c ? 'bg-brand-600 text-white' : 'bg-nexus-bg text-nexus-muted hover:text-nexus-ink')}>
                  {c}
                </button>
              ))}
              <span className="ml-auto text-xs text-nexus-muted">{filteredRows.length} employees</span>
            </div>
            <div className="overflow-auto flex-1">
              <table className="table text-xs w-full min-w-[900px]">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-3 sticky left-0 bg-nexus-bg z-10">Employee</th>
                    <th className="text-right py-2 px-2">Base Pay</th>
                    {(config.type !== 'monthly') && <th className="text-right py-2 px-2">Hours</th>}
                    <th className="text-right py-2 px-2">Allowances</th>
                    <th className="text-right py-2 px-2">Gross</th>
                    <th className="text-right py-2 px-2">PAYE</th>
                    <th className="text-right py-2 px-2">NSSA</th>
                    <th className="text-right py-2 px-2">NEC</th>
                    <th className="text-right py-2 px-2">Loan</th>
                    <th className="text-right py-2 px-2 font-bold">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r, i) => (
                    <tr key={r.profileId} className={i % 2 === 0 ? 'bg-white' : 'bg-nexus-bg/40'}>
                      <td className="py-2 px-3 sticky left-0 bg-inherit z-10">
                        <p className="font-medium text-nexus-ink">{r.name}</p>
                        <div className="flex gap-1 mt-0.5">
                          <span className={cn('badge text-[9px] py-0', r.company === 'Kingsport' ? 'badge-blue' : r.company === 'Bralyn' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600')}>{r.company}</span>
                          <span className="text-nexus-muted">{r.department}</span>
                        </div>
                      </td>
                      <td className="text-right px-2 num">{fmt(r.baseSalaryOrRate)}</td>
                      {(config.type !== 'monthly') && <td className="text-right px-2 num">{r.hoursWorked}</td>}
                      <td className="text-right px-2 num">{fmt(r.allowancesTotal)}</td>
                      <td className="text-right px-2 num font-medium">{fmt(r.gross)}</td>
                      <td className="text-right px-2 num text-red-500">{fmt(r.paye)}</td>
                      <td className="text-right px-2 num text-red-500">{fmt(r.nssa)}</td>
                      <td className="text-right px-2 num text-red-500">{fmt(r.nec)}</td>
                      <td className="text-right px-2 num text-amber-600">{r.loanDeduction > 0 ? fmt(r.loanDeduction) : '—'}</td>
                      <td className="text-right px-2 num font-bold text-emerald-600">{fmt(r.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Totals bar */}
            <div className="flex-shrink-0 border-t border-nexus-border bg-nexus-bg px-5 py-3 flex gap-6 overflow-x-auto text-xs">
              {[
                { label: 'Total Gross', value: totals.gross, color: 'text-nexus-ink' },
                { label: 'Total PAYE', value: totals.paye, color: 'text-red-500' },
                { label: 'Total NSSA', value: totals.nssa, color: 'text-red-500' },
                { label: 'Total NEC', value: totals.nec, color: 'text-red-500' },
                { label: 'Total Deductions', value: totals.deductions, color: 'text-red-600' },
                { label: 'Total Net', value: totals.net, color: 'text-emerald-600' },
              ].map(t => (
                <div key={t.label} className="flex-shrink-0">
                  <p className="text-nexus-muted">{t.label}</p>
                  <p className={cn('font-display font-bold num', t.color)}>{fmt(t.value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <div className="p-6 space-y-5 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Gross', value: fmt(totals.gross), color: 'text-nexus-ink' },
                { label: 'Total Deductions', value: fmt(totals.deductions), color: 'text-red-600' },
                { label: 'Net Pay', value: fmt(totals.net), color: 'text-emerald-600' },
                { label: 'Employees', value: rows.length.toString(), color: 'text-brand-600' },
              ].map(k => (
                <div key={k.label} className="bg-nexus-bg rounded-xl p-3 text-center">
                  <p className="text-[11px] text-nexus-muted">{k.label}</p>
                  <p className={cn('font-display font-bold num mt-0.5', k.color)}>{k.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-nexus-bg rounded-xl p-4 space-y-2 text-sm">
              <p><span className="text-nexus-muted">Run Type:</span> {TYPE_LABELS[config.type]}</p>
              <p><span className="text-nexus-muted">Period:</span> {formatDate(config.periodStart)} – {formatDate(config.periodEnd)}</p>
              <p><span className="text-nexus-muted">Company Scope:</span> All (Kingsport · Bralyn · SGA)</p>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">Submitting for approval will notify all executives. Once approved, payslips can be generated and payroll marked as paid.</p>
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div className="flex justify-between p-5 border-t border-nexus-border flex-shrink-0">
          {step > 1 ? (
            <button className="btn-secondary" onClick={() => setStep(s => s - 1)}>
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}
          <div className="flex gap-2">
            {step === 3 && (
              <button className="btn-secondary" onClick={() => handleSubmit('draft')} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save as Draft
              </button>
            )}
            {step < 3 ? (
              <button className="btn-primary" onClick={() => setStep(s => s + 1)}>
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button className="btn-primary" onClick={() => handleSubmit('pending_approval')} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Submit for Approval
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main Payroll Runs View ────────────────────────────────────────────────────
export default function PayrollRunsView({ canCreate, canApprove }: { canCreate: boolean; canApprove: boolean }) {
  const [runs, setRuns] = useState<PayrollRun[]>(MOCK_RUNS)
  const [showWizard, setShowWizard] = useState(false)
  const [viewRun, setViewRun] = useState<PayrollRun | null>(null)

  const handleApprove = (runId: string) => {
    setRuns(prev => prev.map(r => r.runId === runId ? { ...r, status: 'approved', approvedBy: 'Kingstone Mhako', approvedDate: new Date().toISOString().slice(0, 10) } : r))
    toast.success(`${runId} has been approved.`)
  }
  const handleMarkPaid = (runId: string) => {
    setRuns(prev => prev.map(r => r.runId === runId ? { ...r, status: 'paid', paidDate: new Date().toISOString().slice(0, 10) } : r))
    toast.success(`${runId} marked as paid.`)
  }
  const handleDelete = (runId: string) => {
    setRuns(prev => prev.filter(r => r.runId !== runId))
    toast.success(`Draft ${runId} deleted.`)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canCreate && (
          <button className="btn-primary btn-sm" onClick={() => setShowWizard(true)}>
            <Plus className="w-3.5 h-3.5" /> New Payroll Run
          </button>
        )}
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Run ID</th>
              <th>Period</th>
              <th>Type</th>
              <th className="text-right">Employees</th>
              <th className="text-right">Gross Pay</th>
              <th className="text-right">Deductions</th>
              <th className="text-right">Net Pay</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {runs.map(run => (
              <tr key={run.runId}>
                <td className="font-mono text-xs font-medium text-nexus-ink">{run.runId}</td>
                <td className="text-xs">{formatDate(run.periodStart)} – {formatDate(run.periodEnd)}</td>
                <td><span className="badge badge-blue">{TYPE_LABELS[run.runType]}</span></td>
                <td className="text-right num">{run.employeeCount}</td>
                <td className="text-right num font-medium">{fmt(run.totalGross)}</td>
                <td className="text-right num text-red-500">{fmt(run.totalDeductions)}</td>
                <td className="text-right num font-bold text-emerald-600">{fmt(run.totalNet)}</td>
                <td><span className={cn('badge', STATUS_STYLES[run.status])}>{STATUS_LABELS[run.status]}</span></td>
                <td>
                  <div className="flex gap-1.5">
                    <button className="icon-btn" title="View" onClick={() => setViewRun(run)}><Eye className="w-3.5 h-3.5" /></button>
                    {canApprove && run.status === 'pending_approval' && (
                      <button className="btn-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-2 py-1 text-xs font-medium flex items-center gap-1" onClick={() => handleApprove(run.runId)}>
                        <CheckCircle className="w-3 h-3" /> Approve
                      </button>
                    )}
                    {canCreate && run.status === 'approved' && (
                      <button className="btn-sm btn-secondary text-xs flex items-center gap-1" onClick={() => handleMarkPaid(run.runId)}>
                        Mark Paid
                      </button>
                    )}
                    {run.status === 'approved' || run.status === 'paid' ? (
                      <button className="icon-btn" title="Download Payslips" onClick={() => toast.success('Payslips download queued.')}><Download className="w-3.5 h-3.5" /></button>
                    ) : null}
                    {run.status === 'draft' && canCreate && (
                      <button className="icon-btn text-red-400 hover:text-red-600" title="Delete" onClick={() => handleDelete(run.runId)}><X className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AnimatePresence>
        {showWizard && (
          <NewRunWizard
            onClose={() => setShowWizard(false)}
            onSave={run => setRuns(prev => [run, ...prev])}
          />
        )}
        {viewRun && (
          <RunDetailModal run={viewRun} onClose={() => setViewRun(null)} canApprove={canApprove} />
        )}
      </AnimatePresence>
    </div>
  )
}

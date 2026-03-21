'use client'
import { useState } from 'react'
import { Plus, X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { MOCK_LOANS, type Loan } from '@/lib/payroll'

const LOAN_STATUS_STYLES = {
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-slate-100 text-slate-600',
  written_off: 'bg-red-100 text-red-600',
}

function fmt(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function NewLoanModal({ onClose, onSave }: { onClose: () => void; onSave: (l: Loan) => void }) {
  const [form, setForm] = useState({ employeeName: '', loanType: 'loan', amount: '', instalment: '', approvedBy: 'Kingstone Mhako', notes: '' })
  const instalments = form.amount && form.instalment ? Math.ceil(parseFloat(form.amount) / parseFloat(form.instalment)) : 0

  const handleSave = () => {
    if (!form.employeeName || !form.amount) { toast.error('Employee name and amount are required.'); return }
    const amount = parseFloat(form.amount)
    const instalment = parseFloat(form.instalment) || amount
    const loan: Loan = {
      id: `loan-${Date.now()}`, employeeId: 'tbd', employeeName: form.employeeName,
      company: 'Kingsport', loanType: form.loanType as Loan['loanType'],
      amount, instalment, numberOfInstalments: instalments || 1,
      instalmentsPaid: 0, balance: amount,
      dateIssued: new Date().toISOString().slice(0, 10),
      expectedCompletion: new Date(Date.now() + instalments * 30 * 86400000).toISOString().slice(0, 10),
      approvedBy: form.approvedBy, status: 'active', notes: form.notes,
    }
    onSave(loan)
    toast.success('Loan record created.')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-nexus-border">
          <h3 className="font-display font-bold text-nexus-ink">New Loan / Advance</h3>
          <button onClick={onClose} className="icon-btn"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="form-label">Employee</label>
            <input className="input" placeholder="Type employee name…" value={form.employeeName} onChange={e => setForm(p => ({ ...p, employeeName: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Loan Type</label>
            <select className="input" value={form.loanType} onChange={e => setForm(p => ({ ...p, loanType: e.target.value }))}>
              <option value="loan">Loan (instalments)</option>
              <option value="salary_advance">Salary Advance (full deduction next run)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Amount (USD)</label>
              <input type="number" className="input" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
            </div>
            {form.loanType === 'loan' && (
              <div>
                <label className="form-label">Instalment (USD/run)</label>
                <input type="number" className="input" value={form.instalment} onChange={e => setForm(p => ({ ...p, instalment: e.target.value }))} />
              </div>
            )}
          </div>
          {instalments > 0 && <p className="text-xs text-nexus-muted">{instalments} instalment{instalments > 1 ? 's' : ''} required</p>}
          <div>
            <label className="form-label">Approved By</label>
            <select className="input" value={form.approvedBy} onChange={e => setForm(p => ({ ...p, approvedBy: e.target.value }))}>
              {['Kingstone Mhako','Lyn Mhako','Blessing Mhako','Energy Deshe'].map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Notes (optional)</label>
            <textarea className="input h-16 resize-none" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
        </div>
        <div className="p-5 border-t border-nexus-border flex gap-2">
          <button className="btn-primary flex-1" onClick={handleSave}>Create Loan Record</button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function LoansView({ canManage, canWriteOff }: { canManage: boolean; canWriteOff: boolean }) {
  const [loans, setLoans] = useState<Loan[]>(MOCK_LOANS)
  const [showNew, setShowNew] = useState(false)

  const handleWriteOff = (id: string) => {
    setLoans(prev => prev.map(l => l.id === id ? { ...l, status: 'written_off' as const } : l))
    toast.success('Loan written off.')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canManage && (
          <button className="btn-primary btn-sm" onClick={() => setShowNew(true)}>
            <Plus className="w-3.5 h-3.5" /> New Loan / Advance
          </button>
        )}
      </div>
      <div className="table-wrapper">
        <table className="table text-sm">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Company</th>
              <th>Type</th>
              <th className="text-right">Amount</th>
              <th>Issued</th>
              <th className="text-right">Balance</th>
              <th className="text-right">Instalment</th>
              <th>Expected Completion</th>
              <th>Approved By</th>
              <th>Status</th>
              {(canManage || canWriteOff) && <th />}
            </tr>
          </thead>
          <tbody>
            {loans.map(loan => (
              <tr key={loan.id}>
                <td className="font-medium text-nexus-ink">{loan.employeeName}</td>
                <td><span className={cn('badge', loan.company === 'Kingsport' ? 'badge-blue' : 'bg-purple-100 text-purple-700')}>{loan.company}</span></td>
                <td className="text-xs">{loan.loanType === 'loan' ? 'Loan' : 'Salary Advance'}</td>
                <td className="text-right num">{fmt(loan.amount)}</td>
                <td className="text-xs">{loan.dateIssued}</td>
                <td className="text-right num font-bold">{fmt(loan.balance)}</td>
                <td className="text-right num">{fmt(loan.instalment)}</td>
                <td className="text-xs">{loan.expectedCompletion}</td>
                <td className="text-xs">{loan.approvedBy}</td>
                <td><span className={cn('badge', LOAN_STATUS_STYLES[loan.status])}>{loan.status.replace('_', ' ')}</span></td>
                {(canManage || canWriteOff) && (
                  <td>
                    {canWriteOff && loan.status === 'active' && (
                      <button className="text-xs text-red-500 hover:text-red-700 font-medium" onClick={() => handleWriteOff(loan.id)}>Write Off</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {loans.length === 0 && (
              <tr><td colSpan={11} className="text-center text-nexus-muted py-8">No loan records.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {showNew && (
        <NewLoanModal
          onClose={() => setShowNew(false)}
          onSave={l => { setLoans(prev => [l, ...prev]); setShowNew(false) }}
        />
      )}
    </div>
  )
}

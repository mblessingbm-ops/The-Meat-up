'use client'
import React, { useState, useMemo } from 'react'
import { Search, ChevronRight, X, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { ALL_PAY_PROFILES, type EmployeePayProfile } from '@/lib/payroll'

function fmt(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function ProfileDrawer({ profile, onClose, onSave }: { profile: EmployeePayProfile; onClose: () => void; onSave: (p: EmployeePayProfile) => void }) {
  const [form, setForm] = useState({ ...profile })
  const set = (k: keyof EmployeePayProfile, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl" style={{ animation: 'slideInRight 0.2s ease-out' }}>
        <div className="flex items-center justify-between p-5 border-b border-nexus-border">
          <div>
            <h3 className="font-display font-bold text-nexus-ink">Pay Profile</h3>
            <p className="text-xs text-nexus-muted mt-0.5">{profile.name} · {profile.department}</p>
          </div>
          <button onClick={onClose} className="icon-btn"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="form-label">Pay Structure</label>
            <select className="input" value={form.payStructure} onChange={e => set('payStructure', e.target.value)}>
              <option value="monthly_salary">Monthly Salary</option>
              <option value="hourly_rate">Hourly Rate</option>
            </select>
          </div>
          {form.payStructure === 'monthly_salary' ? (
            <div>
              <label className="form-label">Base Salary (USD/month)</label>
              <input type="number" className="input" value={form.baseSalary ?? ''} onChange={e => set('baseSalary', parseFloat(e.target.value) || 0)} />
            </div>
          ) : (
            <div>
              <label className="form-label">Hourly Rate (USD/hr)</label>
              <input type="number" step="0.01" className="input" value={form.hourlyRate ?? ''} onChange={e => set('hourlyRate', parseFloat(e.target.value) || 0)} />
            </div>
          )}
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => set('necApplicable', !form.necApplicable)}
              className={cn('w-10 h-6 rounded-full transition-colors relative flex-shrink-0', form.necApplicable ? 'bg-brand-600' : 'bg-slate-200')}>
              <span className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform', form.necApplicable ? 'translate-x-5' : 'translate-x-1')} />
            </button>
            <span className="text-sm text-nexus-ink">NEC Applicable (Clothing Sector)</span>
          </div>
          <div>
            <label className="form-label">NSSA Number (optional)</label>
            <input className="input" value={form.nssaNumber ?? ''} onChange={e => set('nssaNumber', e.target.value)} placeholder="NSSA-XXXX" />
          </div>
          <div>
            <label className="form-label">Tax Reference (optional)</label>
            <input className="input" value={form.taxReference ?? ''} onChange={e => set('taxReference', e.target.value)} placeholder="ZIMRA ref" />
          </div>
          <div>
            <label className="form-label">Bank Name (optional)</label>
            <input className="input" value={form.bankName ?? ''} onChange={e => set('bankName', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Bank Account (optional)</label>
            <input className="input" value={form.bankAccount ?? ''} onChange={e => set('bankAccount', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Payroll Notes</label>
            <textarea className="input h-20 resize-none" value={form.payrollNotes ?? ''} onChange={e => set('payrollNotes', e.target.value)} />
          </div>
        </div>
        <div className="p-5 border-t border-nexus-border flex gap-2">
          <button className="btn-primary flex-1" onClick={() => { onSave({ ...form, setupComplete: true }); toast.success('Pay profile saved.'); onClose() }}>
            <Save className="w-4 h-4" /> Save Profile
          </button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function EmployeePaySetupView({ canEdit }: { canEdit: boolean }) {
  const [profiles, setProfiles] = useState<EmployeePayProfile[]>(ALL_PAY_PROFILES)
  const [search, setSearch] = useState('')
  const [companyFilter, setCompanyFilter] = useState('All')
  const [editProfile, setEditProfile] = useState<EmployeePayProfile | null>(null)

  const filtered = useMemo(() => profiles.filter(p =>
    (companyFilter === 'All' || p.company === companyFilter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  ), [profiles, search, companyFilter])

  const incomplete = profiles.filter(p => !p.setupComplete).length

  return (
    <div className="space-y-4">
      {incomplete > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <span className="text-amber-700 text-sm font-medium">{incomplete} employee{incomplete > 1 ? 's' : ''} without a complete pay profile.</span>
        </div>
      )}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nexus-muted" />
          <input className="input pl-9" placeholder="Search employees…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['All','Kingsport','Bralyn','SGA'].map(c => (
          <button key={c} onClick={() => setCompanyFilter(c)}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors', companyFilter === c ? 'bg-brand-600 text-white' : 'bg-nexus-bg text-nexus-muted hover:text-nexus-ink')}>
            {c}
          </button>
        ))}
      </div>
      <div className="table-wrapper">
        <table className="table text-sm">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Company</th>
              <th>Pay Structure</th>
              <th className="text-right">Rate</th>
              <th>NEC</th>
              <th>NSSA No.</th>
              <th>Status</th>
              {canEdit && <th />}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.employeeId}>
                <td>
                  <p className="font-medium text-nexus-ink">{p.name}</p>
                  <p className="text-xs text-nexus-muted">{p.department}</p>
                </td>
                <td>
                  <span className={cn('badge', p.company === 'Kingsport' ? 'badge-blue' : p.company === 'Bralyn' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600')}>{p.company}</span>
                </td>
                <td className="text-xs">{p.payStructure === 'monthly_salary' ? 'Monthly' : 'Hourly'}</td>
                <td className="text-right num text-xs">
                  {p.payStructure === 'monthly_salary' ? fmt(p.baseSalary ?? 0) + '/mo' : fmt(p.hourlyRate ?? 0) + '/hr'}
                </td>
                <td>
                  <span className={cn('badge', p.necApplicable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
                    {p.necApplicable ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="text-xs text-nexus-muted">{p.nssaNumber ?? '—'}</td>
                <td>
                  <span className={cn('badge', p.setupComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                    {p.setupComplete ? 'Complete' : 'Incomplete'}
                  </span>
                </td>
                {canEdit && (
                  <td>
                    <button className="icon-btn" onClick={() => setEditProfile(p)}><ChevronRight className="w-4 h-4" /></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editProfile && (
        <ProfileDrawer
          profile={editProfile}
          onClose={() => setEditProfile(null)}
          onSave={updated => {
            setProfiles(prev => prev.map(p => p.employeeId === updated.employeeId ? updated : p))
            setEditProfile(null)
          }}
        />
      )}
    </div>
  )
}

'use client'

/**
 * app/(dashboard)/dashboard/expenses/page.tsx
 * The Meat Up — Expenses & Payables
 * USD by default. Currency selector only shown when zwg_enabled = true.
 */

import { useState, useMemo } from 'react'
import { Plus, Search, CheckCircle, Pencil, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Expense, ExpenseCategory, ExpenseStatus, Currency } from '@/types'
import { useSettings } from '@/context/SettingsContext'

// ─── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES: ExpenseCategory[] = ['Rent', 'Utilities', 'Wages', 'Stock Purchase', 'Transport', 'Packaging', 'Other']
const CAT_COLORS: Record<ExpenseCategory, string> = {
  'Rent': '#E57373', 'Utilities': '#FFB74D', 'Wages': '#81C784',
  'Stock Purchase': '#64B5F6', 'Transport': '#FF8A65', 'Packaging': '#CE93D8', 'Other': '#9E9E9E',
}

const INITIAL_EXPENSES: Expense[] = [
  { id: '1', date: '2026-03-01', description: 'March Rent — Market Stall', category: 'Rent', amount: 350, currency: 'USD', status: 'Paid', created_at: '', updated_at: '' },
  { id: '2', date: '2026-03-05', description: 'ZESA Electricity', category: 'Utilities', amount: 85, currency: 'USD', status: 'Paid', created_at: '', updated_at: '' },
  { id: '3', date: '2026-03-10', description: 'Staff Wages — March', category: 'Wages', amount: 420, currency: 'USD', status: 'Paid', created_at: '', updated_at: '' },
  { id: '4', date: '2026-03-12', description: 'Pioneer Livestock — Beef order', category: 'Stock Purchase', amount: 450, currency: 'USD', supplier_name: 'Pioneer Livestock', status: 'Unpaid', due_date: '2026-03-19', created_at: '', updated_at: '' },
  { id: '5', date: '2026-03-14', description: 'Braai Masters — Pork & Processed', category: 'Stock Purchase', amount: 195, currency: 'USD', supplier_name: 'Braai Masters Ltd', status: 'Unpaid', due_date: '2026-03-28', created_at: '', updated_at: '' },
  { id: '6', date: '2026-03-16', description: 'Vacuum packaging bags', category: 'Packaging', amount: 65, currency: 'USD', status: 'Paid', created_at: '', updated_at: '' },
  { id: '7', date: '2026-03-18', description: 'Delivery fuel', category: 'Transport', amount: 40, currency: 'USD', status: 'Paid', created_at: '', updated_at: '' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtUSD(n: number) { return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }

// ─── Expense Modal ─────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  date: new Date().toISOString().slice(0, 10),
  description: '',
  category: 'Other' as ExpenseCategory,
  amount: 0,
  currency: 'USD' as Currency,
  supplier_name: '',
  status: 'Unpaid' as ExpenseStatus,
  due_date: '',
  notes: '',
}

function ExpenseModal({ expense, onClose, onSave, zwgActive }: {
  expense: Expense | null
  onClose: () => void
  onSave: (e: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => void
  zwgActive: boolean
}) {
  const editing = !!expense?.id
  const [form, setForm] = useState({ ...EMPTY_FORM, ...(expense ?? {}) })
  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm(f => ({ ...f, [k]: v })) }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h2 className="modal-title">{editing ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.375rem' }}><X className="w-4 h-4" /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1.25rem 1.5rem' }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label className="label">Description</label>
            <input type="text" className="input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. March rent, Pioneer Livestock order..." />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => set('category', e.target.value as ExpenseCategory)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          {/* Currency selector — only shown when ZWG is enabled */}
          {zwgActive && (
            <div>
              <label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={e => set('currency', e.target.value as Currency)}>
                <option value="USD">USD — US Dollar</option>
                <option value="ZWG">ZWG — Zimbabwe Gold</option>
              </select>
            </div>
          )}
          <div>
            <label className="label">Amount ({form.currency})</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                {form.currency === 'USD' ? '$' : 'Z'}
              </span>
              <input type="number" min="0" step="0.01" className="input" style={{ paddingLeft: '1.75rem' }} value={form.amount} onChange={e => set('amount', parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={e => set('status', e.target.value as ExpenseStatus)}>
              <option>Unpaid</option>
              <option>Paid</option>
            </select>
          </div>
          {form.status === 'Unpaid' && (
            <div>
              <label className="label">Due Date</label>
              <input type="date" className="input" value={form.due_date ?? ''} onChange={e => set('due_date', e.target.value)} />
            </div>
          )}
          <div>
            <label className="label">Supplier (optional)</label>
            <input type="text" className="input" value={form.supplier_name ?? ''} onChange={e => set('supplier_name', e.target.value)} placeholder="e.g. Pioneer Livestock" />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label className="label">Notes</label>
            <textarea rows={2} className="input" value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={() => { onSave(form); onClose() }} className="btn-primary" disabled={!form.description.trim() || form.amount <= 0}>
            {editing ? 'Save Changes' : 'Add Expense'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ExpensesPage() {
  const { zwgActive, settings } = useSettings()
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<'All' | ExpenseCategory>('All')
  const [statusFilter, setStatusFilter] = useState<'All' | ExpenseStatus>('All')
  const [editExpense, setEditExpense] = useState<Expense | 'new' | null>(null)

  const filtered = useMemo(() =>
    expenses.filter(e => {
      const matchCat = catFilter === 'All' || e.category === catFilter
      const matchStatus = statusFilter === 'All' || e.status === statusFilter
      const matchSearch = e.description.toLowerCase().includes(search.toLowerCase()) || (e.supplier_name?.toLowerCase().includes(search.toLowerCase()) ?? false)
      return matchCat && matchStatus && matchSearch
    }), [expenses, search, catFilter, statusFilter])

  const totalUnpaid = expenses.filter(e => e.status === 'Unpaid').reduce((sum, e) => sum + e.amount, 0)

  // Monthly category summary (USD)
  const catSummary = useMemo(() => {
    const totals: Partial<Record<ExpenseCategory, number>> = {}
    expenses.forEach(e => { totals[e.category] = (totals[e.category] ?? 0) + e.amount })
    return CATEGORIES.map(cat => ({ cat, total: totals[cat] ?? 0 })).filter(c => c.total > 0)
  }, [expenses])

  const maxCat = Math.max(...catSummary.map(c => c.total), 1)

  function handleSave(data: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
    if (editExpense === 'new') {
      setExpenses(prev => [...prev, { ...data, id: Date.now().toString(), created_at: '', updated_at: '' }])
      toast.success('Expense added')
    } else if (editExpense) {
      setExpenses(prev => prev.map(e => e.id === editExpense.id ? { ...e, ...data } : e))
      toast.success('Expense updated')
    }
  }

  function markPaid(id: string) {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'Paid' } : e))
    toast.success('Marked as paid')
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">
            Unpaid / Payables:{' '}
            <span style={{ color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{fmtUSD(totalUnpaid)}</span>
            {zwgActive && <span style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', marginLeft: '0.375rem' }}>
              (ZWG {(totalUnpaid * settings.usd_to_zwg_rate).toLocaleString('en-ZW', { minimumFractionDigits: 0 })})
            </span>}
          </p>
        </div>
        <button onClick={() => setEditExpense('new')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Category Summary Bar */}
      {catSummary.length > 0 && (
        <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '0.6875rem', color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>
            Month-to-Date by Category
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {catSummary.map(({ cat, total }) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: CAT_COLORS[cat], flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-primary)', fontSize: '0.8125rem', color: 'var(--text-secondary)', width: '110px', flexShrink: 0 }}>{cat}</span>
                <div style={{ flex: 1, background: 'var(--bg-subtle)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${(total / maxCat) * 100}%`, height: '100%', background: CAT_COLORS[cat], borderRadius: '999px' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', width: '64px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {fmtUSD(total)}
                </span>
                {zwgActive && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-tertiary)', width: '80px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    ZWG {(total * settings.usd_to_zwg_rate).toLocaleString('en-ZW', { minimumFractionDigits: 0 })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '0 0 240px' }}>
          <Search className="w-4 h-4" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="input" style={{ paddingLeft: '2.25rem' }} placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ width: 'auto' }} value={catFilter} onChange={e => setCatFilter(e.target.value as typeof catFilter)}>
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="input" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}>
          <option value="All">All Statuses</option>
          <option>Paid</option>
          <option>Unpaid</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
              {['Date', 'Description', 'Category', 'Amount (USD)', ...(zwgActive ? ['Amount (ZWG)'] : []), 'Supplier', 'Due', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '0.625rem 0.875rem', textAlign: 'left', fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: '0.6875rem', color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(exp => (
              <tr key={exp.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-primary)', fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{exp.date}</td>
                <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-primary)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{exp.description}</td>
                <td style={{ padding: '0.75rem 0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: CAT_COLORS[exp.category], flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-primary)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{exp.category}</span>
                  </div>
                </td>
                <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                  {exp.currency === 'ZWG' ? `ZWG ${exp.amount.toLocaleString()}` : fmtUSD(exp.amount)}
                </td>
                {zwgActive && (
                  <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                    {exp.currency === 'USD'
                      ? `ZWG ${(exp.amount * settings.usd_to_zwg_rate).toLocaleString('en-ZW', { minimumFractionDigits: 0 })}`
                      : fmtUSD(exp.amount / settings.usd_to_zwg_rate)}
                  </td>
                )}
                <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-primary)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{exp.supplier_name ?? '—'}</td>
                <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-primary)', fontSize: '0.875rem', color: exp.status === 'Unpaid' && exp.due_date ? 'var(--warning)' : 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                  {exp.due_date ?? '—'}
                </td>
                <td style={{ padding: '0.75rem 0.875rem' }}>
                  <span style={{
                    fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.06em', textTransform: 'uppercase',
                    padding: '0.2rem 0.6rem', borderRadius: '999px',
                    background: exp.status === 'Paid' ? 'var(--success-subtle)' : 'var(--danger-subtle)',
                    border: `1px solid ${exp.status === 'Paid' ? 'var(--success-border)' : 'var(--danger-border)'}`,
                    color: exp.status === 'Paid' ? 'var(--success)' : 'var(--danger)',
                  }}>{exp.status}</span>
                </td>
                <td style={{ padding: '0.75rem 0.875rem' }}>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {exp.status === 'Unpaid' && (
                      <button onClick={() => markPaid(exp.id)} className="btn-ghost" style={{ padding: '0.375rem' }} title="Mark as paid">
                        <CheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
                      </button>
                    )}
                    <button onClick={() => setEditExpense(exp)} className="btn-ghost" style={{ padding: '0.375rem' }}><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { setExpenses(prev => prev.filter(e => e.id !== exp.id)); toast.success('Expense removed') }} className="btn-ghost" style={{ padding: '0.375rem', color: 'var(--danger)' }}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontFamily: 'var(--font-primary)' }}>No expenses found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {editExpense && (
        <ExpenseModal
          expense={editExpense === 'new' ? null : editExpense}
          onClose={() => setEditExpense(null)}
          onSave={handleSave}
          zwgActive={zwgActive}
        />
      )}
    </div>
  )
}

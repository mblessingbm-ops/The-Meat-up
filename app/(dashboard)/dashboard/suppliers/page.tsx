'use client'

/**
 * app/(dashboard)/dashboard/suppliers/page.tsx
 * The Meat Up — Supplier Management
 * Outstanding balance shown in USD. Conditional ZWG secondary when zwg_enabled.
 */

import { useState, useMemo } from 'react'
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Supplier } from '@/types'
import { useSettings } from '@/context/SettingsContext'

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const CATEGORIES_OPTIONS = ['Beef', 'Pork', 'Chicken', 'Lamb', 'Processed', 'Mixed', 'Packaging', 'Other']
const PAYMENT_TERMS_OPTIONS = ['COD', '7 days', '14 days', '30 days', '60 days']

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Pioneer Livestock', contact_person: 'James Moyo', phone: '+263 77 111 2222', email: 'james@pioneer.co.zw', categories: ['Beef', 'Lamb'], payment_terms: '7 days', outstanding_balance: 450, notes: 'Primary beef supplier. Good quality, reliable delivery.', created_at: '' },
  { id: '2', name: 'Braai Masters Ltd', contact_person: 'Sandra Dube', phone: '+263 71 333 4444', email: 'orders@braaimasters.co.zw', categories: ['Pork', 'Processed'], payment_terms: '14 days', outstanding_balance: 195, notes: '', created_at: '' },
  { id: '3', name: 'AFC Poultry', contact_person: 'David Ncube', phone: '+263 73 555 6666', email: '', categories: ['Chicken'], payment_terms: 'COD', outstanding_balance: 0, notes: 'Pay on delivery. Always fresh stock.', created_at: '' },
  { id: '4', name: 'FreshPack Solutions', contact_person: 'Maria Chikwanda', phone: '+263 77 777 8888', email: 'info@freshpack.co.zw', categories: ['Packaging'], payment_terms: '30 days', outstanding_balance: 300, notes: '', created_at: '' },
]

const EMPTY_SUPPLIER: Omit<Supplier, 'id' | 'created_at'> = {
  name: '', contact_person: '', phone: '', email: '', categories: [],
  payment_terms: 'COD', outstanding_balance: 0, notes: '',
}

function fmtUSD(n: number) { return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }

// ─── Supplier Modal ────────────────────────────────────────────────────────────
function SupplierModal({ supplier, onClose, onSave }: {
  supplier: Supplier | null
  onClose: () => void
  onSave: (s: Omit<Supplier, 'id' | 'created_at'>) => void
}) {
  const editing = !!supplier?.id
  const [form, setForm] = useState({ ...EMPTY_SUPPLIER, ...(supplier ?? {}) })
  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm(f => ({ ...f, [k]: v })) }

  function toggleCat(cat: string) {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter(c => c !== cat)
        : [...f.categories, cat],
    }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h2 className="modal-title">{editing ? 'Edit Supplier' : 'Add Supplier'}</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.375rem' }}><X className="w-4 h-4" /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1.25rem 1.5rem' }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label className="label">Supplier Name</label>
            <input type="text" className="input" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="label">Contact Person</label>
            <input type="text" className="input" value={form.contact_person} onChange={e => set('contact_person', e.target.value)} />
          </div>
          <div>
            <label className="label">Phone / WhatsApp</label>
            <input type="text" className="input" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email ?? ''} onChange={e => set('email', e.target.value)} />
          </div>
          <div>
            <label className="label">Payment Terms</label>
            <select className="input" value={form.payment_terms} onChange={e => set('payment_terms', e.target.value)}>
              {PAYMENT_TERMS_OPTIONS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Outstanding Balance (USD)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>$</span>
              <input type="number" min="0" step="0.01" className="input" style={{ paddingLeft: '1.75rem' }} value={form.outstanding_balance} onChange={e => set('outstanding_balance', parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label className="label">Categories Supplied</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.375rem' }}>
              {CATEGORIES_OPTIONS.map(cat => (
                <button key={cat} type="button" onClick={() => toggleCat(cat)} style={{
                  fontFamily: 'var(--font-primary)', fontSize: '0.8125rem', fontWeight: 600,
                  padding: '0.25rem 0.75rem', borderRadius: '999px', border: '1.5px solid', cursor: 'pointer',
                  background: form.categories.includes(cat) ? 'var(--primary)' : 'transparent',
                  borderColor: form.categories.includes(cat) ? 'var(--primary)' : 'var(--border-default)',
                  color: form.categories.includes(cat) ? '#fff' : 'var(--text-secondary)',
                }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label className="label">Notes</label>
            <textarea rows={2} className="input" value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={() => { onSave(form); onClose() }} className="btn-primary" disabled={!form.name.trim()}>
            {editing ? 'Save Changes' : 'Add Supplier'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SuppliersPage() {
  const { zwgActive, settings } = useSettings()
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS)
  const [search, setSearch] = useState('')
  const [editSupplier, setEditSupplier] = useState<Supplier | 'new' | null>(null)

  const filtered = useMemo(() =>
    suppliers.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contact_person.toLowerCase().includes(search.toLowerCase())
    ), [suppliers, search])

  const totalOwed = suppliers.reduce((sum, s) => sum + s.outstanding_balance, 0)

  function handleSave(data: Omit<Supplier, 'id' | 'created_at'>) {
    if (editSupplier === 'new') {
      setSuppliers(prev => [...prev, { ...data, id: Date.now().toString(), created_at: '' }])
      toast.success('Supplier added')
    } else if (editSupplier) {
      setSuppliers(prev => prev.map(s => s.id === editSupplier.id ? { ...s, ...data } : s))
      toast.success('Supplier updated')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-subtitle">
            {suppliers.length} suppliers · Total owed:{' '}
            <span style={{ color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{fmtUSD(totalOwed)}</span>
            {zwgActive && <span style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', marginLeft: '0.375rem' }}>
              (ZWG {(totalOwed * settings.usd_to_zwg_rate).toLocaleString('en-ZW', { minimumFractionDigits: 0 })})
            </span>}
          </p>
        </div>
        <button onClick={() => setEditSupplier('new')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '300px', marginBottom: '1rem' }}>
        <Search className="w-4 h-4" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
        <input className="input" style={{ paddingLeft: '2.25rem' }} placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
              {['Supplier', 'Contact Person', 'Phone', 'Categories', 'Payment Terms', 'Outstanding (USD)', ...(zwgActive ? ['Outstanding (ZWG)'] : []), ''].map(h => (
                <th key={h} style={{ padding: '0.625rem 0.875rem', textAlign: 'left', fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: '0.6875rem', color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-primary)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{s.name}</td>
                <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-primary)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{s.contact_person}</td>
                <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{s.phone}</td>
                <td style={{ padding: '0.75rem 0.875rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {s.categories.map(cat => (
                      <span key={cat} style={{ fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: '0.6875rem', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', color: 'var(--accent)', padding: '0.125rem 0.5rem', borderRadius: '999px' }}>{cat}</span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-primary)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{s.payment_terms}</td>
                <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: s.outstanding_balance > 0 ? 'var(--danger)' : 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                  {s.outstanding_balance > 0 ? fmtUSD(s.outstanding_balance) : '—'}
                </td>
                {zwgActive && (
                  <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                    {s.outstanding_balance > 0 ? `ZWG ${(s.outstanding_balance * settings.usd_to_zwg_rate).toLocaleString('en-ZW', { minimumFractionDigits: 0 })}` : '—'}
                  </td>
                )}
                <td style={{ padding: '0.75rem 0.875rem' }}>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button onClick={() => setEditSupplier(s)} className="btn-ghost" style={{ padding: '0.375rem' }}><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { setSuppliers(prev => prev.filter(sup => sup.id !== s.id)); toast.success('Supplier removed') }} className="btn-ghost" style={{ padding: '0.375rem', color: 'var(--danger)' }}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontFamily: 'var(--font-primary)' }}>No suppliers found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {editSupplier && (
        <SupplierModal
          supplier={editSupplier === 'new' ? null : editSupplier}
          onClose={() => setEditSupplier(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

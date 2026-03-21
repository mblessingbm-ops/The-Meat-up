'use client'

/**
 * app/(dashboard)/dashboard/invoices/page.tsx
 * The Meat Up — Invoices / Receivables
 * USD by default. Currency selector only appears when zwg_enabled = true.
 */

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, CheckCircle, FileText, Printer, X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Invoice, InvoiceItem, InvoiceStatus, Currency, UnitOfMeasure } from '@/types'
import { useSettings } from '@/context/SettingsContext'

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const STATUSES: InvoiceStatus[] = ['Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue']
const UNITS: UnitOfMeasure[] = ['kg', 'g', 'unit', 'pack']

const INITIAL_INVOICES: Invoice[] = [
  { id: '1', invoice_number: 'TMU-0001', client_name: 'Harare Fresh Meats', date_issued: '2026-03-01', due_date: '2026-03-08', currency: 'USD', subtotal: 312, tax: 0, total: 312, amount_paid: 250, status: 'Partially Paid', created_at: '', updated_at: '' },
  { id: '2', invoice_number: 'TMU-0002', client_name: 'Golden Plate Restaurant', date_issued: '2026-03-05', due_date: '2026-03-19', currency: 'USD', subtotal: 485, tax: 0, total: 485, amount_paid: 0, status: 'Sent', created_at: '', updated_at: '' },
  { id: '3', invoice_number: 'TMU-0003', client_name: 'Cresta Hotel Catering', date_issued: '2026-03-10', due_date: '2026-03-24', currency: 'USD', subtotal: 875, tax: 0, total: 875, amount_paid: 875, status: 'Paid', created_at: '', updated_at: '' },
  { id: '4', invoice_number: 'TMU-0004', client_name: 'Taita Trading', date_issued: '2026-02-20', due_date: '2026-03-06', currency: 'USD', subtotal: 128.50, tax: 0, total: 128.50, amount_paid: 0, status: 'Overdue', created_at: '', updated_at: '' },
  { id: '5', invoice_number: 'TMU-0005', client_name: 'Biltong & Braai Co.', date_issued: '2026-03-18', due_date: '2026-04-01', currency: 'USD', subtotal: 320, tax: 0, total: 320, amount_paid: 0, status: 'Draft', created_at: '', updated_at: '' },
  { id: '6', invoice_number: 'TMU-0006', client_name: 'Harare Fresh Meats', date_issued: '2026-03-15', due_date: '2026-03-29', currency: 'USD', subtotal: 540, tax: 0, total: 540, amount_paid: 0, status: 'Sent', created_at: '', updated_at: '' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtUSD(n: number) { return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }

const STATUS_STYLES: Record<InvoiceStatus, { bg: string; border: string; color: string }> = {
  Draft:            { bg: 'var(--bg-subtle)',      border: 'var(--border-subtle)',   color: 'var(--text-tertiary)' },
  Sent:             { bg: 'var(--accent-subtle)',   border: 'var(--accent-border)',   color: 'var(--accent)' },
  'Partially Paid': { bg: 'var(--warning-subtle)',  border: 'var(--warning-border)',  color: 'var(--warning)' },
  Paid:             { bg: 'var(--success-subtle)',  border: 'var(--success-border)',  color: 'var(--success)' },
  Overdue:          { bg: 'var(--danger-subtle)',   border: 'var(--danger-border)',   color: 'var(--danger)' },
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const s = STATUS_STYLES[status]
  return (
    <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0.2rem 0.6rem', borderRadius: '999px', background: s.bg, border: `1px solid ${s.border}`, color: s.color, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  )
}

// ─── Create Invoice Modal ──────────────────────────────────────────────────────
function CreateInvoiceModal({ nextNumber, onClose, onSave, zwgActive }: {
  nextNumber: string
  onClose: () => void
  onSave: (inv: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>, items: Omit<InvoiceItem, 'id' | 'invoice_id'>[]) => void
  zwgActive: boolean
}) {
  const [clientName, setClientName] = useState('')
  const [dateIssued, setDateIssued] = useState(new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState('')
  const [currency, setCurrency] = useState<Currency>('USD')
  const [taxRate, setTaxRate] = useState(0)
  const [items, setItems] = useState<Array<{ product_name: string; qty: number; unit: UnitOfMeasure; unit_price: number }>>([
    { product_name: '', qty: 1, unit: 'kg', unit_price: 0 },
  ])

  function setItem(i: number, k: string, v: string | number) {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [k]: v } : item))
  }

  const subtotal = items.reduce((sum, it) => sum + it.qty * it.unit_price, 0)
  const tax = subtotal * (taxRate / 100)
  const total = subtotal + tax

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">New Invoice — {nextNumber}</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.375rem' }}><X className="w-4 h-4" /></button>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Client + Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label className="label">Client Name</label>
              <input type="text" className="input" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Cresta Hotel Catering" />
            </div>
            <div>
              <label className="label">Date Issued</label>
              <input type="date" className="input" value={dateIssued} onChange={e => setDateIssued(e.target.value)} />
            </div>
            <div>
              <label className="label">Due Date</label>
              <input type="date" className="input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            {/* Currency selector — only shown when ZWG is enabled */}
            {zwgActive && (
              <div>
                <label className="label">Currency</label>
                <select className="input" value={currency} onChange={e => setCurrency(e.target.value as Currency)}>
                  <option value="USD">USD — US Dollar</option>
                  <option value="ZWG">ZWG — Zimbabwe Gold</option>
                </select>
              </div>
            )}
            <div>
              <label className="label">Tax Rate (%)</label>
              <input type="number" min="0" max="100" step="0.5" className="input" value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)} />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="label" style={{ margin: 0 }}>Line Items</label>
              <button type="button" className="btn-ghost" style={{ fontSize: '0.8125rem', padding: '0.25rem 0.625rem' }}
                onClick={() => setItems(prev => [...prev, { product_name: '', qty: 1, unit: 'kg', unit_price: 0 }])}>
                + Add line
              </button>
            </div>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.7fr 0.8fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.25rem' }}>
              {['Product', 'Qty', 'Unit', `Unit Price (${currency})`, `Total`, ''].map(h => (
                <span key={h} style={{ fontFamily: 'var(--font-primary)', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
              ))}
            </div>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 0.7fr 0.8fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <input type="text" className="input" value={item.product_name} onChange={e => setItem(i, 'product_name', e.target.value)} placeholder="Product name" />
                <input type="number" min="0" step="any" className="input" value={item.qty} onChange={e => setItem(i, 'qty', parseFloat(e.target.value) || 0)} />
                <select className="input" value={item.unit} onChange={e => setItem(i, 'unit', e.target.value)}>
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                    {currency === 'USD' ? '$' : 'Z'}
                  </span>
                  <input type="number" min="0" step="0.01" className="input" style={{ paddingLeft: '1.625rem' }} value={item.unit_price} onChange={e => setItem(i, 'unit_price', parseFloat(e.target.value) || 0)} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', paddingLeft: '0.25rem' }}>
                  {currency === 'USD' ? '$' : 'ZWG '}{(item.qty * item.unit_price).toFixed(2)}
                </span>
                <button type="button" className="btn-ghost" style={{ padding: '0.375rem', color: 'var(--danger)' }} onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', alignItems: 'flex-end' }}>
            {[
              { label: 'Subtotal', value: subtotal },
              ...(taxRate > 0 ? [{ label: `Tax (${taxRate}%)`, value: tax }] : []),
              { label: 'Total', value: total },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-primary)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{row.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: row.label === 'Total' ? 700 : 500, fontSize: row.label === 'Total' ? '1.0625rem' : '0.9375rem', color: row.label === 'Total' ? 'var(--accent)' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', minWidth: '100px', textAlign: 'right' }}>
                  {currency === 'USD' ? '$' : 'ZWG '}{row.value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button className="btn-primary" disabled={!clientName.trim() || !dateIssued}
            onClick={() => {
              const lineItems = items.map(it => ({ ...it, line_total: it.qty * it.unit_price }))
              onSave({ invoice_number: nextNumber, client_name: clientName, date_issued: dateIssued, due_date: dueDate, currency, subtotal, tax, total, amount_paid: 0, status: 'Draft', notes: '' }, lineItems)
              onClose()
            }}>
            Create Invoice
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Record Payment Modal ──────────────────────────────────────────────────────
function PaymentModal({ invoice, onClose, onSave }: {
  invoice: Invoice
  onClose: () => void
  onSave: (amount: number, date: string, notes: string) => void
}) {
  const outstanding = invoice.total - invoice.amount_paid
  const [amount, setAmount] = useState(outstanding)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Record Payment — {invoice.invoice_number}</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.375rem' }}><X className="w-4 h-4" /></button>
        </div>
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.875rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-primary)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Invoice Total</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{fmtUSD(invoice.total)}</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-primary)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Outstanding</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--danger)', fontVariantNumeric: 'tabular-nums' }}>{fmtUSD(outstanding)}</div>
            </div>
          </div>
          <div>
            <label className="label">Payment Amount ({invoice.currency})</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>$</span>
              <input type="number" min="0" max={outstanding} step="0.01" className="input" style={{ paddingLeft: '1.75rem' }} value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div>
            <label className="label">Payment Date</label>
            <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Notes</label>
            <input type="text" className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Cash / EcoCash / Transfer..." />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button className="btn-primary" disabled={amount <= 0} onClick={() => { onSave(amount, date, notes); onClose() }}>
            Record Payment
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function InvoicesPage() {
  const router = useRouter()
  const { zwgActive, settings } = useSettings()
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | InvoiceStatus>('All')
  const [showCreate, setShowCreate] = useState(false)
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null)

  const filtered = useMemo(() =>
    invoices.filter(inv => {
      const matchStatus = statusFilter === 'All' || inv.status === statusFilter
      const matchSearch = inv.client_name.toLowerCase().includes(search.toLowerCase()) || inv.invoice_number.includes(search.toUpperCase())
      return matchStatus && matchSearch
    }), [invoices, search, statusFilter])

  const totalReceivables = invoices.reduce((sum, inv) => inv.status !== 'Paid' ? sum + (inv.total - inv.amount_paid) : sum, 0)

  const nextNumber = `TMU-${String(invoices.length + 1).padStart(4, '0')}`

  function handleCreate(invData: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>, _items: unknown) {
    const newId = Date.now().toString()
    setInvoices(prev => [...prev, { ...invData, id: newId, created_at: '', updated_at: '' }])
    toast.success(`Invoice ${invData.invoice_number} created`)
    router.push(`/dashboard/invoices/${newId}`)
  }

  function handlePayment(invoice: Invoice, amount: number) {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoice.id) return inv
      const newPaid = inv.amount_paid + amount
      const newStatus: InvoiceStatus = newPaid >= inv.total ? 'Paid' : 'Partially Paid'
      return { ...inv, amount_paid: newPaid, status: newStatus }
    }))
    toast.success(`Payment recorded — ${fmtUSD(amount)}`)
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">
            Total receivables:{' '}
            <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{fmtUSD(totalReceivables)}</span>
            {zwgActive && <span style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', marginLeft: '0.375rem' }}>
              (ZWG {(totalReceivables * settings.usd_to_zwg_rate).toLocaleString('en-ZW', { minimumFractionDigits: 0 })})
            </span>}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Plus className="w-4 h-4" /> New Invoice
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '0 0 260px' }}>
          <Search className="w-4 h-4" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="input" style={{ paddingLeft: '2.25rem' }} placeholder="Search invoices or clients..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {(['All', ...STATUSES] as const).map(st => (
          <button key={st} onClick={() => setStatusFilter(st as typeof statusFilter)} style={{
            fontFamily: 'var(--font-primary)', fontSize: '0.8125rem', fontWeight: 600,
            padding: '0.375rem 0.875rem', borderRadius: '999px', border: '1.5px solid', cursor: 'pointer', transition: 'all 150ms',
            background: statusFilter === st ? 'var(--primary)' : 'transparent',
            borderColor: statusFilter === st ? 'var(--primary)' : 'var(--border-default)',
            color: statusFilter === st ? '#fff' : 'var(--text-secondary)',
          }}>{st}</button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
              {['Invoice #', 'Client', 'Date Issued', 'Due Date', 'Total', 'Outstanding', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '0.625rem 0.875rem', textAlign: 'left', fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: '0.6875rem', color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => {
              const outstanding = inv.total - inv.amount_paid
              const isOverdue = inv.status === 'Overdue'
              return (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{inv.invoice_number}</td>
                  <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-primary)', fontSize: '0.875rem', color: 'var(--text-primary)' }}>{inv.client_name}</td>
                  <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-primary)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{inv.date_issued}</td>
                  <td style={{ padding: '0.75rem 0.875rem' }}>
                    <div>
                      <span style={{ fontFamily: 'var(--font-primary)', fontSize: '0.875rem', color: isOverdue ? 'var(--danger)' : 'var(--text-secondary)' }}>{inv.due_date}</span>
                      {isOverdue && <div style={{ fontFamily: 'var(--font-primary)', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>⊘ OVERDUE</div>}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                    {fmtUSD(inv.total)}
                    {inv.currency === 'ZWG' && <span style={{ fontFamily: 'var(--font-primary)', fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginLeft: '0.25rem' }}>ZWG</span>}
                  </td>
                  <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: outstanding > 0 ? 'var(--danger)' : 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                    {outstanding > 0 ? fmtUSD(outstanding) : '—'}
                  </td>
                  <td style={{ padding: '0.75rem 0.875rem' }}><StatusBadge status={inv.status} /></td>
                  <td style={{ padding: '0.75rem 0.875rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {inv.status !== 'Paid' && (
                        <button onClick={() => setPayInvoice(inv)} className="btn-ghost" style={{ padding: '0.375rem' }} title="Record payment">
                          <CheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
                        </button>
                      )}
                      <Link href={`/dashboard/invoices/${inv.id}`}>
                        <button className="btn-ghost" style={{ padding: '0.375rem' }} title="View invoice">
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                      <button className="btn-ghost" style={{ padding: '0.375rem' }} title="Print" onClick={() => window.print()}>
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontFamily: 'var(--font-primary)' }}>No invoices found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateInvoiceModal nextNumber={nextNumber} onClose={() => setShowCreate(false)} onSave={handleCreate} zwgActive={zwgActive} />
      )}
      {payInvoice && (
        <PaymentModal invoice={payInvoice} onClose={() => setPayInvoice(null)} onSave={(amt, date, notes) => handlePayment(payInvoice, amt)} />
      )}
    </div>
  )
}

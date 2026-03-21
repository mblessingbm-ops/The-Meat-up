'use client'

/**
 * app/(dashboard)/dashboard/invoices/[id]/page.tsx
 * The Meat Up — Invoice Detail View
 * Dark theme on screen. White / print-safe on @media print.
 */

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Printer } from 'lucide-react'
import type { Invoice, InvoiceItem, InvoiceStatus } from '@/types'

// ─── Mock data — replace with Supabase fetch by params.id ─────────────────────
const MOCK_INVOICES: Invoice[] = [
  { id: '1', invoice_number: 'TMU-0001', client_name: 'Harare Fresh Meats',      client_id: 'c1', date_issued: '2026-03-01', due_date: '2026-03-08', currency: 'USD', subtotal: 312,    tax: 0,     total: 312,    amount_paid: 250,  status: 'Partially Paid', notes: 'Partial payment received via EcoCash.', created_at: '', updated_at: '' },
  { id: '2', invoice_number: 'TMU-0002', client_name: 'Golden Plate Restaurant', client_id: 'c2', date_issued: '2026-03-05', due_date: '2026-03-19', currency: 'USD', subtotal: 485,    tax: 0,     total: 485,    amount_paid: 0,    status: 'Sent',           notes: '',                                      created_at: '', updated_at: '' },
  { id: '3', invoice_number: 'TMU-0003', client_name: 'Cresta Hotel Catering',   client_id: 'c3', date_issued: '2026-03-10', due_date: '2026-03-24', currency: 'USD', subtotal: 875,    tax: 0,     total: 875,    amount_paid: 875,  status: 'Paid',           notes: '',                                      created_at: '', updated_at: '' },
  { id: '4', invoice_number: 'TMU-0004', client_name: 'Taita Trading',           client_id: 'c4', date_issued: '2026-02-20', due_date: '2026-03-06', currency: 'USD', subtotal: 128.50, tax: 0,     total: 128.50, amount_paid: 0,    status: 'Overdue',        notes: 'Follow up required.',                  created_at: '', updated_at: '' },
  { id: '5', invoice_number: 'TMU-0005', client_name: 'Biltong & Braai Co.',     client_id: 'c5', date_issued: '2026-03-18', due_date: '2026-04-01', currency: 'USD', subtotal: 320,    tax: 0,     total: 320,    amount_paid: 0,    status: 'Draft',          notes: '',                                      created_at: '', updated_at: '' },
  { id: '6', invoice_number: 'TMU-0006', client_name: 'Harare Fresh Meats',      client_id: 'c1', date_issued: '2026-03-15', due_date: '2026-03-29', currency: 'USD', subtotal: 540,    tax: 62.10, total: 602.10, amount_paid: 0,    status: 'Sent',           notes: '',                                      created_at: '', updated_at: '' },
]

const MOCK_ITEMS: Record<string, Omit<InvoiceItem, 'id' | 'invoice_id'>[]> = {
  '1': [
    { product_name: 'Beef Fillet',   qty: 8,  unit: 'kg',   unit_price: 18.00, line_total: 144.00 },
    { product_name: 'T-Bone Steak',  qty: 6,  unit: 'kg',   unit_price: 14.50, line_total: 87.00  },
    { product_name: 'Lamb Chops',    qty: 4,  unit: 'kg',   unit_price: 20.50, line_total: 82.00  },
  ],
  '2': [
    { product_name: 'Chicken Portions', qty: 30, unit: 'kg',   unit_price: 5.50, line_total: 165.00 },
    { product_name: 'Boerewors',        qty: 20, unit: 'kg',   unit_price: 7.50, line_total: 150.00 },
    { product_name: 'Pork Sausages',    qty: 30, unit: 'pack', unit_price: 5.80, line_total: 174.00 },
  ],
  '3': [
    { product_name: 'Beef Fillet',     qty: 20, unit: 'kg',   unit_price: 18.00, line_total: 360.00 },
    { product_name: 'Pork Spare Ribs', qty: 40, unit: 'kg',   unit_price: 8.80,  line_total: 352.00 },
    { product_name: 'Variance adj.',   qty: 1,  unit: 'unit', unit_price: 163.00, line_total: 163.00 },
  ],
  '4': [
    { product_name: 'Vienna Sausages', qty: 20, unit: 'pack', unit_price: 3.80,  line_total: 76.00  },
    { product_name: 'Boerewors',       qty: 7,  unit: 'kg',   unit_price: 7.50,  line_total: 52.50  },
  ],
  '5': [
    { product_name: 'Biltong (Thin)', qty: 15, unit: 'kg', unit_price: 12.00, line_total: 180.00 },
    { product_name: 'Biltong (Thick)', qty: 10, unit: 'kg', unit_price: 14.00, line_total: 140.00 },
  ],
  '6': [
    { product_name: 'Beef Fillet',   qty: 15, unit: 'kg', unit_price: 18.00, line_total: 270.00 },
    { product_name: 'Lamb Chops',    qty: 10, unit: 'kg', unit_price: 20.50, line_total: 205.00 },
    { product_name: 'Pork Spare Ribs', qty: 5, unit: 'kg', unit_price: 8.80, line_total: 44.00 },
  ],
}

// ─── Client mock (matches client_id from invoices) ─────────────────────────────
const MOCK_CLIENTS: Record<string, { phone: string; email: string; address: string }> = {
  c1: { phone: '+263 77 123 4567', email: 'orders@hararefreshmeats.co.zw', address: '14 Borrowdale Rd, Harare' },
  c2: { phone: '+263 71 234 5678', email: 'accounts@goldenplate.co.zw',   address: 'Shop 4, Eastgate Mall, Harare' },
  c3: { phone: '+263 78 345 6789', email: 'catering@cresta.co.zw',          address: 'Cresta Lodge, Harare' },
  c4: { phone: '+263 77 456 7890', email: 'info@taitatrading.co.zw',       address: '5 Lobengula St, Bulawayo' },
  c5: { phone: '+263 71 567 8901', email: 'orders@biltongbraai.co.zw',     address: 'Borrowdale Village, Harare' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtUSD(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const STATUS_STYLES: Record<InvoiceStatus, { bg: string; border: string; color: string }> = {
  Draft:            { bg: 'var(--bg-subtle)',     border: 'var(--border-subtle)',  color: 'var(--text-tertiary)' },
  Sent:             { bg: 'var(--accent-subtle)',  border: 'var(--accent-border)',  color: 'var(--accent)' },
  'Partially Paid': { bg: 'var(--warning-subtle)', border: 'var(--warning-border)', color: 'var(--warning)' },
  Paid:             { bg: 'var(--success-subtle)', border: 'var(--success-border)', color: 'var(--success)' },
  Overdue:          { bg: 'var(--danger-subtle)',  border: 'var(--danger-border)',  color: 'var(--danger)' },
}

// ─── Print styles injected as a style tag ─────────────────────────────────────
const PRINT_STYLES = `
@media print {
  body * {
    visibility: hidden;
  }
  #invoice-print-area,
  #invoice-print-area * {
    visibility: visible;
  }
  #invoice-print-area {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    background-color: #ffffff;
    color: #000000;
    padding: 40px;
    font-size: 12pt;
  }
  #invoice-print-area table {
    width: 100%;
    border-collapse: collapse;
  }
  #invoice-print-area th,
  #invoice-print-area td {
    border: 1px solid #cccccc;
    padding: 8px 12px;
    text-align: left;
    color: #000000;
  }
  #invoice-print-area th {
    background-color: #f5f5f5;
    font-weight: bold;
  }
  #invoice-print-area .invoice-total-row td {
    font-weight: bold;
    font-size: 13pt;
    border-top: 2px solid #000000;
  }
  #invoice-print-area .status-badge {
    border: 1px solid #000000;
    background: none;
    color: #000000;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10pt;
  }
  #invoice-print-area img {
    max-width: 140px;
    height: auto;
  }
}
`

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === 'string' ? params.id : ''

  const invoice = MOCK_INVOICES.find(inv => inv.id === id)
  const items = MOCK_ITEMS[id] ?? []
  const client = invoice?.client_id ? MOCK_CLIENTS[invoice.client_id] : null
  const outstanding = invoice ? invoice.total - invoice.amount_paid : 0

  if (!invoice) {
    return (
      <div style={{ padding: '2rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-primary)' }}>
        Invoice not found.{' '}
        <button onClick={() => router.push('/dashboard/invoices')} style={{ color: 'var(--accent)', cursor: 'pointer', background: 'none', border: 'none' }}>
          ← Back to Invoices
        </button>
      </div>
    )
  }

  const ss = STATUS_STYLES[invoice.status]

  return (
    <>
      {/* Inject print styles */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />

      <div className="invoice-shell" style={{ maxWidth: '860px' }}>

        {/* Top action bar — hidden on print */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <button
            onClick={() => router.push('/dashboard/invoices')}
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Invoices
          </button>
          <button
            onClick={() => window.print()}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid #D4A017',
              background: 'transparent',
              color: '#D4A017',
              fontFamily: 'var(--font-primary)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'background 150ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,160,23,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </button>
        </div>

        {/* Invoice card — id wraps only printable content */}
        <div
          id="invoice-print-area"
          className="invoice-card card"
          style={{ padding: '2rem 2.5rem' }}
        >
          {/* ── Header ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            {/* Logo left */}
            {/* Standard <img> — renders correctly in print without Next.js Image optimisation issues */}
            <img
              src="/images/the_meat_up_logo.png"
              alt="The Meat Up Logo"
              style={{ width: '120px', height: 'auto' }}
            />
            {/* Business info right */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                The Meat Up
              </div>
              <div style={{ fontFamily: 'var(--font-primary)', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.6 }}>
                Harare, Zimbabwe<br />
                +263 77 000 0000<br />
                info@themeatup.co.zw
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--border-subtle)', marginBottom: '1.5rem' }} />

          {/* ── Invoice Meta ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Left — invoice numbers */}
            <div>
              <div style={{ fontFamily: 'var(--font-primary)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D4A017', marginBottom: '0.5rem' }}>
                Invoice
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                {invoice.invoice_number}
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {[
                  { label: 'Date Issued', val: invoice.date_issued },
                  { label: 'Due Date',    val: invoice.due_date || '—' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: 'var(--font-primary)', fontSize: '0.75rem', color: 'var(--text-tertiary)', width: '80px', flexShrink: 0 }}>{r.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-primary)' }}>{r.val}</span>
                  </div>
                ))}
                <div style={{ marginTop: '0.5rem' }}>
                  <span
                    className="status-badge"
                    style={{
                      fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '0.6875rem',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      padding: '0.2rem 0.7rem', borderRadius: '999px',
                      background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color,
                    }}
                  >
                    {invoice.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Right — billed to */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-primary)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D4A017', marginBottom: '0.5rem' }}>
                Billed To
              </div>
              <div style={{ fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                {invoice.client_name}
              </div>
              {client && (
                <div style={{ fontFamily: 'var(--font-primary)', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.6 }}>
                  {client.phone}<br />
                  {client.email}<br />
                  {client.address}
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--border-subtle)', marginBottom: '1.25rem' }} />

          {/* ── Line Items Table ── */}
          <div style={{ fontFamily: 'var(--font-primary)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D4A017', marginBottom: '0.75rem' }}>
            Line Items
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.25rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
                {['#', 'Description', 'Qty', 'Unit', 'Unit Price (USD)', 'Line Total (USD)'].map(h => (
                  <th key={h} style={{
                    padding: '0.5rem 0.75rem',
                    textAlign: h === 'Unit Price (USD)' || h === 'Line Total (USD)' || h === 'Qty' ? 'right' : 'left',
                    fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: '0.6875rem',
                    color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.625rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{i + 1}</td>
                  <td style={{ padding: '0.625rem 0.75rem', fontFamily: 'var(--font-primary)', fontWeight: 500, color: 'var(--text-primary)' }}>{item.product_name}</td>
                  <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{item.qty}</td>
                  <td style={{ padding: '0.625rem 0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{item.unit}</td>
                  <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{fmtUSD(item.unit_price)}</td>
                  <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{fmtUSD(item.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── Totals ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <div style={{ minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontFamily: 'var(--font-primary)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Subtotal</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{fmtUSD(invoice.subtotal)}</span>
              </div>
              {invoice.tax > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontFamily: 'var(--font-primary)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Tax</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{fmtUSD(invoice.tax)}</span>
                </div>
              )}
              <div
                className="invoice-total-row"
                style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(212,160,23,0.08)', marginTop: '0.25rem' }}
              >
                <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '1rem', color: '#D4A017' }}>TOTAL</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.125rem', color: '#D4A017', fontVariantNumeric: 'tabular-nums' }}>{fmtUSD(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--border-subtle)', marginBottom: '1.25rem' }} />

          {/* ── Payment Summary ── */}
          <div style={{ fontFamily: 'var(--font-primary)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D4A017', marginBottom: '0.75rem' }}>
            Payment Status
          </div>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-primary)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Invoice Total</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.25rem', fontVariantNumeric: 'tabular-nums' }}>{fmtUSD(invoice.total)}</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-primary)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Amount Paid</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', color: 'var(--success)', marginTop: '0.25rem', fontVariantNumeric: 'tabular-nums' }}>{fmtUSD(invoice.amount_paid)}</div>
            </div>
            {outstanding > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-primary)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Balance Due</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', color: 'var(--danger)', marginTop: '0.25rem', fontVariantNumeric: 'tabular-nums' }}>{fmtUSD(outstanding)}</div>
              </div>
            )}
          </div>

          {/* Notes */}
          {invoice.notes && (
            <>
              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '1.25rem 0' }} />
              <div>
                <div style={{ fontFamily: 'var(--font-primary)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '0.375rem' }}>Notes</div>
                <div style={{ fontFamily: 'var(--font-primary)', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{invoice.notes}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

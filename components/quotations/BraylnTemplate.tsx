'use client'

import React from 'react'
import type { Quote } from '@/lib/quotations'
import { COMPANY_DETAILS, COMPANY_BANK_DETAILS, formatQuoteDate, VAT_RATE } from '@/lib/quotations'
import CompanyStamp from './CompanyStamp'

interface TemplateProps {
  quote: Partial<Quote> & { company: 'Bralyn' }
  forPDF?: boolean
}

// ─── Bralyn Template ──────────────────────────────────────────────────────────
// Visual identity: creative, print-industry, bold.
// Navy (#1E3A5F) + white. Distinctive 8px left border accent.
// ─────────────────────────────────────────────────────────────────────────────
export default function BraylnTemplate({ quote, forPDF = false }: TemplateProps) {
  const co = COMPANY_DETAILS['Bralyn']
  const navy = '#1E3A5F'
  const navyLight = '#2E5591'
  const subtotal = quote.subtotal ?? 0
  const vatAmount = quote.vat_amount ?? 0
  const total = quote.total ?? 0
  const items = quote.line_items ?? []
  const validDays = quote.validity_days ?? 30
  const quoteDate = quote.quote_date ? formatQuoteDate(quote.quote_date) : formatQuoteDate(new Date().toISOString().slice(0, 10))
  const validUntil = quote.valid_until ? formatQuoteDate(quote.valid_until) : '—'

  const vatLine = () => {
    const pct = `${(VAT_RATE * 100).toFixed(1)}%`
    if (quote.vat_mode === 'inclusive') return `VAT (${pct}) included in above prices: USD ${vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    if (quote.vat_mode === 'exclusive') return `VAT @ ${pct}: USD ${vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    return 'Zero rated for VAT purposes.'
  }

  const fmtUSD = (n: number) => `USD ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div
      id="quote-template-bralyn"
      style={{
        width: '794px',
        minHeight: '1123px',
        backgroundColor: '#ffffff',
        fontFamily: '"Arial", "Helvetica Neue", sans-serif',
        fontSize: '11px',
        color: '#1a1a1a',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Distinctive left border — full height */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: '8px',
        backgroundColor: navy,
      }} />

      {/* ── Header — split layout ── */}
      <div style={{ display: 'flex', marginLeft: '8px', borderBottom: `3px solid ${navy}` }}>
        {/* Left 60%: company identity */}
        <div style={{ flex: '0 0 60%', padding: '28px 28px 28px 24px', borderRight: `1px solid #e5e7eb` }}>
          <div style={{ color: navy, fontSize: '20px', fontWeight: '900', letterSpacing: '0.5px', lineHeight: 1.2 }}>
            BRALYN LITHO PRINTERS
          </div>
          <div style={{ color: navy, fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>(PVT) LTD</div>
          <div style={{ color: '#64748b', fontSize: '10px', fontStyle: 'italic', marginBottom: '12px' }}>
            {co.tagline}
          </div>
          <div style={{ color: '#6b7280', fontSize: '9.5px', lineHeight: '1.7' }}>
            {co.address}<br />
            Tel: {co.telephones.join(' / ')}<br />
            Email: {co.email}
          </div>
        </div>

        {/* Right 40%: quote details on navy */}
        <div style={{ flex: '0 0 40%', backgroundColor: navy, padding: '24px 24px', position: 'relative' }}>
          {/* Validity rectangle badge */}
          <div style={{
            position: 'absolute', top: '14px', right: '14px',
            backgroundColor: navyLight, color: '#fff',
            fontSize: '8px', fontWeight: 'bold', letterSpacing: '1px',
            padding: '4px 10px', borderRadius: '2px',
          }}>
            QUOTATION VALID: {validDays} DAYS
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', letterSpacing: '1.5px', marginBottom: '4px', marginTop: '30px' }}>QUOTATION NO.</div>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '1px', marginBottom: '16px' }}>
            {quote.quote_number ?? 'BRL-QT-YYYY-NNNN'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '8px', letterSpacing: '1px', marginBottom: '2px' }}>DATE</div>
              <div style={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>{quoteDate}</div>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '8px', letterSpacing: '1px', marginBottom: '2px' }}>VALID UNTIL</div>
              <div style={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>{validUntil}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ marginLeft: '8px', padding: '24px 28px 100px 24px' }}>

        {/* Client + Prepared by */}
        <div style={{ display: 'flex', gap: '32px', marginBottom: '24px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '9px', color: navy, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px', borderBottom: `2px solid ${navy}`, paddingBottom: '3px', display: 'inline-block' }}>Prepared For</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1a1a1a', marginTop: '4px' }}>{quote.client_name || '—'}</div>
            {quote.client_attention && <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>Att: {quote.client_attention}</div>}
            {quote.client_address && <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px', whiteSpace: 'pre-line' }}>{quote.client_address}</div>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '9px', color: navy, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px', borderBottom: `2px solid ${navy}`, paddingBottom: '3px', display: 'inline-block' }}>Prepared By</div>
            <div style={{ fontSize: '11px', color: '#374151', marginTop: '4px' }}>{quote.created_by || 'Bralyn Sales'}</div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>{co.email}</div>
          </div>
        </div>

        {/* Line items table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0' }}>
          <thead>
            <tr style={{ backgroundColor: navy }}>
              {['#', 'Description', 'Qty', 'Unit', 'Unit Price (USD)', 'Amount (USD)'].map((h, i) => (
                <th key={h} style={{
                  color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '9px 10px',
                  textAlign: i >= 2 ? 'right' : 'left', letterSpacing: '0.5px',
                  borderLeft: i === 1 ? `3px solid ${navyLight}` : 'none',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? items.map((item, i) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '8px 10px', color: '#94a3b8', fontSize: '9px' }}>{i + 1}</td>
                <td style={{ padding: '8px 10px', fontSize: '10px', borderLeft: `3px solid ${i % 2 === 0 ? '#e8f0f8' : '#dbe6f5'}` }}>{item.description}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '10px', fontFamily: 'monospace' }}>{item.qty.toLocaleString()}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '10px', color: '#6b7280' }}>{item.unit}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '10px', fontFamily: 'monospace' }}>{item.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '10px', fontWeight: 'bold', fontFamily: 'monospace' }}>{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              </tr>
            )) : (
              <tr><td colSpan={6} style={{ padding: '16px 10px', color: '#9ca3af', textAlign: 'center', fontStyle: 'italic' }}>No line items added yet</td></tr>
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: `2px solid ${navy}`, marginTop: '0' }}>
          <div style={{ minWidth: '260px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', fontSize: '10px', color: '#6b7280' }}>
              <span>Subtotal</span><span style={{ fontFamily: 'monospace' }}>{fmtUSD(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 10px', fontSize: '9px', color: '#94a3b8', fontStyle: 'italic' }}>
              <span>{vatLine()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 10px', fontSize: '14px', fontWeight: 'bold', backgroundColor: navy, color: '#fff' }}>
              <span>TOTAL</span><span style={{ fontFamily: 'monospace' }}>{fmtUSD(total)}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {quote.payment_terms && (
            <div>
              <div style={{ fontSize: '9px', color: navy, fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Payment Terms</div>
              <div style={{ fontSize: '10px', color: '#374151' }}>{quote.payment_terms}</div>
            </div>
          )}
          {quote.delivery_terms && (
            <div>
              <div style={{ fontSize: '9px', color: navy, fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Delivery</div>
              <div style={{ fontSize: '10px', color: '#374151' }}>{quote.delivery_terms}</div>
            </div>
          )}
          {quote.special_instructions && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '9px', color: navy, fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Special Instructions</div>
              <div style={{ fontSize: '10px', color: '#374151', lineHeight: '1.5' }}>{quote.special_instructions}</div>
            </div>
          )}
        </div>

        {/* Bank details */}
        {quote.include_bank_details && (
          <div style={{ marginTop: '20px', backgroundColor: '#f0f4f8', padding: '12px 14px', borderLeft: `4px solid ${navy}` }}>
            <div style={{ fontSize: '9px', color: navy, fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Banking Details</div>
            <div style={{ fontSize: '9px', color: '#6b7280', lineHeight: '1.6' }}>
              {COMPANY_BANK_DETAILS['Bralyn'].split('·').map((part, i) => (
                <span key={i}>{i > 0 && ' · '}{part.trim()}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Digital stamp — bottom left */}
      <div style={{ position: 'absolute', bottom: '72px', left: '36px', opacity: 0.85 }}>
        <CompanyStamp company="Bralyn" size={80} />
      </div>

      {/* ── Footer ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: '8px', right: 0,
        borderTop: `3px solid ${navy}`,
        padding: '10px 28px 10px 24px',
        backgroundColor: '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#6b7280', marginBottom: '5px' }}>
          <span>Company Reg No: {co.company_reg}</span>
          <span>VAT Reg No: {co.vat_reg}</span>
          <span>TIN: {co.tin}</span>
        </div>
        <div style={{ fontSize: '9px', color: '#9ca3af', textAlign: 'center', fontStyle: 'italic' }}>
          This quotation is subject to stock availability. Prices quoted are exclusive of delivery unless stated. E&amp;OE.
        </div>
      </div>
    </div>
  )
}

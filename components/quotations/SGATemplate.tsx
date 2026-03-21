'use client'

import React from 'react'
import type { Quote } from '@/lib/quotations'
import { COMPANY_DETAILS, COMPANY_BANK_DETAILS, formatQuoteDate, VAT_RATE } from '@/lib/quotations'
import CompanyStamp from './CompanyStamp'

interface TemplateProps {
  quote: Partial<Quote> & { company: 'SGA' }
  forPDF?: boolean
}

// ─── SGA Template ─────────────────────────────────────────────────────────────
// Visual identity: modern, international, forward-looking.
// Deep teal (#0F5C5C) + slate. Light teal body. Diagonal watermark.
// ─────────────────────────────────────────────────────────────────────────────
export default function SGATemplate({ quote, forPDF = false }: TemplateProps) {
  const co = COMPANY_DETAILS['SGA']
  const teal = '#0F5C5C'
  const tealLight = '#1a7a7a'
  const bodyBg = '#F0FAFA'
  const subtotal = quote.subtotal ?? 0
  const vatAmount = quote.vat_amount ?? 0
  const total = quote.total ?? 0
  const items = quote.line_items ?? []
  const validDays = quote.validity_days ?? 14
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
      id="quote-template-sga"
      style={{
        width: '794px',
        minHeight: '1123px',
        backgroundColor: bodyBg,
        fontFamily: '"Arial", "Helvetica Neue", sans-serif',
        fontSize: '11px',
        color: '#1a1a1a',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Diagonal QUOTATION watermark */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%) rotate(-45deg)',
        fontSize: '96px', fontWeight: '900', color: teal,
        opacity: 0.04, whiteSpace: 'nowrap', pointerEvents: 'none',
        userSelect: 'none', zIndex: 0, letterSpacing: '8px',
      }}>
        QUOTATION
      </div>

      {/* ── Header band ── */}
      <div style={{ backgroundColor: teal, padding: '28px 32px 40px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Left: company identity */}
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontSize: '20px', fontWeight: '800', letterSpacing: '0.5px', lineHeight: 1.2 }}>
              SOURCE GLOBAL ALLIANCE
            </div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
              (PVT) LTD
            </div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '10px', fontStyle: 'italic', marginBottom: '12px' }}>
              {co.tagline}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '9.5px', lineHeight: '1.7' }}>
              {co.address}<br />
              Tel: {co.telephones.join(' / ')}<br />
              Email: {co.email}
            </div>
          </div>
        </div>
      </div>

      {/* Floating white quote details card — overlaps header */}
      <div style={{
        position: 'absolute', top: '70px', right: '32px',
        backgroundColor: '#fff', borderRadius: '6px',
        padding: '18px 20px', minWidth: '200px',
        boxShadow: '0 4px 16px rgba(15,92,92,0.18)',
        zIndex: 2,
      }}>
        {/* Circular validity badge overlapping top-right of card */}
        <div style={{
          position: 'absolute', top: '-14px', right: '-14px',
          width: '50px', height: '50px', borderRadius: '50%',
          backgroundColor: teal, color: '#fff',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          fontSize: '8px', fontWeight: 'bold', textAlign: 'center', lineHeight: '1.1',
        }}>
          <span style={{ fontSize: '11px' }}>{validDays}</span>
          <span>DAY</span>
          <span>QUOTE</span>
        </div>
        <div style={{ color: teal, fontSize: '9px', fontWeight: 'bold', letterSpacing: '1.5px', marginBottom: '6px' }}>QUOTATION</div>
        <div style={{ color: '#1a1a1a', fontSize: '15px', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '1px', marginBottom: '10px' }}>
          {quote.quote_number ?? 'SGA-QT-YYYY-NNNN'}
        </div>
        <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '8px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <div style={{ color: '#9ca3af', fontSize: '8px', letterSpacing: '0.5px' }}>Date</div>
            <div style={{ color: '#374151', fontSize: '9.5px', fontWeight: '600', marginTop: '2px' }}>{quoteDate}</div>
          </div>
          <div>
            <div style={{ color: '#9ca3af', fontSize: '8px', letterSpacing: '0.5px' }}>Valid Until</div>
            <div style={{ color: teal, fontSize: '9.5px', fontWeight: '600', marginTop: '2px' }}>{validUntil}</div>
          </div>
        </div>
      </div>

      {/* Two teal accent lines beneath header */}
      <div style={{ height: '4px', backgroundColor: tealLight }} />
      <div style={{ height: '2px', backgroundColor: 'rgba(15,92,92,0.3)', marginBottom: '4px' }} />

      {/* ── Body ── */}
      <div style={{ padding: '24px 32px 110px', position: 'relative', zIndex: 1 }}>

        {/* Client / Prepared by — offset right to avoid floating card overlap */}
        <div style={{ display: 'flex', gap: '32px', marginBottom: '24px', paddingRight: '240px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '8px', color: teal, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>Prepared For</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1a1a1a' }}>{quote.client_name || '—'}</div>
            {quote.client_attention && <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>Att: {quote.client_attention}</div>}
            {quote.client_address && <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px', whiteSpace: 'pre-line' }}>{quote.client_address}</div>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '8px', color: teal, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>Prepared By</div>
            <div style={{ fontSize: '11px', color: '#374151' }}>{quote.created_by || 'SGA Sales'}</div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>{co.email}</div>
          </div>
        </div>

        {/* Line items table */}
        <div style={{ fontSize: '8px', color: teal, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Line Items</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: teal }}>
              {['#', 'Description', 'Qty', 'Unit', 'Unit Price (USD)', 'Amount (USD)'].map((h, i) => (
                <th key={h} style={{
                  color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '9px 10px',
                  textAlign: i >= 2 ? 'right' : 'left', letterSpacing: '0.5px',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? items.map((item, i) => (
              <tr key={item.id} style={{ backgroundColor: '#fff', borderBottom: '1px solid #d1fafa' }}>
                <td style={{ padding: '8px 10px', color: '#94a3b8', fontSize: '9px' }}>{i + 1}</td>
                <td style={{ padding: '8px 10px', fontSize: '10px' }}>{item.description}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '10px', fontFamily: 'monospace' }}>{item.qty.toLocaleString()}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '10px', color: '#6b7280' }}>{item.unit}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '10px', fontFamily: 'monospace' }}>{item.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '10px', fontWeight: 'bold', fontFamily: 'monospace' }}>{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              </tr>
            )) : (
              <tr><td colSpan={6} style={{ padding: '16px 10px', color: '#9ca3af', textAlign: 'center', fontStyle: 'italic', backgroundColor: '#fff' }}>No line items added yet</td></tr>
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: `2px solid ${teal}` }}>
          <div style={{ minWidth: '280px', backgroundColor: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', fontSize: '10px', color: '#6b7280' }}>
              <span>Subtotal</span><span style={{ fontFamily: 'monospace' }}>{fmtUSD(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 10px', fontSize: '9px', color: '#94a3b8', fontStyle: 'italic' }}>
              <span>{vatLine()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 10px', fontSize: '14px', fontWeight: 'bold', backgroundColor: teal, color: '#fff' }}>
              <span>TOTAL</span><span style={{ fontFamily: 'monospace' }}>{fmtUSD(total)}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {quote.payment_terms && (
            <div>
              <div style={{ fontSize: '8px', color: teal, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>Payment Terms</div>
              <div style={{ fontSize: '10px', color: '#374151' }}>{quote.payment_terms}</div>
            </div>
          )}
          {quote.delivery_terms && (
            <div>
              <div style={{ fontSize: '8px', color: teal, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>Delivery</div>
              <div style={{ fontSize: '10px', color: '#374151' }}>{quote.delivery_terms}</div>
            </div>
          )}
          {quote.special_instructions && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '8px', color: teal, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>Special Instructions</div>
              <div style={{ fontSize: '10px', color: '#374151', lineHeight: '1.5' }}>{quote.special_instructions}</div>
            </div>
          )}
        </div>

        {/* Bank details */}
        {quote.include_bank_details && (
          <div style={{ marginTop: '20px', backgroundColor: '#fff', padding: '12px 14px', borderLeft: `3px solid ${teal}`, borderRadius: '2px' }}>
            <div style={{ fontSize: '8px', color: teal, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>Banking Details</div>
            <div style={{ fontSize: '9px', color: '#6b7280', lineHeight: '1.6' }}>
              {COMPANY_BANK_DETAILS['SGA'].split('·').map((part, i) => (
                <span key={i}>{i > 0 && ' · '}{part.trim()}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Digital stamp — bottom centre */}
      <div style={{ position: 'absolute', bottom: '72px', left: '50%', transform: 'translateX(-50%)', opacity: 0.85, zIndex: 1 }}>
        <CompanyStamp company="SGA" size={80} />
      </div>

      {/* ── Footer ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        borderTop: `2px solid ${teal}`,
        padding: '10px 32px',
        backgroundColor: bodyBg, zIndex: 1,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#6b7280', marginBottom: '5px' }}>
          <span>Company Reg No: {co.company_reg}</span>
          <span>VAT Reg No: {co.vat_reg}</span>
          <span>TIN: {co.tin}</span>
        </div>
        <div style={{ fontSize: '9px', color: '#9ca3af', textAlign: 'center', fontStyle: 'italic' }}>
          All prices quoted in USD unless otherwise stated. This quotation constitutes no binding agreement until a purchase order is received. E&amp;OE.
        </div>
      </div>
    </div>
  )
}

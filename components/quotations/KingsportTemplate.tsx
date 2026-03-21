'use client'

import React from 'react'
import type { Quote } from '@/lib/quotations'
import { COMPANY_DETAILS, COMPANY_BANK_DETAILS, formatQuoteDate, VAT_RATE } from '@/lib/quotations'
import CompanyStamp from './CompanyStamp'

interface TemplateProps {
  quote: Partial<Quote> & { company: 'Kingsport' }
  forPDF?: boolean
  // ZIMRA fields — populated after successful fiscalisation
  fiscalData?: {
    fiscalStatus?: 'pending' | 'fiscalised' | 'fiscalisation_failed' | 'not_required'
    zimraVerificationCode?: string
    zimraQrCodeUrl?: string
    zimraReceiptCounter?: number
    zimraReceiptGlobalNo?: number
    zimraFiscalDayNo?: number
    deviceID?: number
  }
}

// ─── Kingsport Template ───────────────────────────────────────────────────────
// Visual identity: authoritative, established, corporate.
// Oxblood (#6B2737) + charcoal. Serif headers.
// ─────────────────────────────────────────────────────────────────────────────
export default function KingsportTemplate({ quote, forPDF = false, fiscalData }: TemplateProps) {
  const co = COMPANY_DETAILS['Kingsport']
  const brandColor = '#6B2737'
  const goldLine = '#C9A96E'
  const subtotal = quote.subtotal ?? 0
  const vatAmount = quote.vat_amount ?? 0
  const total = quote.total ?? 0
  const items = quote.line_items ?? []
  const validDays = quote.validity_days ?? 30
  const quoteDate = quote.quote_date ? formatQuoteDate(quote.quote_date) : formatQuoteDate(new Date().toISOString().slice(0, 10))
  const validUntil = quote.valid_until ? formatQuoteDate(quote.valid_until) : '—'

  // ZIMRA fiscal state
  const isFiscalised = fiscalData?.fiscalStatus === 'fiscalised'
  const showWatermark = fiscalData && fiscalData.fiscalStatus !== 'fiscalised' && fiscalData.fiscalStatus !== undefined

  const vatLine = () => {
    const pct = `${(VAT_RATE * 100).toFixed(1)}%`
    if (quote.vat_mode === 'inclusive') return `VAT (${pct}) included in above prices: USD ${vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    if (quote.vat_mode === 'exclusive') return `VAT @ ${pct}: USD ${vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    return 'Zero rated for VAT purposes.'
  }

  const fmtUSD = (n: number) => `USD ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div
      id="quote-template-kingsport"
      style={{
        width: '794px',
        minHeight: '1123px',
        backgroundColor: '#ffffff',
        fontFamily: '"Times New Roman", Georgia, serif',
        fontSize: '11px',
        color: '#1a1a1a',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Header band ── */}
      <div style={{ backgroundColor: brandColor, padding: '24px 32px 20px', position: 'relative' }}>
        {/* Validity ribbon — diagonal */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '100px', height: '100px', overflow: 'hidden',
          pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute', top: '22px', right: '-22px',
            backgroundColor: goldLine, color: '#fff',
            fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.5px',
            padding: '4px 28px', transform: 'rotate(45deg)',
            whiteSpace: 'nowrap', textAlign: 'center',
          }}>
            VALID {validDays} DAYS
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Left: company identity */}
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold', letterSpacing: '1px', lineHeight: 1.2, fontFamily: 'Georgia, serif' }}>
              KINGSPORT INVESTMENTS
            </div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: 'normal', marginTop: '2px' }}>
              PRIVATE LIMITED
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', marginTop: '10px', lineHeight: '1.6' }}>
              {co.address}<br />
              Tel: {co.telephones.join(' / ')}<br />
              Email: {co.email}
            </div>
          </div>

          {/* Right: quote details box */}
          <div style={{
            backgroundColor: '#fff', borderRadius: '4px', padding: '14px 18px',
            minWidth: '200px', textAlign: 'right',
          }}>
            {/* FISCAL TAX INVOICE label when fiscalised */}
            {isFiscalised ? (
              <div style={{ color: brandColor, fontSize: '9px', fontWeight: 'bold', letterSpacing: '1.5px', marginBottom: '4px', textTransform: 'uppercase' }}>Fiscal Tax Invoice</div>
            ) : (
              <div style={{ color: brandColor, fontSize: '8px', fontWeight: 'bold', letterSpacing: '1.5px', marginBottom: '6px', textTransform: 'uppercase' }}>Quotation</div>
            )}
            <div style={{ color: '#1a1a1a', fontSize: '16px', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '1px' }}>
              {quote.quote_number ?? 'KIN-QT-YYYY-NNNN'}
            </div>
            <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '8px 0' }} />
            <div style={{ color: '#6b7280', fontSize: '9px', marginBottom: '2px' }}>Date of Issue</div>
            <div style={{ color: '#374151', fontSize: '10px', fontWeight: 'bold' }}>{quoteDate}</div>
            <div style={{ color: '#6b7280', fontSize: '9px', marginTop: '6px', marginBottom: '2px' }}>Valid Until</div>
            <div style={{ color: brandColor, fontSize: '10px', fontWeight: 'bold' }}>{validUntil}</div>
            {/* ZIMRA fiscal info */}
            {isFiscalised && fiscalData && (
              <>
                <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '8px 0' }} />
                {fiscalData.zimraReceiptCounter !== undefined && fiscalData.zimraReceiptGlobalNo !== undefined && (
                  <div style={{ color: '#6b7280', fontSize: '8px', marginBottom: '1px' }}>Invoice No: <span style={{ fontFamily: 'monospace', color: '#374151' }}>{fiscalData.zimraReceiptCounter}/{fiscalData.zimraReceiptGlobalNo}</span></div>
                )}
                {fiscalData.zimraFiscalDayNo !== undefined && (
                  <div style={{ color: '#6b7280', fontSize: '8px', marginBottom: '1px' }}>Fiscal Day: <span style={{ fontFamily: 'monospace', color: '#374151' }}>{fiscalData.zimraFiscalDayNo}</span></div>
                )}
                {fiscalData.deviceID !== undefined && (
                  <div style={{ color: '#6b7280', fontSize: '8px' }}>Device ID: <span style={{ fontFamily: 'monospace', color: '#374151' }}>{fiscalData.deviceID}</span></div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Gold rule */}
      <div style={{ height: '3px', backgroundColor: goldLine }} />

      {/* ── Body ── */}
      <div style={{ padding: '24px 32px' }}>

        {/* Prepared by / Client row */}
        <div style={{ display: 'flex', gap: '32px', marginBottom: '24px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '8px', color: brandColor, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>Prepared For</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1a1a1a' }}>{quote.client_name || '—'}</div>
            {quote.client_attention && <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>Att: {quote.client_attention}</div>}
            {quote.client_address && <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px', whiteSpace: 'pre-line' }}>{quote.client_address}</div>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '8px', color: brandColor, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>Prepared By</div>
            <div style={{ fontSize: '11px', color: '#374151' }}>{quote.created_by || 'Kingsport Sales'}</div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>{co.email}</div>
          </div>
        </div>

        {/* Line items table */}
        <div style={{ fontSize: '8px', color: brandColor, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Line Items</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0' }}>
          <thead>
            <tr style={{ backgroundColor: brandColor }}>
              {['#', 'Description', 'Qty', 'Unit', 'Unit Price (USD)', 'Amount (USD)'].map((h, i) => (
                <th key={h} style={{
                  color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '8px 10px',
                  textAlign: i >= 2 ? 'right' : 'left', letterSpacing: '0.5px',
                  borderRight: i < 5 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? items.map((item, i) => (
              <tr key={item.id} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#FAF7F7' }}>
                <td style={{ padding: '8px 10px', color: '#6b7280', fontSize: '9px', borderBottom: '1px solid #f0ece9', width: '28px' }}>{i + 1}</td>
                <td style={{ padding: '8px 10px', fontSize: '10px', borderBottom: '1px solid #f0ece9' }}>{item.description}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '10px', borderBottom: '1px solid #f0ece9', fontFamily: 'monospace' }}>{item.qty.toLocaleString()}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '10px', borderBottom: '1px solid #f0ece9', color: '#6b7280' }}>{item.unit}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '10px', borderBottom: '1px solid #f0ece9', fontFamily: 'monospace' }}>{item.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '10px', borderBottom: '1px solid #f0ece9', fontWeight: 'bold', fontFamily: 'monospace' }}>{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} style={{ padding: '16px 10px', color: '#9ca3af', textAlign: 'center', fontStyle: 'italic' }}>No line items added yet</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0' }}>
          <div style={{ minWidth: '260px', borderTop: '2px solid #f0ece9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', fontSize: '10px', color: '#6b7280' }}>
              <span>Subtotal</span><span style={{ fontFamily: 'monospace' }}>{fmtUSD(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 10px', fontSize: '9px', color: '#9ca3af', fontStyle: 'italic' }}>
              <span>{vatLine()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', fontSize: '14px', fontWeight: 'bold', backgroundColor: '#FAF7F7', borderTop: `2px solid ${brandColor}`, color: brandColor }}>
              <span>TOTAL</span><span style={{ fontFamily: 'monospace' }}>{fmtUSD(total)}</span>
            </div>
          </div>
        </div>

        {/* Terms section */}
        <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {quote.payment_terms && (
            <div>
              <div style={{ fontSize: '8px', color: brandColor, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>Payment Terms</div>
              <div style={{ fontSize: '10px', color: '#374151' }}>{quote.payment_terms}</div>
            </div>
          )}
          {quote.delivery_terms && (
            <div>
              <div style={{ fontSize: '8px', color: brandColor, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>Delivery</div>
              <div style={{ fontSize: '10px', color: '#374151' }}>{quote.delivery_terms}</div>
            </div>
          )}
          {quote.special_instructions && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '8px', color: brandColor, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>Special Instructions</div>
              <div style={{ fontSize: '10px', color: '#374151', lineHeight: '1.5' }}>{quote.special_instructions}</div>
            </div>
          )}
        </div>

        {/* PAYMENT DETAILS — structured account block */}
        {quote.include_bank_details && (
          <div style={{ marginTop: '20px', backgroundColor: '#FAF7F7', padding: '12px 14px', borderLeft: `3px solid ${goldLine}`, borderRadius: '2px' }}>
            <div style={{ fontSize: '8px', color: brandColor, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Payment Details</div>
            {quote.selected_bank_account ? (
              // Structured account — field-by-field
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', rowGap: '3px', fontSize: '9px', color: '#374151', lineHeight: '1.5' }}>
                <span style={{ color: '#6b7280' }}>ACCOUNT NAME:</span><span style={{ fontWeight: '600' }}>{quote.selected_bank_account.account_name}</span>
                <span style={{ color: '#6b7280' }}>BANK:</span><span>{quote.selected_bank_account.bank}</span>
                <span style={{ color: '#6b7280' }}>BRANCH:</span><span>{quote.selected_bank_account.branch}</span>
                {quote.selected_bank_account.branch_code && (<><span style={{ color: '#6b7280' }}>BRANCH CODE:</span><span>{quote.selected_bank_account.branch_code}</span></>)}
                {quote.selected_bank_account.sort_code && (<><span style={{ color: '#6b7280' }}>SORT CODE:</span><span>{quote.selected_bank_account.sort_code}</span></>)}
                <span style={{ color: '#6b7280' }}>ACCOUNT NUMBER:</span><span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{quote.selected_bank_account.account_number}</span>
                {quote.selected_bank_account.account_type && (<><span style={{ color: '#6b7280' }}>ACCOUNT TYPE:</span><span>{quote.selected_bank_account.account_type}</span></>)}
                {quote.selected_bank_account.swift_code && (<><span style={{ color: '#6b7280' }}>SWIFT CODE:</span><span style={{ fontFamily: 'monospace' }}>{quote.selected_bank_account.swift_code}</span></>)}
              </div>
            ) : (
              // Fallback — legacy string format
              <div style={{ fontSize: '9px', color: '#6b7280', lineHeight: '1.6' }}>
                {COMPANY_BANK_DETAILS['Kingsport'].split('·').map((part, i) => (
                  <span key={i}>{i > 0 && ' · '}{part.trim()}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

        {/* ZIMRA verification code + QR - rendered when fiscalised */}
        {isFiscalised && fiscalData?.zimraVerificationCode && (
          <div style={{ marginTop: '20px', backgroundColor: '#f8f9ff', padding: '10px 14px', borderLeft: '3px solid #6366f1', borderRadius: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '8px', color: '#6366f1', fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>ZIMRA Verification Code</div>
              <div style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold', color: '#1a1a1a', letterSpacing: '2px' }}>{fiscalData.zimraVerificationCode}</div>
              <div style={{ fontSize: '8px', color: '#9ca3af', marginTop: '3px' }}>Verify at: fdmsapitest.zimra.co.zw</div>
            </div>
            {/* QR code placeholder — in PDF generation, replace with actual qrcode image */}
            <div style={{ width: '56px', height: '56px', border: '1px solid #e5e7eb', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
              <div style={{ fontSize: '6px', color: '#9ca3af', textAlign: 'center', lineHeight: 1.3 }}>ZIMRA<br/>QR</div>
            </div>
          </div>
        )}

        {/* ZIMRA Tax Summary Table — required for InvoiceA4 format */}
        {isFiscalised && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '8px', color: brandColor, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>Tax Summary</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAF7F7' }}>
                  {['Tax Code', 'VAT %', 'Net Amount (USD)', 'VAT Amount (USD)', 'Gross Amount (USD)'].map(h => (
                    <th key={h} style={{ padding: '5px 8px', textAlign: 'right', color: '#6b7280', fontWeight: 'bold', fontSize: '8px', borderBottom: `1px solid ${goldLine}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'monospace' }}>A</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{(VAT_RATE * 100).toFixed(1)}%</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{fmtUSD(subtotal - vatAmount)}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{fmtUSD(vatAmount)}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>{fmtUSD(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      <div style={{ position: 'absolute', bottom: '80px', right: '32px', opacity: 0.85 }}>
        <CompanyStamp company="Kingsport" size={80} />
      </div>

      {/* ── Footer ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        borderTop: `2px solid ${brandColor}`,
        padding: '12px 32px',
        backgroundColor: '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#6b7280', marginBottom: '6px' }}>
          <span>Company Reg No: {co.company_reg}</span>
          <span>VAT Reg No: {co.vat_reg}</span>
          <span>TIN: {co.tin}</span>
        </div>
        <div style={{ fontSize: '9px', color: '#9ca3af', textAlign: 'center', fontStyle: 'italic' }}>
          This quotation is valid for {validDays} days from the date of issue. E&amp;OE.
        </div>
      </div>

      {/* NOT FISCALISED watermark — shown when fiscal data present but not yet fiscalised */}
      {showWatermark && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', pointerEvents: 'none', zIndex: 10,
        }}>
          <div style={{
            fontSize: '28px', fontWeight: 'bold', color: '#dc2626',
            opacity: 0.40, transform: 'rotate(-35deg)', letterSpacing: '2px',
            whiteSpace: 'nowrap', userSelect: 'none',
            fontFamily: 'Arial, sans-serif',
          }}>
            NOT FISCALISED — DRAFT ONLY
          </div>
        </div>
      )}
    </div>
  )
}

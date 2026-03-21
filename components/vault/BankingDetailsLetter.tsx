'use client'

import React from 'react'
import { Download, AlertTriangle } from 'lucide-react'
import CompanyStamp from '@/components/quotations/CompanyStamp'
import { generateQuotePDF } from '@/lib/generateQuotePDF'
import toast from 'react-hot-toast'

// ─── Banking Details Confirmation Letter ──────────────────────────────────────
// Rendered in the Document Vault drawer as a live styled HTML component.
// Reuses the Kingsport quotation template visual identity (oxblood header).
// ─────────────────────────────────────────────────────────────────────────────

const brandColor = '#6B2737'
const goldLine = '#C9A96E'

interface FieldRowProps {
  label: string
  value?: string
}
function FieldRow({ label, value }: FieldRowProps) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: '0', marginBottom: '4px' }}>
      <div style={{ width: '160px', flexShrink: 0, color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', paddingTop: '1px' }}>{label}:</div>
      <div style={{ fontSize: '10.5px', color: '#1a1a1a', fontWeight: '500' }}>{value}</div>
    </div>
  )
}

interface AccountBlockProps {
  number: number
  bank: string
  branch: string
  accountNumber: string
  accountType?: string
  swiftCode?: string
  branchCode?: string
  sortCode?: string
}
function AccountBlock({ number, bank, branch, accountNumber, accountType, swiftCode, branchCode, sortCode }: AccountBlockProps) {
  return (
    <div style={{ marginBottom: '20px', borderLeft: `3px solid ${brandColor}`, paddingLeft: '14px', paddingTop: '4px', paddingBottom: '4px' }}>
      <p style={{ fontSize: '10px', fontWeight: 'bold', color: brandColor, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Account {number}</p>
      <FieldRow label="Account Name" value="Kingsport Investments" />
      <FieldRow label="Bank" value={bank} />
      <FieldRow label="Branch" value={branch} />
      {branchCode && <FieldRow label="Branch Code" value={branchCode} />}
      {sortCode && <FieldRow label="Sort Code" value={sortCode} />}
      <FieldRow label="Account Number" value={accountNumber} />
      {accountType && <FieldRow label="Account Type" value={accountType} />}
      {swiftCode && <FieldRow label="Swift Code" value={swiftCode} />}
    </div>
  )
}

export default function BankingDetailsLetter() {
  const [downloading, setDownloading] = React.useState(false)

  async function handleDownload() {
    setDownloading(true)
    try {
      const jsPDFModule = await import('jspdf')
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = jsPDFModule
      const el = document.getElementById('banking-letter-content')
      if (!el) throw new Error('Letter element not found')
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', logging: false })
      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const imgHeight = (canvas.height * pageWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight)
      pdf.save('Kingsport_Banking_Details_Confirmation_Letter_16Mar2026.pdf')
      toast.success('Letter downloaded.')
    } catch {
      toast.error('Could not generate PDF.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Download button */}
      <div className="flex justify-end">
        <button onClick={handleDownload} disabled={downloading} className="btn-secondary btn-sm text-xs">
          <Download className="w-3 h-3" />{downloading ? 'Generating…' : 'Download PDF'}
        </button>
      </div>

      {/* Letter */}
      <div
        id="banking-letter-content"
        style={{
          width: '100%',
          maxWidth: '680px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          fontFamily: '"Times New Roman", Georgia, serif',
          fontSize: '11px',
          color: '#1a1a1a',
          boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div style={{ backgroundColor: brandColor, padding: '22px 28px 18px' }}>
          <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', fontFamily: 'Georgia, serif', letterSpacing: '1px', lineHeight: 1.2 }}>
            KINGSPORT INVESTMENTS
          </div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', marginBottom: '10px' }}>
            PRIVATE LIMITED
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '9.5px', lineHeight: '1.7' }}>
            4 Grant Street, Harare, Zimbabwe<br />
            Tel: 0242 781073 / 0242 770712 / 0242 770922 / 0242 770607<br />
            Email: sales@kingsport.co.zw
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '9px', marginTop: '6px' }}>
            VAT Reg No: 220135644 &nbsp;|&nbsp; Company Reg No: 6023/98 &nbsp;|&nbsp; TIN: 2000130947
          </div>
        </div>

        {/* Gold rule */}
        <div style={{ height: '3px', backgroundColor: goldLine }} />

        {/* ── Body ── */}
        <div style={{ padding: '24px 28px' }}>

          {/* Date */}
          <p style={{ fontSize: '10.5px', color: '#6b7280', marginBottom: '20px' }}>
            16 March 2026
          </p>

          {/* Salutation */}
          <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '4px' }}>
            TO WHOM IT MAY CONCERN
          </p>

          {/* RE line */}
          <p style={{ fontSize: '11px', fontWeight: 'bold', color: brandColor, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px', paddingBottom: '12px', borderBottom: `1px solid ${goldLine}` }}>
            RE: CONFIRMATION OF BANKING DETAILS — KINGSPORT INVESTMENTS PRIVATE LIMITED
          </p>

          {/* Opening paragraph */}
          <p style={{ fontSize: '10.5px', lineHeight: '1.7', color: '#374151', marginBottom: '16px' }}>
            This letter serves to confirm that the following are the official and verified banking details for{' '}
            <strong>Kingsport Investments Private Limited</strong>, a company duly registered under the laws of Zimbabwe with
            Company Registration Number <strong>6023/98</strong>.
          </p>
          <p style={{ fontSize: '10.5px', lineHeight: '1.7', color: '#374151', marginBottom: '24px' }}>
            Please direct all payments to any one of the accounts listed below. Kindly use the payment reference agreed upon with your
            respective sales representative to ensure prompt allocation of funds.
          </p>

          {/* ── Accounts ── */}
          <AccountBlock
            number={1}
            bank="Stanbic Bank Zimbabwe"
            branch="Southerton"
            branchCode="3120"
            accountNumber="9140001219757"
            accountType="FCA Nostro"
            swiftCode="SBICZWHX"
          />
          <AccountBlock
            number={2}
            bank="CBZ Bank"
            branch="Kwame Nkrumah Avenue"
            sortCode="6101"
            accountNumber="01124052670014"
            accountType="Corporate Account"
            swiftCode="COBZZWHAXXX"
          />
          <AccountBlock
            number={3}
            bank="First Capital Bank"
            branch="FCDA Centre / Birmingham"
            accountNumber="21573058690"
            swiftCode="BARCZWHX"
          />
          <AccountBlock
            number={4}
            bank="FBC Bank"
            branch="Centre"
            branchCode="8120"
            accountNumber="2270000290265"
            swiftCode="FBCPZWHAXXX"
          />

          {/* Closing */}
          <p style={{ fontSize: '10.5px', lineHeight: '1.7', color: '#374151', marginTop: '12px', paddingTop: '16px', borderTop: `1px solid #f0ece9` }}>
            Should you require any further verification or have any queries regarding the above, please do not hesitate to
            contact us directly on the numbers or email address above.
          </p>

          <p style={{ fontSize: '10.5px', color: '#374151', marginTop: '20px' }}>
            Yours faithfully,
          </p>
          <p style={{ fontSize: '10px', color: '#374151', fontStyle: 'italic', marginTop: '4px', marginBottom: '20px' }}>
            For and on behalf of Kingsport Investments Private Limited
          </p>

          {/* Stamp + signatory */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', marginTop: '8px' }}>
            <CompanyStamp company="Kingsport" size={80} />
            <div>
              <div style={{ height: '1px', width: '160px', backgroundColor: '#d1d5db', marginBottom: '6px' }} />
              <p style={{ fontSize: '10.5px', fontWeight: 'bold', color: '#1a1a1a' }}>Authorised Signatory</p>
              <p style={{ fontSize: '10px', color: '#6b7280' }}>Kingsport Investments (Pvt) Ltd</p>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ backgroundColor: '#FAF7F7', borderTop: `2px solid ${brandColor}`, padding: '10px 28px' }}>
          <p style={{ fontSize: '9px', color: '#9ca3af', fontStyle: 'italic', textAlign: 'center', lineHeight: '1.5' }}>
            The information contained in this letter is confidential and intended solely for the verification of banking details.
            Kingsport Investments accepts no liability for payments made to accounts other than those listed above.
          </p>
        </div>
      </div>
    </div>
  )
}

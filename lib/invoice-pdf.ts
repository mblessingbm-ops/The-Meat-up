/**
 * lib/invoice-pdf.ts
 *
 * Server-safe invoice PDF generation using jsPDF + jspdf-autotable.
 * Produces two layouts:
 *   • Fiscal invoice  — includes ZIMRA verification code, QR, VAT table
 *   • Non-fiscal invoice — includes VAT EXEMPT band, exemption reason, no ZIMRA data
 *
 * Usage (API route):
 *   import { generateInvoicePdf } from '@/lib/invoice-pdf'
 *   const pdfBytes = await generateInvoicePdf(invoice)
 *   return new Response(pdfBytes, { headers: { 'Content-Type': 'application/pdf' } })
 */

// Dynamic import keeps jsPDF out of the Edge runtime bundle (it requires Node APIs)
import type { jsPDF as JsPDFType } from 'jspdf'

export interface InvoicePdfData {
  // Identity
  invoiceNumber:   string
  invoiceType:     'fiscal' | 'non_fiscal'
  issueDate:       string
  dueDate:         string
  currency:        string

  // Parties
  sellerName:      string
  sellerAddress?:  string
  sellerTin?:      string
  sellerVat?:      string
  buyerName:       string
  buyerAddress?:   string
  buyerTin?:       string
  buyerVat?:       string

  // Line items
  lineItems: Array<{
    description: string
    quantity:    number
    unitPrice:   number
    lineTotal:   number
    taxPercent?: number
  }>

  // Totals
  subtotal:    number
  taxAmount:   number
  totalAmount: number

  // Non-fiscal only
  exemptionReason?: string

  // Fiscal (ZIMRA) only
  fiscalStatus?:         string
  zimraReceiptId?:       number | null
  zimraFiscalDayNo?:     number | null
  zimraGlobalNo?:        number | null
  zimraVerificationCode?: string | null
  zimraQrCodeUrl?:       string | null
  zimraServerDate?:      string | null

  // Misc
  notes?:        string
  paymentMethod?: string
}

const BRAND = {
  primary:     [17, 24, 39]   as [number, number, number],  // gray-900
  accent:      [5, 150, 105]  as [number, number, number],  // emerald-600
  accentLight: [209, 250, 229] as [number, number, number], // emerald-100
  danger:      [220, 38, 38]  as [number, number, number],  // red-600
  dangerLight: [254, 226, 226] as [number, number, number], // red-100
  muted:       [107, 114, 128] as [number, number, number], // gray-500
  border:      [229, 231, 235] as [number, number, number], // gray-200
  white:       [255, 255, 255] as [number, number, number],
}

function fmt(n: number, currency: string) {
  return `${currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return d }
}

/** Returns jsPDF Uint8Array */
export async function generateInvoicePdf(inv: InvoicePdfData): Promise<Uint8Array> {
  // Dynamic imports — avoids Edge runtime issues
  const { jsPDF } = await import('jspdf')
  await import('jspdf-autotable')

  const doc: JsPDFType = new (jsPDF as unknown as new (opts: object) => JsPDFType)({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const W = 210
  const marginL = 15
  const marginR = 15
  const contentW = W - marginL - marginR
  let y = 15

  // ── Header band ──────────────────────────────────────────────────────────────
  doc.setFillColor(...BRAND.primary)
  doc.rect(0, 0, W, 28, 'F')

  // Company name
  doc.setTextColor(...BRAND.white)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(inv.sellerName.toUpperCase(), marginL, 12)

  // Invoice type tag (top-right)
  if (inv.invoiceType === 'fiscal') {
    doc.setFillColor(...BRAND.accent)
    doc.roundedRect(W - marginR - 44, 5, 44, 10, 2, 2, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('FISCAL INVOICE', W - marginR - 22, 11.5, { align: 'center' })
  } else {
    doc.setFillColor(...BRAND.danger)
    doc.roundedRect(W - marginR - 52, 5, 52, 10, 2, 2, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('NON-FISCAL INVOICE', W - marginR - 26, 11.5, { align: 'center' })
  }

  // Subtitle
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(200, 220, 210)
  const sellerMeta = [inv.sellerTin ? `TIN: ${inv.sellerTin}` : '', inv.sellerVat ? `VAT: ${inv.sellerVat}` : ''].filter(Boolean).join('   ')
  doc.text(sellerMeta, marginL, 22)

  y = 36

  // ── Invoice meta block ───────────────────────────────────────────────────────
  doc.setTextColor(...BRAND.primary)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`INVOICE #${inv.invoiceNumber}`, marginL, y)

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...BRAND.muted)
  y += 5
  doc.text(`Issue Date: ${fmtDate(inv.issueDate)}`, marginL, y)
  doc.text(`Due Date:   ${fmtDate(inv.dueDate)}`, marginL + 55, y)
  doc.text(`Currency:   ${inv.currency}`, marginL + 110, y)
  if (inv.paymentMethod) {
    y += 5
    doc.text(`Payment via: ${inv.paymentMethod}`, marginL, y)
  }

  // ── Buyer / Seller boxes ─────────────────────────────────────────────────────
  y += 9
  const boxY = y
  const boxH = 28
  const halfW = (contentW - 5) / 2

  // Seller box
  doc.setFillColor(...BRAND.accentLight)
  doc.roundedRect(marginL, boxY, halfW, boxH, 2, 2, 'F')
  doc.setTextColor(...BRAND.accent)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('FROM', marginL + 4, boxY + 5)
  doc.setTextColor(...BRAND.primary)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.text(inv.sellerName, marginL + 4, boxY + 11)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...BRAND.muted)
  if (inv.sellerAddress) doc.text(inv.sellerAddress, marginL + 4, boxY + 16)
  if (inv.sellerTin)     doc.text(`TIN: ${inv.sellerTin}`, marginL + 4, boxY + 21)
  if (inv.sellerVat)     doc.text(`VAT: ${inv.sellerVat}`, marginL + 4, boxY + 25)

  // Buyer box
  const buyerX = marginL + halfW + 5
  doc.setFillColor(...BRAND.border)
  doc.roundedRect(buyerX, boxY, halfW, boxH, 2, 2, 'F')
  doc.setTextColor(...BRAND.muted)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('BILL TO', buyerX + 4, boxY + 5)
  doc.setTextColor(...BRAND.primary)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.text(inv.buyerName, buyerX + 4, boxY + 11)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...BRAND.muted)
  if (inv.buyerAddress) doc.text(inv.buyerAddress, buyerX + 4, boxY + 16)
  if (inv.buyerTin)     doc.text(`TIN: ${inv.buyerTin}`, buyerX + 4, boxY + 21)
  if (inv.buyerVat)     doc.text(`VAT: ${inv.buyerVat}`, buyerX + 4, boxY + 25)

  y = boxY + boxH + 8

  // ── Non-fiscal VAT EXEMPT band ───────────────────────────────────────────────
  if (inv.invoiceType === 'non_fiscal') {
    doc.setFillColor(...BRAND.dangerLight)
    doc.roundedRect(marginL, y, contentW, 12, 2, 2, 'F')
    doc.setTextColor(...BRAND.danger)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('⊘  VAT EXEMPT — NOT FISCALISED', marginL + 4, y + 5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    if (inv.exemptionReason) {
      doc.text(`Reason: ${inv.exemptionReason}`, marginL + 4, y + 10)
    }
    y += 16
  }

  // ── Line items table ─────────────────────────────────────────────────────────
  const tableHead = [['#', 'Description', 'Qty', 'Unit Price', 'VAT %', 'Total']]
  const tableBody = inv.lineItems.map((item, i) => [
    String(i + 1),
    item.description,
    String(item.quantity),
    fmt(item.unitPrice, inv.currency),
    inv.invoiceType === 'non_fiscal' ? 'Exempt' : `${item.taxPercent ?? 15}%`,
    fmt(item.lineTotal, inv.currency),
  ])

  ;(doc as unknown as { autoTable: (opts: object) => void }).autoTable({
    startY:       y,
    head:         tableHead,
    body:         tableBody,
    margin:       { left: marginL, right: marginR },
    styles:       { fontSize: 8, cellPadding: 3 },
    headStyles:   { fillColor: BRAND.primary, textColor: BRAND.white, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 8,  halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 14, halign: 'center' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 16, halign: 'center' },
      5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
    },
  })

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6

  // ── Totals block ─────────────────────────────────────────────────────────────
  const totalsX = W - marginR - 70
  const totalsW = 70

  const drawTotalRow = (label: string, value: string, highlight = false) => {
    if (highlight) {
      doc.setFillColor(...BRAND.primary)
      doc.rect(totalsX, y - 4, totalsW, 8, 'F')
      doc.setTextColor(...BRAND.white)
      doc.setFont('helvetica', 'bold')
    } else {
      doc.setTextColor(...BRAND.muted)
      doc.setFont('helvetica', 'normal')
    }
    doc.setFontSize(8.5)
    doc.text(label, totalsX + 3, y)
    doc.text(value, totalsX + totalsW - 3, y, { align: 'right' })
    y += 7
    doc.setTextColor(...BRAND.primary)
  }

  drawTotalRow('Subtotal', fmt(inv.subtotal, inv.currency))
  drawTotalRow(
    inv.invoiceType === 'non_fiscal' ? 'VAT (Exempt)' : `VAT (${inv.taxAmount > 0 ? '15%' : '0%'})`,
    inv.invoiceType === 'non_fiscal' ? '—' : fmt(inv.taxAmount, inv.currency)
  )
  drawTotalRow(`TOTAL DUE (${inv.currency})`, fmt(inv.totalAmount, inv.currency), true)

  y += 4

  // ── Notes ────────────────────────────────────────────────────────────────────
  if (inv.notes) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...BRAND.muted)
    doc.text(`Notes: ${inv.notes}`, marginL, y)
    y += 6
  }

  // ── ZIMRA fiscal block ────────────────────────────────────────────────────────
  if (inv.invoiceType === 'fiscal' && inv.fiscalStatus === 'fiscalised') {
    y += 4

    doc.setFillColor(...BRAND.accentLight)
    const zimraBlockH = 38 + (inv.zimraQrCodeUrl ? 2 : 0)
    doc.roundedRect(marginL, y, contentW, zimraBlockH, 3, 3, 'F')

    // ZIMRA label
    doc.setTextColor(...BRAND.accent)
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.text('ZIMRA FISCAL RECEIPT', marginL + 4, y + 7)

    doc.setTextColor(...BRAND.primary)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)

    const col1 = marginL + 4
    const col2 = marginL + 65
    const col3 = marginL + 115
    let zy = y + 14

    if (inv.zimraReceiptId)   { doc.text(`Receipt ID:`, col1, zy);   doc.setFont('helvetica', 'bold'); doc.text(`${inv.zimraReceiptId}`, col1 + 24, zy); doc.setFont('helvetica', 'normal') }
    if (inv.zimraFiscalDayNo) { doc.text(`Fiscal Day:`, col2, zy);   doc.setFont('helvetica', 'bold'); doc.text(`${inv.zimraFiscalDayNo}`, col2 + 24, zy); doc.setFont('helvetica', 'normal') }
    if (inv.zimraGlobalNo)    { doc.text(`Global No:`, col3, zy);    doc.setFont('helvetica', 'bold'); doc.text(`${inv.zimraGlobalNo}`, col3 + 22, zy); doc.setFont('helvetica', 'normal') }

    zy += 8
    if (inv.zimraServerDate) {
      doc.text(`Verified:`, col1, zy)
      doc.setFont('helvetica', 'bold')
      doc.text(fmtDate(inv.zimraServerDate), col1 + 20, zy)
      doc.setFont('helvetica', 'normal')
    }

    zy += 8
    if (inv.zimraVerificationCode) {
      doc.text(`Verification Code:`, col1, zy)
      doc.setFont('courier', 'bold')
      doc.setFontSize(9)
      doc.text(inv.zimraVerificationCode, col1 + 36, zy)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
    }

    zy += 10
    doc.setFontSize(7)
    doc.setTextColor(...BRAND.muted)
    doc.text('This invoice has been electronically verified by ZIMRA. Verify at: zimra.co.zw', marginL + 4, zy)

    y += zimraBlockH + 6
  } else if (inv.invoiceType === 'fiscal' && inv.fiscalStatus === 'fiscalisation_failed') {
    y += 4
    doc.setFillColor(...BRAND.dangerLight)
    doc.roundedRect(marginL, y, contentW, 12, 2, 2, 'F')
    doc.setTextColor(...BRAND.danger)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('⚠  ZIMRA FISCALISATION FAILED — Please retry submission before issuing this invoice.', marginL + 4, y + 7)
    y += 16
  }

  // ── Footer ───────────────────────────────────────────────────────────────────
  const pageH = 297
  doc.setFillColor(...BRAND.primary)
  doc.rect(0, pageH - 12, W, 12, 'F')
  doc.setTextColor(...BRAND.white)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `${inv.sellerName}  •  Generated by NEXUS Business Platform  •  ${new Date().toLocaleDateString('en-GB')}`,
    W / 2,
    pageH - 5,
    { align: 'center' }
  )

  return doc.output('arraybuffer') as unknown as Uint8Array
}

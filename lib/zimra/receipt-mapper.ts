// lib/zimra/receipt-mapper.ts
// Maps Kingsport internal invoice data → ZIMRA Receipt object

import type { KingsportInvoiceForFiscalisation, ZimraReceipt, ZimraFiscalDayState } from '@/types/zimra'

export function mapInvoiceToZimraReceipt(
  invoice: KingsportInvoiceForFiscalisation,
  fiscalDayState: ZimraFiscalDayState,
  receiptDate: Date
): Omit<ZimraReceipt, 'receiptDeviceSignature'> {
  const nextReceiptCounter = fiscalDayState.lastReceiptCounter + 1
  const nextReceiptGlobalNo = fiscalDayState.lastReceiptGlobalNo + 1
  const receiptDateISO = formatReceiptDate(receiptDate)

  const receiptLines = invoice.lineItems.map((item, idx) => ({
    receiptLineType: 'Sale' as const,
    receiptLineNo: idx + 1,
    receiptLineHSCode: item.hsCode,
    receiptLineName: item.description,
    receiptLinePrice: item.unitPrice,
    receiptLineQuantity: item.quantity,
    receiptLineTotal: roundTo2(item.lineTotal),
    taxCode: item.taxCode,
    taxPercent: item.taxPercent,
    taxID: item.taxID,
  }))

  // Aggregate taxes per taxID + taxCode (tax inclusive calculation)
  const taxMap = new Map<string, {
    taxID: number
    taxCode?: string
    taxPercent?: number
    taxAmount: number
    salesAmountWithTax: number
  }>()

  for (const line of invoice.lineItems) {
    const key = `${line.taxID}-${line.taxCode || ''}`
    const taxAmount = line.taxPercent !== undefined
      ? line.lineTotal * (line.taxPercent / (100 + line.taxPercent))
      : 0
    const existing = taxMap.get(key)
    if (existing) {
      existing.taxAmount += taxAmount
      existing.salesAmountWithTax += line.lineTotal
    } else {
      taxMap.set(key, {
        taxID: line.taxID,
        taxCode: line.taxCode,
        taxPercent: line.taxPercent,
        taxAmount,
        salesAmountWithTax: line.lineTotal,
      })
    }
  }

  const receiptTaxes = Array.from(taxMap.values()).map(t => ({
    taxCode: t.taxCode,
    taxPercent: t.taxPercent,
    taxID: t.taxID,
    taxAmount: roundTo2(t.taxAmount),
    salesAmountWithTax: roundTo2(t.salesAmountWithTax),
  }))

  const receiptTotal = roundTo2(invoice.lineItems.reduce((sum, l) => sum + l.lineTotal, 0))

  return {
    receiptType: invoice.receiptType,
    receiptCurrency: invoice.currency === 'ZWG' ? 'ZWG' : 'USD',
    receiptCounter: nextReceiptCounter,
    receiptGlobalNo: nextReceiptGlobalNo,
    invoiceNo: invoice.invoiceNo,
    buyerData: invoice.buyer ? {
      buyerRegisterName: invoice.buyer.name,
      buyerTIN: invoice.buyer.tin || '0000000000',
      VATNumber: invoice.buyer.vatNumber,
    } : undefined,
    receiptNotes: invoice.receiptNotes,
    receiptDate: receiptDateISO,
    creditDebitNote: invoice.creditDebitNote,
    receiptLinesTaxInclusive: true,
    receiptLines,
    receiptTaxes,
    receiptPayments: [{ moneyTypeCode: invoice.paymentMethod, paymentAmount: receiptTotal }],
    receiptTotal,
    receiptPrintForm: 'InvoiceA4',
    username: invoice.issuedBy,
    userNameSurname: invoice.issuedByName,
  }
}

function formatReceiptDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function roundTo2(n: number): number {
  return Math.round(n * 100) / 100
}

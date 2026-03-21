// lib/zimra/crypto.ts
// SERVER-SIDE ONLY — never import in client components

import { createHash, createSign } from 'crypto'
import type { ZimraReceipt, ZimraFiscalDayCounter } from '@/types/zimra'

/**
 * Signs a receipt per ZIMRA spec section 13.2.1.
 * Field concatenation order:
 * deviceID | receiptType (UPPER) | receiptCurrency (UPPER) | receiptGlobalNo |
 * receiptDate | receiptTotal (cents) | receiptTaxes (concatenated) | previousReceiptHash
 */
export function signReceipt(
  receipt: Omit<ZimraReceipt, 'receiptDeviceSignature'>,
  deviceID: number,
  previousReceiptHash: string | null,
  privateKeyPem: string
): { hash: string; signature: string } {
  const receiptTotalCents = Math.round(receipt.receiptTotal * 100)

  // Sort taxes: taxID ascending, then taxCode alphabetically
  const sortedTaxes = [...receipt.receiptTaxes].sort((a, b) => {
    if (a.taxID !== b.taxID) return a.taxID - b.taxID
    return (a.taxCode || '').localeCompare(b.taxCode || '')
  })

  const taxesString = sortedTaxes.map(tax => {
    const code = tax.taxCode || ''
    const percent = tax.taxPercent !== undefined
      ? Number.isInteger(tax.taxPercent)
        ? `${tax.taxPercent}.00`
        : tax.taxPercent.toFixed(2)
      : ''
    const taxAmountCents = Math.round(tax.taxAmount * 100)
    const salesAmountCents = Math.round(tax.salesAmountWithTax * 100)
    return `${code}${percent}${taxAmountCents}${salesAmountCents}`
  }).join('')

  const parts = [
    deviceID.toString(),
    receipt.receiptType.toUpperCase(),
    receipt.receiptCurrency.toUpperCase(),
    receipt.receiptGlobalNo.toString(),
    receipt.receiptDate,
    receiptTotalCents.toString(),
    taxesString,
  ]

  if (previousReceiptHash) parts.push(previousReceiptHash)

  const concatenated = parts.join('')

  const hash = createHash('sha256').update(concatenated, 'utf8').digest()

  const sign = createSign('SHA256')
  sign.update(concatenated, 'utf8')
  sign.end()
  const signature = sign.sign(privateKeyPem)

  return {
    hash: hash.toString('base64'),
    signature: signature.toString('base64'),
  }
}

/**
 * Signs a fiscal day close per ZIMRA spec section 13.3.1.
 * Field concatenation: deviceID | fiscalDayNo | fiscalDayDate (YYYY-MM-DD) | counters
 * Counter sort: fiscalCounterType asc → fiscalCounterCurrency asc → taxID/moneyType asc
 * All text values in UPPER CASE. Amounts in cents.
 */
export function signFiscalDay(
  deviceID: number,
  fiscalDayNo: number,
  fiscalDayDate: string,
  fiscalDayCounters: ZimraFiscalDayCounter[],
  privateKeyPem: string
): { hash: string; signature: string } {
  const sorted = [...fiscalDayCounters]
    .filter(c => c.fiscalCounterValue !== 0)
    .sort((a, b) => {
      if (a.fiscalCounterType !== b.fiscalCounterType)
        return a.fiscalCounterType.localeCompare(b.fiscalCounterType)
      if (a.fiscalCounterCurrency !== b.fiscalCounterCurrency)
        return a.fiscalCounterCurrency.localeCompare(b.fiscalCounterCurrency)
      if (a.fiscalCounterTaxID !== undefined && b.fiscalCounterTaxID !== undefined)
        return a.fiscalCounterTaxID - b.fiscalCounterTaxID
      return (a.fiscalCounterMoneyType || '').localeCompare(b.fiscalCounterMoneyType || '')
    })

  const countersString = sorted.map(c => {
    const type = c.fiscalCounterType.toUpperCase()
    const currency = c.fiscalCounterCurrency.toUpperCase()
    const taxOrMoney = c.fiscalCounterMoneyType
      ? c.fiscalCounterMoneyType.toUpperCase()
      : c.fiscalCounterTaxPercent !== undefined
        ? Number.isInteger(c.fiscalCounterTaxPercent)
          ? `${c.fiscalCounterTaxPercent}.00`
          : c.fiscalCounterTaxPercent.toFixed(2)
        : ''
    const valueCents = Math.round(c.fiscalCounterValue * 100)
    return `${type}${currency}${taxOrMoney}${valueCents}`
  }).join('')

  const concatenated = `${deviceID}${fiscalDayNo}${fiscalDayDate}${countersString}`

  const hash = createHash('sha256').update(concatenated, 'utf8').digest()

  const sign = createSign('SHA256')
  sign.update(concatenated, 'utf8')
  sign.end()
  const signature = sign.sign(privateKeyPem)

  return {
    hash: hash.toString('base64'),
    signature: signature.toString('base64'),
  }
}

/**
 * Generates QR code data string per ZIMRA spec section 11.
 * Format: qrUrl/deviceID(10)receiptDate(ddMMyyyy)receiptGlobalNo(10)receiptQrData(16)
 * receiptQrData = first 16 chars of MD5 hex of device signature hash buffer (uppercase)
 */
export function generateQrCodeData(
  qrUrl: string,
  deviceID: number,
  receiptDate: string,
  receiptGlobalNo: number,
  receiptDeviceSignatureHash: string
): string {
  const deviceIDPadded = deviceID.toString().padStart(10, '0')

  const [year, month, day] = receiptDate.substring(0, 10).split('-')
  const receiptDateFormatted = `${day}${month}${year}`

  const receiptGlobalNoPadded = receiptGlobalNo.toString().padStart(10, '0')

  const hashBuffer = Buffer.from(receiptDeviceSignatureHash, 'base64')
  const md5Hex = createHash('md5').update(hashBuffer).digest('hex').toUpperCase()
  const receiptQrData = md5Hex.substring(0, 16)

  const cleanQrUrl = qrUrl.endsWith('/') ? qrUrl : `${qrUrl}/`

  return `${cleanQrUrl}${deviceIDPadded}${receiptDateFormatted}${receiptGlobalNoPadded}${receiptQrData}`
}

/**
 * Formats verification code for display on invoice.
 * "4C8BE27663330417" → "4C8B-E276-6333-0417"
 */
export function formatVerificationCode(receiptQrData: string): string {
  const code = receiptQrData.split('/').pop() || receiptQrData
  return code.substring(code.length - 16).match(/.{1,4}/g)?.join('-') || code
}

// types/zimra.ts
// All ZIMRA API types and interfaces — used by lib/zimra/* and API routes

export type ZimraReceiptType = 'FiscalInvoice' | 'CreditNote' | 'DebitNote'
export type ZimraReceiptLineType = 'Sale' | 'Discount'
export type ZimraMoneyType = 'Cash' | 'Card' | 'MobileWallet' | 'Coupon' | 'Credit' | 'BankTransfer' | 'Other'
export type ZimraReceiptPrintForm = 'Receipt48' | 'InvoiceA4'
export type ZimraFiscalDayStatus = 'FiscalDayClosed' | 'FiscalDayOpened' | 'FiscalDayCloseInitiated' | 'FiscalDayCloseFailed'
export type ZimraFiscalCounterType = 'SaleByTax' | 'SaleTaxByTax' | 'CreditNoteByTax' | 'CreditNoteTaxByTax' | 'DebitNoteByTax' | 'DebitNoteTaxByTax' | 'BalanceByMoneyType'
export type ZimraDeviceOperatingMode = 'Online' | 'Offline'

// ZimraCompany is resolved here to avoid circular dep — also exported from constants/zimra-devices.ts
export type ZimraCompany = 'KINGSPORT' // | 'BRALYN' | 'SGA' — Phase 2

export interface ZimraAddress {
  province: string
  city: string
  street: string
  houseNo: string
}

export interface ZimraContacts {
  phoneNo?: string
  email?: string
}

export interface ZimraSignatureData {
  hash: string
  signature: string
}

export interface ZimraBuyer {
  buyerRegisterName: string
  buyerTradeName?: string
  buyerTIN: string
  VATNumber?: string
  buyerContacts?: ZimraContacts
  buyerAddress?: ZimraAddress
}

export interface ZimraCreditDebitNote {
  receiptID?: number
  deviceID?: number
  receiptGlobalNo?: number
  fiscalDayNo?: number
}

export interface ZimraReceiptLine {
  receiptLineType: ZimraReceiptLineType
  receiptLineNo: number
  receiptLineHSCode?: string
  receiptLineName: string
  receiptLinePrice?: number
  receiptLineQuantity: number
  receiptLineTotal: number
  taxCode?: string
  taxPercent?: number
  taxID: number
}

export interface ZimraReceiptTax {
  taxCode?: string
  taxPercent?: number
  taxID: number
  taxAmount: number
  salesAmountWithTax: number
}

export interface ZimraPayment {
  moneyTypeCode: ZimraMoneyType
  paymentAmount: number
}

export interface ZimraReceipt {
  receiptType: ZimraReceiptType
  receiptCurrency: string
  receiptCounter: number
  receiptGlobalNo: number
  invoiceNo: string
  buyerData?: ZimraBuyer
  receiptNotes?: string
  receiptDate: string
  creditDebitNote?: ZimraCreditDebitNote
  receiptLinesTaxInclusive: boolean
  receiptLines: ZimraReceiptLine[]
  receiptTaxes: ZimraReceiptTax[]
  receiptPayments: ZimraPayment[]
  receiptTotal: number
  receiptPrintForm?: ZimraReceiptPrintForm
  receiptDeviceSignature: ZimraSignatureData
  username?: string
  userNameSurname?: string
}

export interface ZimraFiscalDayCounter {
  fiscalCounterType: ZimraFiscalCounterType
  fiscalCounterCurrency: string
  fiscalCounterTaxID?: number
  fiscalCounterTaxPercent?: number
  fiscalCounterMoneyType?: ZimraMoneyType
  fiscalCounterValue: number
}

export interface ZimraSubmitReceiptResponse {
  operationID: string
  receiptID: number
  serverDate: string
  receiptServerSignature: ZimraSignatureData & { certificateThumbprint: string }
}

export interface ZimraTax {
  taxID: number
  taxPercent?: number
  taxName: string
  taxValidFrom: string
  taxValidTill?: string
}

export interface ZimraConfig {
  operationID: string
  taxPayerName: string
  taxPayerTIN: string
  vatNumber?: string
  deviceSerialNo: string
  deviceBranchName: string
  deviceBranchAddress: ZimraAddress
  deviceBranchContacts?: ZimraContacts
  deviceOperatingMode: ZimraDeviceOperatingMode
  taxPayerDayMaxHrs: number
  taxpayerDayEndNotificationHrs: number
  applicableTaxes: ZimraTax[]
  certificateValidTill: string
  qrUrl: string
}

export interface ZimraFiscalDayState {
  company: string
  deviceID: number
  fiscalDayNo: number
  fiscalDayStatus: ZimraFiscalDayStatus
  fiscalDayOpened?: string
  lastReceiptGlobalNo: number
  lastReceiptCounter: number
  lastReceiptHash: string | null
  counters: ZimraFiscalDayCounter[]
  applicableTaxes: ZimraTax[]
  qrUrl: string
  certificateValidTill?: string
}

// Internal invoice type mapped to ZimraReceipt before submission
export interface KingsportInvoiceForFiscalisation {
  invoiceNo: string
  company: ZimraCompany
  currency: 'USD' | 'ZWG'
  receiptType: ZimraReceiptType
  lineItems: {
    description: string
    hsCode?: string
    quantity: number
    unitPrice: number
    lineTotal: number
    taxID: number
    taxPercent?: number
    taxCode?: string
  }[]
  paymentMethod: ZimraMoneyType
  buyer?: {
    name: string
    tin?: string
    vatNumber?: string
    address?: string
  }
  creditDebitNote?: ZimraCreditDebitNote
  receiptNotes?: string
  issuedBy: string
  issuedByName: string
}

// Fields added to accounting Invoice records after fiscalisation
export interface InvoiceFiscalData {
  fiscalStatus: 'pending' | 'fiscalised' | 'fiscalisation_failed' | 'not_required'
  zimraReceiptID?: number
  zimraFiscalDayNo?: number
  zimraReceiptGlobalNo?: number
  zimraReceiptCounter?: number
  zimraVerificationCode?: string
  zimraQrCodeUrl?: string
  zimraSubmissionDate?: string
  zimraServerDate?: string
  zimraErrorCode?: string
  zimraErrorMessage?: string
}

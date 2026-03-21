// lib/zimra/fiscal-day.ts
// SERVER-SIDE ONLY — Manages full fiscal day lifecycle with in-memory state
// Future: wire to Supabase as write-through persistence when DB is live

import { zimraRequest, zimraGet } from '@/lib/zimra/client'
import { signFiscalDay } from '@/lib/zimra/crypto'
import { ZIMRA_DEVICES, type ZimraCompany } from '@/constants/zimra-devices'
import type {
  ZimraFiscalDayState,
  ZimraFiscalDayStatus,
  ZimraFiscalDayCounter,
  ZimraReceipt,
  ZimraTax,
  ZimraConfig,
} from '@/types/zimra'

// ─── In-memory state store ────────────────────────────────────────────────────
// One entry per company. Survives server restarts as-needed (re-init from ZIMRA on first use).
const fiscalDayStateStore = new Map<ZimraCompany, ZimraFiscalDayState>()

// ─── State accessors ──────────────────────────────────────────────────────────

export async function getFiscalDayState(company: ZimraCompany): Promise<ZimraFiscalDayState> {
  const state = fiscalDayStateStore.get(company)
  if (!state) {
    // Auto-initialise from ZIMRA on first access
    return await initFiscalDayState(company)
  }
  return state
}

export async function initFiscalDayState(company: ZimraCompany): Promise<ZimraFiscalDayState> {
  const device = ZIMRA_DEVICES[company]
  if (!device) throw new Error(`Unknown ZIMRA company: ${company}`)

  // Fetch current config + status from ZIMRA
  const [config, statusResp] = await Promise.all([
    zimraRequest<ZimraConfig>(
      `/api/Devices/${device.deviceID}/GetConfig`,
      { deviceID: device.deviceID },
      company
    ),
    zimraGet<{
      fiscalDayNo: number
      fiscalDayStatus: ZimraFiscalDayStatus
      lastReceiptGlobalNo: number
      lastReceiptCounter: number
    }>(
      `/api/Devices/${device.deviceID}/GetStatus`,
      company
    ),
  ])

  const state: ZimraFiscalDayState = {
    company,
    deviceID: device.deviceID,
    fiscalDayNo: statusResp.fiscalDayNo,
    fiscalDayStatus: statusResp.fiscalDayStatus,
    lastReceiptGlobalNo: statusResp.lastReceiptGlobalNo,
    lastReceiptCounter: statusResp.lastReceiptCounter,
    lastReceiptHash: null, // Not available from ZIMRA status — first receipt of day chains from null
    counters: [],
    applicableTaxes: config.applicableTaxes,
    qrUrl: config.qrUrl,
    certificateValidTill: config.certificateValidTill,
  }

  fiscalDayStateStore.set(company, state)
  return state
}

// ─── Fiscal day lifecycle ─────────────────────────────────────────────────────

/**
 * Ensures the fiscal day is open before any invoice submission.
 * Auto-opens if status is FiscalDayClosed (no user action needed).
 * Throws for terminal states that require manual intervention.
 */
export async function ensureFiscalDayOpen(company: ZimraCompany): Promise<void> {
  const state = await getFiscalDayState(company)

  switch (state.fiscalDayStatus) {
    case 'FiscalDayOpened':
      // Happy path — already open
      return
    case 'FiscalDayClosed':
      // Auto-open — first invoice of the business day
      await openFiscalDay(company)
      return
    case 'FiscalDayCloseInitiated':
      throw new Error('Fiscal day close is in progress. Please wait a moment and retry.')
    case 'FiscalDayCloseFailed':
      throw new Error('Previous fiscal day close failed. Contact your accountant before issuing invoices.')
    default:
      throw new Error(`Unexpected fiscal day status: ${(state as ZimraFiscalDayState).fiscalDayStatus}`)
  }
}

export async function openFiscalDay(company: ZimraCompany): Promise<void> {
  const device = ZIMRA_DEVICES[company]
  const state = await getFiscalDayState(company)

  await zimraRequest(
    `/api/Devices/${device.deviceID}/OpenFiscalDay`,
    { deviceID: device.deviceID },
    company
  )

  const updated: ZimraFiscalDayState = {
    ...state,
    fiscalDayStatus: 'FiscalDayOpened',
    fiscalDayNo: state.fiscalDayNo + 1,
    fiscalDayOpened: new Date().toISOString(),
    lastReceiptCounter: 0,
    lastReceiptHash: null,
    counters: [],
  }

  fiscalDayStateStore.set(company, updated)
}

export async function closeFiscalDay(company: ZimraCompany, closedBy: string): Promise<void> {
  const device = ZIMRA_DEVICES[company]
  const state = await getFiscalDayState(company)

  if (state.fiscalDayStatus !== 'FiscalDayOpened') {
    throw new Error(`Cannot close fiscal day — current status is ${state.fiscalDayStatus}`)
  }

  const privateKeyPem = (process.env[`ZIMRA_PRIVATE_KEY_PEM_${company}`] || '').replace(/\\n/g, '\n')
  if (!privateKeyPem) {
    throw new Error(`Private key not configured for ${company}`)
  }

  // Update status to CloseInitiated before calling ZIMRA
  fiscalDayStateStore.set(company, { ...state, fiscalDayStatus: 'FiscalDayCloseInitiated' })

  try {
    const fiscalDayDate = (state.fiscalDayOpened || new Date().toISOString()).substring(0, 10)
    const { hash, signature } = signFiscalDay(
      device.deviceID,
      state.fiscalDayNo,
      fiscalDayDate,
      state.counters,
      privateKeyPem
    )

    await zimraRequest(
      `/api/Devices/${device.deviceID}/CloseFiscalDay`,
      {
        deviceID: device.deviceID,
        receipt: {
          fiscalDayNo: state.fiscalDayNo,
          fiscalDayDate,
          fiscalDayCounters: state.counters,
          receiptCounter: state.lastReceiptCounter,
          fiscalDayDeviceSignature: { hash, signature },
          closedBy,
        },
      },
      company
    )

    fiscalDayStateStore.set(company, { ...state, fiscalDayStatus: 'FiscalDayClosed' })
  } catch (error) {
    fiscalDayStateStore.set(company, { ...state, fiscalDayStatus: 'FiscalDayCloseFailed' })
    throw error
  }
}

// ─── Counter management ───────────────────────────────────────────────────────

/**
 * Updates running fiscal counters after each successful receipt submission.
 * Tracks SaleByTax, SaleTaxByTax, and BalanceByMoneyType per ZIMRA spec section 6.
 */
export async function updateCountersAfterReceipt(
  company: ZimraCompany,
  receipt: ZimraReceipt
): Promise<void> {
  const state = fiscalDayStateStore.get(company)
  if (!state) return

  const counters = [...state.counters]
  const currency = receipt.receiptCurrency

  // SaleByTax + SaleTaxByTax
  for (const tax of receipt.receiptTaxes) {
    upsertCounter(counters, {
      fiscalCounterType: 'SaleByTax',
      fiscalCounterCurrency: currency,
      fiscalCounterTaxID: tax.taxID,
      fiscalCounterTaxPercent: tax.taxPercent,
      fiscalCounterValue: tax.salesAmountWithTax,
    })
    upsertCounter(counters, {
      fiscalCounterType: 'SaleTaxByTax',
      fiscalCounterCurrency: currency,
      fiscalCounterTaxID: tax.taxID,
      fiscalCounterTaxPercent: tax.taxPercent,
      fiscalCounterValue: tax.taxAmount,
    })
  }

  // BalanceByMoneyType
  for (const payment of receipt.receiptPayments) {
    upsertCounter(counters, {
      fiscalCounterType: 'BalanceByMoneyType',
      fiscalCounterCurrency: currency,
      fiscalCounterMoneyType: payment.moneyTypeCode,
      fiscalCounterValue: payment.paymentAmount,
    })
  }

  fiscalDayStateStore.set(company, { ...state, counters })
}

function upsertCounter(
  counters: ZimraFiscalDayCounter[],
  update: ZimraFiscalDayCounter
): void {
  const idx = counters.findIndex(c =>
    c.fiscalCounterType === update.fiscalCounterType &&
    c.fiscalCounterCurrency === update.fiscalCounterCurrency &&
    c.fiscalCounterTaxID === update.fiscalCounterTaxID &&
    c.fiscalCounterMoneyType === update.fiscalCounterMoneyType
  )
  if (idx >= 0) {
    counters[idx] = { ...counters[idx], fiscalCounterValue: counters[idx].fiscalCounterValue + update.fiscalCounterValue }
  } else {
    counters.push({ ...update })
  }
}

export async function incrementReceiptCounters(
  company: ZimraCompany,
  receiptGlobalNo: number,
  receiptHash: string
): Promise<void> {
  const state = fiscalDayStateStore.get(company)
  if (!state) return
  fiscalDayStateStore.set(company, {
    ...state,
    lastReceiptGlobalNo: receiptGlobalNo,
    lastReceiptCounter: state.lastReceiptCounter + 1,
    lastReceiptHash: receiptHash,
  })
}

/** Returns a read-only snapshot of the current state without triggering init */
export function getFiscalDayStateSync(company: ZimraCompany): ZimraFiscalDayState | null {
  return fiscalDayStateStore.get(company) ?? null
}

/** Force-updates state from ZIMRA — used by getConfig route on startup */
export function setFiscalDayState(company: ZimraCompany, state: ZimraFiscalDayState): void {
  fiscalDayStateStore.set(company, state)
}

/** Patches tax config without resetting counters — used by device/config route */
export function patchFiscalDayTaxConfig(
  company: ZimraCompany,
  applicableTaxes: ZimraTax[],
  qrUrl: string,
  certificateValidTill: string
): void {
  const state = fiscalDayStateStore.get(company)
  if (!state) return
  fiscalDayStateStore.set(company, { ...state, applicableTaxes, qrUrl, certificateValidTill })
}

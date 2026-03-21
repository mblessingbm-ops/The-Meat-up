// constants/zimra-devices.ts
// Store all device configuration here. Never hardcode credentials in components.

/**
 * ⚠️  ZIMRA TEST ENVIRONMENT ACTIVE
 * All submissions go to fdmsapitest.zimra.co.zw
 * Switch ZIMRA_API_BASE_URL to https://fdmsapi.zimra.co.zw for production.
 * Do NOT switch until full test environment validation is complete.
 * Swagger UI: https://fdmsapitest.zimra.co.zw/swagger/index.html
 */

export const ZIMRA_ENV = {
  BASE_URL: process.env.ZIMRA_API_BASE_URL || 'https://fdmsapitest.zimra.co.zw',
  DEVICE_MODEL_NAME: process.env.ZIMRA_DEVICE_MODEL_NAME || 'KingsportPlatform',
  DEVICE_MODEL_VERSION: process.env.ZIMRA_DEVICE_MODEL_VERSION || '1.0.0',
}

export const ZIMRA_DEVICES = {
  KINGSPORT: {
    company: 'Kingsport',
    deviceID: parseInt(process.env.ZIMRA_DEVICE_ID_KINGSPORT || '0'),
    activationKey: process.env.ZIMRA_ACTIVATION_KEY_KINGSPORT || '',
    taxPayerTIN: '2000130947',
    vatNumber: '220135644',
    branchName: 'Kingsport Investments Private Limited',
    branchAddress: {
      province: 'Harare',
      city: 'Harare',
      street: 'Grant Street',
      houseNo: '4',
    },
    branchContacts: {
      phoneNo: '0242781073',
      email: 'sales@kingsport.co.zw',
    },
  },

  // ─── PHASE 2 — NOT YET ACTIVE ──────────────────────────────────────────────
  // BRALYN: { ... } — add when Bralyn device is registered with ZIMRA
  //   company: 'Bralyn', taxPayerTIN: '2000410780', vatNumber: '22029420'
  // SGA: { ... }    — add when SGA device is registered with ZIMRA
  //   company: 'SGA', taxPayerTIN: '2000934222', vatNumber: '220300970'
  // ─────────────────────────────────────────────────────────────────────────────
}

export type ZimraCompany = keyof typeof ZIMRA_DEVICES
// Phase 1: ZimraCompany = 'KINGSPORT' only

/** Returns true if the device is configured (deviceID is non-zero) */
export function isZimraConfigured(company: ZimraCompany): boolean {
  return ZIMRA_DEVICES[company].deviceID > 0
}

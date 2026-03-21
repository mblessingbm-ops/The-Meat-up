// lib/zimra/config.ts
// Device credentials and environment config accessors

import { ZIMRA_ENV, ZIMRA_DEVICES, type ZimraCompany } from '@/constants/zimra-devices'

export { ZIMRA_ENV, ZIMRA_DEVICES }

/** Returns the private key PEM for a company (replaces escaped newlines) */
export function getPrivateKeyPem(company: ZimraCompany): string {
  const key = `ZIMRA_PRIVATE_KEY_PEM_${company}` as keyof NodeJS.ProcessEnv
  const pem = (process.env[key] || '').replace(/\\n/g, '\n')
  if (!pem) {
    throw new Error(`Private key not configured for ${company}. Set ZIMRA_PRIVATE_KEY_PEM_${company} in environment variables.`)
  }
  return pem
}

/** Returns the certificate PEM for a company */
export function getCertPem(company: ZimraCompany): string {
  const key = `ZIMRA_CERT_PEM_${company}` as keyof NodeJS.ProcessEnv
  const pem = (process.env[key] || '').replace(/\\n/g, '\n')
  if (!pem) {
    throw new Error(`Certificate not configured for ${company}. Set ZIMRA_CERT_PEM_${company} in environment variables.`)
  }
  return pem
}

/** Returns true only if ALL required credentials for a company are set */
export function isFullyConfigured(company: ZimraCompany): boolean {
  const device = ZIMRA_DEVICES[company]
  if (!device || device.deviceID === 0) return false
  const cert = (process.env[`ZIMRA_CERT_PEM_${company}` as keyof NodeJS.ProcessEnv] || '').trim()
  const key = (process.env[`ZIMRA_PRIVATE_KEY_PEM_${company}` as keyof NodeJS.ProcessEnv] || '').trim()
  return cert.length > 0 && key.length > 0
}

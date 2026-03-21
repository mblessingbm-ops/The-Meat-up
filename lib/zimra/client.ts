// lib/zimra/client.ts
// SERVER-SIDE ONLY — mTLS-authenticated HTTP client for ZIMRA FDMS API

/**
 * ⚠️  ZIMRA TEST ENVIRONMENT ACTIVE
 * Target: https://fdmsapitest.zimra.co.zw
 */

import https from 'https'
import { ZIMRA_ENV, ZIMRA_DEVICES, type ZimraCompany } from '@/constants/zimra-devices'

const REQUIRED_HEADERS = {
  'Content-Type': 'application/json',
  'DeviceModelName': ZIMRA_ENV.DEVICE_MODEL_NAME,
  'DeviceModelVersionNo': ZIMRA_ENV.DEVICE_MODEL_VERSION,
}

function getHttpsAgent(company: ZimraCompany): https.Agent {
  const certKey = `ZIMRA_CERT_PEM_${company}` as keyof NodeJS.ProcessEnv
  const privKey = `ZIMRA_PRIVATE_KEY_PEM_${company}` as keyof NodeJS.ProcessEnv

  const cert = (process.env[certKey] || '').replace(/\\n/g, '\n')
  const key = (process.env[privKey] || '').replace(/\\n/g, '\n')

  if (!cert || !key) {
    throw new Error(
      `ZIMRA certificates not configured for ${company}. ` +
      `Set ZIMRA_CERT_PEM_${company} and ZIMRA_PRIVATE_KEY_PEM_${company} in environment variables.`
    )
  }

  return new https.Agent({ cert, key, rejectUnauthorized: true })
}

export async function zimraRequest<T>(
  endpoint: string,
  body: object,
  company: ZimraCompany,
  requiresAuth = true
): Promise<T> {
  const url = `${ZIMRA_ENV.BASE_URL}${endpoint}`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchOptions: any = {
    method: 'POST',
    headers: REQUIRED_HEADERS,
    body: JSON.stringify(body),
  }

  if (requiresAuth) {
    fetchOptions.agent = getHttpsAgent(company)
  }

  const response = await fetch(url, fetchOptions)

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new ZimraApiError(
      response.status,
      errorBody.errorCode || String(response.status),
      errorBody.title || `ZIMRA API error ${response.status}`
    )
  }

  return response.json() as Promise<T>
}

export async function zimraGet<T>(
  endpoint: string,
  company: ZimraCompany,
): Promise<T> {
  const url = `${ZIMRA_ENV.BASE_URL}${endpoint}`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchOptions: any = {
    method: 'GET',
    headers: REQUIRED_HEADERS,
    agent: getHttpsAgent(company),
  }

  const response = await fetch(url, fetchOptions)

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new ZimraApiError(
      response.status,
      errorBody.errorCode || String(response.status),
      errorBody.title || `ZIMRA API error ${response.status}`
    )
  }

  return response.json() as Promise<T>
}

export class ZimraApiError extends Error {
  constructor(
    public httpStatus: number,
    public errorCode: string,
    message: string
  ) {
    super(message)
    this.name = 'ZimraApiError'
  }
}

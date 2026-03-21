// lib/zimra/errors.ts
// Plain English error messages for all ZIMRA error codes

export const ZIMRA_ERROR_MESSAGES: Record<string, string> = {
  DEV01: "This device is not active in ZIMRA's system. Contact your accountant.",
  DEV02: 'The activation key is incorrect. Check your ZIMRA device credentials.',
  DEV03: 'The certificate request is invalid. Contact system support.',
  DEV04: 'This device model is not approved by ZIMRA. Contact support.',
  DEV05: "This taxpayer account is not active in ZIMRA's system.",
  DEV06: 'This device model and version are not registered in ZIMRA.',
  RCPT01: 'Fiscal day is closed. A new day will open automatically on the next invoice.',
  RCPT02: 'Invoice data is invalid. Check all required fields and try again.',
  RCPT010: 'Invalid currency code. Only USD and ZWG are supported.',
  RCPT011: 'Receipt counter sequence error. Contact your accountant immediately — this requires manual resolution.',
  RCPT012: 'Receipt global number sequence error. Contact your accountant immediately.',
  RCPT013: 'This invoice number already exists in ZIMRA. Use a unique invoice number.',
  RCPT015: 'Credit/debit note data is missing. Provide the original invoice reference.',
  RCPT016: 'No line items provided on this invoice.',
  RCPT017: 'Tax information is missing from this invoice.',
  RCPT018: 'Payment information is missing from this invoice.',
  RCPT019: 'Invoice total does not match line item totals. Check your calculations.',
  RCPT020: 'Invoice signature is invalid. This is a system error — contact support.',
  RCPT021: 'VAT tax used but this taxpayer is not VAT registered.',
  RCPT025: "Invalid tax rate. The VAT rate must match ZIMRA's current approved rates.",
  RCPT032: 'The original invoice referenced by this credit/debit note does not exist in ZIMRA.',
  RCPT033: 'The original invoice is older than 12 months and cannot be credited.',
  RCPT035: 'Credit note amount exceeds the original invoice amount.',
  FISC01: 'Cannot open fiscal day — a previous day may still be open.',
  FISC03: 'Fiscal day close is already in progress. Wait and retry.',
  FISC04: 'No fiscal day is currently open.',
  FILE01: 'File too large for ZIMRA. Maximum allowed size is 3MB.',
  '400': 'The request was malformed. Check all invoice fields.',
  '401': 'Authentication failed. Your ZIMRA certificate may be expired or invalid.',
  '422': 'ZIMRA rejected this request. See the error code for details.',
  '500': "ZIMRA's servers are temporarily unavailable. Retry in a few minutes.",
  '502': 'Cannot reach ZIMRA. Check your internet connection and retry.',
  UNKNOWN: 'An unexpected error occurred communicating with ZIMRA. Retry or contact support.',
}

export function getZimraErrorMessage(errorCode: string): string {
  return ZIMRA_ERROR_MESSAGES[errorCode] || ZIMRA_ERROR_MESSAGES.UNKNOWN
}

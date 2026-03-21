// lib/zimra/qr-generator.ts
// Thin wrapper — re-exports QR utilities from crypto.ts for use in PDF templates
// SERVER-SIDE ONLY

export { generateQrCodeData, formatVerificationCode } from '@/lib/zimra/crypto'

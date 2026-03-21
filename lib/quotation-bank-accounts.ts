// lib/quotation-bank-accounts.ts
// Bank account records for Kingsport Investments — used in the Quotation Builder
// and in the Quotation Settings bank accounts panel.
// To add Bralyn / SGA accounts in a future session: add records here with company field.

export type BankAccountCompany = 'Kingsport' | 'Bralyn' | 'SGA'

export interface BankAccount {
  id: string
  company: BankAccountCompany
  account_name: string
  bank: string
  branch: string
  account_number: string
  account_type?: string     // undefined = not yet provided
  swift_code?: string
  branch_code?: string      // undefined = not applicable / not yet provided
  sort_code?: string        // some ZW banks use sort codes instead of branch codes
  currency: 'USD' | 'ZWG'
  is_active: boolean
  /** Advisory flag — account is usable but has missing fields */
  is_incomplete?: boolean
  incomplete_note?: string
}

export const MOCK_BANK_ACCOUNTS: BankAccount[] = [
  // ── Kingsport ─────────────────────────────────────────────────────────────────

  {
    id: 'bk1',
    company: 'Kingsport',
    account_name: 'Kingsport Investments',
    bank: 'Stanbic Bank',
    branch: 'Southerton',
    account_number: '9140001219757',
    account_type: 'FCA Nostro',
    swift_code: 'SBICZWHX',
    branch_code: '3120',
    currency: 'USD',
    is_active: true,
    is_incomplete: false,
  },
  {
    id: 'bk2',
    company: 'Kingsport',
    account_name: 'Kingsport Investments',
    bank: 'CBZ Bank',
    branch: 'Kwame Nkrumah Avenue',
    account_number: '01124052670014',
    account_type: 'Corporate Account',
    swift_code: 'COBZZWHAXXX',
    sort_code: '6101',
    currency: 'USD',
    is_active: true,
    is_incomplete: false,
  },
  {
    id: 'bk3',
    company: 'Kingsport',
    account_name: 'Kingsport Investments',
    bank: 'First Capital Bank',
    branch: 'FCDA Centre / Birmingham',
    account_number: '21573058690',
    // account_type deliberately omitted — not provided
    swift_code: 'BARCZWHX',
    // branch_code deliberately omitted — not provided
    currency: 'USD',
    is_active: true,
    is_incomplete: true,
    incomplete_note: 'Branch code and account type not yet provided — please update to complete this record.',
  },
  {
    id: 'bk4',
    company: 'Kingsport',
    account_name: 'Kingsport Investments',
    bank: 'FBC Bank',
    branch: 'Centre',
    account_number: '2270000290265',
    // account_type deliberately omitted — not provided
    swift_code: 'FBCPZWHAXXX',
    branch_code: '8120',
    currency: 'USD',
    is_active: true,
    is_incomplete: true,
    incomplete_note: 'Account type not yet provided — please update to complete this record.',
  },
]

/** Returns label shown in the builder dropdown */
export function bankAccountLabel(acc: BankAccount): string {
  return `${acc.bank} — ${acc.account_type ?? acc.branch}`
}

/** Returns all active accounts for a given company */
export function getActiveBankAccounts(company: BankAccountCompany): BankAccount[] {
  return MOCK_BANK_ACCOUNTS.filter(a => a.company === company && a.is_active)
}

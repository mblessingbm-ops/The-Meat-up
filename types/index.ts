// ─── User & Auth ─────────────────────────────────────────────────────────────
// The Meat Up is a single-owner system. Role is always 'owner'.

export type UserRole = 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department: string
  team_id?: string
  avatar_url?: string
  is_active: boolean
  created_at: string
}

// ─── Audit ───────────────────────────────────────────────────────────────────

export type AuditAction =
  | 'CREATE' | 'UPDATE' | 'DELETE'
  | 'IMPORT' | 'EXPORT'
  | 'LOGIN' | 'LOGOUT'

// ─── Currency ─────────────────────────────────────────────────────────────────
// All amounts are stored in USD. ZWG is an optional display layer.
// Currency field on invoice/expense records which denomination was used at time of entry.
export type Currency = 'USD' | 'ZWG'

// ─── Products & Stock ─────────────────────────────────────────────────────────

export type ProductCategory = 'Beef' | 'Pork' | 'Chicken' | 'Lamb' | 'Processed' | 'Other'
export type UnitOfMeasure = 'kg' | 'g' | 'unit' | 'pack'

export interface Product {
  id: string
  name: string
  category: ProductCategory
  unit: UnitOfMeasure
  stock_qty: number
  reorder_level: number
  cost_price: number       // USD
  sell_price: number       // USD
  supplier_id?: string
  supplier_name?: string
  last_restocked?: string
  notes?: string
  created_at: string
  updated_at: string
}

export type StockMovementType = 'Purchase' | 'Sale' | 'Wastage' | 'Write-off' | 'Correction'

export interface StockMovement {
  id: string
  product_id: string
  product_name?: string
  movement_type: StockMovementType
  qty_change: number
  reason: string
  date: string
  notes?: string
  created_at: string
}

// ─── Suppliers ────────────────────────────────────────────────────────────────

export interface Supplier {
  id: string
  name: string
  contact_person: string
  phone: string
  email?: string
  categories: string[]
  payment_terms: string
  outstanding_balance: number   // USD — auto-calculated from unpaid expenses
  notes?: string
  created_at: string
}

// ─── Clients ─────────────────────────────────────────────────────────────────

export interface Client {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  notes?: string
  created_at: string
}

// ─── Invoices (Receivables) ───────────────────────────────────────────────────

export type InvoiceStatus = 'Draft' | 'Sent' | 'Partially Paid' | 'Paid' | 'Overdue'

export interface Invoice {
  id: string
  invoice_number: string    // e.g. TMU-0001
  client_id?: string
  client_name: string
  date_issued: string
  due_date: string
  currency: Currency        // 'USD' default; 'ZWG' only when zwg_enabled=true
  subtotal: number          // amount in the invoice's currency
  tax: number
  total: number
  amount_paid: number
  status: InvoiceStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  product_name: string
  qty: number
  unit: UnitOfMeasure
  unit_price: number        // in invoice currency
  line_total: number
}

export interface PaymentReceived {
  id: string
  invoice_id: string
  amount: number
  date: string
  notes?: string
  created_at: string
}

// ─── Expenses & Payables ─────────────────────────────────────────────────────

export type ExpenseCategory =
  | 'Rent'
  | 'Utilities'
  | 'Wages'
  | 'Stock Purchase'
  | 'Transport'
  | 'Packaging'
  | 'Other'

export type ExpenseStatus = 'Paid' | 'Unpaid'

export interface Expense {
  id: string
  date: string
  description: string
  category: ExpenseCategory
  amount: number            // in `currency` denomination
  currency: Currency        // 'USD' default; 'ZWG' only when zwg_enabled
  supplier_id?: string
  supplier_name?: string
  status: ExpenseStatus
  due_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface Settings {
  id: string
  business_name: string
  admin_name: string
  phone?: string
  email?: string
  address?: string
  invoice_prefix: string       // e.g. 'TMU'
  invoice_start_number: number // e.g. 1
  tax_rate: number             // percentage, e.g. 15
  logo_url?: string
  // ZWG toggle
  zwg_enabled: boolean         // default false — system operates USD-only
  usd_to_zwg_rate: number      // exchange rate, only used when zwg_enabled=true
}

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────

export interface DashboardKPIs {
  today_revenue: number             // USD
  stock_alerts: number              // items at or below reorder level
  outstanding_receivables: number   // USD — total unpaid invoices
  outstanding_payables: number      // USD — total unpaid expenses
  net_cash_position: number         // USD — receivables - payables
  mtd_income: number                // USD — month-to-date paid invoices
  mtd_expenses: number              // USD — month-to-date paid expenses
  mtd_net: number                   // USD
  monthly_trend: Array<{ month: string; revenue: number }>
}

// ─── P&L ─────────────────────────────────────────────────────────────────────

export interface PLSummary {
  period_start: string
  period_end: string
  income: number          // USD paid invoices
  cogs: number            // USD stock purchase expenses
  gross_profit: number
  opex: number            // USD other expenses
  net_profit: number
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export type SortOrder = 'asc' | 'desc'

export interface TableFilter {
  search?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: SortOrder
  [key: string]: string | number | boolean | undefined
}

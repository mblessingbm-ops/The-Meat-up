import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Invoice {
  id: string; invoice_number: string; amount: number; tax_amount?: number
  total_amount: number; status: string; issue_date: string; due_date: string
  paid_date?: string; payment_reference?: string; line_items?: unknown[]
  notes?: string
  customer: { id: string; name: string; email: string; payment_terms: string }
}

export interface Expense {
  id: string; description: string; amount: number; category: string
  expense_date: string; reference?: string; status: string
  receipt_url?: string; notes?: string
  submitted_by?: { id: string; name: string }
}

interface InvoiceFilters {
  status?: string; customer_id?: string; from?: string; to?: string; overdue?: boolean
}

interface ExpenseFilters {
  status?: string; category?: string; from?: string; to?: string
}

// ─── useInvoices ──────────────────────────────────────────────────────────────
export function useInvoices(filters: InvoiceFilters = {}) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (filters.status)      qs.set('status', filters.status)
      if (filters.customer_id) qs.set('customer_id', filters.customer_id)
      if (filters.from)        qs.set('from', filters.from)
      if (filters.to)          qs.set('to', filters.to)
      if (filters.overdue)     qs.set('overdue', 'true')

      const res = await window.fetch(`/api/accounting/invoices?${qs}`)
      const data = await res.json()
      setInvoices(data.invoices ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching invoices')
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => { fetch() }, [fetch])

  async function createInvoice(payload: Partial<Invoice> & { customer_id: string }) {
    const user = JSON.parse(localStorage.getItem('nexus_user') ?? '{}')
    const res  = await window.fetch('/api/accounting/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, _userId: user.id, _userName: user.name, _userRole: user.role }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); return null }
    toast.success(`Invoice ${data.invoice.invoice_number} created.`)
    fetch()
    return data.invoice
  }

  async function recordPayment(invoiceId: string, opts: { paid_date?: string; payment_reference?: string }) {
    const user = JSON.parse(localStorage.getItem('nexus_user') ?? '{}')
    const res  = await window.fetch('/api/accounting/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'pay', id: invoiceId, ...opts, _userId: user.id, _userName: user.name, _userRole: user.role }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); return null }
    toast.success('Payment recorded.')
    fetch()
    return data.invoice
  }

  return { invoices, loading, error, refresh: fetch, createInvoice, recordPayment }
}

// ─── useExpenses ──────────────────────────────────────────────────────────────
export function useExpenses(filters: ExpenseFilters = {}) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading]   = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (filters.status)   qs.set('status', filters.status)
      if (filters.category) qs.set('category', filters.category)
      if (filters.from)     qs.set('from', filters.from)
      if (filters.to)       qs.set('to', filters.to)
      const res  = await window.fetch(`/api/accounting/expenses?${qs}`)
      const data = await res.json()
      setExpenses(data.expenses ?? [])
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => { fetch() }, [fetch])

  async function submitExpense(payload: Partial<Expense>) {
    const user = JSON.parse(localStorage.getItem('nexus_user') ?? '{}')
    const res  = await window.fetch('/api/accounting/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, _userId: user.id, _userName: user.name, _userRole: user.role }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); return null }
    toast.success('Expense submitted.')
    fetch()
    return data.expense
  }

  async function approveExpense(id: string, decision: 'approved' | 'rejected') {
    const user = JSON.parse(localStorage.getItem('nexus_user') ?? '{}')
    const res  = await window.fetch('/api/accounting/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', id, decision, _userId: user.id, _userName: user.name, _userRole: user.role }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); return null }
    toast.success(`Expense ${decision}.`)
    fetch()
    return data.expense
  }

  return { expenses, loading, refresh: fetch, submitExpense, approveExpense }
}

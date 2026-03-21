// lib/accounting-search.ts — Smart search across all Accounting sections
// Created March 2026

import { useState, useEffect } from 'react'

export type SearchSection =
  | 'Customer Invoices'
  | 'Supplier Invoices'
  | 'Expenses'
  | 'Overhead Costs'
  | 'Payroll'
  | 'AR Aging'

export interface SearchResultItem {
  id: string
  primary: string      // main label: invoice number / run ID / employee
  secondary: string    // sub-label: client name / amount / status
  status?: string
  amount?: number
  currency?: 'USD' | 'ZWG'
}

export interface SearchResultGroup {
  section: SearchSection
  items: SearchResultItem[]
}

export type Company = 'Kingsport' | 'Bralyn' | 'SGA'

interface SearchData {
  invoices: Array<{
    id: string; invoice_number: string; customer_name: string
    total_amount: number; currency: 'USD' | 'ZWG'; status: string
    rep_name: string; product: string
  }>
  supplierInvoices: Array<{
    id: string; nexus_ref: string; supplier_name: string
    supplier_invoice_number: string; category: string
    total_amount: number; currency: 'USD' | 'ZWG'; status: string
  }>
  expenses: Array<{
    id: string; description: string; amount: number
    category: string; submitted_by: string; status: string
  }>
  payrollRuns?: Array<{
    id: string; period: string; status: string; totalNetPay?: number
  }>
}

function fuzzy(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase())
}

function searchData(
  query: string,
  data: SearchData,
): SearchResultGroup[] {
  if (!query || query.trim().length < 2) return []
  const q = query.trim()
  const results: SearchResultGroup[] = []

  // Customer Invoices
  const invHits = data.invoices.filter(inv =>
    fuzzy(inv.invoice_number, q) ||
    fuzzy(inv.customer_name, q) ||
    fuzzy(inv.rep_name, q) ||
    fuzzy(inv.product, q) ||
    fuzzy(String(inv.total_amount), q)
  )
  if (invHits.length > 0) {
    results.push({
      section: 'Customer Invoices',
      items: invHits.slice(0, 5).map(inv => ({
        id: inv.id,
        primary: inv.invoice_number,
        secondary: `${inv.customer_name} · ${inv.currency} ${inv.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        status: inv.status,
        amount: inv.total_amount,
        currency: inv.currency,
      })),
    })
  }

  // Supplier Invoices
  const sinvHits = data.supplierInvoices.filter(inv =>
    fuzzy(inv.nexus_ref, q) ||
    fuzzy(inv.supplier_name, q) ||
    fuzzy(inv.supplier_invoice_number, q) ||
    fuzzy(inv.category, q)
  )
  if (sinvHits.length > 0) {
    results.push({
      section: 'Supplier Invoices',
      items: sinvHits.slice(0, 4).map(inv => ({
        id: inv.id,
        primary: inv.nexus_ref,
        secondary: `${inv.supplier_name} · ${inv.currency} ${inv.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        status: inv.status,
        amount: inv.total_amount,
        currency: inv.currency,
      })),
    })
  }

  // Expenses
  const expHits = data.expenses.filter(exp =>
    fuzzy(exp.description, q) ||
    fuzzy(exp.submitted_by, q) ||
    fuzzy(exp.category, q)
  )
  if (expHits.length > 0) {
    results.push({
      section: 'Expenses',
      items: expHits.slice(0, 4).map(exp => ({
        id: exp.id,
        primary: exp.description,
        secondary: `${exp.submitted_by} · $${exp.amount.toLocaleString()}`,
        status: exp.status,
        amount: exp.amount,
      })),
    })
  }

  // Payroll runs
  if (data.payrollRuns) {
    const prHits = data.payrollRuns.filter(r =>
      fuzzy(r.id, q) || fuzzy(r.period, q)
    )
    if (prHits.length > 0) {
      results.push({
        section: 'Payroll',
        items: prHits.slice(0, 3).map(r => ({
          id: r.id,
          primary: r.id,
          secondary: r.period,
          status: r.status,
          amount: r.totalNetPay,
        })),
      })
    }
  }

  return results
}

export function useAccountingSearch(data: SearchData) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [results, setResults] = useState<SearchResultGroup[]>([])

  // Debounce 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([])
      return
    }
    setResults(searchData(debouncedQuery, data))
  }, [debouncedQuery, data])

  return { query, setQuery, results, hasResults: results.length > 0, hasQuery: query.trim().length >= 2 }
}

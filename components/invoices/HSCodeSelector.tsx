'use client'
// components/invoices/HSCodeSelector.tsx
// HS code picker for invoice line items — searchable dropdown

import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { KINGSPORT_HS_CODES, type HSCode } from '@/constants/hs-codes'
import { cn } from '@/lib/utils'

interface HSCodeSelectorProps {
  value?: string
  onChange: (code: HSCode) => void
  required?: boolean
  placeholder?: string
  className?: string
}

export function HSCodeSelector({ value, onChange, required, placeholder, className }: HSCodeSelectorProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = KINGSPORT_HS_CODES.find(hs => hs.code === value)

  const filtered = query.length > 0
    ? KINGSPORT_HS_CODES.filter(hs =>
        hs.code.includes(query) ||
        hs.description.toLowerCase().includes(query.toLowerCase()) ||
        hs.category.toLowerCase().includes(query.toLowerCase())
      )
    : KINGSPORT_HS_CODES

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Focus search when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center justify-between gap-2',
          'px-2.5 py-1.5 text-left',
          'bg-[var(--bg-surface)]',
          'border border-[var(--border-default)] rounded-[var(--radius-sm)]',
          'text-xs transition-colors hover:border-[var(--border-strong)]',
          open && 'border-[var(--accent)] ring-1 ring-[var(--accent)]/20',
          !selected && required && 'border-amber-300 bg-amber-50'
        )}
        style={{ fontFamily: 'var(--font-primary)' }}
      >
        {selected ? (
          <span className="flex items-center gap-1.5 min-w-0">
            <span className="font-mono text-[11px] text-[var(--text-secondary)] flex-shrink-0">{selected.code}</span>
            <span className="text-[var(--text-primary)] truncate text-[11px]">{selected.category}</span>
          </span>
        ) : (
          <span className="text-[var(--text-tertiary)] text-[11px]">
            {placeholder ?? (required ? 'HS code (required)' : 'HS code')}
          </span>
        )}
        <ChevronDown className="w-3 h-3 text-[var(--text-tertiary)] flex-shrink-0" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="
          absolute top-full left-0 right-0 mt-1 z-[60]
          bg-[var(--bg-surface)]
          border border-[var(--border-default)]
          rounded-[var(--radius-md)]
          shadow-[var(--shadow-lg)]
          overflow-hidden
          min-w-[260px]
        ">
          {/* Search */}
          <div className="p-2 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-[var(--bg-subtle)] rounded-[var(--radius-sm)]">
              <Search className="w-3.5 h-3.5 text-[var(--text-tertiary)] flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by code, description or category…"
                className="flex-1 text-xs bg-transparent outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                style={{ fontFamily: 'var(--font-primary)' }}
              />
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[220px] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-xs text-center text-[var(--text-tertiary)]">No matching HS codes</p>
            ) : (
              filtered.map(hs => (
                <button
                  key={hs.code}
                  type="button"
                  onClick={() => { onChange(hs); setOpen(false); setQuery('') }}
                  className="
                    w-full flex items-start gap-2.5 px-3 py-2 text-left
                    hover:bg-[var(--bg-subtle)]
                    border-b border-[var(--border-subtle)] last:border-0
                    transition-colors duration-100
                  "
                >
                  <span className="font-mono text-[11px] text-[var(--text-secondary)] flex-shrink-0 mt-0.5 bg-[var(--bg-subtle)] px-1 rounded">
                    {hs.code}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--text-primary)] leading-tight">{hs.description}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{hs.category}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

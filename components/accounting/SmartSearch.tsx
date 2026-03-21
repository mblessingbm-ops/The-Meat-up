'use client'
// SmartSearch.tsx — Search bar with grouped results dropdown for Accounting module
import { useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { SearchResultGroup, SearchSection } from '@/lib/accounting-search'
import AStatusBadge from './ui/AStatusBadge'

interface SmartSearchProps {
  query: string
  onChange: (q: string) => void
  results: SearchResultGroup[]
  hasQuery: boolean
  onNavigate: (section: SearchSection, itemId: string) => void
  collapsed?: boolean
}

export default function SmartSearch({ query, onChange, results, hasQuery, onNavigate, collapsed }: SmartSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  // Click outside closes
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        onChange('')
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [onChange])

  if (collapsed) {
    return (
      <button
        className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors mx-auto"
        title="Search (expand sidebar)"
      >
        <Search className="w-4 h-4" />
      </button>
    )
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search invoices, payroll…"
          className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400 text-slate-700"
          value={query}
          onChange={e => onChange(e.target.value)}
        />
        {query && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            onClick={() => onChange('')}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {hasQuery && (
          <motion.div
            ref={dropRef}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto"
          >
            {results.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-slate-400">
                No results for &ldquo;{query}&rdquo;<br />
                <span className="text-slate-300">Try an invoice number, client, or employee name</span>
              </div>
            ) : (
              <div className="py-2">
                {results.map(group => (
                  <div key={group.section}>
                    <div className="px-3 py-1.5">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{group.section}</p>
                    </div>
                    {group.items.map(item => (
                      <button
                        key={item.id}
                        className="w-full px-3 py-2 hover:bg-slate-50 text-left flex items-center justify-between gap-2 transition-colors"
                        onClick={() => { onNavigate(group.section, item.id); onChange('') }}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{item.primary}</p>
                          <p className="text-xs text-slate-400 truncate">{item.secondary}</p>
                        </div>
                        {item.status && <AStatusBadge status={item.status} className="flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

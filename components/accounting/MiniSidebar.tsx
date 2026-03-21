'use client'
// MiniSidebar.tsx — Accounting module left navigation panel (240px desktop, 64px tablet, drawer mobile)
// Created March 2026

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calculator, FileText, Clock, FileInput, Receipt, Flame, Users,
  TrendingUp, Banknote, Settings, Download, ChevronRight, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import SmartSearch from './SmartSearch'
import type { SearchResultGroup, SearchSection } from '@/lib/accounting-search'

export type Company = 'Kingsport' | 'Bralyn' | 'SGA'

export type AccountingSection =
  | 'customer-invoices'
  | 'supplier-invoices'
  | 'expenses'
  | 'overhead-costs'
  | 'ar-aging'
  | 'pl'
  | 'payroll'
  | 'currency'

interface NavCounts {
  overdueInvoices: number
  overdueAR: number
  unpaidSupplier: number
  pendingExpenses: number
  draftOverheads: number
  payrollPending: number
}

interface MiniSidebarProps {
  activeSection: AccountingSection
  onSectionChange: (s: AccountingSection) => void
  activeCompany: Company
  onCompanyChange: (c: Company) => void
  counts: NavCounts
  canSeeCurrency: boolean
  canSeePayroll: boolean
  userName: string
  userRole: string
  // Smart search
  searchQuery: string
  onSearchChange: (q: string) => void
  searchResults: SearchResultGroup[]
  hasSearchQuery: boolean
  onSearchNavigate: (section: SearchSection, itemId: string) => void
  // Mobile
  mobileOpen: boolean
  onMobileClose: () => void
}

const COMPANY_PILL: Record<Company, string> = {
  Kingsport: 'bg-indigo-600 text-white border-indigo-600',
  Bralyn:    'bg-emerald-600 text-white border-emerald-600',
  SGA:       'bg-orange-500 text-white border-orange-500',
}
const COMPANY_INACTIVE = 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'

const SGA_ACCENT = 'border-r-4 border-orange-400'

interface NavItemDef {
  id: AccountingSection
  icon: React.ReactNode
  label: string
  badge?: number
  badgeVariant?: 'red' | 'amber' | 'blue' | 'slate'
  visible?: boolean
}

function NavItem({ item, active, collapsed, onClick }: {
  item: NavItemDef; active: boolean; collapsed: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative',
        active
          ? 'bg-indigo-50 text-indigo-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        collapsed && 'justify-center px-0'
      )}
    >
      <span className={cn('flex-shrink-0 w-4 h-4', active ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-700')}>
        {item.icon}
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 text-left truncate">{item.label}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
              item.badgeVariant === 'red' ? 'bg-red-100 text-red-700' :
              item.badgeVariant === 'amber' ? 'bg-amber-100 text-amber-700' :
              'bg-slate-100 text-slate-600'
            )}>
              {item.badge}
            </span>
          )}
        </>
      )}
      {collapsed && item.badge !== undefined && item.badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
          {item.badge > 9 ? '9+' : item.badge}
        </span>
      )}
      {collapsed && (
        <div className="hidden group-hover:flex absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap pointer-events-none z-50">
          {item.label}
          {item.badge !== undefined && item.badge > 0 && ` (${item.badge})`}
        </div>
      )}
    </button>
  )
}

function SidebarContent({
  activeSection, onSectionChange, activeCompany, onCompanyChange,
  counts, canSeeCurrency, canSeePayroll, userName, userRole,
  searchQuery, onSearchChange, searchResults, hasSearchQuery, onSearchNavigate,
  collapsed, onMobileClose,
}: MiniSidebarProps & { collapsed: boolean }) {
  const moneyIn: NavItemDef[] = [
    { id: 'customer-invoices', icon: <FileText className="w-4 h-4" />, label: 'Customer Invoices', badge: counts.overdueInvoices, badgeVariant: 'red' },
    { id: 'ar-aging',          icon: <Clock className="w-4 h-4" />,    label: 'AR Aging',          badge: counts.overdueAR, badgeVariant: 'red' },
  ]
  const moneyOut: NavItemDef[] = [
    { id: 'supplier-invoices', icon: <FileInput className="w-4 h-4" />, label: 'Supplier Invoices', badge: counts.unpaidSupplier, badgeVariant: 'blue' },
    { id: 'expenses',          icon: <Receipt className="w-4 h-4" />,   label: 'Expenses',          badge: counts.pendingExpenses, badgeVariant: 'amber' },
    { id: 'overhead-costs',    icon: <Flame className="w-4 h-4" />,     label: 'Overhead Costs',    badge: counts.draftOverheads, badgeVariant: 'slate' },
    ...(canSeePayroll ? [{ id: 'payroll' as const, icon: <Users className="w-4 h-4" />, label: 'Payroll', badge: counts.payrollPending, badgeVariant: 'amber' as const }] : []),
  ]
  const reports: NavItemDef[] = [
    { id: 'pl',       icon: <TrendingUp className="w-4 h-4" />, label: 'P&L Overview' },
    ...(canSeeCurrency ? [{ id: 'currency' as const, icon: <Banknote className="w-4 h-4" />, label: 'Currency Position' }] : []),
  ]

  const groups = [
    { label: 'MONEY IN',  items: moneyIn },
    { label: 'MONEY OUT', items: moneyOut },
    { label: 'REPORTS',   items: reports },
  ]

  return (
    <div className={cn(
      'flex flex-col h-full bg-slate-50 border-r border-slate-200 transition-all duration-200',
      activeCompany === 'SGA' && !collapsed ? SGA_ACCENT : '',
    )}>
      {/* Module identity */}
      <div className={cn('px-4 pt-5 pb-3 border-b border-slate-200 flex items-center gap-2', collapsed && 'justify-center px-2')}>
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <Calculator className="w-4 h-4 text-white" />
        </div>
        {!collapsed && <span className="font-bold text-slate-900 text-base">Accounting</span>}
        {onMobileClose && !collapsed && (
          <button className="ml-auto text-slate-400 hover:text-slate-600 lg:hidden" onClick={onMobileClose}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Company switcher */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-2 border-b border-slate-200">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Entity</p>
          <div className="flex flex-col gap-1">
            {(['Kingsport', 'Bralyn', 'SGA'] as Company[]).map(c => (
              <button
                key={c}
                onClick={() => onCompanyChange(c)}
                className={cn(
                  'w-full text-left px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                  activeCompany === c ? COMPANY_PILL[c] : COMPANY_INACTIVE
                )}
              >
                {c}
              </button>
            ))}
          </div>
          {activeCompany === 'SGA' && (
            <p className="text-[10px] text-orange-500 mt-1.5 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" /> Viewing SGA entity data
            </p>
          )}
        </div>
      )}

      {/* Smart search */}
      <div className={cn('px-3 py-3 border-b border-slate-200', collapsed && 'px-2')}>
        <SmartSearch
          query={searchQuery}
          onChange={onSearchChange}
          results={searchResults}
          hasQuery={hasSearchQuery}
          onNavigate={onSearchNavigate}
          collapsed={collapsed}
        />
      </div>

      {/* Navigation groups */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {groups.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">{group.label}</p>
            )}
            {collapsed && <div className="w-6 h-px bg-slate-200 mx-auto mb-2" />}
            <div className="space-y-0.5">
              {group.items.map(item => (
                <NavItem
                  key={item.id}
                  item={item}
                  active={activeSection === item.id}
                  collapsed={collapsed}
                  onClick={() => { onSectionChange(item.id); if (onMobileClose) onMobileClose() }}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom utilities */}
      <div className="border-t border-slate-200 px-2 py-3 space-y-1">
        {!collapsed ? (
          <>
            <button
              onClick={() => onSectionChange('payroll' as AccountingSection)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Settings className="w-3.5 h-3.5" /> Payroll Settings
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <Download className="w-3.5 h-3.5" /> Export Current View
            </button>
            <div className="px-3 pt-2 pb-1">
              <p className="text-xs font-medium text-slate-700 truncate">{userName}</p>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 rounded px-1.5 py-0.5 capitalize">{userRole.replace('_', ' ')}</span>
            </div>
          </>
        ) : (
          <>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 mx-auto transition-colors" title="Payroll Settings">
              <Settings className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 mx-auto transition-colors" title="Export">
              <Download className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function MiniSidebar(props: MiniSidebarProps) {
  // Collapse on tablet (managed by parent via CSS — sidebar always renders, CSS controls width)
  const { mobileOpen, onMobileClose } = props
  return (
    <>
      {/* Desktop/tablet sidebar */}
      <div className="hidden md:flex flex-col h-full">
        {/* Wide (240px) on desktop */}
        <div className="hidden lg:flex flex-col h-full w-60">
          <SidebarContent {...props} collapsed={false} />
        </div>
        {/* Collapsed rail (64px) on tablet */}
        <div className="flex lg:hidden flex-col h-full w-16">
          <SidebarContent {...props} collapsed={true} />
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={onMobileClose}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 z-50 flex flex-col md:hidden"
            >
              <SidebarContent {...props} collapsed={false} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

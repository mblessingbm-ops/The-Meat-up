'use client'
// ASectionHeader — Section title bar with company badge and primary action
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

type Company = 'Kingsport' | 'Bralyn' | 'SGA'

const COMPANY_BADGE: Record<Company, string> = {
  Kingsport: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Bralyn:    'bg-emerald-100 text-emerald-700 border-emerald-200',
  SGA:       'bg-orange-100 text-orange-700 border-orange-200',
}

interface ASectionHeaderProps {
  title: string
  subtitle?: string
  company: Company
  action?: ReactNode
  className?: string
}

export default function ASectionHeader({ title, subtitle, company, action, className }: ASectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-slate-100', className)}>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 leading-tight">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
        <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border', COMPANY_BADGE[company])}>
          {company}
        </span>
        {action}
      </div>
    </div>
  )
}

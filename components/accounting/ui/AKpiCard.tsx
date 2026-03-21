'use client'
// AKpiCard — Standardised Accounting KPI card with coloured left border accent
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

type AKpiVariant = 'healthy' | 'warning' | 'critical' | 'neutral' | 'info'

const BORDER: Record<AKpiVariant, string> = {
  healthy: 'border-l-emerald-500',
  warning: 'border-l-amber-500',
  critical: 'border-l-red-500',
  neutral:  'border-l-indigo-400',
  info:     'border-l-blue-400',
}

const ICON_BG: Record<AKpiVariant, string> = {
  healthy: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  critical: 'bg-red-50 text-red-600',
  neutral:  'bg-indigo-50 text-indigo-600',
  info:     'bg-blue-50 text-blue-600',
}

const VALUE_COLOR: Record<AKpiVariant, string> = {
  healthy: 'text-emerald-700',
  warning: 'text-amber-700',
  critical: 'text-red-700',
  neutral:  'text-slate-900',
  info:     'text-blue-700',
}

interface AKpiCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: ReactNode
  variant?: AKpiVariant
  className?: string
}

export default function AKpiCard({ label, value, sub, icon, variant = 'neutral', className }: AKpiCardProps) {
  return (
    <div className={cn(
      'bg-white rounded-xl border border-slate-200 border-l-4 shadow-sm p-4 flex items-start gap-3 min-w-0',
      BORDER[variant],
      className
    )}>
      {icon && (
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm', ICON_BG[variant])}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider leading-none mb-1">{label}</p>
        <p className={cn('text-xl font-bold font-mono leading-tight truncate', VALUE_COLOR[variant])}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  )
}

/**
 * components/shared/StatusBadge.tsx
 * Unified status badge with optional leading dot indicator.
 * All status labels across the platform must use this component.
 */

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent'

interface StatusBadgeProps {
  label: string
  variant?: Variant
  dot?: boolean
  className?: string
}

const variantClass: Record<Variant, string> = {
  success: 'badge badge-success',
  warning: 'badge badge-warning',
  danger:  'badge badge-danger',
  info:    'badge badge-info',
  neutral: 'badge badge-neutral',
  accent:  'badge badge-accent',
}

export default function StatusBadge({
  label,
  variant = 'neutral',
  dot = true,
  className = '',
}: StatusBadgeProps) {
  return (
    <span className={`${variantClass[variant]} ${className}`}>
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: 'currentColor' }}
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  )
}

/**
 * Map common status strings to badge variants automatically.
 */
export function statusVariant(status: string): Variant {
  const s = status.toLowerCase()
  if (['active', 'paid', 'completed', 'in stock', 'received', 'accepted', 'on track'].some(v => s.includes(v)))
    return 'success'
  if (['pending', 'draft', 'in transit', 'sent', 'sourcing', 'fabric sourcing'].some(v => s.includes(v)))
    return 'info'
  if (['overdue', 'expired', 'cancelled', 'failed', 'at risk', 'critical', 'out of stock'].some(v => s.includes(v)))
    return 'danger'
  if (['low stock', 'warning', 'behind', 'expiring', 'on hold', 'urgent'].some(v => s.includes(v)))
    return 'warning'
  if (['converted', 'processed'].some(v => s.includes(v)))
    return 'accent'
  return 'neutral'
}

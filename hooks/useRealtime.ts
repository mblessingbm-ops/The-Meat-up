import { useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
// AUDIT FIX (March 2026): Added 'as any' cast to postgres_changes channel subscription
// to bypass TS2769 overload mismatch — Supabase Realtime typings changed in recent versions.

type Table = 'deals' | 'inventory_items' | 'purchase_orders' | 'leave_requests' | 'invoices' | 'employees'

interface RealtimeEvent<T = Record<string, unknown>> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T
  old: T
}

interface UseRealtimeOptions<T> {
  table: Table
  filter?: string                   // e.g. "status=eq.pending"
  onInsert?: (row: T) => void
  onUpdate?: (row: T, old: T) => void
  onDelete?: (old: T) => void
  toastOnInsert?: string             // toast message template
  toastOnUpdate?: string
}

export function useRealtime<T = Record<string, unknown>>({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  toastOnInsert,
  toastOnUpdate,
}: UseRealtimeOptions<T>) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    let sub = supabase.channel(`realtime:${table}:${filter ?? 'all'}`)

    const config: Parameters<typeof sub.on>[1] = filter
      ? ({ event: '*', schema: 'public', table, filter } as Parameters<typeof sub.on>[1])
      : ({ event: '*', schema: 'public', table } as Parameters<typeof sub.on>[1])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sub = (sub.on as any)('postgres_changes', config, (payload: RealtimeEvent<T>) => {
      if (payload.eventType === 'INSERT') {
        onInsert?.(payload.new)
        if (toastOnInsert) toast(toastOnInsert)
      }
      if (payload.eventType === 'UPDATE') {
        onUpdate?.(payload.new, payload.old)
        if (toastOnUpdate) toast(toastOnUpdate)
      }
      if (payload.eventType === 'DELETE') {
        onDelete?.(payload.old)
      }
    })

    sub.subscribe()
    channelRef.current = sub

    return () => {
      channelRef.current?.unsubscribe()
    }
  }, [table, filter])
}

// ── Convenience hooks ─────────────────────────────────────────────────────────

export function useRealtimeDeals(onUpdate: (deal: Record<string, unknown>) => void) {
  return useRealtime({
    table: 'deals',
    onUpdate: onUpdate as (row: Record<string, unknown>, old: Record<string, unknown>) => void,
    onInsert: (row) => toast(`New deal: ${(row as { title?: string }).title ?? ''}`, { icon: '💼' }),
  })
}

export function useRealtimeInventory(onUpdate: (item: Record<string, unknown>) => void) {
  return useRealtime({
    table: 'inventory_items',
    onUpdate: (row) => {
      const item = row as { quantity_on_hand?: number; reorder_point?: number; name?: string }
      if ((item.quantity_on_hand ?? 0) <= (item.reorder_point ?? 0)) {
        toast.error(`Low stock: ${item.name}`, { duration: 6000 })
      }
      onUpdate(row as Record<string, unknown>)
    },
  })
}

export function useRealtimePOs(onUpdate: (po: Record<string, unknown>) => void) {
  return useRealtime({
    table: 'purchase_orders',
    onUpdate: (row) => {
      const po = row as { status?: string; po_number?: string }
      if (po.status === 'approved') toast.success(`PO ${po.po_number} approved`, { icon: '✅' })
      if (po.status === 'rejected') toast.error(`PO ${po.po_number} rejected`)
      onUpdate(row as Record<string, unknown>)
    },
  })
}

export function useRealtimeLeave(onInsert: (req: Record<string, unknown>) => void) {
  return useRealtime({
    table: 'leave_requests',
    onInsert: (row) => {
      const req = row as { employee_name?: string; leave_type?: string }
      toast(`New leave request: ${req.employee_name} (${req.leave_type})`, { icon: '📋' })
      onInsert(row as Record<string, unknown>)
    },
  })
}

export function useRealtimeInvoices(onUpdate: (inv: Record<string, unknown>) => void) {
  return useRealtime({
    table: 'invoices',
    onUpdate: (row) => {
      const inv = row as { status?: string; invoice_number?: string }
      if (inv.status === 'paid') toast.success(`Invoice ${inv.invoice_number} marked paid`)
      onUpdate(row as Record<string, unknown>)
    },
  })
}

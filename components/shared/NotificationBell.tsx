'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, X, CheckCheck, AlertTriangle, ShoppingCart, Clock, TrendingUp, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatRelative, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Notification {
  id: string
  type: 'low_stock' | 'po_approval' | 'leave_request' | 'contract_expiry' | 'invoice_overdue' | 'deal_won' | 'system'
  title: string
  message: string
  is_read: boolean
  created_at: string
  action_url?: string
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'po_approval',     title: 'PO Awaiting Approval',    message: 'PO-2026-0012 from Zisco Steel (USD 96,000) needs your approval.', is_read: false, created_at: new Date(Date.now() - 1800000).toISOString(),   action_url: '/dashboard/supply-chain' },
  { id: 'n2', type: 'low_stock',       title: 'Low Stock Alert',          message: '3 items are below reorder point: Cold Rolled Sheet, Hydraulic Fluid, MIG Wire.', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString(),   action_url: '/dashboard/supply-chain' },
  { id: 'n3', type: 'leave_request',   title: 'Leave Request Submitted',  message: 'David Moyo has requested 5 days annual leave (10–14 Mar).', is_read: false, created_at: new Date(Date.now() - 7200000).toISOString(),    action_url: '/dashboard/hr' },
  { id: 'n4', type: 'invoice_overdue', title: 'Overdue Invoice',          message: 'INV-2026-0043 — Harare City Council — USD 210,000 is 19 days overdue.', is_read: false, created_at: new Date(Date.now() - 14400000).toISOString(),   action_url: '/dashboard/accounting' },
  { id: 'n5', type: 'contract_expiry', title: 'Contract Expiry Warning',  message: 'Rudo Nhemachena\'s contract expires in 26 days (31 Mar 2026).', is_read: true,  created_at: new Date(Date.now() - 43200000).toISOString(),   action_url: '/dashboard/hr' },
  { id: 'n6', type: 'deal_won',        title: 'Deal Closed Won! 🎉',      message: 'James Moyo closed the Municipal Pipe Tender — USD 210,000.', is_read: true,  created_at: new Date(Date.now() - 86400000).toISOString(),   action_url: '/dashboard/sales' },
]

const TYPE_ICONS: Record<Notification['type'], React.ReactNode> = {
  low_stock:       <Package className="w-4 h-4" />,
  po_approval:     <ShoppingCart className="w-4 h-4" />,
  leave_request:   <Clock className="w-4 h-4" />,
  contract_expiry: <AlertTriangle className="w-4 h-4" />,
  invoice_overdue: <AlertTriangle className="w-4 h-4" />,
  deal_won:        <TrendingUp className="w-4 h-4" />,
  system:          <Bell className="w-4 h-4" />,
}

const TYPE_COLORS: Record<Notification['type'], string> = {
  low_stock:       'bg-amber-100 text-amber-600',
  po_approval:     'bg-blue-100 text-blue-600',
  leave_request:   'bg-purple-100 text-purple-600',
  contract_expiry: 'bg-red-100 text-red-600',
  invoice_overdue: 'bg-red-100 text-red-600',
  deal_won:        'bg-emerald-100 text-emerald-600',
  system:          'bg-slate-100 text-slate-600',
}

export default function NotificationBell() {
  const [open,          setOpen]          = useState(false)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function markRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    toast.success('All notifications marked as read.')
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn('btn-icon rounded-xl relative', open && 'bg-surface-muted')}
        aria-label="Notifications"
      >
        <Bell className="w-4.5 h-4.5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-full mt-2 w-[360px] bg-surface rounded-2xl shadow-lift border border-nexus-border z-50 overflow-hidden"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-nexus-border">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-sm text-nexus-ink">Notifications</h3>
                {unread > 0 && <span className="badge bg-red-100 text-red-600 text-[10px] py-0">{unread} unread</span>}
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button onClick={markAllRead} className="btn-icon rounded-lg text-xs text-nexus-muted hover:text-brand-600" title="Mark all read">
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="btn-icon rounded-lg">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto divide-y divide-nexus-border">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-8 h-8 text-nexus-light mx-auto mb-2" />
                  <p className="text-sm text-nexus-muted">No notifications</p>
                </div>
              ) : notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => { markRead(n.id); if (n.action_url) window.location.href = n.action_url }}
                  className={cn('flex gap-3 p-4 cursor-pointer transition-colors hover:bg-surface-muted', !n.is_read && 'bg-brand-50/40')}
                >
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', TYPE_COLORS[n.type])}>
                    {TYPE_ICONS[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm leading-tight', !n.is_read ? 'font-semibold text-nexus-ink' : 'font-medium text-nexus-slate')}>{n.title}</p>
                      {!n.is_read && <div className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-xs text-nexus-muted mt-1 leading-relaxed line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-nexus-light mt-1.5">{formatRelative(n.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-2.5 border-t border-nexus-border">
              <button className="text-xs text-brand-600 hover:text-brand-700 font-medium">View all notifications →</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

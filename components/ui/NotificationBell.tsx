'use client'
// components/ui/NotificationBell.tsx
// Notification bell with dropdown for payment events — role-filtered

import { useState, useEffect, useRef } from 'react'
import { Bell, X, CheckCircle2, AlertCircle, CreditCard, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  getNotificationsForRole, markAsRead, markAllAsRead, dismissNotification,
  subscribeToNotifications, getUnreadCountForRole,
  type AppNotification,
} from '@/lib/notifications-store'

interface NotificationBellProps {
  userRole: string
  userId?: string
  onResubmit?: (paymentId: string) => void
  onViewInvoice?: (invoiceId: string) => void
  onReconcile?: (paymentId: string) => void
}

const TYPE_ICONS = {
  payment_submitted: CreditCard,
  payment_reconciled: CheckCircle2,
  payment_rejected: AlertCircle,
}
const TYPE_COLORS = {
  payment_submitted: 'text-blue-500',
  payment_reconciled: 'text-emerald-500',
  payment_rejected: 'text-red-500',
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function NotificationBell({ userRole, userId, onResubmit, onViewInvoice, onReconcile }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  function refresh() {
    setNotifications(getNotificationsForRole(userRole, userId))
    setUnreadCount(getUnreadCountForRole(userRole, userId))
  }

  useEffect(() => {
    refresh()
    return subscribeToNotifications(refresh)
  }, [userRole, userId])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleOpen() {
    setOpen(o => !o)
  }

  function handleMarkAllRead() {
    markAllAsRead(userRole, userId)
    refresh()
  }

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className={cn(
          'relative p-2.5 rounded-xl transition-colors',
          open ? 'bg-slate-100 text-slate-700' : 'hover:bg-slate-100 text-slate-500'
        )}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className={cn(
            'absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-0.5',
            notifications.some(n => !n.read && n.priority === 'high') ? 'bg-red-500' : 'bg-blue-500'
          )}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-500" />
                <span className="font-bold text-slate-800 text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="badge bg-red-100 text-red-600 text-[10px] font-bold">{unreadCount} unread</span>
                )}
              </div>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-xs text-brand-600 hover:underline font-medium">
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification list */}
            <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-slate-200" />
                  <p className="text-sm">All caught up!</p>
                </div>
              ) : (
                notifications.map(notif => {
                  const Icon = TYPE_ICONS[notif.type]
                  const color = TYPE_COLORS[notif.type]
                  return (
                    <div
                      key={notif.id}
                      className={cn(
                        'px-4 py-3.5 group relative transition-colors',
                        !notif.read ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                      )}
                      onClick={() => { markAsRead(notif.id); refresh() }}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className={cn('mt-0.5 flex-shrink-0', color)}>
                          <Icon className="w-4 h-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-xs leading-relaxed', !notif.read ? 'text-slate-800' : 'text-slate-600')}>
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">{formatRelative(notif.createdAt)}</p>

                          {/* Action buttons */}
                          {(notif.action || notif.type === 'payment_submitted') && (
                            <div className="flex gap-2 mt-2">
                              {notif.action === 'reconcile' && onReconcile && (
                                <button
                                  onClick={e => { e.stopPropagation(); onReconcile(notif.paymentId); setOpen(false) }}
                                  className="text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-lg transition-colors"
                                >
                                  Reconcile
                                </button>
                              )}
                              {onViewInvoice && (
                                <button
                                  onClick={e => { e.stopPropagation(); onViewInvoice(notif.invoiceId); setOpen(false) }}
                                  className="text-[11px] font-semibold text-slate-600 border border-slate-200 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                                >
                                  <ExternalLink className="w-2.5 h-2.5" />View Invoice
                                </button>
                              )}
                              {notif.action === 'resubmit' && onResubmit && (
                                <button
                                  onClick={e => { e.stopPropagation(); onResubmit(notif.paymentId); setOpen(false) }}
                                  className="text-[11px] font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors"
                                >
                                  Resubmit
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Unread dot + dismiss */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          {!notif.read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-0.5" />}
                          <button
                            onClick={e => { e.stopPropagation(); dismissNotification(notif.id); refresh() }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-slate-200 rounded text-slate-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

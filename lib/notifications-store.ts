// lib/notifications-store.ts
// In-memory notification store for payment events
// TODO: Wire to Supabase real-time when DB is live

export type NotificationType = 'payment_submitted' | 'payment_reconciled' | 'payment_rejected'
export type NotificationPriority = 'high' | 'standard'

export interface AppNotification {
  id: string
  type: NotificationType
  priority: NotificationPriority
  targetRoles: string[]
  targetUserId?: string    // If set, only show to this specific user
  message: string
  invoiceId: string
  invoiceNo: string
  paymentId: string
  rejectionReason?: string
  createdAt: string
  read: boolean
  dismissed?: boolean
  action?: 'resubmit' | 'view_invoice' | 'reconcile'
}

// ─── In-memory store ──────────────────────────────────────────────────────────

let _notifications: AppNotification[] = [
  // Pre-seeded from the mock payment data
  {
    id: 'notif-seed-001',
    type: 'payment_submitted',
    priority: 'high',
    targetRoles: ['accountant', 'executive'],
    message: '💳 Payment recorded — Thandeka Madeya has submitted a payment of USD 6,750.00 from Natpharm (Invoice KIN-2025-0055). Proof of payment attached. Awaiting your reconciliation.',
    invoiceId: 'inv-055',
    invoiceNo: 'KIN-2025-0055',
    paymentId: 'pay-005',
    createdAt: '2026-03-15T08:45:00',
    read: false,
    action: 'reconcile',
  },
  {
    id: 'notif-seed-002',
    type: 'payment_submitted',
    priority: 'high',
    targetRoles: ['accountant', 'executive'],
    message: '💳 Payment recorded — Spiwe Mandizha has submitted a payment of USD 2,100.00 from ZINARA (Invoice KIN-2025-0049). Proof of payment not attached. Awaiting your reconciliation.',
    invoiceId: 'inv-049',
    invoiceNo: 'KIN-2025-0049',
    paymentId: 'pay-006',
    createdAt: '2026-03-15T11:20:00',
    read: false,
    action: 'reconcile',
  },
  {
    id: 'notif-seed-003',
    type: 'payment_rejected',
    priority: 'high',
    targetRoles: ['sales_rep', 'data_capture'],
    targetUserId: 'thandeka-madeya',
    message: '⚠️ Payment record rejected — Grain Marketing Board (Invoice KIN-2025-0037) — USD 4,500.00 was rejected by Ashleigh Kurira. Reason: \'Reference number ZB20260310099 not found in CBZ statement for 10 March.\'. Please review and resubmit.',
    invoiceId: 'inv-037',
    invoiceNo: 'KIN-2025-0037',
    paymentId: 'pay-007',
    rejectionReason: 'Reference number ZB20260310099 not found in CBZ statement for 10 March. Please verify the correct RTGS reference and resubmit with proof of payment attached.',
    createdAt: '2026-03-12T10:00:00',
    read: false,
    action: 'resubmit',
  },
]

let _listeners: Array<() => void> = []

function notify() {
  _listeners.forEach(fn => fn())
}

export function subscribeToNotifications(fn: () => void) {
  _listeners.push(fn)
  return () => { _listeners = _listeners.filter(l => l !== fn) }
}

export function addNotification(notification: AppNotification) {
  _notifications = [notification, ..._notifications]
  notify()
}

export function getNotifications(): AppNotification[] {
  return _notifications.filter(n => !n.dismissed)
}

export function getNotificationsForRole(role: string, userId?: string): AppNotification[] {
  return _notifications.filter(n =>
    !n.dismissed &&
    n.targetRoles.includes(role) &&
    (!n.targetUserId || n.targetUserId === userId)
  )
}

export function markAsRead(id: string) {
  _notifications = _notifications.map(n => n.id === id ? { ...n, read: true } : n)
  notify()
}

export function markAllAsRead(role: string, userId?: string) {
  _notifications = _notifications.map(n =>
    n.targetRoles.includes(role) && (!n.targetUserId || n.targetUserId === userId)
      ? { ...n, read: true }
      : n
  )
  notify()
}

export function dismissNotification(id: string) {
  _notifications = _notifications.map(n => n.id === id ? { ...n, dismissed: true, read: true } : n)
  notify()
}

export function getUnreadCountForRole(role: string, userId?: string): number {
  return _notifications.filter(n =>
    !n.dismissed &&
    !n.read &&
    n.targetRoles.includes(role) &&
    (!n.targetUserId || n.targetUserId === userId)
  ).length
}

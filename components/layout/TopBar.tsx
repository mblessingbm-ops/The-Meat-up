'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Search, Bell, X, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelative } from '@/lib/utils'
import { MOTION } from '@/lib/animations'
import { Tooltip } from '@/components/ui/Tooltip'
import { ThemeToggle } from '@/components/ThemeToggle'

const BREADCRUMB_MAP: Record<string, string> = {
  '/dashboard':             'Dashboard',
  '/dashboard/stock':       'Stock',
  '/dashboard/suppliers':   'Suppliers',
  '/dashboard/invoices':    'Invoices',
  '/dashboard/expenses':    'Expenses',
  '/dashboard/pl-summary':  'P&L Summary',
  '/dashboard/settings':    'Settings',
}

function getBreadcrumb(pathname: string): { module: string; sub: string | null } {
  // Exact match
  if (BREADCRUMB_MAP[pathname]) return { module: BREADCRUMB_MAP[pathname], sub: null }
  // Prefix match — find longest
  const sorted = Object.entries(BREADCRUMB_MAP).sort((a, b) => b[0].length - a[0].length)
  for (const [path, label] of sorted) {
    if (pathname.startsWith(path + '/')) {
      const rest = pathname.slice(path.length + 1).replace(/-/g, ' ')
      return { module: label, sub: rest || null }
    }
  }
  return { module: 'The Meat Up', sub: null }
}

// Mock notifications — replace with API
const MOCK_NOTIFICATIONS = [
  { id: '1', message: 'TMU-0012 is 7 days overdue from Harare Fresh Meats', time: new Date(Date.now() - 1000 * 60 * 12).toISOString(), read: false, type: 'invoices' },
  { id: '2', message: 'Beef Fillet is below reorder level — only 3.2kg remaining', time: new Date(Date.now() - 1000 * 60 * 45).toISOString(), read: false, type: 'stock' },
  { id: '3', message: 'Outstanding payable to Pioneer Livestock due in 2 days', time: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), read: true, type: 'expenses' },
  { id: '4', message: 'Boerewors batch from last week nearing expiry', time: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), read: true, type: 'stock' },
]

interface TopBarProps {
  onMenuClick: () => void
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname()
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const unreadCount = notifications.filter(n => !n.read).length
  const breadcrumb = getBreadcrumb(pathname)

  function markAllRead() {
    setNotifications(n => n.map(x => ({ ...x, read: true })))
  }

  return (
    <header
      style={{
        height: '52px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.25rem',
        gap: '0.75rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Mobile hamburger */}
      <button onClick={onMenuClick} className="lg:hidden btn-icon">
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{
          fontFamily: 'var(--font-primary)',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: breadcrumb.sub ? 'var(--text-secondary)' : 'var(--text-primary)',
        }}>
          {breadcrumb.module}
        </span>
        {breadcrumb.sub && (
          <>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>/</span>
            <span style={{
              fontFamily: 'var(--font-primary)',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text-primary)',
              textTransform: 'capitalize',
            }}>
              {breadcrumb.sub}
            </span>
          </>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Theme toggle */}
      <ThemeToggle />

      {/* Search */}
      <button
        className="hidden md:flex items-center gap-2"
        style={{
          padding: '0.375rem 0.75rem',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-subtle)',
          fontFamily: 'var(--font-primary)',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--text-tertiary)',
          cursor: 'pointer',
          width: '180px',
          justifyContent: 'flex-start',
          transition: 'border-color 150ms, background 150ms',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--border-strong)'
          e.currentTarget.style.background = 'var(--bg-overlay)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border-default)'
          e.currentTarget.style.background = 'var(--bg-subtle)'
        }}
      >
        <Search className="w-3.5 h-3.5" />
        <span>Search...</span>
        <kbd style={{
          marginLeft: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          background: 'var(--bg-overlay)',
          padding: '0.125rem 0.375rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-tertiary)',
        }}>⌘K</kbd>
      </button>



      {/* General notification bell — one bell only per spec */}
      <div style={{ position: 'relative' }}>
        <Tooltip content="Notifications" side="bottom" delayDuration={300}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className={cn('btn-icon', notifOpen && 'bg-[var(--bg-subtle)]')}
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '2px', right: '2px',
                width: '8px', height: '8px',
                background: 'var(--danger)',
                borderRadius: '50%',
                border: '1.5px solid var(--bg-surface)',
              }} />
            )}
          </button>
        </Tooltip>

        <AnimatePresence>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <motion.div
                {...MOTION.scaleIn}
                style={{
                  position: 'absolute', right: 0, top: '2.75rem',
                  width: '360px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 50,
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid var(--border-subtle)',
                }}>
                  <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    Notifications
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        style={{ fontFamily: 'var(--font-primary)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    )}
                    <button onClick={() => setNotifOpen(false)} className="btn-icon">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notification list */}
                <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      style={{
                        display: 'flex', gap: '0.75rem', padding: '0.875rem 1rem',
                        borderBottom: '1px solid var(--border-subtle)',
                        background: n.read ? 'transparent' : 'var(--accent-subtle)',
                        cursor: 'pointer', transition: 'background 100ms',
                      }}
                      className="hover:bg-[var(--bg-subtle)]"
                      onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                    >
                      <div style={{
                        width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, marginTop: '0.375rem',
                        background: n.read ? 'var(--text-tertiary)' : 'var(--accent)',
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'var(--font-primary)', fontSize: '0.875rem', fontWeight: n.read ? 500 : 600, color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)', lineHeight: 1.45 }}>
                          {n.message}
                        </p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                          {formatRelative(n.time)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

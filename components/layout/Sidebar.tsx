'use client'
/**
 * components/layout/Sidebar.tsx
 * The Meat Up — premium butchery business management sidebar
 */

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, Truck, FileText, CreditCard,
  BarChart2, Settings, LogOut, Bell, X, CheckCheck, Clock,
  ChevronRight, MoreHorizontal, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOTION, ANIMATION_PRESETS } from '@/lib/animations'
import { Tooltip } from '@/components/ui/Tooltip'
import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
}

// ─── Navigation structure ──────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',   href: '/dashboard',             icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Stock',       href: '/dashboard/stock',       icon: <Package          className="w-4 h-4" /> },
  { label: 'Suppliers',   href: '/dashboard/suppliers',   icon: <Truck            className="w-4 h-4" /> },
  { label: 'Invoices',    href: '/dashboard/invoices',    icon: <FileText         className="w-4 h-4" /> },
  { label: 'Expenses',    href: '/dashboard/expenses',    icon: <CreditCard       className="w-4 h-4" /> },
  { label: 'P&L Summary', href: '/dashboard/pl-summary',  icon: <BarChart2        className="w-4 h-4" /> },
  { label: 'Settings',    href: '/dashboard/settings',    icon: <Settings         className="w-4 h-4" /> },
]

// ─── Mock notifications ────────────────────────────────────────────────────────
const MOCK_NOTIFICATIONS = [
  { id: 'n1', text: 'TMU-0012 is 7 days overdue from Harare Fresh Meats', time: '2 hours ago', read: false, href: '/dashboard/invoices' },
  { id: 'n2', text: 'Beef Fillet is below reorder level — only 3.2kg remaining', time: '4 hours ago', read: false, href: '/dashboard/stock' },
  { id: 'n3', text: 'Outstanding payable to Pioneer Livestock due in 2 days', time: 'Yesterday', read: false, href: '/dashboard/expenses' },
  { id: 'n4', text: 'Boerewors batch from last week nearing expiry', time: '2 days ago', read: true, href: '/dashboard/stock' },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────
function isActive(href: string, pathname: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname.startsWith(href)
}

// ─── Notifications Drawer ──────────────────────────────────────────────────────
function NotificationsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const unread = notifications.filter(n => !n.read).length

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            {...MOTION.fadeIn}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
          />
          <motion.div
            {...ANIMATION_PRESETS.slideInRight}
            className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
            style={{
              width: '340px',
              background: 'var(--bg-surface)',
              borderLeft: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                  Alerts
                </h2>
                {unread > 0 && (
                  <p style={{ fontFamily: 'var(--font-primary)', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
                    {unread} unread
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {unread > 0 && (
                  <button
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                    className="btn-ghost btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--gold)' }}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
                <button onClick={onClose} className="btn-icon">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {notifications.map(n => (
                <Link key={n.id} href={n.href} onClick={onClose}>
                  <div
                    style={{
                      display: 'flex', gap: '0.75rem', padding: '1rem 1.25rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      background: n.read ? 'transparent' : 'var(--accent-subtle)',
                      cursor: 'pointer',
                      transition: 'background 150ms',
                    }}
                    className="hover:bg-[var(--bg-subtle)]"
                  >
                    <div style={{
                      width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, marginTop: '0.375rem',
                      background: n.read ? 'transparent' : 'var(--accent)',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'var(--font-primary)', fontSize: '0.875rem', fontWeight: n.read ? 500 : 600, color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)', lineHeight: 1.5 }}>
                        {n.text}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.375rem' }}>
                        <Clock className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{n.time}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 mt-1" style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Nav Link ──────────────────────────────────────────────────────────────────
function NavLink({ item, pathname, onClick }: { item: NavItem; pathname: string; onClick?: () => void }) {
  const active = isActive(item.href, pathname)

  return (
    <Link href={item.href} onClick={onClick}>
      <div
        className={cn('nav-item', active && 'nav-item-active')}
        style={active ? {
          backgroundColor: 'var(--accent-subtle)',
          borderLeftColor: 'var(--accent)',
          color: 'var(--gold)',
        } : undefined}
      >
        <span style={{ opacity: active ? 1 : 0.6, color: active ? 'var(--gold)' : undefined }}>{item.icon}</span>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
        {item.badge !== undefined && item.badge > 0 && (
          <span style={{
            padding: '0.125rem 0.375rem',
            background: 'var(--accent)',
            color: '#F5F0EB',
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            borderRadius: 'var(--radius-full)',
            minWidth: '18px',
            textAlign: 'center',
          }}>
            {item.badge}
          </span>
        )}
      </div>
    </Link>
  )
}

// ─── Mobile Bottom Tab Bar ─────────────────────────────────────────────────────
function MobileTabBar({ pathname }: { pathname: string }) {
  const mobileTabs = NAV_ITEMS.slice(0, 5)
  return (
    <div
      className="lg:hidden fixed bottom-0 inset-x-0 z-30"
      style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center justify-around px-2 py-1">
        {mobileTabs.map(tab => {
          const active = isActive(tab.href, pathname)
          return (
            <Link key={tab.href} href={tab.href}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                color: active ? 'var(--gold)' : 'var(--text-tertiary)',
                minWidth: '44px', minHeight: '44px', justifyContent: 'center',
                cursor: 'pointer',
              }}>
                {tab.icon}
                <span style={{ fontFamily: 'var(--font-primary)', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.04em' }}>
                  {tab.label}
                </span>
              </div>
            </Link>
          )
        })}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
          padding: '0.5rem 0.75rem', color: 'var(--text-tertiary)', minWidth: '44px', minHeight: '44px', justifyContent: 'center', cursor: 'pointer',
        }}>
          <MoreHorizontal className="w-5 h-5" />
          <span style={{ fontFamily: 'var(--font-primary)', fontSize: '0.625rem', fontWeight: 600 }}>More</span>
        </div>
      </div>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface SidebarProps {
  user: User
  mobileOpen?: boolean
  onMobileClose?: () => void
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export default function Sidebar({ user, mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [notifOpen, setNotifOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length

  async function handleLogout() {
    setLoggingOut(true)
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      router.push('/auth/login')
      router.refresh()
    }
  }

  const sidebarContent = (
    <div
      className="flex flex-col h-full"
      style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}
    >
      {/* Brand block */}
      <div style={{ padding: '1rem 1rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
        {/* Logo */}
        <div style={{ paddingTop: '0', paddingBottom: '1rem' }}>
          <Image
            src="/images/the_meat_up_logo.png"
            alt="The Meat Up Logo"
            width={140}
            height={0}
            style={{ width: '140px', height: 'auto' }}
            priority
          />
        </div>
        <div style={{ height: '1px', background: '#2A2A2A', marginBottom: '1rem' }} />

        {/* Admin block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
            background: 'var(--accent-subtle)',
            border: '1px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'var(--font-primary)',
              fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.04em',
              color: 'var(--gold)',
            }}>
              {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </div>
            <div style={{
              fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: '0.6875rem',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: 'var(--gold)',
            }}>
              Admin
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          {NAV_ITEMS.map(item => (
            <NavLink key={item.href} item={item} pathname={pathname} onClick={onMobileClose} />
          ))}
        </div>
      </nav>

      {/* Bottom — notifications + sign out */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Notification bell */}
          <Tooltip content="Alerts" side="right" delayDuration={300}>
            <button
              onClick={() => setNotifOpen(true)}
              className="btn-icon"
              style={{ position: 'relative' }}
              aria-label="Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '6px', right: '6px',
                  width: '7px', height: '7px',
                  background: 'var(--accent)',
                  borderRadius: '50%',
                  border: '1.5px solid var(--bg-surface)',
                }} />
              )}
            </button>
          </Tooltip>

          {/* Sign out */}
          <Tooltip content="Sign out" side="right" delayDuration={300}>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="btn-icon"
              style={{ color: 'var(--text-tertiary)', transition: 'color 150ms', opacity: loggingOut ? 0.5 : 1 }}
              onMouseEnter={e => !loggingOut && (e.currentTarget.style.color = 'var(--danger)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
            >
              {loggingOut
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <LogOut className="w-3.5 h-3.5" />}
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[220px] flex-shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              {...MOTION.fadeIn}
              onClick={onMobileClose}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden flex flex-col"
              style={{ width: '240px' }}
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile bottom tab bar */}
      <MobileTabBar pathname={pathname} />

      {/* Notifications drawer */}
      <NotificationsDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  )
}

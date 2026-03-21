'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import { SettingsProvider } from '@/context/SettingsContext'
import type { User } from '@/types'

// The Meat Up — single operator
const ADMIN_USER: User = {
  id: 'usr_admin_001',
  name: 'Admin',
  email: 'admin@themeatup.co.zw',
  role: 'admin',
  department: 'Management',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <SettingsProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
        <Sidebar
          user={ADMIN_USER}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto p-5 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </SettingsProvider>
  )
}

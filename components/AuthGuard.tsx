'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/auth/login')
        return
      }

      setAuthenticated(true)
      setChecking(false)
    }

    checkSession()

    // Listen for auth state changes — handles sign-out from other tabs
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.replace('/auth/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  // Show loading screen while checking — prevents flash of dashboard content
  if (checking) {
    return (
      <div
        style={{
          backgroundColor: '#0F0F0F',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ color: '#9E9E9E', fontSize: '14px' }}>
          Loading...
        </div>
      </div>
    )
  }

  if (!authenticated) return null

  return <>{children}</>
}

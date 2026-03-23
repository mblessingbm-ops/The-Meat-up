'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Redirect already-authenticated users away from login
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/dashboard')
      } else {
        setChecking(false)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      if (data.session) {
        router.push('/dashboard')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  if (checking) {
    return <div style={{ backgroundColor: '#0F0F0F', minHeight: '100vh' }} />
  }

  return (
    <div
      style={{ backgroundColor: '#0F0F0F', minHeight: '100vh' }}
      className="flex items-center justify-center"
    >
      <div
        style={{ backgroundColor: '#1A1A1A' }}
        className="w-full max-w-md rounded-xl p-10 shadow-2xl"
      >
        <div className="flex justify-center mb-8">
          <Image
            src="/images/the_meat_up_logo.png"
            alt="The Meat Up Logo"
            width={180}
            height={180}
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>

        <h1
          style={{ color: '#F5F0EB' }}
          className="text-2xl font-bold text-center mb-2"
        >
          Admin Login
        </h1>
        <p
          style={{ color: '#9E9E9E' }}
          className="text-sm text-center mb-8"
        >
          The Meat Up Business Management
        </p>

        {error && (
          <div
            style={{
              backgroundColor: '#3B0000',
              border: '1px solid #8B1A1A',
              color: '#FCA5A5',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label style={{ color: '#9E9E9E', display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="admin@themeatup.co.zw"
              style={{
                backgroundColor: '#0F0F0F',
                border: '1px solid #2A2A2A',
                color: '#F5F0EB',
                borderRadius: '8px',
                padding: '12px 16px',
                width: '100%',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ color: '#9E9E9E', display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              style={{
                backgroundColor: '#0F0F0F',
                border: '1px solid #2A2A2A',
                color: '#F5F0EB',
                borderRadius: '8px',
                padding: '12px 16px',
                width: '100%',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#5C1111' : '#8B1A1A',
              color: '#F5F0EB',
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

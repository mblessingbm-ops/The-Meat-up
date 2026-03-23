'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

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
        router.refresh()
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div
      style={{ backgroundColor: 'var(--bg-base, #0F0F0F)', minHeight: '100vh' }}
      className="flex items-center justify-center"
    >
      <div
        style={{ backgroundColor: 'var(--bg-surface, #1A1A1A)' }}
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
          style={{ color: 'var(--text-primary, #F5F0EB)' }}
          className="text-2xl font-bold text-center mb-2"
        >
          Admin Login
        </h1>
        <p
          style={{ color: 'var(--text-tertiary, #9E9E9E)' }}
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
            <label
              style={{ color: 'var(--text-tertiary, #9E9E9E)', display: 'block', marginBottom: '8px', fontSize: '14px' }}
            >
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
                backgroundColor: 'var(--bg-base, #0F0F0F)',
                border: '1px solid var(--border-default, #2A2A2A)',
                color: 'var(--text-primary, #F5F0EB)',
                borderRadius: '8px',
                padding: '12px 16px',
                width: '100%',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label
              style={{ color: 'var(--text-tertiary, #9E9E9E)', display: 'block', marginBottom: '8px', fontSize: '14px' }}
            >
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
                backgroundColor: 'var(--bg-base, #0F0F0F)',
                border: '1px solid var(--border-default, #2A2A2A)',
                color: 'var(--text-primary, #F5F0EB)',
                borderRadius: '8px',
                padding: '12px 16px',
                width: '100%',
                fontSize: '14px',
                outline: 'none',
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

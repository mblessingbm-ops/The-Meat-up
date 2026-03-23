'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
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
        {/* Logo */}
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

        {/* Title */}
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

        {/* Error message */}
        {error && (
          <div
            style={{
              backgroundColor: '#3B0000',
              borderColor: '#8B1A1A',
              color: '#FCA5A5',
            }}
            className="border rounded-lg px-4 py-3 mb-6 text-sm"
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              style={{ color: '#9E9E9E' }}
              className="block text-sm mb-2"
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@themeatup.co.zw"
              style={{
                backgroundColor: '#0F0F0F',
                borderColor: '#2A2A2A',
                color: '#F5F0EB',
              }}
              className="w-full border rounded-lg px-4 py-3 text-sm outline-none focus:border-[#8B1A1A] transition-colors"
            />
          </div>

          <div>
            <label
              style={{ color: '#9E9E9E' }}
              className="block text-sm mb-2"
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                backgroundColor: '#0F0F0F',
                borderColor: '#2A2A2A',
                color: '#F5F0EB',
              }}
              className="w-full border rounded-lg px-4 py-3 text-sm outline-none focus:border-[#8B1A1A] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#5C1111' : '#8B1A1A',
              color: '#F5F0EB',
            }}
            className="w-full py-3 rounded-lg font-semibold text-sm transition-colors hover:opacity-90 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

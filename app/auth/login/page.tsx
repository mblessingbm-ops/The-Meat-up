'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter your email and password.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      toast.success(`Welcome back, ${data.user?.name?.split(' ')[0]}!`)
      router.push('/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1117] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-brand-600/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[280px] h-[280px] rounded-full bg-amber-500/8 blur-[80px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Image
            src="/images/the_meat_up_logo.png"
            alt="The Meat Up Logo"
            width={200}
            height={0}
            style={{ width: '200px', height: 'auto' }}
            priority
          />
        </div>

        {/* Headline */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="font-display text-[52px] leading-[1.1] font-bold text-white mb-6 text-balance">
            Your business.<br />
            <span className="text-brand-400">Always in control.</span>
          </h1>
          <p className="text-[#8B949E] text-lg max-w-sm leading-relaxed">
            Stock, suppliers, invoices, and profit — unified into a single management platform built for The Meat Up.
          </p>

          {/* Stats strip */}
          <div className="mt-10 flex gap-8">
            {[
              { label: 'Modules', value: '4' },
              { label: 'Users', value: '100+' },
              { label: 'Real-time', value: 'KPIs' },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display font-bold text-2xl text-white">{s.value}</div>
                <div className="text-xs text-[#8B949E] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-[#484F58]">
          © {new Date().getFullYear()} The Meat Up. All rights reserved.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#161B22]">
        <motion.div
          className="w-full max-w-[400px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden mb-8">
            <Image
              src="/images/the_meat_up_logo.png"
              alt="The Meat Up Logo"
              width={160}
              height={0}
              style={{ width: '160px', height: 'auto' }}
              priority
            />
          </div>

          <h2 className="font-display font-bold text-2xl text-white mb-1">Sign in</h2>
          <p className="text-[#8B949E] text-sm mb-8">Enter your credentials to access the platform.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                className={cn(
                  'w-full rounded-lg border bg-[#0D1117] px-4 py-3 text-sm text-white',
                  'placeholder:text-[#484F58] border-[#30363D]',
                  'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
                  'transition-all duration-150'
                )}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  className={cn(
                    'w-full rounded-lg border bg-[#0D1117] px-4 py-3 pr-12 text-sm text-white',
                    'placeholder:text-[#484F58] border-[#30363D]',
                    'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
                    'transition-all duration-150'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#484F58] hover:text-[#8B949E] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full btn-primary btn-lg rounded-lg font-display font-semibold',
                'disabled:opacity-60'
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in to The Meat Up'
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 p-3.5 rounded-lg bg-[#21262D] border border-[#30363D]">
            <p className="text-xs text-[#8B949E] font-medium mb-1">Demo credentials</p>
            <p className="text-xs text-[#C9D1D9]">owner@themeatup.co.zw · meatup2026</p>
          </div>

          <p className="text-center text-xs text-[#484F58] mt-8">
            Trouble signing in? Contact your system administrator.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

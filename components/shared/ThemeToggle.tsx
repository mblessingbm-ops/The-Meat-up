'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  // Always start with a known server-safe default — never read browser APIs during initial state
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Only runs on client — safe to access localStorage and matchMedia here
    setMounted(true)
    const stored = localStorage.getItem('theme')
    if (stored === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    } else if (stored === 'light') {
      setIsDark(false)
      document.documentElement.classList.remove('dark')
    } else {
      // No stored preference — use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(prefersDark)
      document.documentElement.classList.toggle('dark', prefersDark)
    }
  }, [])

  useEffect(() => {
    // Sync theme changes to DOM and localStorage
    if (!mounted) return
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark, mounted])

  // Render a static placeholder during SSR and first client render
  // to prevent hydration mismatch — both server and client render
  // the same thing initially (the Moon icon as the light-mode default)
  if (!mounted) {
    return (
      <button
        className="btn-icon"
        aria-label="Toggle theme"
        style={{ pointerEvents: 'none' }}
      >
        <Moon className="w-4 h-4" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="btn-icon"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark
        ? <Sun  className="w-4 h-4" />
        : <Moon className="w-4 h-4" />
      }
    </button>
  )
}

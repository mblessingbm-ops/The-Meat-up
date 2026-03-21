'use client'
/**
 * components/shared/OnboardingTooltip.tsx
 * First-time-only floating tooltip. Appears once per user per feature.
 * State stored in localStorage under key 'kingsport_onboarding'.
 * Never shows again after dismissal.
 */

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface OnboardingTooltipProps {
  /** Unique ID — stored in localStorage on dismiss */
  id: string
  /** One-line title */
  title: string
  /** One-sentence explanation */
  body: string
  /** Placement of the arrow relative to the tooltip */
  placement?: 'top' | 'bottom' | 'left' | 'right'
  /** Delay before showing (ms) — gives the page time to settle */
  delay?: number
  className?: string
}

const STORAGE_KEY = 'kingsport_onboarding'

function getSeenTooltips(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function markTooltipSeen(id: string) {
  if (typeof window === 'undefined') return
  const seen = getSeenTooltips()
  seen[id] = true
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seen))
}

const ARROW_CLASSES: Record<NonNullable<OnboardingTooltipProps['placement']>, string> = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
}

const ARROW_INDICATOR: Record<NonNullable<OnboardingTooltipProps['placement']>, string> = {
  top:    'border-t-slate-900 border-x-transparent border-b-transparent top-full border-8',
  bottom: 'border-b-slate-900 border-x-transparent border-t-transparent bottom-full border-8',
  left:   'border-l-slate-900 border-y-transparent border-r-transparent left-full border-8',
  right:  'border-r-slate-900 border-y-transparent border-l-transparent right-full border-8',
}

export default function OnboardingTooltip({
  id,
  title,
  body,
  placement = 'bottom',
  delay = 600,
  className = '',
}: OnboardingTooltipProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const seen = getSeenTooltips()
    if (seen[id]) return
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [id, delay])

  function dismiss() {
    setVisible(false)
    markTooltipSeen(id)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className={`absolute z-50 ${ARROW_CLASSES[placement]} ${className}`}
          role="tooltip"
        >
          {/* Arrow */}
          <div className={`absolute border-solid ${ARROW_INDICATOR[placement]} w-0 h-0`} />

          {/* Card */}
          <div className="max-w-[260px] bg-slate-900 text-white rounded-xl shadow-xl p-3.5">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold leading-tight mb-1">{title}</p>
                <p className="text-[11px] text-slate-300 leading-relaxed">{body}</p>
              </div>
              <button
                onClick={dismiss}
                className="text-slate-400 hover:text-white transition-colors flex-shrink-0 mt-0.5 cursor-pointer"
                aria-label="Dismiss tooltip"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={dismiss}
              className="mt-2.5 text-[11px] font-semibold text-brand-400 hover:text-brand-300 transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

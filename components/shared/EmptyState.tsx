'use client'
/**
 * components/shared/EmptyState.tsx
 * Universal empty state component — used by EVERY module in the system.
 * Never build a custom empty state UI — always use this component.
 */

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface EmptyStateAction {
  label: string
  onClick: () => void
  icon?: LucideIcon
}

interface EmptyStateProps {
  icon: LucideIcon
  heading: string
  body: string
  action?: EmptyStateAction
  /** Optional secondary action (text-only link, no fill) */
  secondaryAction?: EmptyStateAction
  /** Use 'page' for full area, 'card' for inside a card/panel */
  variant?: 'page' | 'card'
  className?: string
}

export default function EmptyState({
  icon: Icon,
  heading,
  body,
  action,
  secondaryAction,
  variant = 'card',
  className = '',
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`flex flex-col items-center justify-center text-center ${
        variant === 'page'
          ? 'min-h-[60vh] px-6'
          : 'py-16 px-6'
      } ${className}`}
    >
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-5">
        <Icon className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
      </div>

      {/* Heading */}
      <h3 className="text-base font-semibold text-slate-800 mb-2">{heading}</h3>

      {/* Body */}
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-6">{body}</p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-brand-700 transition-all duration-150 cursor-pointer"
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}

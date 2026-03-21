'use client'

import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MOTION } from '@/lib/animations'

interface ConfirmPopoverProps {
  open: boolean
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
  /** Element the popover is anchored to — used for positioning */
  anchorRef?: React.RefObject<HTMLElement>
}

export default function ConfirmPopover({
  open,
  message,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'danger',
  onConfirm,
  onCancel,
}: ConfirmPopoverProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onCancel])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onCancel()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onCancel])

  const confirmStyle: React.CSSProperties = variant === 'danger'
    ? { background: 'var(--danger)', color: 'var(--text-inverse)' }
    : { background: 'var(--accent)', color: 'var(--text-inverse)' }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          {...MOTION.scaleIn}
          style={{
            background:   'var(--bg-surface)',
            border:       '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow:    'var(--shadow-md)',
            padding:      '1rem',
            width:        '17rem',
            zIndex:       50,
          }}
        >
          <p style={{
            fontFamily: 'var(--font-primary)',
            fontSize:   '0.875rem',
            fontWeight: 500,
            color:      'var(--text-primary)',
            marginBottom: '0.75rem',
            lineHeight: 1.5,
          }}>
            {message}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              onClick={onCancel}
              className="btn-ghost btn-sm"
              type="button"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className="btn btn-sm"
              style={confirmStyle}
              type="button"
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

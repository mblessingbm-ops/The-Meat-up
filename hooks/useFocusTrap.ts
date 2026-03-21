/**
 * hooks/useFocusTrap.ts
 * Focus trap for all modals and drawers.
 * - On open: focuses first focusable element
 * - On Escape: calls onClose
 * - On close: returns focus to trigger element
 */

import { useEffect, useRef, RefObject } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onClose?: () => void
) {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen || !ref.current) return

    // Store the element that had focus before this opened
    previousFocusRef.current = document.activeElement as HTMLElement

    // Focus first focusable element inside
    const focusable = ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)
    if (focusable.length > 0) {
      focusable[0].focus()
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (!ref.current) return

      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
        return
      }

      if (e.key === 'Tab') {
        const focusableEls = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE))
        const first = focusableEls[0]
        const last = focusableEls[focusableEls.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last?.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first?.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, ref, onClose])

  // Return focus on close
  useEffect(() => {
    if (!isOpen && previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [isOpen])
}

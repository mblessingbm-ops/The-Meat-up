/**
 * lib/animations.ts
 * Shared Framer Motion animation presets — referenced by ALL animated components.
 * Never define ad-hoc animation values in components; use these constants instead.
 */

export const ANIMATION_PRESETS = {
  /** Simple opacity fade — cards, panels, page sections */
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit:    { opacity: 0 },
    transition: { duration: 0.18 },
  },

  /** Slide in from the right — drawers, side panels */
  slideInRight: {
    initial: { x: 40, opacity: 0 },
    animate: { x: 0,  opacity: 1 },
    exit:    { x: 40, opacity: 0 },
    transition: { type: 'spring', damping: 28, stiffness: 340 },
  },

  /** Slide in from the bottom — mobile bottom sheets, modals */
  slideInUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0,  opacity: 1 },
    exit:    { y: 20, opacity: 0 },
    transition: { type: 'spring', damping: 28, stiffness: 340 },
  },

  /** Scale + fade — modals, tooltips, popovers */
  scaleIn: {
    initial: { scale: 0.96, opacity: 0 },
    animate: { scale: 1,    opacity: 1 },
    exit:    { scale: 0.96, opacity: 0 },
    transition: { duration: 0.15 },
  },

  /** Parent container for staggered children */
  staggerContainer: {
    initial:  {},
    animate:  { transition: { staggerChildren: 0.06 } },
  },

  /** Individual child in a stagger list */
  staggerItem: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0,  transition: { duration: 0.2 } },
  },

  /** Section/content switcher — used by accordion + tab transitions */
  sectionSwitch: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: 8 },
    transition: { duration: 0.16 },
  },
} as const

export type AnimationPreset = keyof typeof ANIMATION_PRESETS

/**
 * NEXUS Design System — MOTION presets
 * Use these for all Framer Motion animations across the platform.
 * Rule: no bounce, no spring overload. Sharp, precise transitions only.
 */
export const MOTION = {
  /** UI feedback — hover, focus. Instant feel. */
  micro:  { duration: 0.1,  ease: [0.4, 0, 0.2, 1] as const },

  /** State transitions — button clicks, badge updates */
  fast:   { duration: 0.15, ease: [0.4, 0, 0.2, 1] as const },

  /** Panel open/close, drawers, modals */
  medium: { duration: 0.2,  ease: [0.4, 0, 0.2, 1] as const },

  /** Page transitions, large reveals */
  slow:   { duration: 0.3,  ease: [0.4, 0, 0.1, 1] as const },

  /** Stagger children — list items, table rows on load */
  stagger: { staggerChildren: 0.04, delayChildren: 0.05 },

  /** Standard panel/card entry animation */
  fadeUp: {
    initial:    { opacity: 0, y: 6 },
    animate:    { opacity: 1, y: 0 },
    exit:       { opacity: 0, y: -4 },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
  },

  /** Overlays, tooltips, backdrop */
  fadeIn: {
    initial:    { opacity: 0 },
    animate:    { opacity: 1 },
    exit:       { opacity: 0 },
    transition: { duration: 0.15 },
  },

  /** Slide in from right — drawers */
  slideRight: {
    initial:    { x: 40, opacity: 0 },
    animate:    { x: 0,  opacity: 1 },
    exit:       { x: 40, opacity: 0 },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
  },

  /** Scale + fade — popovers, tooltips */
  scaleIn: {
    initial:    { scale: 0.96, opacity: 0 },
    animate:    { scale: 1,    opacity: 1 },
    exit:       { scale: 0.96, opacity: 0 },
    transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] as const },
  },
} as const


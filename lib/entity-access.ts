// lib/entity-access.ts
// No-op stub — The Meat Up has a single entity, no entity-based access control.

/** Always returns false — no entity switching in The Meat Up */
export function canSwitchEntity(_role: string): boolean {
  return false
}

/** Always returns 'all' — single entity system */
export function getDefaultEntity(_role: string): 'all' {
  return 'all'
}

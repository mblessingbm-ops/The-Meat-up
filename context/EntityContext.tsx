'use client'
// context/EntityContext.tsx
// No-op stub — The Meat Up is a single-entity system. No entity switching needed.
// Kept to avoid breaking any import paths during migration.

import { createContext, useContext, useCallback, type ReactNode } from 'react'

export type EntityFilter = 'all'

export interface EntityConfig {
  id: string
  label: string
  shortLabel: string
  fullName: string
  colour: string
  colourSubtle: string
  colourBorder: string
}

interface EntityContextValue {
  activeEntity: 'all'
  setActiveEntity: (entity: 'all') => void
  activeConfig: null
  isFiltered: false
  filterLabel: string
}

const EntityContext = createContext<EntityContextValue>({
  activeEntity: 'all',
  setActiveEntity: () => {},
  activeConfig: null,
  isFiltered: false,
  filterLabel: 'The Meat Up',
})

export function EntityProvider({ children }: { children: ReactNode }) {
  return (
    <EntityContext.Provider value={{
      activeEntity: 'all',
      setActiveEntity: () => {},
      activeConfig: null,
      isFiltered: false,
      filterLabel: 'The Meat Up',
    }}>
      {children}
    </EntityContext.Provider>
  )
}

export function useEntity(): EntityContextValue {
  return useContext(EntityContext)
}

export function useEntityFilter() {
  const matchesFilter = useCallback((): boolean => true, [])
  return { matchesFilter, activeEntity: 'all' as const }
}

export const ENTITY_CONFIG = {}

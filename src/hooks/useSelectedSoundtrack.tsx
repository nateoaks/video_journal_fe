'use client'

import { createContext, useContext, useState } from 'react'

interface SelectedSoundtrackContextValue {
  selectedId: string | null
  setSelectedId: (id: string | null) => void
}

const SelectedSoundtrackContext =
  createContext<SelectedSoundtrackContextValue | null>(null)

/**
 * Provides client-side state for tracking which soundtrack is currently selected.
 * Wrap the soundtracks feature page with this provider to enable selection UI.
 */
export function SelectedSoundtrackProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <SelectedSoundtrackContext.Provider value={{ selectedId, setSelectedId }}>
      {children}
    </SelectedSoundtrackContext.Provider>
  )
}

/**
 * Returns the current selected soundtrack ID and a setter function.
 * Must be called within a SelectedSoundtrackProvider.
 */
export function useSelectedSoundtrack(): SelectedSoundtrackContextValue {
  const ctx = useContext(SelectedSoundtrackContext)
  if (!ctx) {
    throw new Error(
      'useSelectedSoundtrack must be used within a SelectedSoundtrackProvider'
    )
  }
  return ctx
}

'use client'

// Re-export from the canonical shared hooks location.
// The implementation has moved to src/hooks/useSelectedSoundtrack.ts so that
// other features can import it without crossing a feature boundary.
export {
  SelectedSoundtrackProvider,
  useSelectedSoundtrack,
} from '@/hooks/useSelectedSoundtrack'

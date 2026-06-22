'use client'

import { useState, useCallback, useEffect } from 'react'
import { Trimmer } from '@/features/trimmer'
import type { Clip } from '@/types/clip'

interface UnsavedTrimGuardProps {
  clip: Clip
}

export function UnsavedTrimGuard({ clip }: UnsavedTrimGuardProps) {
  const [dirty, setDirty] = useState(false)

  const handleDirtyChange = useCallback((isDirty: boolean) => {
    setDirty(isDirty)
  }, [])

  // Warn before tab/browser close when unsaved
  useEffect(() => {
    if (!dirty) return
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [dirty])

  // Intercept in-app navigation using the router's beforePopState equivalent
  // Next.js App Router doesn't expose a reliable push-intercept hook, so we
  // patch the history API to catch soft navigations away from this page.
  useEffect(() => {
    if (!dirty) return

    const originalPushState = history.pushState.bind(history)
    const originalReplaceState = history.replaceState.bind(history)

    function warnIfDirty(proceed: () => void) {
      if (window.confirm('You have unsaved trim changes. Leave anyway?')) {
        proceed()
      }
    }

    history.pushState = (...args) => {
      warnIfDirty(() => originalPushState(...args))
    }
    history.replaceState = (...args) => {
      warnIfDirty(() => originalReplaceState(...args))
    }

    return () => {
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [dirty])

  return <Trimmer clip={clip} onDirtyChange={handleDirtyChange} />
}

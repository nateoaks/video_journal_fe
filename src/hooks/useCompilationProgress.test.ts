import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCompilationProgress } from './useCompilationProgress'

// Mock compilationEventsPath
vi.mock('@/services/compilations', () => ({
  compilationEventsPath: (id: string) => `/api/compilations/${id}/events`,
}))

type EventListener = (event: MessageEvent | Event) => void

interface MockEventSource {
  addEventListener: ReturnType<typeof vi.fn>
  close: ReturnType<typeof vi.fn>
  readyState: number
  _listeners: Record<string, EventListener[]>
  _triggerMessage: (data: unknown) => void
  _triggerError: () => void
}

function createMockEventSource(): MockEventSource {
  const listeners: Record<string, EventListener[]> = {}

  const instance: MockEventSource = {
    addEventListener: vi.fn((type: string, cb: EventListener) => {
      if (!listeners[type]) listeners[type] = []
      listeners[type].push(cb)
    }),
    close: vi.fn(),
    readyState: 1,
    _listeners: listeners,
    _triggerMessage(data: unknown) {
      const event = { data: JSON.stringify(data) } as MessageEvent
      listeners['message']?.forEach((cb) => cb(event))
    },
    _triggerError() {
      listeners['error']?.forEach((cb) => cb(new Event('error')))
    },
  }

  return instance
}

let mockSourceInstance: MockEventSource | null = null

beforeEach(() => {
  mockSourceInstance = null
  // EventSource must be a real class (constructor) for `new EventSource()` to work
  class MockEventSourceClass {
    constructor() {
      const instance = createMockEventSource()
      mockSourceInstance = instance
      Object.assign(this, instance)
    }
  }
  ;(globalThis as Record<string, unknown>).EventSource = MockEventSourceClass
})

afterEach(() => {
  delete (globalThis as Record<string, unknown>).EventSource
  vi.clearAllMocks()
})

describe('useCompilationProgress', () => {
  it('returns idle state when compilationId is null', () => {
    const { result } = renderHook(() => useCompilationProgress(null))

    expect(result.current.status).toBeNull()
    expect(result.current.progress).toBe(0)
    expect(result.current.error).toBeNull()
    expect(result.current.outputKey).toBeNull()
    expect(result.current.sseDropped).toBe(false)
  })

  it('updates state on progress event', () => {
    const { result } = renderHook(() => useCompilationProgress('comp_1'))

    act(() => {
      mockSourceInstance!._triggerMessage({
        status: 'running',
        progress: 42,
      })
    })

    expect(result.current.status).toBe('running')
    expect(result.current.progress).toBe(42)
  })

  it('closes source and sets terminal status on complete event', () => {
    const { result } = renderHook(() => useCompilationProgress('comp_1'))

    act(() => {
      mockSourceInstance!._triggerMessage({
        status: 'complete',
        progress: 100,
        output_key: 'output/video.mp4',
      })
    })

    expect(result.current.status).toBe('complete')
    expect(result.current.outputKey).toBe('output/video.mp4')
    expect(mockSourceInstance!.close).toHaveBeenCalled()
  })

  it('closes source and sets error on failed event', () => {
    const { result } = renderHook(() => useCompilationProgress('comp_1'))

    act(() => {
      mockSourceInstance!._triggerMessage({
        status: 'failed',
        progress: 0,
        error: 'Something went wrong',
      })
    })

    expect(result.current.status).toBe('failed')
    expect(result.current.error).toBe('Something went wrong')
    expect(mockSourceInstance!.close).toHaveBeenCalled()
  })

  it('sets sseDropped when EventSource emits error', () => {
    const { result } = renderHook(() => useCompilationProgress('comp_1'))

    act(() => {
      mockSourceInstance!._triggerError()
    })

    expect(result.current.sseDropped).toBe(true)
    expect(mockSourceInstance!.close).toHaveBeenCalled()
  })

  it('closes source on unmount', () => {
    const { unmount } = renderHook(() => useCompilationProgress('comp_1'))

    const capturedSource = mockSourceInstance

    unmount()

    expect(capturedSource!.close).toHaveBeenCalled()
  })

  it('closes old source and opens new one when compilationId changes', () => {
    const sources: MockEventSource[] = []

    class TrackingEventSourceClass {
      constructor() {
        const src = createMockEventSource()
        sources.push(src)
        Object.assign(this, src)
      }
    }
    ;(globalThis as Record<string, unknown>).EventSource =
      TrackingEventSourceClass

    const { rerender } = renderHook(
      ({ id }: { id: string | null }) => useCompilationProgress(id),
      { initialProps: { id: 'comp_1' as string | null } }
    )

    expect(sources).toHaveLength(1)

    rerender({ id: 'comp_2' })

    expect(sources[0].close).toHaveBeenCalled()
    expect(sources).toHaveLength(2)
  })

  it('ignores malformed JSON data without crashing', () => {
    const { result } = renderHook(() => useCompilationProgress('comp_1'))

    act(() => {
      // Trigger with invalid JSON
      const event = { data: 'not valid json {{' } as MessageEvent
      mockSourceInstance!._listeners['message']?.forEach((cb) => cb(event))
    })

    // State should remain at initial values
    expect(result.current.status).toBeNull()
    expect(result.current.progress).toBe(0)
  })
})

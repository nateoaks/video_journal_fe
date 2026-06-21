import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type MockedFunction,
} from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ refresh: vi.fn() })),
}))

vi.mock('@/services', () => ({
  uploadClip: vi.fn(),
}))

import { useRouter } from 'next/navigation'
import { uploadClip } from '@/services'
import { UploadDropzone } from './UploadDropzone'

const mockUseRouter = useRouter as MockedFunction<typeof useRouter>
const mockUploadClip = uploadClip as MockedFunction<typeof uploadClip>

function makeFile(name = 'video.mp4', type = 'video/mp4') {
  return new File(['data'], name, { type })
}

/**
 * Simulate dropping files onto the Dropzone by firing input change on the
 * hidden file input — avoids the DataTransfer.files quirks in happy-dom.
 */
function dropFiles(files: File[]) {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement

  // Build a FileList-like object
  const dt = new DataTransfer()
  files.forEach((f) => dt.items.add(f))

  Object.defineProperty(input, 'files', {
    value: dt.files,
    configurable: true,
  })

  fireEvent.change(input)
}

describe('UploadDropzone', () => {
  const mockRefresh = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseRouter.mockReturnValue({
      refresh: mockRefresh,
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    })
    // Default: uploadClip resolves after a tick
    mockUploadClip.mockResolvedValue({
      id: 'clip_1',
      status: 'processing',
    } as never)
  })

  it('renders the Dropzone', () => {
    render(<UploadDropzone />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('does not show file list when no files have been dropped', () => {
    render(<UploadDropzone />)
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('adds accepted files to the list after selection', async () => {
    render(<UploadDropzone />)

    await act(async () => {
      dropFiles([makeFile()])
    })

    expect(screen.getByText('video.mp4')).toBeInTheDocument()
  })

  it('does not add rejected file types to the list', async () => {
    render(<UploadDropzone />)

    await act(async () => {
      dropFiles([makeFile('bad.avi', 'video/avi')])
    })

    expect(screen.queryByText('bad.avi')).not.toBeInTheDocument()
  })

  it('starts upload immediately after selecting a file', async () => {
    render(<UploadDropzone />)

    const file = makeFile()

    await act(async () => {
      dropFiles([file])
    })

    expect(mockUploadClip).toHaveBeenCalledWith(file, expect.any(Function))
  })

  it('caps concurrent uploads at MAX_CONCURRENT (3)', async () => {
    // Make uploadClip hang so we can check concurrency
    mockUploadClip.mockImplementation(
      // Never resolves during this test — we just check call count
      () => new Promise(() => {})
    )

    render(<UploadDropzone />)

    const files = [
      makeFile('v1.mp4'),
      makeFile('v2.mp4'),
      makeFile('v3.mp4'),
      makeFile('v4.mp4'),
      makeFile('v5.mp4'),
    ]

    await act(async () => {
      dropFiles(files)
    })

    // Only 3 should be started concurrently
    expect(mockUploadClip).toHaveBeenCalledTimes(3)
  })

  it('calls router.refresh after a successful upload (debounced)', async () => {
    vi.useFakeTimers()
    mockUploadClip.mockResolvedValue({
      id: 'clip_1',
      status: 'processing',
    } as never)

    render(<UploadDropzone />)

    await act(async () => {
      dropFiles([makeFile()])
    })

    // Wait for the upload promise to settle
    await act(async () => {
      await Promise.resolve()
    })

    // Before the debounce fires, refresh should not have been called
    expect(mockRefresh).not.toHaveBeenCalled()

    // Advance past the 300ms debounce
    await act(async () => {
      vi.advanceTimersByTime(400)
    })

    expect(mockRefresh).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('shows Retry button for a failed upload and re-calls uploadClip on retry', async () => {
    mockUploadClip.mockRejectedValueOnce(new Error('Network error'))

    render(<UploadDropzone />)

    await act(async () => {
      dropFiles([makeFile()])
    })

    // Wait for rejection to propagate
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    })

    // Reset mock for retry
    mockUploadClip.mockResolvedValue({
      id: 'clip_2',
      status: 'processing',
    } as never)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    })

    // uploadClip should have been called again (second call = retry)
    expect(mockUploadClip).toHaveBeenCalledTimes(2)
  })
})

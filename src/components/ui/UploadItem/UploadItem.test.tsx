import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UploadItem } from './UploadItem'

describe('UploadItem', () => {
  it('renders the filename', () => {
    render(<UploadItem name="my-video.mp4" status="queued" />)
    expect(screen.getByText('my-video.mp4')).toBeInTheDocument()
  })

  it('shows "Queued" label for queued status', () => {
    render(<UploadItem name="file.mp4" status="queued" />)
    expect(screen.getByText('Queued')).toBeInTheDocument()
  })

  it('shows upload progress label for uploading status', () => {
    render(<UploadItem name="file.mp4" status="uploading" progress={42} />)
    expect(screen.getByText('Uploading 42%')).toBeInTheDocument()
  })

  it('shows processing label for processing status', () => {
    render(<UploadItem name="file.mp4" status="processing" />)
    expect(screen.getByText('Processing…')).toBeInTheDocument()
  })

  it('shows failed label for failed status', () => {
    render(<UploadItem name="file.mp4" status="failed" />)
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  it('renders progress bar with correct width when uploading', () => {
    render(<UploadItem name="file.mp4" status="uploading" progress={65} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toBeInTheDocument()
    expect(bar.getAttribute('aria-valuenow')).toBe('65')
    expect((bar as HTMLElement).style.width).toBe('65%')
  })

  it('does not render progress bar when not uploading', () => {
    render(<UploadItem name="file.mp4" status="queued" />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('renders Retry button when status is failed and onRetry is provided', () => {
    render(<UploadItem name="file.mp4" status="failed" onRetry={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('calls onRetry when Retry button is clicked', () => {
    const onRetry = vi.fn()
    render(<UploadItem name="file.mp4" status="failed" onRetry={onRetry} />)
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('does not render Retry button when status is not failed', () => {
    render(<UploadItem name="file.mp4" status="uploading" onRetry={vi.fn()} />)
    expect(
      screen.queryByRole('button', { name: 'Retry' })
    ).not.toBeInTheDocument()
  })

  it('does not render Retry button when onRetry is not provided', () => {
    render(<UploadItem name="file.mp4" status="failed" />)
    expect(
      screen.queryByRole('button', { name: 'Retry' })
    ).not.toBeInTheDocument()
  })

  it('renders error message when status is failed and error is provided', () => {
    render(<UploadItem name="file.mp4" status="failed" error="Upload failed" />)
    expect(screen.getByText('Upload failed')).toBeInTheDocument()
  })
})

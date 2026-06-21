import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Dropzone } from './Dropzone'

describe('Dropzone', () => {
  it('renders children in idle state', () => {
    render(
      <Dropzone onFiles={vi.fn()}>
        <span>Upload here</span>
      </Dropzone>
    )
    expect(screen.getByText('Upload here')).toBeInTheDocument()
  })

  it('renders default idle copy when no children provided', () => {
    render(<Dropzone onFiles={vi.fn()} />)
    expect(screen.getByText('Drop files here')).toBeInTheDocument()
  })

  it('renders generic rejected label by default', () => {
    render(<Dropzone onFiles={vi.fn()} variant="rejected" />)
    expect(screen.getByText('File not supported')).toBeInTheDocument()
  })

  it('renders custom rejectedLabel when provided', () => {
    render(
      <Dropzone
        onFiles={vi.fn()}
        variant="rejected"
        rejectedLabel="File type not supported"
        rejectedDescription="Please upload .mp4 or .mov files"
      />
    )
    expect(screen.getByText('File type not supported')).toBeInTheDocument()
    expect(
      screen.getByText('Please upload .mp4 or .mov files')
    ).toBeInTheDocument()
  })

  it('calls onFiles with selected files when files are chosen via input', () => {
    const onFiles = vi.fn()
    render(<Dropzone onFiles={onFiles} />)

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    const file = new File(['video'], 'test.mp4', { type: 'video/mp4' })

    Object.defineProperty(input, 'files', {
      value: [file],
      configurable: true,
    })

    fireEvent.change(input)

    expect(onFiles).toHaveBeenCalledTimes(1)
    expect(onFiles).toHaveBeenCalledWith(expect.objectContaining({ 0: file }))
  })

  it('calls onFiles when files are dropped on the dropzone', () => {
    const onFiles = vi.fn()
    render(<Dropzone onFiles={onFiles} />)

    const dropzone = screen.getByRole('button')
    const file = new File(['video'], 'clip.mp4', { type: 'video/mp4' })

    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file] },
    })

    expect(onFiles).toHaveBeenCalledTimes(1)
  })

  it('does not call onFiles when dropped with no files', () => {
    const onFiles = vi.fn()
    render(<Dropzone onFiles={onFiles} />)

    const dropzone = screen.getByRole('button')
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [] },
    })

    expect(onFiles).not.toHaveBeenCalled()
  })

  it('applies the correct variant class via the variant prop', () => {
    const { rerender } = render(<Dropzone onFiles={vi.fn()} variant="idle" />)
    const el = screen.getByRole('button')
    expect(el.className).toMatch(/border-border/)

    rerender(<Dropzone onFiles={vi.fn()} variant="active" />)
    expect(el.className).toMatch(/border-primary/)

    rerender(<Dropzone onFiles={vi.fn()} variant="rejected" />)
    expect(el.className).toMatch(/border-destructive/)
  })
})

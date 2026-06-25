import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { userEvent, within } from '@storybook/test'
import { ErrorDetails } from './ErrorDetails'

const meta: Meta<typeof ErrorDetails> = {
  title: 'Composite/ErrorDetails',
  component: ErrorDetails,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof ErrorDetails>

const sampleStderr = `ffmpeg version 6.0 Copyright (c) 2000-2023 the FFmpeg developers
Error: Could not open input file 'clip_abc123.mp4'
No such file or directory
Conversion failed!`

export const Default: Story = {
  args: {
    message: 'Compilation failed',
  },
}

export const WithDetails: Story = {
  args: {
    message: 'Compilation failed',
    details: sampleStderr,
  },
}

export const Expanded: Story = {
  args: {
    message: 'Compilation failed after 12 seconds',
    details: 'ffmpeg: error while opening encoder\nOutput #0, mp4...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /show details/i }))
  },
}

export const LongDetails: Story = {
  args: {
    message: 'Processing failed due to an encoding error',
    details: Array.from(
      { length: 30 },
      (_, i) => `Line ${i + 1}: some log output here`
    ).join('\n'),
  },
}

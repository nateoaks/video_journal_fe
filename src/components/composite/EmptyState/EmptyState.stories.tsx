import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { EmptyState } from './EmptyState'
import { Button } from '@/components/ui'

const VideoIcon = () => (
  <svg
    className="h-12 w-12"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
)

const meta: Meta<typeof EmptyState> = {
  title: 'Composite/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof EmptyState>

export const Default: Story = {
  args: {
    title: 'No clips yet',
    description: 'Upload your first video to get started.',
  },
}

export const WithIcon: Story = {
  args: {
    icon: <VideoIcon />,
    title: 'No clips yet',
    description: 'Upload your first video to get started.',
  },
}

export const WithAction: Story = {
  args: {
    icon: <VideoIcon />,
    title: 'No clips yet',
    description: 'Upload your first video to get started.',
    action: <Button size="sm">Upload video</Button>,
  },
}

export const TitleOnly: Story = {
  args: {
    title: 'Nothing here yet',
  },
}

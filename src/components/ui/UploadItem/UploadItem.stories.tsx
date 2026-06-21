import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { UploadItem } from './UploadItem'

const meta: Meta<typeof UploadItem> = {
  title: 'UI/UploadItem',
  component: UploadItem,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['queued', 'uploading', 'processing', 'failed'],
    },
    progress: { control: { type: 'range', min: 0, max: 100 } },
  },
  args: {
    name: 'my-video-clip.mp4',
  },
}
export default meta

type Story = StoryObj<typeof UploadItem>

export const Queued: Story = {
  args: { status: 'queued' },
}

export const Uploading: Story = {
  args: { status: 'uploading', progress: 42 },
}

export const Processing: Story = {
  args: { status: 'processing' },
}

export const Failed: Story = {
  args: {
    status: 'failed',
    error: 'Upload timed out. Please try again.',
    onRetry: () => {},
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <UploadItem name="clip-queued.mp4" status="queued" />
      <UploadItem name="clip-uploading.mp4" status="uploading" progress={65} />
      <UploadItem name="clip-processing.mp4" status="processing" />
      <UploadItem
        name="clip-failed.mp4"
        status="failed"
        error="Server error 500"
        onRetry={() => {}}
      />
    </div>
  ),
}

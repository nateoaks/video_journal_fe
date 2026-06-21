import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Dropzone } from './Dropzone'

const meta: Meta<typeof Dropzone> = {
  title: 'UI/Dropzone',
  component: Dropzone,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['idle', 'active', 'rejected'] },
    multiple: { control: 'boolean' },
  },
  args: {
    onFiles: () => {},
    accept: 'video/mp4,video/quicktime',
  },
}
export default meta

type Story = StoryObj<typeof Dropzone>

export const Idle: Story = {
  args: { variant: 'idle' },
}

export const Active: Story = {
  args: { variant: 'active' },
}

export const Rejected: Story = {
  args: { variant: 'rejected' },
}

export const Interactive: Story = {
  args: { variant: 'idle' },
}

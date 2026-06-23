import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ProgressBar } from './ProgressBar'

const meta: Meta<typeof ProgressBar> = {
  title: 'UI/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error', 'complete'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
}
export default meta

type Story = StoryObj<typeof ProgressBar>

export const Default: Story = {
  args: { value: 50 },
}

export const Complete: Story = {
  args: { value: 100, variant: 'complete' },
}

export const Error: Story = {
  args: { value: 75, variant: 'error' },
}

export const Zero: Story = {
  args: { value: 0 },
}

export const Interactive: Story = {
  args: { value: 40, variant: 'default', size: 'md' },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-muted-foreground mb-1 text-xs">sm</p>
        <ProgressBar value={60} size="sm" />
      </div>
      <div>
        <p className="text-muted-foreground mb-1 text-xs">md</p>
        <ProgressBar value={60} size="md" />
      </div>
    </div>
  ),
}

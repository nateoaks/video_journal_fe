import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Switch } from './Switch'

const meta: Meta<typeof Switch> = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    variant: { control: 'select', options: ['default'] },
  },
}
export default meta

type Story = StoryObj<typeof Switch>

export const Default: Story = {
  args: {
    checked: false,
  },
}

export const Checked: Story = {
  args: {
    checked: true,
  },
}

export const Disabled: Story = {
  args: {
    checked: false,
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
  },
}

export const Interactive: Story = {
  args: {
    checked: false,
    onCheckedChange: (checked: boolean) => console.log('changed:', checked),
  },
}

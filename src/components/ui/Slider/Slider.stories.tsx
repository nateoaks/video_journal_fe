import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Slider } from './Slider'

const meta: Meta<typeof Slider> = {
  title: 'UI/Slider',
  component: Slider,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof Slider>

export const Default: Story = {
  args: {
    value: 40,
    min: 0,
    max: 100,
    step: 1,
  },
}

export const AtMinimum: Story = {
  args: {
    value: 0,
    min: 0,
    max: 100,
  },
}

export const AtMaximum: Story = {
  args: {
    value: 100,
    min: 0,
    max: 100,
  },
}

export const Disabled: Story = {
  args: {
    value: 50,
    disabled: true,
  },
}

export const Interactive: Story = {
  args: {
    value: 40,
    min: 0,
    max: 100,
    step: 1,
    onValueChange: (value: number) => console.log('value:', value),
  },
}

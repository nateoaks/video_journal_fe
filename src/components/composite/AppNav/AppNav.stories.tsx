import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AppNav } from './AppNav'

const meta: Meta<typeof AppNav> = {
  title: 'Composite/AppNav',
  component: AppNav,
  tags: ['autodocs'],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/library',
      },
    },
  },
}
export default meta

type Story = StoryObj<typeof AppNav>

export const Default: Story = {}

export const TimelineActive: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/timeline',
      },
    },
  },
}

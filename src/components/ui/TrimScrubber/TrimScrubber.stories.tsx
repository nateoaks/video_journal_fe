import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { TrimScrubber } from './TrimScrubber'

const DURATION = 60
const WIDTH = 600

function px(t: number) {
  return (t / DURATION) * WIDTH
}

function tp(p: number) {
  return (p / WIDTH) * DURATION
}

const meta: Meta<typeof TrimScrubber> = {
  title: 'UI/TrimScrubber',
  component: TrimScrubber,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    trimIn: { control: { type: 'range', min: 0, max: 60, step: 0.1 } },
    trimOut: { control: { type: 'range', min: 0, max: 60, step: 0.1 } },
    playheadTime: { control: { type: 'range', min: 0, max: 60, step: 0.1 } },
  },
}
export default meta

type Story = StoryObj<typeof TrimScrubber>

const baseArgs = {
  filmstripSrc: 'https://placehold.co/600x64/1f2937/6b7280?text=filmstrip',
  duration: DURATION,
  pixelToTime: tp,
  timeToPixel: px,
  onTrimInChange: () => {},
  onTrimOutChange: () => {},
  style: { width: WIDTH },
}

export const Default: Story = {
  args: {
    ...baseArgs,
    trimIn: 10,
    trimOut: 45,
    playheadTime: 10,
  },
}

export const InPointEarly: Story = {
  args: {
    ...baseArgs,
    trimIn: 2,
    trimOut: 30,
    playheadTime: 2,
  },
}

export const OutPointLate: Story = {
  args: {
    ...baseArgs,
    trimIn: 30,
    trimOut: 58,
    playheadTime: 30,
  },
}

export const PlayheadMidSelection: Story = {
  args: {
    ...baseArgs,
    trimIn: 10,
    trimOut: 50,
    playheadTime: 30,
  },
}

export const Interactive: Story = {
  render: (args) => {
    const [trimIn, setTrimIn] = useState(args.trimIn)
    const [trimOut, setTrimOut] = useState(args.trimOut)
    const [playhead, setPlayhead] = useState(args.playheadTime)

    return (
      <div className="flex flex-col gap-4">
        <TrimScrubber
          {...args}
          trimIn={trimIn}
          trimOut={trimOut}
          playheadTime={playhead}
          onTrimInChange={setTrimIn}
          onTrimOutChange={setTrimOut}
          style={{ width: WIDTH }}
        />
        <div className="text-sm text-neutral-400">
          In: {trimIn.toFixed(2)}s | Out: {trimOut.toFixed(2)}s | Playhead:{' '}
          {playhead.toFixed(2)}s
        </div>
        <input
          type="range"
          min={0}
          max={DURATION}
          step={0.1}
          value={playhead}
          onChange={(e) => setPlayhead(Number(e.target.value))}
          className="w-full"
        />
      </div>
    )
  },
  args: {
    ...baseArgs,
    trimIn: 10,
    trimOut: 45,
    playheadTime: 10,
  },
}

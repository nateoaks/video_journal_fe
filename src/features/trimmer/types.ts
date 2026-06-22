export interface TrimSelection {
  in: number
  out: number
}

export interface TrimScrubberCallbackProps {
  pixelToTime: (px: number) => number
  timeToPixel: (t: number) => number
}

"use client"

import * as React from "react"

import { AudioPlayer } from "@/components/ballmac/audio-player"

export default function AudioPlayerCompact() {
  const [time, setTime] = React.useState(0)
  return (
    <div className="w-full max-w-xl space-y-3">
      <AudioPlayer variant="compact" title="Weekly update: October 1" duration={312} time={time} onTimeChange={setTime} skip={{ back: 10, forward: 10 }} rates={[1, 1.5, 2]} />
      <p className="text-muted-foreground text-sm tabular-nums">Position: {Math.floor(time)} seconds</p>
    </div>
  )
}

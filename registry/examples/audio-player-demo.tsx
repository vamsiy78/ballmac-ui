"use client"

import * as React from "react"

import { AudioPlayer } from "@/components/ballmac/audio-player"

const chapters = [
  { start: 0, title: "Cold open" },
  { start: 95, title: "Why we stopped measuring" },
  { start: 612, title: "The spreadsheet that ate a year" },
  { start: 1480, title: "What replaced it" },
  { start: 2210, title: "Listener questions" },
]

export default function AudioPlayerDemo() {
  return (
    <div className="w-full max-w-xl">
      <AudioPlayer
        title="Episode 42: The Optimised Life"
        subtitle="Slow Burn · 41 min"
        duration={2460}
        chapters={chapters}
        artwork={<div className="from-chart-1 to-chart-4 flex size-full items-center justify-center bg-gradient-to-br text-2xl font-bold text-white">42</div>}
      />
    </div>
  )
}

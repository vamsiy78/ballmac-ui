"use client"

import * as React from "react"

import { PulseButton } from "@/components/ballmac/pulse-button"

export default function PulseButtonTones() {
  const [recording, setRecording] = React.useState(true)
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <PulseButton tone="chart-2" shape="pill" onClick={() => setRecording((r) => !r)} active={recording}>
        {recording ? "Recording…" : "Record"}
      </PulseButton>
      <PulseButton tone="destructive" variant="destructive">
        Live now
      </PulseButton>
      <PulseButton tone="chart-1" variant="outline" disabled>
        Disabled
      </PulseButton>
    </div>
  )
}

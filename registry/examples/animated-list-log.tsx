"use client"

import * as React from "react"

import { AnimatedList, AnimatedListItem } from "@/components/ballmac/animated-list"

const lines = ["Build started", "Installing dependencies", "Compiling 218 modules", "Running tests", "Uploading assets", "Deployment ready"]

export default function AnimatedListLog() {
  const [log, setLog] = React.useState<{ id: number; text: string }[]>([])
  const [running, setRunning] = React.useState(true)
  React.useEffect(() => {
    if (!running) return
    let n = 0
    const id = setInterval(() => {
      setLog((l) => [{ id: n, text: lines[n % lines.length]! }, ...l].slice(0, 4))
      n++
    }, 1200)
    return () => clearInterval(id)
  }, [running])
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Deploy log</h3>
        <button
          type="button"
          aria-pressed={!running}
          onClick={() => setRunning((r) => !r)}
          className="h-7 rounded-md border px-2.5 text-xs font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {running ? "Pause" : "Resume"}
        </button>
      </div>
      <AnimatedList max={4} className="min-h-[7.5rem] gap-1.5 font-mono text-xs">
        {log.map((l) => (
          <AnimatedListItem key={l.id} className="rounded-md bg-muted/60 px-2.5 py-1.5 text-foreground">
            <span className="text-muted-foreground">{String(l.id + 1).padStart(2, "0")}</span> {l.text}
          </AnimatedListItem>
        ))}
      </AnimatedList>
    </div>
  )
}

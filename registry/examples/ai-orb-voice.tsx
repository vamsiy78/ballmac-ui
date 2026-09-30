"use client"

import * as React from "react"

import { AiOrb } from "@/components/ballmac/ai-orb"

/** Stand-in for a microphone: a smooth, speech-like level. Swap in useMicrophoneLevel from voice-input. */
function useFakeVoice(active: boolean) {
  const [level, setLevel] = React.useState(0)
  React.useEffect(() => {
    if (!active) {
      setLevel(0)
      return
    }
    let t = 0
    const id = setInterval(() => {
      t += 0.35
      setLevel(Math.max(0, Math.min(1, 0.45 + Math.sin(t) * 0.3 + Math.sin(t * 2.7) * 0.2)))
    }, 80)
    return () => clearInterval(id)
  }, [active])
  return level
}

export default function AiOrbVoice() {
  const [on, setOn] = React.useState(true)
  const level = useFakeVoice(on)
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5">
      <AiOrb size="lg" state={on ? "listening" : "idle"} level={level} />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {on ? "Listening…" : "Tap to talk"}
      </p>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        className="h-9 rounded-md border bg-background px-4 text-sm font-medium shadow-xs outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {on ? "Stop" : "Start talking"}
      </button>
    </div>
  )
}

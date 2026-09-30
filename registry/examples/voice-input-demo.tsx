"use client"

import * as React from "react"

import { VoiceInput, type VoiceState } from "@/components/ballmac/voice-input"

/** A speech-like level. In an app use useMicrophoneLevel(state === "listening"). */
function useFakeLevel(active: boolean) {
  const [level, setLevel] = React.useState(0)
  React.useEffect(() => {
    if (!active) {
      setLevel(0)
      return
    }
    let t = 0
    const id = setInterval(() => {
      t += 0.45
      const burst = Math.max(0, Math.sin(t * 0.5))
      setLevel(Math.min(1, burst * (0.5 + 0.5 * Math.abs(Math.sin(t * 2.3)))))
    }, 70)
    return () => clearInterval(id)
  }, [active])
  return level
}

export default function VoiceInputDemo() {
  const [state, setState] = React.useState<VoiceState>("idle")
  const [result, setResult] = React.useState<string | null>(null)
  const level = useFakeLevel(state === "listening")
  React.useEffect(() => {
    if (state !== "processing") return
    const id = setTimeout(() => {
      setResult("Move the standup to ten and invite Priya.")
      setState("idle")
    }, 1400)
    return () => clearTimeout(id)
  }, [state])
  return (
    <div className="grid w-full max-w-md gap-3">
      <VoiceInput
        variant="bar"
        state={state}
        level={level}
        label="Dictate a message"
        onStart={() => {
          setResult(null)
          setState("listening")
        }}
        onStop={() => setState("processing")}
        onCancel={() => setState("idle")}
      />
      <p className="min-h-5 text-sm text-muted-foreground" aria-live="polite">
        {result ? <>Heard: <span className="text-foreground">“{result}”</span></> : "Press the button and speak."}
      </p>
    </div>
  )
}

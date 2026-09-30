"use client"

import * as React from "react"
import { ArrowUp } from "lucide-react"

import { VoiceInput, useMicrophoneLevel } from "@/components/ballmac/voice-input"

export default function VoiceInputButton() {
  const [listening, setListening] = React.useState(false)
  const { level, error } = useMicrophoneLevel(listening)
  return (
    <div className="grid w-full max-w-md gap-2">
      <div className="flex items-center gap-2 rounded-full border bg-card py-1.5 pr-1.5 pl-4 shadow-xs">
        <input
          aria-label="Message"
          placeholder={listening ? "Listening…" : "Message the assistant"}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <VoiceInput
          className="size-9 [&_button]:size-9"
          state={listening ? "listening" : "idle"}
          level={level}
          onStart={() => setListening(true)}
          onStop={() => setListening(false)}
          onCancel={() => setListening(false)}
        />
        <button
          type="button"
          aria-label="Send message"
          className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <ArrowUp aria-hidden="true" className="size-4" />
        </button>
      </div>
      <p className="px-2 text-xs text-muted-foreground" role={error ? "alert" : undefined}>
        {error ? `Microphone unavailable: ${error}` : "Uses your real microphone level. Nothing is recorded or sent."}
      </p>
    </div>
  )
}

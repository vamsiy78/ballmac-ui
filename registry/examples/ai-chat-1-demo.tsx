"use client"

import * as React from "react"

import { AiChat1, type ChatTurn } from "@/components/ballmac/blocks/ai-chat-1/ai-chat-1"

const REPLY = "Here's a short plan: reproduce the failure locally, add a wait for the form's ready state, then run the suite ten times to confirm it's stable."

export default function AiChat1Demo() {
  const [messages, setMessages] = React.useState<ChatTurn[] | undefined>(undefined)
  const [streaming, setStreaming] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setInterval> | null>(null)
  React.useEffect(() => () => {
    if (timer.current) clearInterval(timer.current)
  }, [])
  return (
    <AiChat1
      className="rounded-xl"
      messages={messages}
      streaming={streaming}
      onStop={() => {
        if (timer.current) clearInterval(timer.current)
        setStreaming(false)
      }}
      onSubmit={(value) => {
        const id = String(Date.now())
        setMessages((m) => [...(m ?? []), { id, role: "user", text: value }, { id: `${id}-a`, role: "assistant", text: "", streaming: true }])
        setStreaming(true)
        let i = 0
        timer.current = setInterval(() => {
          i += 5
          setMessages((m) => m?.map((x) => (x.id === `${id}-a` ? { ...x, text: REPLY.slice(0, i), streaming: i < REPLY.length } : x)))
          if (i >= REPLY.length) {
            if (timer.current) clearInterval(timer.current)
            setStreaming(false)
          }
        }, 30)
      }}
    />
  )
}

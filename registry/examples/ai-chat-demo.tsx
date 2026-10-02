"use client"

import * as React from "react"

import { Chat, ChatFooter, ChatMessages } from "@/components/ballmac/ai-chat"
import { Message, MessageAvatar, MessageContent } from "@/components/ballmac/ai-message"
import { PromptInput, PromptInputSubmit, PromptInputTextarea, PromptInputToolbar } from "@/components/ballmac/prompt-input"
import { StreamingText } from "@/components/ballmac/streaming-text"

type Turn = { id: number; role: "user" | "assistant"; text: string; streaming?: boolean }

const REPLY =
  "Ballmac components install into components/ballmac, so they never overwrite your shadcn/ui files. Add one with `npx shadcn@latest add @ballmac/prompt-input`, then import it from @/components/ballmac/prompt-input."

export default function AiChatDemo() {
  const [turns, setTurns] = React.useState<Turn[]>([
    { id: 1, role: "user", text: "Where do Ballmac components get installed?" },
    { id: 2, role: "assistant", text: REPLY },
  ])
  const [streaming, setStreaming] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setInterval> | null>(null)
  React.useEffect(() => () => {
    if (timer.current) clearInterval(timer.current)
  }, [])

  const stop = () => {
    if (timer.current) clearInterval(timer.current)
    setStreaming(false)
    setTurns((t) => t.map((x) => ({ ...x, streaming: false })))
  }

  const send = (value: string) => {
    const id = Date.now()
    setTurns((t) => [...t, { id, role: "user", text: value }, { id: id + 1, role: "assistant", text: "", streaming: true }])
    setStreaming(true)
    let i = 0
    timer.current = setInterval(() => {
      i += 4
      setTurns((t) => t.map((x) => (x.id === id + 1 ? { ...x, text: REPLY.slice(0, i) } : x)))
      if (i >= REPLY.length) stop()
    }, 30)
  }

  return (
    <div className="h-[420px] w-full max-w-2xl overflow-hidden rounded-xl border bg-background">
      <Chat>
        <ChatMessages contentClassName="px-4 py-5">
          {turns.map((t) => (
            <Message key={t.id} role={t.role}>
              <MessageAvatar>{t.role === "user" ? "YO" : "AI"}</MessageAvatar>
              <MessageContent>{t.role === "assistant" ? <StreamingText text={t.text} streaming={t.streaming} /> : t.text}</MessageContent>
            </Message>
          ))}
        </ChatMessages>
        <ChatFooter contentClassName="px-4 pb-4">
          <PromptInput onSubmit={send} status={streaming ? "streaming" : "idle"} onStop={stop}>
            <PromptInputTextarea placeholder="Ask about Ballmac UI…" />
            <PromptInputToolbar>
              <PromptInputSubmit className="ms-auto" />
            </PromptInputToolbar>
          </PromptInput>
        </ChatFooter>
      </Chat>
    </div>
  )
}

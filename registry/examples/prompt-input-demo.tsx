"use client"

import * as React from "react"

import { PromptInput, PromptInputAttachButton, PromptInputSubmit, PromptInputTextarea, PromptInputToolbar } from "@/components/ballmac/prompt-input"

export default function PromptInputDemo() {
  const [status, setStatus] = React.useState<"idle" | "streaming">("idle")
  return (
    <div className="w-full max-w-xl">
      <PromptInput
        status={status}
        onSubmit={() => {
          setStatus("streaming")
          setTimeout(() => setStatus("idle"), 2000)
        }}
        onStop={() => setStatus("idle")}
      >
        <PromptInputTextarea placeholder="Message the assistant…" />
        <PromptInputToolbar>
          <PromptInputAttachButton />
          <PromptInputSubmit className="ms-auto" />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  )
}

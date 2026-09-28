"use client"

import * as React from "react"

import { ReasoningDisclosure } from "@/components/ballmac/reasoning-disclosure"

export default function ReasoningDisclosureDemo() {
  const [streaming, setStreaming] = React.useState(true)
  React.useEffect(() => {
    const t = setTimeout(() => setStreaming(false), 2400)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="w-full max-w-xl">
      <ReasoningDisclosure streaming={streaming} duration={12}>
        The user wants the chat to stay pinned to the newest message. Pinning should only happen when they are already at
        the bottom; otherwise their scroll position must be respected. A floating button can offer a jump back.
      </ReasoningDisclosure>
    </div>
  )
}

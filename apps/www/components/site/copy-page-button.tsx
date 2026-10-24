"use client"

import { Check, Copy, Sparkles } from "lucide-react"
import * as React from "react"

/** Copies the page as Markdown, ready to paste into an AI chat. */
export function CopyPageButton({ markdown }: { markdown: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(markdown)
          setCopied(true)
          setTimeout(() => setCopied(false), 1600)
        } catch {
          // Clipboard unavailable.
        }
      }}
      className="bg-background hover:bg-accent focus-visible:ring-ring/50 inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium outline-none transition-colors focus-visible:ring-[3px]"
    >
      {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
      {copied ? "Copied" : "Copy page"}
    </button>
  )
}

/** Copies a ready-made instruction for an AI coding agent: what to install, how it works and when to use it. */
export function CopyPromptButton({ prompt }: { prompt: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(prompt)
          setCopied(true)
          setTimeout(() => setCopied(false), 1600)
        } catch {
          // Clipboard unavailable.
        }
      }}
      className="bg-background hover:bg-accent focus-visible:ring-ring/50 inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium outline-none transition-colors focus-visible:ring-[3px]"
    >
      {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Sparkles className="size-3.5" aria-hidden="true" />}
      {copied ? "Copied" : "Copy prompt"}
    </button>
  )
}

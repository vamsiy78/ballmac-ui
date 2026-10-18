"use client"

import { Check, Copy } from "lucide-react"
import * as React from "react"

/**
 * Copies the page as Markdown, ready to paste into an AI chat. The Markdown is fetched when you press the button (the same file agents
 * can read at /md/docs/<page>.md), so no page carries a second copy of itself.
 */
export function CopyMarkdownButton({ href }: { href: string }) {
  const [state, setState] = React.useState<"idle" | "copied" | "failed">("idle")
  const copy = async () => {
    try {
      // Safari only allows the clipboard inside the click, so hand it the promise instead of awaiting first.
      const text = fetch(href).then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write)
        await navigator.clipboard.write([new ClipboardItem({ "text/plain": text.then((t) => new Blob([t], { type: "text/plain" })) })])
      else await navigator.clipboard.writeText(await text)
      setState("copied")
    } catch {
      setState("failed")
    }
    setTimeout(() => setState("idle"), 1800)
  }
  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="bg-background hover:bg-accent focus-visible:ring-ring/50 inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium outline-none transition-colors focus-visible:ring-[3px]"
      >
        {state === "copied" ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
        {state === "copied" ? "Copied" : state === "failed" ? "Could not copy" : "Copy page"}
      </button>
      <span role="status" className="sr-only">
        {state === "copied" ? "Page copied as Markdown" : state === "failed" ? "Copying failed" : ""}
      </span>
    </>
  )
}

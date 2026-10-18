"use client"

import { ThumbsDown, ThumbsUp } from "lucide-react"
import * as React from "react"

type Phase = "ask" | "comment" | "thanks" | "failed"

/** "Was this page helpful?" Yes is one press. No asks what was missing, which is optional. Nothing about the reader is sent, only the page and the answer. */
export function DocsFeedback({ page }: { page: string }) {
  const [phase, setPhase] = React.useState<Phase>("ask")
  const [comment, setComment] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const id = React.useId()
  const send = async (helpful: boolean, text?: string) => {
    setBusy(true)
    try {
      const res = await fetch("/api/docs-feedback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ page, helpful, comment: text }) })
      setPhase(res.ok || res.status === 429 ? "thanks" : "failed")
    } catch {
      setPhase("failed")
    } finally {
      setBusy(false)
    }
  }
  const button = "hover:bg-accent focus-visible:ring-ring/50 inline-flex h-9 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] disabled:opacity-60"
  return (
    <section aria-labelledby={`${id}-q`} className="bg-card rounded-xl border p-5">
      {phase === "ask" && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id={`${id}-q`} className="text-sm font-medium">
            Was this page helpful?
          </h2>
          <div className="flex gap-2">
            <button type="button" disabled={busy} onClick={() => send(true)} className={button}>
              <ThumbsUp className="size-4" aria-hidden="true" />
              Yes
            </button>
            <button type="button" disabled={busy} onClick={() => setPhase("comment")} className={button}>
              <ThumbsDown className="size-4" aria-hidden="true" />
              No
            </button>
          </div>
        </div>
      )}
      {phase === "comment" && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void send(false, comment)
          }}
          className="space-y-3"
        >
          <label htmlFor={`${id}-c`} className="block text-sm font-medium">
            What was missing or wrong? <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <textarea
            id={`${id}-c`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            rows={3}
            className="focus-visible:ring-ring/50 bg-background placeholder:text-muted-foreground w-full resize-y rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
            placeholder="A step that didn't work, an example you looked for…"
          />
          <p className="text-muted-foreground text-xs">We read every note. Don&apos;t include licence keys or other secrets.</p>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className={button}>
              Send
            </button>
            <button type="button" disabled={busy} onClick={() => void send(false)} className={button}>
              Skip
            </button>
          </div>
        </form>
      )}
      {phase === "thanks" && (
        <p role="status" className="text-sm">
          Thanks. That helps us decide what to fix next.
        </p>
      )}
      {phase === "failed" && (
        <p role="status" className="text-sm">
          That didn&apos;t send. You can also <a href="/support" className="underline underline-offset-4">contact support</a>.
        </p>
      )}
    </section>
  )
}

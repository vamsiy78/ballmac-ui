"use client"

import { Ban, CircleAlert, CircleCheck, Clock, Eye, Inbox, LoaderCircle, Send, WifiOff } from "lucide-react"
import * as React from "react"

import { CopyButton } from "@/components/site/copy-button"
import { SHOW_STATE_EVENT, type PreviewState } from "@/components/site/frame-preview"
import { cn } from "@/lib/utils"

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  loading: LoaderCircle,
  empty: Inbox,
  error: CircleAlert,
  submitting: Send,
  success: CircleCheck,
  disabled: Ban,
  expired: Clock,
  offline: WifiOff,
}

/**
 * What an item can show beyond ready. Each row's button picks that state in the preview above, so the table and the preview are one
 * control; items with nothing to load, submit or fail say why instead.
 */
export function ItemStates({ states, none }: { states: PreviewState[]; none?: string }) {
  if (!states.length) {
    return none ? <p className="text-muted-foreground text-sm leading-6">This block has no states. {none}</p> : null
  }
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm leading-6">
        Pass <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.85em]">state</code> and the block does the rest: skeletons that match its layout, a clear empty message, an error you can retry, and announcements for screen readers.
      </p>
      <ul className="divide-y rounded-xl border">
        {states.map((s) => {
          const Icon = icons[s.id] ?? Inbox
          return (
            <li key={s.id} className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div className="min-w-0 space-y-1.5">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Icon className={cn("text-muted-foreground size-4", s.id === "loading" && "motion-safe:animate-spin [animation-play-state:var(--bm-ambient-state,running)]")} aria-hidden="true" />
                  {s.title}
                </p>
                {s.note ? <p className="text-muted-foreground text-sm leading-6 text-pretty">{s.note}</p> : null}
                <code className="bg-muted inline-flex max-w-full items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-xs">
                  <span className="truncate">{s.trigger}</span>
                  <CopyButton value={s.trigger} label="Copy the prop" />
                </code>
              </div>
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent(SHOW_STATE_EVENT, { detail: s.id }))
                  document.getElementById("preview")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" })
                }}
                className="hover:bg-accent focus-visible:ring-ring/50 inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium outline-none focus-visible:ring-[3px]"
              >
                <Eye className="size-3.5" aria-hidden="true" /> Show in preview<span className="sr-only">: {s.title}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

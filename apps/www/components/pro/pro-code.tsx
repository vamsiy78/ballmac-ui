"use client"

import { LockKeyhole, ShieldCheck, Sparkles } from "lucide-react"
import * as React from "react"

import { fetchProItem, useProFlag, type ProItem } from "@/components/pro/session"
import { CopyButton } from "@/components/site/copy-button"
import { ProNotice } from "@/components/site/pro-notice"
import type { Nudge } from "@/lib/founding"

function Skeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Loading the source">
      <div className="bg-muted h-10 animate-pulse rounded-xl" />
      <div className="bg-muted/60 h-64 animate-pulse rounded-xl" />
    </div>
  )
}

/** The build prompt: everything an AI builder needs to recreate the item from scratch, with one button to copy it. */
function PromptCard({ prompt, title }: { prompt: string; title?: string }) {
  const [copied, setCopied] = React.useState(false)
  const words = prompt.split(/\s+/).length
  return (
    <div data-slot="pro-prompt" className="bg-card overflow-hidden rounded-xl border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="bg-background flex size-8 shrink-0 items-center justify-center rounded-lg border" aria-hidden="true">
            <Sparkles className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium">Build prompt</p>
            <p className="text-muted-foreground text-xs">
              Paste it into Claude, Cursor, Lovable or v0 to recreate {title ?? "this block"} from scratch. About {words.toLocaleString("en-US")} words.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(prompt)
              setCopied(true)
              setTimeout(() => setCopied(false), 1800)
            } catch {
              // Clipboard unavailable; the text below stays selectable.
            }
          }}
          className="bg-primary text-primary-foreground focus-visible:ring-ring/50 inline-flex h-9 items-center rounded-md px-4 text-sm font-medium outline-none transition-colors hover:opacity-90 focus-visible:ring-[3px]"
        >
          {copied ? "Copied" : "Copy prompt"}
        </button>
      </div>
      <details className="group">
        <summary className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 cursor-pointer px-4 py-2.5 text-xs outline-none select-none focus-visible:ring-[3px] focus-visible:ring-inset">
          <span className="group-open:hidden">Read the prompt</span>
          <span className="hidden group-open:inline">Hide the prompt</span>
        </summary>
        <pre dir="ltr" tabIndex={0} className="max-h-[480px] overflow-auto border-t px-4 py-3.5 font-mono text-xs leading-relaxed whitespace-pre-wrap outline-none focus-visible:ring-[3px] focus-visible:ring-inset">
          {prompt}
        </pre>
      </details>
    </div>
  )
}

/**
 * The source of a Pro item. Visitors see the notice; a buyer who is logged in sees the real code with copy buttons, fetched from
 * the licence-checked API, so the page itself stays static and public.
 */
/** The licensed source of an item: undefined while loading, null when this visitor has no valid session. */
function useProItem(name: string, signedIn: boolean) {
  const [loaded, setLoaded] = React.useState<{ name: string; item: ProItem | null } | undefined>()
  React.useEffect(() => {
    if (!signedIn) return
    let cancelled = false
    fetchProItem(name).then((item) => {
      if (!cancelled) setLoaded({ name, item })
    })
    return () => {
      cancelled = true
    }
  }, [name, signedIn])
  return loaded?.name === name ? loaded.item : undefined
}

/** The build prompt section of an item page: the prompt for a logged-in buyer, the Pro notice for everyone else. */
export function ProPrompt({ name, nudge = null }: { name: string; nudge?: Nudge }) {
  const signedIn = useProFlag()
  const item = useProItem(name, signedIn)
  if (!signedIn || item === null) return <ProNotice nudge={nudge} prompt />
  if (item === undefined) return <Skeleton />
  return item.prompt ? <PromptCard prompt={item.prompt} title={item.title} /> : null
}

export function ProCode({ name, nudge = null, hasPrompt = false }: { name: string; nudge?: Nudge; /** The item has a build prompt (known at build time; the text arrives with the licensed source). */ hasPrompt?: boolean }) {
  const signedIn = useProFlag()
  const item = useProItem(name, signedIn)

  if (!signedIn) return <ProNotice nudge={nudge} hasPrompt={hasPrompt} />
  if (item === undefined) return <Skeleton />
  if (item === null) return <ProNotice nudge={nudge} hasPrompt={hasPrompt} />

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground flex items-center gap-2 text-sm">
        <ShieldCheck className="size-4" aria-hidden="true" />
        Your Pro licence is active. Copy the code below, or install with the CLI.
      </p>
      {item.prompt ? <PromptCard prompt={item.prompt} title={item.title} /> : null}
      {item.files.map((f) => (
        <div key={f.path} className="bg-card overflow-hidden rounded-xl border">
          <div className="flex h-10 items-center justify-between border-b px-4">
            <span className="text-muted-foreground font-mono text-xs">{f.path}</span>
            <CopyButton value={f.code} label={`Copy ${f.path}`} />
          </div>
          <div className="max-h-[560px] overflow-auto px-4 py-3.5 [&_pre]:outline-none" dangerouslySetInnerHTML={{ __html: f.html }} />
        </div>
      ))}
      {item.files.length === 0 && (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <LockKeyhole className="size-4" aria-hidden="true" />
          This item has no files to show.
        </p>
      )}
    </div>
  )
}

"use client"

import { LockKeyhole, ShieldCheck } from "lucide-react"
import * as React from "react"

import { fetchProItem, useProFlag, type ProItem } from "@/components/pro/session"
import { CopyButton } from "@/components/site/copy-button"
import { ProNotice } from "@/components/site/pro-notice"

function Skeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Loading the source">
      <div className="bg-muted h-10 animate-pulse rounded-xl" />
      <div className="bg-muted/60 h-64 animate-pulse rounded-xl" />
    </div>
  )
}

/**
 * The source of a Pro item. Visitors see the notice; a buyer who is logged in sees the real code with copy buttons, fetched from
 * the licence-checked API, so the page itself stays static and public.
 */
export function ProCode({ name }: { name: string }) {
  const signedIn = useProFlag()
  // undefined while loading, null when the session turned out not to be valid.
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

  if (!signedIn) return <ProNotice />
  const item = loaded?.name === name ? loaded.item : undefined
  if (item === undefined) return <Skeleton />
  if (item === null) return <ProNotice />

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground flex items-center gap-2 text-sm">
        <ShieldCheck className="size-4" aria-hidden="true" />
        Your Pro licence is active. Copy the code below, or install with the CLI.
      </p>
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

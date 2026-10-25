// Ballmac UI: Knowledge Sources. https://ui.ballmac.com/components/knowledge-sources
"use client"

import * as React from "react"
import { AlertCircle, Check, Pause, Database, FileText, Files, Folder, GitBranch, Globe, Link2, MessageSquare, Plus, RefreshCw, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type KnowledgeKind = "drive" | "notion" | "github" | "web" | "slack" | "files" | "database" | (string & {})
type KnowledgeStatus = "synced" | "syncing" | "error" | "paused"

type KnowledgeSource = {
  id: string
  name: string
  kind: KnowledgeKind
  /** A line under the name, for example the folder or the address. */
  detail?: string
  status: KnowledgeStatus
  /** How many documents are indexed. */
  docs: number
  /** When it was last synced, as text, for example "12 minutes ago". */
  lastSync?: string
  /** What went wrong, shown when status is "error". */
  error?: string
  /** Progress from 0 to 1 while syncing. Leave it out for an indeterminate bar. */
  progress?: number
  /** Whether the assistant may use this source in answers. */
  included: boolean
}

type KnowledgeSourcesProps = Omit<React.ComponentProps<"section">, "title" | "children"> & {
  /** The starting sources. The component keeps its own copy and reports every change. */
  sources: KnowledgeSource[]
  title?: string
  /** Adds the "Add a source" button. */
  onAdd?: () => void
  /** Called to sync a source now. Reject and it shows the error with Retry. */
  onSync?: (id: string) => void | Promise<void>
  /** Called when "Use in answers" changes. Reject and it goes back with the reason. */
  onToggle?: (id: string, included: boolean) => void | Promise<void>
  /** Adds Remove, which asks first. Reject and the source stays. */
  onRemove?: (id: string) => void | Promise<void>
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = { drive: Folder, notion: FileText, github: GitBranch, web: Globe, slack: MessageSquare, files: Files, database: Database }

const nf = new Intl.NumberFormat("en-US")

/**
 * The places an assistant reads from, shown the way a person thinks about them: what each source is, how many documents it holds, whether it is up to date,
 * and whether answers may use it. Syncing shows progress, a failed sync says why and offers Retry, and removing a source asks first.
 */
function KnowledgeSources({ sources, title, onAdd, onSync, onToggle, onRemove, className, ...props }: KnowledgeSourcesProps) {
  const msg = useMessages()
  const id = React.useId()
  title ??= msg("knowledge-sources.title", "Knowledge sources")
  const [items, setItems] = React.useState(sources)
  const [confirm, setConfirm] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<{ text: string; error?: boolean } | null>(null)

  const patch = (sid: string, p: Partial<KnowledgeSource>) => setItems((l) => l.map((s) => (s.id === sid ? { ...s, ...p } : s)))
  const reason = (e: unknown) => (e instanceof Error ? e.message : msg("knowledge-sources.failed", "That did not work. Nothing was changed."))

  async function sync(s: KnowledgeSource) {
    patch(s.id, { status: "syncing", error: undefined, progress: undefined })
    setStatus({ text: msg("knowledge-sources.syncing", "Syncing {name}", { name: s.name }) })
    try {
      await onSync?.(s.id)
      patch(s.id, { status: "synced", lastSync: msg("knowledge-sources.justNow", "Just now") })
      setStatus({ text: msg("knowledge-sources.synced", "{name} is up to date", { name: s.name }) })
    } catch (e) {
      patch(s.id, { status: "error", error: reason(e) })
      setStatus({ text: msg("knowledge-sources.syncFailed", "{name} could not be synced", { name: s.name }), error: true })
    }
  }
  async function toggle(s: KnowledgeSource) {
    const next = !s.included
    patch(s.id, { included: next })
    try {
      await onToggle?.(s.id, next)
      setStatus({ text: next ? msg("knowledge-sources.usedOn", "{name} is used in answers", { name: s.name }) : msg("knowledge-sources.usedOff", "{name} is no longer used in answers", { name: s.name }) })
    } catch (e) {
      patch(s.id, { included: s.included })
      setStatus({ text: reason(e), error: true })
    }
  }
  async function remove(s: KnowledgeSource) {
    try {
      await onRemove?.(s.id)
      setItems((l) => l.filter((x) => x.id !== s.id))
      setConfirm(null)
      setStatus({ text: msg("knowledge-sources.removed", "{name} was removed", { name: s.name }) })
    } catch (e) {
      setStatus({ text: reason(e), error: true })
    }
  }

  const docs = items.filter((s) => s.included).reduce((n, s) => n + s.docs, 0)
  const broken = items.filter((s) => s.status === "error").length

  return (
    <section data-slot="knowledge-sources" aria-labelledby={`${id}-title`} className={cn("min-w-0 rounded-xl border bg-card text-card-foreground", className)} {...props}>
      <header className="flex flex-wrap items-center justify-between gap-3 p-5 pb-4 sm:p-6 sm:pb-4">
        <div className="min-w-0">
          <h2 id={`${id}-title`} className="text-base font-semibold tracking-[-0.02em]">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {msg("knowledge-sources.summary", "{docs} documents from {count} sources are used in answers", { docs: nf.format(docs), count: items.filter((s) => s.included).length })}
            {broken > 0 && <span className="ms-2 font-medium text-foreground">{msg("knowledge-sources.broken", "{count} needs attention", { count: broken })}</span>}
          </p>
        </div>
        {onAdd && (
          <button type="button" onClick={onAdd} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-3.5 text-sm font-medium text-background outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <Plus aria-hidden="true" className="size-4" />
            {msg("knowledge-sources.add", "Add a source")}
          </button>
        )}
      </header>

      <ul className="grid grid-cols-[minmax(0,1fr)] divide-y border-t">
        {items.map((s) => {
          const Icon = ICONS[s.kind] ?? Link2
          const syncing = s.status === "syncing"
          const nameId = `${id}-${s.id}`
          return (
            <li key={s.id} className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 px-5 py-4 sm:px-6">
              <div className="flex items-start gap-3">
                <span aria-hidden="true" className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg border [&>svg]:size-4.5", s.included ? "bg-muted" : "bg-background text-muted-foreground")}>
                  <Icon />
                </span>
                <div className="min-w-0 flex-1">
                  <p id={nameId} className="truncate text-sm font-medium">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{[s.detail, msg("knowledge-sources.docs", "{count} documents", { count: nf.format(s.docs) })].filter(Boolean).join(" · ")}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={s.included}
                  aria-label={msg("knowledge-sources.use", "Use {name} in answers", { name: s.name })}
                  onClick={() => void toggle(s)}
                  className="relative mt-1 inline-flex h-5.5 w-9.5 shrink-0 items-center rounded-full border bg-muted outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-checked:border-foreground aria-checked:bg-foreground motion-reduce:transition-none"
                >
                  <span aria-hidden="true" className={cn("block size-4 rounded-full bg-background shadow-sm transition-transform motion-reduce:transition-none", s.included ? "translate-x-[1.1rem] rtl:-translate-x-[1.1rem]" : "translate-x-0.5 rtl:-translate-x-0.5")} />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 ps-12 text-xs">
                <p className="inline-flex items-center gap-1.5 font-medium">
                  {s.status === "error" ? <AlertCircle aria-hidden="true" className="size-3.5" /> : s.status === "synced" ? <Check aria-hidden="true" className="size-3.5" /> : s.status === "paused" ? <Pause aria-hidden="true" className="size-3.5" /> : <RefreshCw aria-hidden="true" className={cn("size-3.5", syncing && "animate-spin motion-reduce:animate-none")} />}
                  {s.status === "synced" && msg("knowledge-sources.upToDate", "Up to date")}
                  {syncing && (s.progress !== undefined ? msg("knowledge-sources.syncingPct", "Syncing, {percent}%", { percent: Math.round(s.progress * 100) }) : msg("knowledge-sources.syncingNow", "Syncing"))}
                  {s.status === "error" && msg("knowledge-sources.errorWord", "Sync failed")}
                  {s.status === "paused" && msg("knowledge-sources.paused", "Paused")}
                </p>
                {s.lastSync && !syncing && <p className="text-muted-foreground">{msg("knowledge-sources.last", "Synced {when}", { when: s.lastSync })}</p>}
                <span className="flex-1" />
                <div className="flex items-center gap-1">
                  {onSync && (
                    <button type="button" disabled={syncing} aria-label={msg("knowledge-sources.syncLabel", "{action}: {name}", { action: s.status === "error" ? msg("knowledge-sources.retry", "Retry") : msg("knowledge-sources.sync", "Sync now"), name: s.name })} onClick={() => void sync(s)} className="inline-flex h-7 items-center gap-1.5 rounded-md border bg-background px-2.5 font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50">
                      {s.status === "error" ? msg("knowledge-sources.retry", "Retry") : msg("knowledge-sources.sync", "Sync now")}
                    </button>
                  )}
                  {onRemove && confirm !== s.id && (
                    <button type="button" onClick={() => setConfirm(s.id)} aria-label={msg("knowledge-sources.removeLabel", "Remove {name}", { name: s.name })} title={msg("knowledge-sources.remove", "Remove")} className="flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50">
                      <Trash2 aria-hidden="true" className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {syncing && (
                <div aria-hidden="true" className="ms-12 h-1 overflow-hidden rounded-full bg-muted">
                  {s.progress !== undefined ? (
                    <div className="h-full rounded-full bg-foreground transition-[width] motion-reduce:transition-none" style={{ width: `${Math.round(s.progress * 100)}%` }} />
                  ) : (
                    <div className="h-full w-1/3 animate-pulse rounded-full bg-foreground motion-reduce:animate-none" />
                  )}
                </div>
              )}
              {s.status === "error" && s.error && <p role="alert" className="ms-12 rounded-md border border-destructive/40 px-3 py-2 text-xs leading-relaxed text-pretty">{s.error}</p>}
              {confirm === s.id && (
                <div role="group" aria-label={msg("knowledge-sources.confirm", "Confirm removing {name}", { name: s.name })} className="ms-12 flex flex-wrap items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs">
                  <p className="flex-1 basis-48 text-pretty">{msg("knowledge-sources.confirmText", "Remove {name}? Its {count} documents stop appearing in answers. The originals are not touched.", { name: s.name, count: nf.format(s.docs) })}</p>
                  <button type="button" autoFocus onClick={() => setConfirm(null)} className="h-7 rounded-md px-2.5 outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50">{msg("knowledge-sources.keep", "Keep it")}</button>
                  <button type="button" onClick={() => void remove(s)} className="h-7 rounded-md bg-foreground px-3 font-medium text-background outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">{msg("knowledge-sources.removeYes", "Remove")}</button>
                </div>
              )}
            </li>
          )
        })}
        {items.length === 0 && <li className="px-6 py-10 text-center text-sm text-muted-foreground">{msg("knowledge-sources.empty", "No sources yet. Add one and the assistant can answer from it.")}</li>}
      </ul>
      <p aria-live="polite" role={status?.error ? "alert" : undefined} className={cn("text-xs sm:px-6", status ? "border-t px-5 py-3" : "sr-only", status?.error ? "font-medium text-destructive" : "text-muted-foreground")}>{status?.text}</p>
    </section>
  )
}

export { KnowledgeSources, type KnowledgeKind, type KnowledgeSource, type KnowledgeSourcesProps, type KnowledgeStatus }

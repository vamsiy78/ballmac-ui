// Ballmac UI: Memory Panel. https://ui.ballmac.com/components/memory-panel
"use client"

import * as React from "react"
import { Brain, Pencil, Pin, PinOff, Plus, Search, Undo2, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type MemoryItem = {
  id: string
  /** What the assistant remembers, written as a sentence. */
  text: string
  /** The id of the group it belongs to. */
  scope: string
  /** Where it was learned, for example "Chat on Oct 3". */
  source?: string
  /** Kept at the top of its group and always used. */
  pinned?: boolean
}

type MemoryScope = {
  id: string
  label: string
  /** One line on what belongs here. */
  description?: string
}

type MemoryPanelProps = Omit<React.ComponentProps<"section">, "title" | "children"> & {
  /** The starting memories. The panel keeps its own copy and reports every change. */
  memories: MemoryItem[]
  /** The groups, in order. */
  scopes?: MemoryScope[]
  title?: string
  /** Whether memory is used in replies. Controlled. */
  enabled?: boolean
  defaultEnabled?: boolean
  onEnabledChange?: (enabled: boolean) => void | Promise<void>
  /** Called with the new text. Reject and the old text comes back with the reason. */
  onUpdate?: (id: string, text: string) => void | Promise<void>
  /** Called once the undo window has passed. Reject and the memory comes back with the reason. */
  onForget?: (id: string) => void | Promise<void>
  onPin?: (id: string, pinned: boolean) => void | Promise<void>
  /** Adds the "Remember something" form. Return an id to use for the new memory. */
  onAdd?: (text: string, scope: string) => string | void | Promise<string | void>
  /** How long Undo is offered after Forget, in milliseconds. */
  undoMs?: number
}

const DEFAULT_SCOPES: MemoryScope[] = [
  { id: "you", label: "About you", description: "Who you are and how you like to work." },
  { id: "work", label: "Your work", description: "Projects, tools and decisions." },
  { id: "style", label: "Style", description: "Tone, format and length." },
]

/**
 * What an assistant remembers about a person, in plain sentences they can read, correct, pin or forget. A master switch turns memory off for replies without
 * deleting it. Forget waits a few seconds so Undo works, and every change that cannot be saved is taken back with the reason.
 */
function MemoryPanel({ memories, scopes = DEFAULT_SCOPES, title, enabled: enabledProp, defaultEnabled = true, onEnabledChange, onUpdate, onForget, onPin, onAdd, undoMs = 5000, className, ...props }: MemoryPanelProps) {
  const msg = useMessages()
  const id = React.useId()
  title ??= msg("memory-panel.title", "Memory")
  const [items, setItems] = React.useState(memories)
  const [innerEnabled, setInnerEnabled] = React.useState(defaultEnabled)
  const enabled = enabledProp ?? innerEnabled
  const [query, setQuery] = React.useState("")
  const [editing, setEditing] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState("")
  const [forgetting, setForgetting] = React.useState<string[]>([])
  const [adding, setAdding] = React.useState("")
  const [addScope, setAddScope] = React.useState(scopes[0]?.id ?? "")
  const [status, setStatus] = React.useState<{ text: string; error?: boolean } | null>(null)
  const timers = React.useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const latest = React.useRef({ onForget })
  latest.current = { onForget }

  React.useEffect(() => {
    const pending = timers.current
    return () => {
      for (const [k, t] of pending) {
        clearTimeout(t)
        void latest.current.onForget?.(k)
      }
      pending.clear()
    }
  }, [])

  const fail = (e: unknown) => setStatus({ text: e instanceof Error ? e.message : msg("memory-panel.failed", "That did not work. Nothing was changed."), error: true })

  async function toggle() {
    const next = !enabled
    const before = enabled
    setInnerEnabled(next)
    try {
      await onEnabledChange?.(next)
      setStatus({ text: next ? msg("memory-panel.on", "Memory is on. Replies can use it.") : msg("memory-panel.off", "Memory is off. Nothing is deleted.") })
    } catch (e) {
      setInnerEnabled(before)
      fail(e)
    }
  }
  function startEdit(m: MemoryItem) {
    setEditing(m.id)
    setDraft(m.text)
  }
  async function save(m: MemoryItem) {
    const text = draft.trim()
    if (text === "" || text === m.text) return setEditing(null)
    const before = m.text
    setItems((l) => l.map((x) => (x.id === m.id ? { ...x, text } : x)))
    setEditing(null)
    try {
      await onUpdate?.(m.id, text)
      setStatus({ text: msg("memory-panel.saved", "Updated") })
    } catch (e) {
      setItems((l) => l.map((x) => (x.id === m.id ? { ...x, text: before } : x)))
      fail(e)
    }
  }
  async function pin(m: MemoryItem) {
    const next = !m.pinned
    setItems((l) => l.map((x) => (x.id === m.id ? { ...x, pinned: next } : x)))
    try {
      await onPin?.(m.id, next)
      setStatus({ text: next ? msg("memory-panel.pinned", "Pinned") : msg("memory-panel.unpinned", "Unpinned") })
    } catch (e) {
      setItems((l) => l.map((x) => (x.id === m.id ? { ...x, pinned: m.pinned } : x)))
      fail(e)
    }
  }
  function forget(m: MemoryItem) {
    setForgetting((l) => [...l, m.id])
    setStatus({ text: msg("memory-panel.forgetting", "Forgetting. You can still undo.") })
    timers.current.set(
      m.id,
      setTimeout(async () => {
        timers.current.delete(m.id)
        try {
          await onForget?.(m.id)
          setItems((l) => l.filter((x) => x.id !== m.id))
          setStatus({ text: msg("memory-panel.forgotten", "Forgotten") })
        } catch (e) {
          fail(e)
        }
        setForgetting((l) => l.filter((x) => x !== m.id))
      }, undoMs)
    )
  }
  function undo(m: MemoryItem) {
    const t = timers.current.get(m.id)
    if (t) clearTimeout(t)
    timers.current.delete(m.id)
    setForgetting((l) => l.filter((x) => x !== m.id))
    setStatus({ text: msg("memory-panel.restored", "Kept") })
  }
  async function add(e: React.FormEvent) {
    e.preventDefault()
    const text = adding.trim()
    if (!text) return
    try {
      const made = await onAdd?.(text, addScope)
      setItems((l) => [...l, { id: made || `new-${l.length}-${text.length}`, text, scope: addScope, source: msg("memory-panel.addedByYou", "Added by you") }])
      setAdding("")
      setStatus({ text: msg("memory-panel.added", "Remembered") })
    } catch (err) {
      fail(err)
    }
  }

  const q = query.trim().toLowerCase()
  const visible = items.filter((m) => q === "" || m.text.toLowerCase().includes(q))

  return (
    <section data-slot="memory-panel" aria-labelledby={`${id}-title`} className={cn("grid min-w-0 gap-4 rounded-xl border bg-card p-4 text-card-foreground sm:p-5", className)} {...props}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={`${id}-title`} className="flex items-center gap-2 text-sm font-semibold tracking-[-0.01em]">
            <span aria-hidden="true" className="flex size-6 items-center justify-center rounded-md bg-muted [&>svg]:size-3.5"><Brain /></span>
            {title}
            <span className="rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground tabular-nums">{items.length}</span>
          </h2>
          <p id={`${id}-hint`} className="mt-1 text-xs text-muted-foreground text-pretty">
            {enabled ? msg("memory-panel.hintOn", "Replies use these notes. Edit or forget anything that is wrong.") : msg("memory-panel.hintOff", "Memory is off. Replies ignore these notes and nothing is deleted.")}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={msg("memory-panel.switch", "Use memory in replies")}
          aria-describedby={`${id}-hint`}
          onClick={() => void toggle()}
          className="relative mt-0.5 inline-flex h-6 w-10 shrink-0 items-center rounded-full border bg-muted outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-checked:border-foreground aria-checked:bg-foreground motion-reduce:transition-none"
        >
          <span aria-hidden="true" className={cn("block size-4.5 rounded-full bg-background shadow-sm transition-transform motion-reduce:transition-none", enabled ? "translate-x-[1.1rem] rtl:-translate-x-[1.1rem]" : "translate-x-0.5 rtl:-translate-x-0.5")} />
        </button>
      </header>

      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={msg("memory-panel.search", "Search memory")}
          placeholder={msg("memory-panel.searchPlaceholder", "Search what it remembers")}
          className="h-9 w-full rounded-lg border bg-background ps-9 pe-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>

      <div className={cn("grid gap-5 transition-opacity motion-reduce:transition-none", !enabled && "opacity-60")}>
        {scopes.map((s) => {
          const list = visible.filter((m) => m.scope === s.id).sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned))
          if (list.length === 0) return null
          return (
            <div key={s.id}>
              <h3 className="flex items-baseline gap-2 text-xs font-medium text-muted-foreground">
                {s.label}
                <span className="text-[11px] tabular-nums">{list.length}</span>
              </h3>
              {s.description && <p className="text-[11px] text-muted-foreground">{s.description}</p>}
              <ul className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-1.5">
                {list.map((m) => {
                  const isForgetting = forgetting.includes(m.id)
                  if (isForgetting)
                    return (
                      <li key={m.id} className="flex items-center justify-between gap-3 rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
                        <span className="min-w-0 truncate">{msg("memory-panel.forgot", "Forgetting “{text}”", { text: m.text })}</span>
                        <button type="button" onClick={() => undo(m)} className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border bg-background px-2.5 font-medium text-foreground outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50">
                          <Undo2 aria-hidden="true" className="size-3.5 rtl:-scale-x-100" />
                          {msg("memory-panel.undo", "Undo")}
                        </button>
                      </li>
                    )
                  return (
                    <li key={m.id} className={cn("group/mem grid min-w-0 gap-2 rounded-lg border px-3 py-2.5 transition-colors motion-reduce:transition-none", m.pinned ? "bg-accent/40" : "bg-background hover:bg-accent/30")}>
                      {editing === m.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            void save(m)
                          }}
                          className="grid gap-2"
                        >
                          <textarea
                            autoFocus
                            rows={2}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") setEditing(null)
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                void save(m)
                              }
                            }}
                            aria-label={msg("memory-panel.editLabel", "Edit this memory")}
                            className="w-full resize-none rounded-md border bg-card px-2.5 py-2 text-sm leading-snug outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button type="button" onClick={() => setEditing(null)} className="h-7 rounded-md px-2.5 text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50">{msg("memory-panel.cancel", "Cancel")}</button>
                            <button type="submit" className="h-7 rounded-md bg-foreground px-3 text-xs font-medium text-background outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">{msg("memory-panel.save", "Save")}</button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm leading-snug text-pretty">{m.text}</p>
                            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
                              {m.pinned && (
                                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                                  <Pin aria-hidden="true" className="size-3" />
                                  {msg("memory-panel.pinnedTag", "Pinned")}
                                </span>
                              )}
                              {m.source}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-0.5">
                            <button type="button" onClick={() => void pin(m)} aria-pressed={!!m.pinned} aria-label={msg("memory-panel.pinLabel", "Pin: {text}", { text: m.text })} title={m.pinned ? msg("memory-panel.unpin", "Unpin") : msg("memory-panel.pin", "Pin")} className="flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:size-3.5">
                              {m.pinned ? <PinOff /> : <Pin />}
                            </button>
                            <button type="button" onClick={() => startEdit(m)} aria-label={msg("memory-panel.editFor", "Edit: {text}", { text: m.text })} title={msg("memory-panel.edit", "Edit")} className="flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:size-3.5">
                              <Pencil />
                            </button>
                            <button type="button" onClick={() => forget(m)} aria-label={msg("memory-panel.forgetFor", "Forget: {text}", { text: m.text })} title={msg("memory-panel.forget", "Forget")} className="flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:size-3.5">
                              <X />
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
        {visible.length === 0 && (
          <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
            {q ? msg("memory-panel.noMatch", "Nothing matches “{query}”.", { query }) : msg("memory-panel.empty", "Nothing remembered yet. It learns as you talk, and you decide what stays.")}
          </p>
        )}
      </div>

      {onAdd && (
        <form onSubmit={(e) => void add(e)} className="flex flex-wrap items-center gap-2 border-t pt-4">
          <label htmlFor={`${id}-add`} className="sr-only">{msg("memory-panel.addLabel", "Something to remember")}</label>
          <input
            id={`${id}-add`}
            value={adding}
            onChange={(e) => setAdding(e.target.value)}
            placeholder={msg("memory-panel.addPlaceholder", "Remember that…")}
            className="h-9 min-w-0 flex-1 basis-40 rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <select value={addScope} onChange={(e) => setAddScope(e.target.value)} aria-label={msg("memory-panel.addScope", "Group")} className="h-9 rounded-lg border bg-background px-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            {scopes.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <button type="submit" disabled={adding.trim() === ""} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-3 text-sm font-medium text-background outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50">
            <Plus aria-hidden="true" className="size-4" />
            {msg("memory-panel.add", "Remember")}
          </button>
        </form>
      )}
      <p aria-live="polite" role={status?.error ? "alert" : undefined} className={cn("min-h-4 text-xs", status?.error ? "font-medium text-destructive" : "text-muted-foreground")}>{status?.text}</p>
    </section>
  )
}

export { MemoryPanel, type MemoryItem, type MemoryPanelProps, type MemoryScope }

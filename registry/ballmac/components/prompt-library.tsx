// Ballmac UI: Prompt Library. https://ui.ballmac.com/components/prompt-library
"use client"

import * as React from "react"
import { Check, Copy, CornerDownLeft, Search, Star } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type LibraryPrompt = {
  id: string
  title: string
  /** The prompt. Put {{variable}} where a person should fill something in, for example "Reply to {{customer}} in a {{tone}} tone." */
  body: string
  description?: string
  tags?: string[]
  /** Pinned prompts come first. */
  favourite?: boolean
}

type PromptLibraryProps = Omit<React.ComponentProps<"section">, "title"> & {
  prompts: LibraryPrompt[]
  title?: string
  /** Called with the finished prompt text. Reject and the card says why. */
  onInsert?: (text: string, prompt: LibraryPrompt) => void | Promise<void>
  /** Called when a prompt is pinned or unpinned. Reject and it goes back with the message. */
  onFavourite?: (id: string, favourite: boolean) => void | Promise<void>
}

const VAR = /\{\{\s*([A-Za-z_][\w -]*?)\s*\}\}/g

/** The variable names in a prompt, in the order they first appear, without repeats. */
function extractVariables(body: string): string[] {
  const out: string[] = []
  for (const m of body.matchAll(VAR)) if (!out.includes(m[1])) out.push(m[1])
  return out
}

/** The prompt with every filled variable replaced. A variable left empty stays as `{{name}}`. */
function fillPrompt(body: string, values: Record<string, string>): string {
  return body.replace(VAR, (whole, name: string) => (values[name]?.trim() ? values[name].trim() : whole))
}

/** "customer_name" or "customer-name" → "customer name". */
const humanise = (name: string) => name.replace(/[_-]+/g, " ")

/**
 * A shelf of saved prompts: search them, filter by tag, pin the ones you use most, and fill in the {{variables}} in the one you pick with labelled fields while a
 * preview shows the finished text. Insert sends it on once every blank is filled and names what is missing if not; Copy puts it on the clipboard.
 */
function PromptLibrary({ prompts, title, onInsert, onFavourite, className, ...props }: PromptLibraryProps) {
  const msg = useMessages()
  const id = React.useId()
  title ??= msg("prompt-library.title", "Prompts")
  const [query, setQuery] = React.useState("")
  const [tag, setTag] = React.useState<string | null>(null)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [values, setValues] = React.useState<Record<string, string>>({})
  const [pins, setPins] = React.useState<Record<string, boolean>>({})
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [done, setDone] = React.useState<string | null>(null)
  const [pinError, setPinError] = React.useState<string | null>(null)

  const tags = React.useMemo(() => [...new Set(prompts.flatMap((p) => p.tags ?? []))], [prompts])
  const q = query.trim().toLowerCase()
  const isPinned = (p: LibraryPrompt) => pins[p.id] ?? !!p.favourite
  const shown = prompts
    .filter((p) => (!tag || p.tags?.includes(tag)) && (!q || `${p.title} ${p.description ?? ""} ${p.body} ${(p.tags ?? []).join(" ")}`.toLowerCase().includes(q)))
    .sort((a, b) => Number(isPinned(b)) - Number(isPinned(a)))
  const chosen = prompts.find((p) => p.id === selectedId) ?? null
  const vars = chosen ? extractVariables(chosen.body) : []
  const missing = vars.filter((v) => !values[v]?.trim())
  const finished = chosen ? fillPrompt(chosen.body, values) : ""

  function pick(p: LibraryPrompt) {
    setSelectedId(p.id)
    setValues({})
    setError(null)
    setDone(null)
  }
  async function insert() {
    if (!chosen) return
    if (missing.length) {
      setError(msg("prompt-library.missing", "Fill in: {names}", { names: missing.map(humanise).join(", ") }))
      return
    }
    setBusy(true)
    setError(null)
    try {
      await onInsert?.(finished, chosen)
      setDone(msg("prompt-library.inserted", "Inserted: {title}", { title: chosen.title }))
    } catch (e) {
      setError(e instanceof Error ? e.message : msg("prompt-library.insertFailed", "It could not be inserted. Nothing was changed."))
    } finally {
      setBusy(false)
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(finished)
      setDone(msg("prompt-library.copied", "Copied"))
    } catch {
      setError(msg("prompt-library.copyFailed", "It could not be copied. Select the text and copy it yourself."))
    }
  }
  async function pin(p: LibraryPrompt) {
    const next = !isPinned(p)
    setPinError(null)
    setPins((s) => ({ ...s, [p.id]: next }))
    try {
      await onFavourite?.(p.id, next)
    } catch (e) {
      setPins((s) => ({ ...s, [p.id]: !next }))
      setPinError(e instanceof Error ? e.message : msg("prompt-library.pinFailed", "It could not be pinned."))
    }
  }

  return (
    <section data-slot="prompt-library" aria-labelledby={`${id}-t`} className={cn("bg-card text-card-foreground overflow-hidden rounded-xl border", className)} {...props}>
      <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
        <h3 id={`${id}-t`} className="text-sm font-semibold">{title}</h3>
        <div className="flex h-8 min-w-40 flex-1 items-center gap-2 rounded-lg border bg-background px-2.5 focus-within:ring-[3px] focus-within:ring-ring/50">
          <Search aria-hidden="true" className="size-4 text-muted-foreground" />
          <input type="search" aria-label={msg("prompt-library.search", "Search prompts")} placeholder={msg("prompt-library.search", "Search prompts")} value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </div>
      </div>
      {tags.length > 0 && (
        <div role="group" aria-label={msg("prompt-library.tags", "Tags")} className="flex flex-wrap gap-1.5 border-b px-4 py-2.5">
          {[null, ...tags].map((t) => (
            <button key={t ?? "all"} type="button" aria-pressed={tag === t} onClick={() => setTag(t)} className={cn("h-7 rounded-full border px-2.5 text-xs font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none", tag === t ? "border-foreground bg-foreground text-background" : "hover:bg-accent")}>
              {t ?? msg("prompt-library.all", "All")}
            </button>
          ))}
        </div>
      )}

      {pinError && <p role="alert" className="border-b px-4 py-2 text-sm font-medium text-destructive">{pinError}</p>}
      <div className="grid md:grid-cols-[16rem_minmax(0,1fr)]">
        <ul aria-label={msg("prompt-library.list", "Saved prompts")} className="max-h-[26rem] divide-y overflow-y-auto border-b md:border-e md:border-b-0">
          {shown.length === 0 && <li className="px-4 py-8 text-center text-sm text-muted-foreground">{msg("prompt-library.none", "No prompts match.")}</li>}
          {shown.map((p) => (
            <li key={p.id} className={cn("flex items-start", chosen?.id === p.id && "bg-accent/60")}>
              <button type="button" aria-pressed={chosen?.id === p.id} onClick={() => pick(p)} className="min-w-0 flex-1 px-3.5 py-3 text-start outline-none transition-colors hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset motion-reduce:transition-none">
                <span className="block text-sm font-medium leading-snug">{p.title}</span>
                {p.description && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{p.description}</span>}
              </button>
              {onFavourite && (
                <button type="button" aria-label={isPinned(p) ? msg("prompt-library.unpin", "Unpin {title}", { title: p.title }) : msg("prompt-library.pin", "Pin {title}", { title: p.title })} aria-pressed={isPinned(p)} onClick={() => void pin(p)} className="m-1.5 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none">
                  <Star aria-hidden="true" className={cn("size-4", isPinned(p) && "fill-current text-foreground")} />
                </button>
              )}
            </li>
          ))}
        </ul>

        <div className="grid min-w-0 content-start gap-4 p-4 sm:p-5">
          {chosen ? (
            <>
              <div>
                <p className="text-base font-semibold tracking-tight">{chosen.title}</p>
                {chosen.description && <p className="mt-0.5 text-sm text-muted-foreground">{chosen.description}</p>}
              </div>
              {vars.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {vars.map((v) => (
                    <div key={v} className="grid gap-1.5">
                      <label htmlFor={`${id}-${v}`} className="text-xs font-medium capitalize text-muted-foreground">{humanise(v)}</label>
                      <input id={`${id}-${v}`} value={values[v] ?? ""} onChange={(e) => { setValues({ ...values, [v]: e.target.value }); setError(null); setDone(null) }} aria-invalid={!!error && !values[v]?.trim()} className="h-9 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[invalid=true]:border-destructive" />
                    </div>
                  ))}
                </div>
              )}
              <div className="grid gap-1.5">
                <p className="text-xs font-medium text-muted-foreground">{msg("prompt-library.preview", "Preview")}</p>
                <p data-slot="prompt-library-preview" className="rounded-lg border bg-background/60 px-3.5 py-3 text-sm leading-relaxed whitespace-pre-wrap text-pretty">
                  {chosen.body.split(VAR).map((part, i) =>
                    i % 2 === 1 ? (values[part]?.trim() ? <mark key={i} className="rounded-sm bg-foreground/10 px-0.5 font-medium text-foreground">{values[part].trim()}</mark> : <span key={i} className="rounded-sm border border-dashed px-1 font-mono text-xs text-muted-foreground">{`{{${part}}}`}</span>) : <React.Fragment key={i}>{part}</React.Fragment>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" disabled={busy} onClick={() => void insert()} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 motion-reduce:transition-none">
                  <CornerDownLeft aria-hidden="true" className="size-4 rtl:-scale-x-100" />{msg("prompt-library.insert", "Insert")}
                </button>
                <button type="button" onClick={() => void copy()} className="inline-flex h-9 items-center gap-1.5 rounded-full border bg-background px-4 text-sm font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none">
                  <Copy aria-hidden="true" className="size-4" />{msg("prompt-library.copy", "Copy")}
                </button>
                {done && <span aria-live="polite" className="flex items-center gap-1.5 text-sm text-muted-foreground"><Check aria-hidden="true" className="size-4" />{done}</span>}
              </div>
              {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
            </>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">{msg("prompt-library.hint", "Pick a prompt to fill it in.")}</p>
          )}
        </div>
      </div>
    </section>
  )
}

export { PromptLibrary, extractVariables, fillPrompt, type LibraryPrompt, type PromptLibraryProps }

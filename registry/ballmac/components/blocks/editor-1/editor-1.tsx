// Ballmac UI: Editor 1. https://ui.ballmac.com/blocks/editor-1
"use client"

import * as React from "react"
import { Bold, CircleAlert, CircleCheck, Code, Heading2, Italic, Link2, List, ListOrdered, Loader2, Quote, RotateCw } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Editor1Props = Omit<React.ComponentProps<"section">, "title" | "onChange"> &
  StateProps & {
    title?: string
    defaultValue?: string
    /** Milliseconds to wait after typing before saving. 0 saves on every change. */
    autosaveMs?: number
    /** Called to save the text. Return a promise; reject and the editor says Not saved, with Retry. Without it, saving is simulated. */
    onSave?: (value: string) => void | Promise<void>
    onChange?: (value: string) => void
    /** Start on the Preview tab (narrow screens). */
    defaultTab?: "write" | "preview"
  }

const starter = `# Launch notes

We are shipping **three things** this week, and one of them is *small but loved*.

## What is new

1. A faster search that finds words, not just titles
2. Notes that save as you type
3. [Read the full changelog](https://example.com/changelog)

> People forgive missing features. They do not forgive losing their work.

Use \`autosave\` for anything longer than a paragraph.

- Fewer clicks
- Clearer errors
- One place for everything
`

// A small, safe Markdown reader. It builds React elements, never HTML strings, and only lets http, https and mailto links through.
function inline(text: string, key: string): React.ReactNode[] {
  const out: React.ReactNode[] = []
  const re = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|_[^_\n]+_|`[^`\n]+`|\[[^\]\n]+\]\([^)\s]+\))/g
  let last = 0
  let i = 0
  for (const m of text.matchAll(re)) {
    if (m.index! > last) out.push(text.slice(last, m.index))
    const t = m[0]
    const k = `${key}-${i++}`
    if (t.startsWith("**")) out.push(<strong key={k}>{t.slice(2, -2)}</strong>)
    else if (t.startsWith("`")) out.push(<code key={k} className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.9em]">{t.slice(1, -1)}</code>)
    else if (t.startsWith("[")) {
      const [, label, href] = t.match(/^\[([^\]]+)\]\(([^)]+)\)$/)!
      out.push(/^(https?:|mailto:)/i.test(href!) ? <a key={k} href={href} className="underline underline-offset-4" rel="noreferrer">{label}</a> : <span key={k}>{label}</span>)
    } else out.push(<em key={k}>{t.slice(1, -1)}</em>)
    last = m.index! + t.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

function render(md: string): React.ReactNode[] {
  const lines = md.replace(/\r/g, "").split("\n")
  const out: React.ReactNode[] = []
  let i = 0
  let k = 0
  while (i < lines.length) {
    const line = lines[i]!
    if (!line.trim()) { i++; continue }
    let m: RegExpMatchArray | null
    if ((m = line.match(/^(#{1,3})\s+(.*)$/))) {
      const level = m[1]!.length
      const cls = level === 1 ? "mt-6 mb-3 text-3xl font-semibold tracking-tight first:mt-0" : level === 2 ? "mt-6 mb-2 text-xl font-semibold tracking-tight first:mt-0" : "mt-4 mb-2 text-base font-semibold first:mt-0"
      out.push(React.createElement(`h${level}`, { key: k++, className: cls }, ...inline(m[2]!, `h${k}`)))
      i++
    } else if (/^(-{3,}|\*{3,})$/.test(line.trim())) { out.push(<hr key={k++} className="my-6" />); i++ }
    else if (/^>\s?/.test(line)) {
      const buf: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i]!)) buf.push(lines[i++]!.replace(/^>\s?/, ""))
      out.push(<blockquote key={k++} className="text-muted-foreground my-4 border-s-2 ps-4 italic">{inline(buf.join(" "), `q${k}`)}</blockquote>)
    } else if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i]!)) items.push(lines[i++]!.replace(/^\s*[-*]\s+/, ""))
      out.push(<ul key={k++} className="my-3 list-disc space-y-1 ps-6">{items.map((t, n) => <li key={n}>{inline(t, `u${k}${n}`)}</li>)}</ul>)
    } else if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i]!)) items.push(lines[i++]!.replace(/^\s*\d+\.\s+/, ""))
      out.push(<ol key={k++} className="my-3 list-decimal space-y-1 ps-6">{items.map((t, n) => <li key={n}>{inline(t, `o${k}${n}`)}</li>)}</ol>)
    } else {
      const buf: string[] = []
      while (i < lines.length && lines[i]!.trim() && !/^(#{1,3}\s|>|\s*[-*]\s|\s*\d+\.\s)/.test(lines[i]!)) buf.push(lines[i++]!)
      out.push(<p key={k++} className="my-3 leading-relaxed text-pretty">{inline(buf.join(" "), `p${k}`)}</p>)
    }
  }
  return out
}

const words = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0)

function Skel() {
  return (
    <div aria-hidden="true" className="bg-card rounded-2xl border p-5">
      <Skeleton className="h-10" />
      <Skeleton className="mt-4 h-72" />
    </div>
  )
}

/**
 * A Markdown editor with a live preview: a toolbar and the usual shortcuts (Ctrl or Command with B, I and K) wrap the selected text, the preview
 * updates as you type and is built from safe elements, and a word count and reading time sit under the page. It saves on its own after you stop typing and
 * always says where it stands: Saved, Saving, Unsaved changes, or Not saved with a Retry that keeps your text.
 */
function Editor1({ title = "Launch notes", defaultValue = starter, autosaveMs = 1200, onSave, onChange, defaultTab = "write", state = "ready", onRetry, errorState, className, ...props }: Editor1Props) {
  const id = React.useId()
  const [text, setText] = React.useState(defaultValue)
  const [tab, setTab] = React.useState(defaultTab)
  const [save, setSave] = React.useState<"saved" | "dirty" | "saving" | "failed">("saved")
  const area = React.useRef<HTMLTextAreaElement>(null)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const latest = React.useRef(text)
  latest.current = text

  const doSave = React.useCallback(async () => {
    const value = latest.current
    setSave("saving")
    try {
      if (onSave) await onSave(value)
      else await new Promise((r) => setTimeout(r, 400))
      // Typing during the save leaves it unsaved; the autosave timer will pick that up.
      setSave(latest.current === value ? "saved" : "dirty")
    } catch {
      setSave("failed")
    }
  }, [onSave])
  React.useEffect(() => () => clearTimeout(timer.current), [])

  function change(next: string) {
    setText(next)
    onChange?.(next)
    setSave("dirty")
    clearTimeout(timer.current)
    timer.current = setTimeout(() => void doSave(), autosaveMs)
  }
  // Wrap the selection, or put the marks around a placeholder and select it so typing replaces it.
  function wrap(before: string, after = before, placeholder = "text") {
    const el = area.current
    if (!el) return
    const { selectionStart: a, selectionEnd: b, value } = el
    const sel = value.slice(a, b) || placeholder
    const next = value.slice(0, a) + before + sel + after + value.slice(b)
    change(next)
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(a + before.length, a + before.length + sel.length) })
  }
  function prefix(mark: string) {
    const el = area.current
    if (!el) return
    const { selectionStart: a, selectionEnd: b, value } = el
    const start = value.lastIndexOf("\n", a - 1) + 1
    const end = b + (value.indexOf("\n", b) === -1 ? value.length - b : value.indexOf("\n", b) - b)
    const block = value.slice(start, end).split("\n").map((l, n) => (mark === "1. " ? `${n + 1}. ` : mark) + l).join("\n")
    change(value.slice(0, start) + block + value.slice(end))
    requestAnimationFrame(() => el.focus())
  }
  function key(e: React.KeyboardEvent) {
    if (!(e.metaKey || e.ctrlKey)) return
    const k = e.key.toLowerCase()
    if (k === "b") { e.preventDefault(); wrap("**") }
    else if (k === "i") { e.preventDefault(); wrap("*") }
    else if (k === "k") { e.preventDefault(); wrap("[", "](https://)", "link text") }
    else if (k === "s") { e.preventDefault(); clearTimeout(timer.current); void doSave() }
  }

  const tools = [
    { label: "Bold", hint: "Ctrl B", icon: Bold, run: () => wrap("**") },
    { label: "Italic", hint: "Ctrl I", icon: Italic, run: () => wrap("*") },
    { label: "Heading", icon: Heading2, run: () => prefix("## ") },
    { label: "Link", hint: "Ctrl K", icon: Link2, run: () => wrap("[", "](https://)", "link text") },
    { label: "Bulleted list", icon: List, run: () => prefix("- ") },
    { label: "Numbered list", icon: ListOrdered, run: () => prefix("1. ") },
    { label: "Quote", icon: Quote, run: () => prefix("> ") },
    { label: "Code", icon: Code, run: () => wrap("`", "`", "code") },
  ]
  const n = words(text)
  const status = { saved: { icon: CircleCheck, text: "Saved" }, dirty: { icon: Loader2, text: "Unsaved changes" }, saving: { icon: Loader2, text: "Saving…" }, failed: { icon: CircleAlert, text: "Not saved" } }[save]

  const content = (
    <div className="bg-card overflow-hidden rounded-2xl border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2.5">
        <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5">
          {tools.map((t) => (
            <Button key={t.label} type="button" variant="ghost" size="icon" aria-label={t.hint ? `${t.label} (${t.hint})` : t.label} title={t.hint ? `${t.label} (${t.hint})` : t.label} onClick={t.run}>
              <t.icon aria-hidden="true" className="rtl:-scale-x-100" />
            </Button>
          ))}
        </div>
        <div role="tablist" aria-label="View" className="bg-muted flex rounded-lg p-0.5 lg:hidden">
          {(["write", "preview"] as const).map((k) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn("focus-visible:ring-ring/50 rounded-md px-3 py-1.5 text-sm font-medium capitalize outline-none focus-visible:ring-[3px]", tab === k ? "bg-background shadow-sm" : "text-muted-foreground")}>
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 lg:divide-x rtl:lg:divide-x-reverse">
        <div className={cn("flex", tab === "preview" && "hidden lg:flex")}>
          <label htmlFor={`${id}-ta`} className="sr-only">
            Write in Markdown
          </label>
          <textarea
            id={`${id}-ta`}
            ref={area}
            dir="auto"
            value={text}
            onChange={(e) => change(e.target.value)}
            onKeyDown={key}
            spellCheck
            className="focus-visible:ring-ring/50 block min-h-[26rem] w-full flex-1 resize-none bg-transparent p-5 font-mono text-sm leading-relaxed outline-none focus-visible:ring-[3px] focus-visible:ring-inset"
          />
        </div>
        <div className={cn("bg-muted/20 min-h-[26rem] p-5 sm:p-6", tab === "write" && "hidden lg:block")} aria-label="Preview" role="region">
          {text.trim() ? render(text) : <p className="text-muted-foreground text-sm">Nothing to preview yet. Start writing and it appears here.</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-2.5 text-sm">
        <p className="text-muted-foreground tabular-nums">
          {n} {n === 1 ? "word" : "words"} · {Math.max(1, Math.round(n / 220))} min read
        </p>
        <p role="status" className={cn("flex items-center gap-2", save === "failed" && "font-medium")}>
          <status.icon aria-hidden="true" className={cn("size-4", (save === "dirty" || save === "saving") && "text-muted-foreground", save === "saving" && "animate-spin motion-reduce:animate-none", save === "saved" && "text-chart-2")} />
          {status.text}
          {save === "failed" ? (
            <>
              . Your text is still here.
              <button type="button" onClick={() => void doSave()} className="focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-sm font-semibold underline underline-offset-2 outline-none focus-visible:ring-[3px]">
                <RotateCw aria-hidden="true" className="size-3" />
                Retry
              </button>
            </>
          ) : null}
        </p>
      </div>
    </div>
  )

  return (
    <section data-slot="editor-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <h1 id={`${id}-title`} className="mb-6 text-3xl font-semibold tracking-[-0.035em] text-balance">
        {title}
      </h1>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading the editor" loading={<Skel />} error={{ title: errorState?.title ?? "The document could not be loaded", description: errorState?.description ?? "Nothing was changed. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
    </section>
  )
}

export { Editor1, type Editor1Props }

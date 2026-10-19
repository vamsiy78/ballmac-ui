// Ballmac UI: Mention Input. https://ui.ballmac.com/components/mention-input
"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { useDirection } from "@/lib/ballmac/direction"
import { useMessages } from "@/lib/ballmac/i18n"
import { cn } from "@/lib/utils"

type MentionOption = {
  id: string
  /** The text put in the field, without the trigger: "Maya Chen". */
  label: string
  /** A second line in the list: an email or a role. */
  description?: string
  /** A small picture or icon drawn before the name in the list. */
  media?: React.ReactNode
  disabled?: boolean
}

/** One mention in the text: where it sits (`start` to `end`, counting the trigger) and what it refers to. */
type Mention = { id: string; trigger: string; label: string; start: number; end: number }

type MentionValue = { text: string; mentions: Mention[] }

type MentionSource = {
  /** The character that opens the list: "@" for people, "#" for channels or tags. */
  trigger: string
  /** The choices, or a function that finds them for what was typed after the trigger. It may return a promise. */
  options: MentionOption[] | ((query: string, signal: AbortSignal) => MentionOption[] | Promise<MentionOption[]>)
  /** What the list is called for screen readers: "People". */
  label?: string
  /** Mention styling for this trigger. */
  className?: string
}

type MentionInputProps = Omit<React.ComponentProps<"textarea">, "value" | "defaultValue" | "onChange" | "onSubmit" | "children"> & {
  /** The text and its mentions, when you hold them in state. Pair with `onValueChange`. */
  value?: MentionValue
  defaultValue?: MentionValue
  onValueChange?: (value: MentionValue) => void
  sources: MentionSource[]
  /** Rows to show at first. The field grows with its text up to `maxRows`. */
  minRows?: number
  maxRows?: number
  /** One line, like a search box: Enter does not add a line. */
  singleLine?: boolean
  invalid?: boolean
  /** Called when Enter is pressed with no list open, in a single-line field or with Ctrl or Cmd held. */
  onSubmit?: (value: MentionValue) => void
}

type Active = { source: MentionSource; sourceIndex: number; query: string; start: number }

const EMPTY: MentionValue = { text: "", mentions: [] }

// ------------------------------------------------------------------------------------------------- helpers

/** `Hi @[Maya Chen](u1), see #[docs](c9)`: the text with each mention written as `trigger[label](id)`. */
export function mentionsToMarkup(value: MentionValue): string {
  let out = ""
  let at = 0
  for (const m of [...value.mentions].sort((a, b) => a.start - b.start)) {
    out += value.text.slice(at, m.start) + `${m.trigger}[${m.label}](${m.id})`
    at = m.end
  }
  return out + value.text.slice(at)
}

/** The reverse of `mentionsToMarkup`: reads `@[Maya Chen](u1)` back into text and mentions. */
export function parseMentionMarkup(markup: string, triggers: string[] = ["@", "#"]): MentionValue {
  const escaped = triggers.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")
  const re = new RegExp(`(${escaped})\\[([^\\]]+)\\]\\(([^)]+)\\)`, "g")
  let text = ""
  let at = 0
  const mentions: Mention[] = []
  for (const m of markup.matchAll(re)) {
    text += markup.slice(at, m.index)
    const start = text.length
    text += `${m[1]}${m[2]}`
    mentions.push({ id: m[3]!, trigger: m[1]!, label: m[2]!, start, end: text.length })
    at = m.index! + m[0].length
  }
  return { text: text + markup.slice(at), mentions }
}

/**
 * Keeps mentions in place as the text changes. The part that changed is found by trimming what the old and new text share at each end; a mention
 * wholly before it stays, one wholly after it moves by the change in length, and one that was touched is dropped, so it becomes plain text.
 */
export function shiftMentions(prev: MentionValue, nextText: string): Mention[] {
  const a = prev.text
  const b = nextText
  let head = 0
  while (head < a.length && head < b.length && a[head] === b[head]) head++
  let tail = 0
  while (tail < a.length - head && tail < b.length - head && a[a.length - 1 - tail] === b[b.length - 1 - tail]) tail++
  const removedEnd = a.length - tail
  const delta = b.length - a.length
  const out: Mention[] = []
  for (const m of prev.mentions) {
    if (m.end <= head) out.push(m)
    else if (m.start >= removedEnd) out.push({ ...m, start: m.start + delta, end: m.end + delta })
  }
  return out
}

/** The trigger and query the caret is in, if any: `@ma` right after a space or the start of the text. */
function findActive(text: string, caret: number, sources: MentionSource[], mentions: Mention[]): Active | null {
  const before = text.slice(0, caret)
  let best: Active | null = null
  sources.forEach((source, sourceIndex) => {
    const at = before.lastIndexOf(source.trigger)
    if (at < 0) return
    const prev = at === 0 ? "" : before[at - 1]!
    if (prev && !/[\s([{"'“‘]/.test(prev)) return
    const query = before.slice(at + source.trigger.length)
    if (/\s{2,}|\n/.test(query) || query.length > 40) return
    // a space ends a one-word query unless the source's labels have spaces; allow one space so "Maya Ch" keeps matching
    if ((query.match(/\s/g) ?? []).length > 1) return
    if (mentions.some((m) => at >= m.start && at < m.end)) return
    if (!best || at > best.start) best = { source, sourceIndex, query, start: at }
  })
  return best
}

// ------------------------------------------------------------------------------------------------- component

/**
 * A text field where typing @ or # opens a list of people, channels or tags. The chosen one is written into the text and highlighted; the value
 * keeps where each mention is, so you know who was mentioned. Arrow keys choose, Enter or Tab inserts, Escape closes, Backspace removes a whole mention.
 */
function MentionInput({
  value,
  defaultValue,
  onValueChange,
  sources,
  minRows = 3,
  maxRows = 8,
  singleLine = false,
  invalid = false,
  onSubmit,
  disabled,
  className,
  placeholder,
  onKeyDown,
  onSelect,
  onBlur,
  ...props
}: MentionInputProps) {
  const msg = useMessages()
  const dir = useDirection()
  const id = React.useId()
  const [inner, setInner] = React.useState<MentionValue>(defaultValue ?? EMPTY)
  const current = value ?? inner
  const [caret, setCaret] = React.useState(0)
  const [open, setOpen] = React.useState(true)
  const [index, setIndex] = React.useState(0)
  const [results, setResults] = React.useState<MentionOption[]>([])
  const [loading, setLoading] = React.useState(false)
  const [pos, setPos] = React.useState<{ top: number; start: number } | null>(null)
  const area = React.useRef<HTMLTextAreaElement>(null)
  const layer = React.useRef<HTMLDivElement>(null)
  const marker = React.useRef<HTMLSpanElement>(null)

  const active = React.useMemo(() => (open && !disabled ? findActive(current.text, caret, sources, current.mentions) : null), [open, disabled, current.text, current.mentions, caret, sources])
  const listId = `${id}-list`
  // where the caret goes once the new text is in the field: set in the same commit, so typing straight after cannot land in the wrong place
  const pendingCaret = React.useRef<number | null>(null)
  React.useLayoutEffect(() => {
    const at = pendingCaret.current
    if (at === null || !area.current) return
    pendingCaret.current = null
    area.current.focus()
    area.current.setSelectionRange(at, at)
    setCaret(at)
  }, [current.text])

  const commit = (next: MentionValue) => {
    if (value === undefined) setInner(next)
    onValueChange?.(next)
  }

  // ----- find the options for what was typed
  const sourcesRef = React.useRef(sources)
  sourcesRef.current = sources
  React.useEffect(() => {
    if (!active) {
      setResults([])
      setLoading(false)
      return
    }
    const source = sourcesRef.current[active.sourceIndex]!
    const q = active.query.trim().toLowerCase()
    if (Array.isArray(source.options)) {
      setResults(source.options.filter((o) => !q || o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q)))
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    Promise.resolve((source.options as (q: string, s: AbortSignal) => MentionOption[] | Promise<MentionOption[]>)(active.query, controller.signal))
      .then((found) => {
        if (controller.signal.aborted) return
        setResults(found)
        setLoading(false)
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setResults([])
        setLoading(false)
      })
    return () => controller.abort()
  }, [active?.sourceIndex, active?.query, active?.start]) // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => setIndex(0), [active?.query, active?.start, active?.sourceIndex])

  // ----- where the list goes: under the caret, read from a marker in the mirror layer
  React.useLayoutEffect(() => {
    if (!active || !marker.current || !layer.current) return setPos(null)
    const top = marker.current.offsetTop - (area.current?.scrollTop ?? 0) + marker.current.offsetHeight + 6
    setPos({ top, start: marker.current.offsetLeft })
  }, [active, current.text, results.length])

  // ----- keep the field the height of its text
  React.useLayoutEffect(() => {
    const el = area.current
    if (!el || singleLine) return
    const style = getComputedStyle(el)
    const line = parseFloat(style.lineHeight) || 20
    const pad = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
    el.style.height = "auto"
    el.style.height = `${Math.min(Math.max(el.scrollHeight, line * minRows + pad), line * maxRows + pad)}px`
    if (layer.current) layer.current.style.height = el.style.height
  }, [current.text, minRows, maxRows, singleLine])

  const choose = (option: MentionOption) => {
    if (!active || option.disabled) return
    const trigger = active.source.trigger
    const inserted = `${trigger}${option.label}`
    const after = current.text.slice(caret)
    // a space follows the mention, unless one is already there
    const text = current.text.slice(0, active.start) + inserted + (after.startsWith(" ") ? "" : " ") + after
    const shifted = shiftMentions(current, text)
    const mention: Mention = { id: option.id, trigger, label: option.label, start: active.start, end: active.start + inserted.length }
    const next: MentionValue = { text, mentions: [...shifted.filter((m) => m.end <= mention.start || m.start >= mention.end), mention].sort((a, b) => a.start - b.start) }
    pendingCaret.current = active.start + inserted.length + 1
    commit(next)
    setOpen(true)
  }

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = singleLine ? e.target.value.replace(/\n/g, " ") : e.target.value
    commit({ text, mentions: shiftMentions(current, text) })
    setCaret(e.target.selectionStart)
    setOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented) return
    if (active && (results.length || loading)) {
      const enabled = results.map((r, i) => (r.disabled ? -1 : i)).filter((i) => i >= 0)
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault()
        if (!enabled.length) return
        const at = enabled.indexOf(index)
        const next = e.key === "ArrowDown" ? enabled[(at + 1) % enabled.length]! : enabled[(at - 1 + enabled.length) % enabled.length]!
        setIndex(next)
        return
      }
      if ((e.key === "Enter" || e.key === "Tab") && results[index] && !results[index]!.disabled && !e.shiftKey) {
        e.preventDefault()
        choose(results[index]!)
        return
      }
    }
    if (active && e.key === "Escape") {
      e.preventDefault()
      setOpen(false)
      return
    }
    // Backspace right after a mention removes all of it, as one unit
    if (e.key === "Backspace" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const el = e.currentTarget
      if (el.selectionStart === el.selectionEnd) {
        const m = current.mentions.find((x) => x.end === el.selectionStart)
        if (m) {
          e.preventDefault()
          const text = current.text.slice(0, m.start) + current.text.slice(m.end)
          pendingCaret.current = m.start
          commit({ text, mentions: shiftMentions(current, text) })
          return
        }
      }
    }
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      if (singleLine || e.ctrlKey || e.metaKey) {
        if (onSubmit) {
          e.preventDefault()
          onSubmit(current)
        } else if (singleLine) e.preventDefault()
      }
    }
  }

  // the mirror layer: the same text, invisible, with the mentions highlighted behind the real text
  const pieces: React.ReactNode[] = []
  {
    let at = 0
    const sorted = [...current.mentions].sort((a, b) => a.start - b.start)
    const caretIn = active ? caret : -1
    const withMarker = (from: number, to: number, key: string) => {
      if (caretIn >= from && caretIn <= to) {
        pieces.push(<span key={key}>{current.text.slice(from, caretIn)}</span>, <span key={`${key}-m`} ref={marker} aria-hidden="true">{"​"}</span>, <span key={`${key}-r`}>{current.text.slice(caretIn, to)}</span>)
      } else pieces.push(<span key={key}>{current.text.slice(from, to)}</span>)
    }
    for (const m of sorted) {
      if (m.start > at) withMarker(at, m.start, `t${at}`)
      const source = sources.find((s) => s.trigger === m.trigger)
      pieces.push(
        <mark key={`m${m.start}`} className={cn("rounded bg-primary/15 text-transparent [box-decoration-break:clone]", source?.className)}>
          {current.text.slice(m.start, m.end)}
        </mark>
      )
      at = m.end
    }
    if (at <= current.text.length) withMarker(at, current.text.length, `t${at}`)
    // a trailing newline would not take up a line in the layer without one more character
    pieces.push(<span key="end">{"​"}</span>)
  }

  const shown = !!active && (results.length > 0 || loading || (active.query.length > 0 && !loading))
  const sourceLabel = active?.source.label ?? msg("mention-input.suggestions", "Suggestions")

  const text = cn(
    "block w-full whitespace-pre-wrap break-words px-3 py-2 text-sm leading-6 [overflow-wrap:anywhere]",
    singleLine && "whitespace-pre"
  )

  return (
    <div data-slot="mention-input" className={cn("relative min-w-0", className)}>
      <div
        className={cn(
          "relative rounded-md border border-input bg-background shadow-xs transition-[border-color,box-shadow] duration-150 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 motion-reduce:transition-none",
          invalid && "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <div ref={layer} aria-hidden="true" data-slot="mention-input-layer" dir={dir} className={cn(text, "pointer-events-none absolute inset-0 overflow-hidden text-transparent")}>
          {pieces}
        </div>
        <textarea
          ref={area}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={shown}
          aria-controls={shown ? listId : undefined}
          aria-activedescendant={shown && results[index] ? `${id}-opt-${index}` : undefined}
          aria-haspopup="listbox"
          aria-invalid={invalid || undefined}
          data-slot="mention-input-field"
          dir={dir}
          rows={singleLine ? 1 : minRows}
          value={current.text}
          disabled={disabled}
          placeholder={placeholder}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          onSelect={(e) => {
            setCaret(e.currentTarget.selectionStart)
            onSelect?.(e)
          }}
          onBlur={(e) => {
            setOpen(false)
            onBlur?.(e)
          }}
          onFocus={() => setOpen(true)}
          onScroll={(e) => layer.current && (layer.current.scrollTop = e.currentTarget.scrollTop)}
          className={cn(text, "relative z-10 resize-none bg-transparent outline-none placeholder:text-muted-foreground", singleLine && "overflow-x-auto")}
          {...props}
        />
      </div>

      {shown ? (
        <div
          id={listId}
          role="listbox"
          aria-label={sourceLabel}
          data-slot="mention-input-list"
          style={{ top: pos?.top ?? "100%", insetInlineStart: Math.min(pos?.start ?? 0, 160) }}
          className="absolute z-50 max-h-60 w-64 overflow-y-auto rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg"
          onMouseDown={(e) => e.preventDefault()}
        >
          {results.map((o, i) => (
            <div
              key={o.id}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === index}
              aria-disabled={o.disabled || undefined}
              onMouseEnter={() => !o.disabled && setIndex(i)}
              onClick={() => choose(o)}
              className={cn("flex cursor-default items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm", i === index && "bg-accent text-accent-foreground", o.disabled && "opacity-50")}
            >
              {o.media ? <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium">{o.media}</span> : null}
              <span className="min-w-0">
                <span className="block truncate font-medium">{o.label}</span>
                {o.description ? <span className="block truncate text-xs text-muted-foreground">{o.description}</span> : null}
              </span>
            </div>
          ))}
          {loading ? (
            <div role="status" className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              {msg("mention-input.searching", "Searching")}
            </div>
          ) : null}
          {!loading && !results.length ? <div className="px-2 py-2 text-sm text-muted-foreground">{msg("mention-input.noMatches", "No matches for “{query}”", { query: active?.query ?? "" })}</div> : null}
        </div>
      ) : null}
      <span className="sr-only" role="status" aria-live="polite">
        {shown ? (loading ? msg("mention-input.searching", "Searching") : results.length ? msg("mention-input.count", { one: "{count} suggestion. {name} is highlighted.", other: "{count} suggestions. {name} is highlighted." }, { count: results.length, name: results[index]?.label ?? "" }) : msg("mention-input.noMatches", "No matches for “{query}”", { query: active?.query ?? "" })) : ""}
      </span>
    </div>
  )
}

export { MentionInput, type Mention, type MentionInputProps, type MentionOption, type MentionSource, type MentionValue }

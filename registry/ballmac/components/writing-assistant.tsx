// Ballmac UI: Writing Assistant. https://ui.ballmac.com/components/writing-assistant
"use client"

import * as React from "react"
import { Check, Pencil, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type SuggestionKind = "grammar" | "clarity" | "tone" | "length"

type WritingSuggestion = {
  id: string
  /** The exact words in the text to replace. The first match is the one marked. */
  find: string
  /** What to put there instead. */
  replace: string
  /** Why, in a sentence. */
  reason: string
  kind?: SuggestionKind
}

type WritingAssistantProps = Omit<React.ComponentProps<"section">, "title" | "onChange" | "defaultValue"> & {
  /** The text. Controlled. */
  text?: string
  /** The text to start with, for uncontrolled use. */
  defaultText?: string
  onTextChange?: (text: string) => void
  suggestions: WritingSuggestion[]
  title?: string
  /** Called when a suggestion is accepted, after the text has changed. */
  onAccept?: (suggestion: WritingSuggestion) => void
  /** Called when a suggestion is dismissed. */
  onDismiss?: (suggestion: WritingSuggestion) => void
}

const KIND: Record<SuggestionKind, { label: string; mark: string }> = {
  grammar: { label: "Grammar", mark: "decoration-wavy" },
  clarity: { label: "Clarity", mark: "decoration-dotted" },
  tone: { label: "Tone", mark: "decoration-dashed" },
  length: { label: "Length", mark: "decoration-double" },
}

type Segment = { text: string; suggestion?: WritingSuggestion }

/** Splits the text where suggestions apply. A suggestion whose words are not in the text, or overlap an earlier one, is left out. Exported for reuse and tests. */
function segmentText(text: string, suggestions: WritingSuggestion[]): { segments: Segment[]; applied: WritingSuggestion[] } {
  const found = suggestions
    .map((s) => ({ s, at: s.find ? text.indexOf(s.find) : -1 }))
    .filter((x) => x.at >= 0)
    .sort((a, b) => a.at - b.at)
  const segments: Segment[] = []
  const applied: WritingSuggestion[] = []
  let cursor = 0
  for (const { s, at } of found) {
    if (at < cursor) continue
    if (at > cursor) segments.push({ text: text.slice(cursor, at) })
    segments.push({ text: s.find, suggestion: s })
    applied.push(s)
    cursor = at + s.find.length
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) })
  return { segments, applied }
}

/**
 * Suggested edits to a piece of writing, shown in place: the words that could change are marked in the text (with a different underline for each kind,
 * so it never depends on colour), and each suggestion says what it would change, why, and what the text becomes. Accept makes the edit; Dismiss hides it;
 * Accept all does the lot. You can still edit the text yourself, and a suggestion whose words are no longer there quietly drops away.
 */
function WritingAssistant({ text: textProp, defaultText = "", onTextChange, suggestions, title, onAccept, onDismiss, className, ...props }: WritingAssistantProps) {
  const msg = useMessages()
  const id = React.useId()
  title ??= msg("writing-assistant.title", "Suggestions")
  const [inner, setInner] = React.useState(defaultText)
  const text = textProp ?? inner
  const [dismissed, setDismissed] = React.useState<string[]>([])
  const [selected, setSelected] = React.useState<string | null>(null)
  const [editing, setEditing] = React.useState(false)
  const [announce, setAnnounce] = React.useState("")
  const kindText = (k: SuggestionKind) => msg(`writing-assistant.kind.${k}`, KIND[k].label)

  const live = suggestions.filter((s) => !dismissed.includes(s.id))
  const { segments, applied } = React.useMemo(() => segmentText(text, live), [text, live])
  const current = applied.find((s) => s.id === selected) ?? applied[0]

  function setText(next: string) {
    if (textProp === undefined) setInner(next)
    onTextChange?.(next)
  }
  function accept(s: WritingSuggestion) {
    const at = text.indexOf(s.find)
    if (at < 0) return
    setText(text.slice(0, at) + s.replace + text.slice(at + s.find.length))
    setDismissed((d) => [...d, s.id])
    setSelected(null)
    setAnnounce(msg("writing-assistant.accepted", "Accepted: {text}", { text: s.replace }))
    onAccept?.(s)
  }
  function dismiss(s: WritingSuggestion) {
    setDismissed((d) => [...d, s.id])
    setSelected(null)
    setAnnounce(msg("writing-assistant.dismissed", "Dismissed: {text}", { text: s.find }))
    onDismiss?.(s)
  }
  function acceptAll() {
    // From the end to the start, so earlier edits do not move the later ones.
    let next = text
    const ordered = [...applied].sort((a, b) => next.indexOf(b.find) - next.indexOf(a.find))
    for (const s of ordered) {
      const at = next.indexOf(s.find)
      if (at >= 0) next = next.slice(0, at) + s.replace + next.slice(at + s.find.length)
    }
    setText(next)
    setDismissed((d) => [...d, ...ordered.map((s) => s.id)])
    setAnnounce(msg("writing-assistant.acceptedAll", "Accepted {count} suggestions", { count: ordered.length }))
    ordered.forEach((s) => onAccept?.(s))
  }

  return (
    <section data-slot="writing-assistant" aria-labelledby={`${id}-t`} className={cn("bg-card text-card-foreground grid gap-0 overflow-hidden rounded-xl border md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]", className)} {...props}>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-3 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 id={`${id}-t`} className="text-sm font-semibold">{msg("writing-assistant.draft", "Your draft")}</h3>
          <button type="button" aria-pressed={editing} onClick={() => setEditing((e) => !e)} className="inline-flex h-7 items-center gap-1.5 rounded-md border bg-background px-2.5 text-xs font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none">
            {editing ? <Check aria-hidden="true" className="size-3.5" /> : <Pencil aria-hidden="true" className="size-3.5" />}
            {editing ? msg("writing-assistant.done", "Done editing") : msg("writing-assistant.edit", "Edit the text")}
          </button>
        </div>
        {editing ? (
          <textarea aria-label={msg("writing-assistant.textLabel", "Your draft")} value={text} onChange={(e) => setText(e.target.value)} rows={9} className="min-h-48 w-full resize-y rounded-lg border bg-background px-3.5 py-3 text-[15px] leading-7 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50" />
        ) : (
          <p className="rounded-lg border bg-background/60 px-3.5 py-3 text-[15px] leading-7 whitespace-pre-wrap text-pretty">
            {segments.map((seg, i) =>
              seg.suggestion ? (
                <span
                  key={i}
                  role="button"
                  tabIndex={0}
                  aria-label={msg("writing-assistant.mark", "Suggestion, {kind}: {text}", { kind: kindText(seg.suggestion.kind ?? "clarity").toLowerCase(), text: seg.text })}
                  aria-pressed={current?.id === seg.suggestion.id}
                  onClick={() => setSelected(seg.suggestion!.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(seg.suggestion!.id) } }}
                  className={cn("cursor-pointer rounded-sm bg-foreground/[0.06] px-0.5 underline underline-offset-4 outline-none transition-colors [box-decoration-break:clone] hover:bg-foreground/10 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none", KIND[seg.suggestion.kind ?? "clarity"].mark, current?.id === seg.suggestion.id && "bg-foreground/15")}
                >{seg.text}</span>
              ) : (
                <React.Fragment key={i}>{seg.text}</React.Fragment>
              )
            )}
          </p>
        )}
      </div>

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-3 border-t p-4 sm:p-5 md:border-s md:border-t-0">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">{title} <span className="ms-1 rounded-full bg-muted px-2 py-px text-xs font-medium tabular-nums">{applied.length}</span></p>
          {applied.length > 1 && !editing && <button type="button" onClick={acceptAll} className="inline-flex h-7 items-center rounded-md bg-foreground px-2.5 text-xs font-medium text-background outline-none transition-colors hover:bg-foreground/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none">{msg("writing-assistant.acceptAll", "Accept all")}</button>}
        </div>
        {editing ? (
          <p className="text-sm text-muted-foreground">{msg("writing-assistant.whileEditing", "Suggestions come back when you finish editing.")}</p>
        ) : applied.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">{msg("writing-assistant.none", "No suggestions. This reads well.")}</p>
        ) : (
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-2.5">
            {applied.map((s) => {
              const on = current?.id === s.id
              return (
                <li key={s.id} className={cn("grid grid-cols-[minmax(0,1fr)] gap-2 rounded-lg border p-3 text-sm transition-colors motion-reduce:transition-none", on && "border-foreground bg-accent/40")}>
                  <button type="button" onClick={() => setSelected(s.id)} aria-label={msg("writing-assistant.showSuggestion", "Show: {text}", { text: s.find })} className="flex items-center gap-2 text-start outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                    <span className="rounded-full border px-2 py-px text-[11px] font-medium text-muted-foreground">{kindText(s.kind ?? "clarity")}</span>
                    <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{s.reason}</span>
                  </button>
                  <p className="leading-relaxed">
                    <del className="text-muted-foreground"><span className="sr-only">{msg("writing-assistant.remove", "Remove:")} </span>{s.find}</del>
                    {" "}
                    <ins className="font-medium no-underline"><span className="sr-only">{msg("writing-assistant.insert", "Use instead:")} </span>{s.replace || msg("writing-assistant.nothing", "(nothing)")}</ins>
                  </p>
                  {on && <p className="text-[13px] leading-snug text-muted-foreground">{s.reason}</p>}
                  <div className="flex gap-2">
                    <button type="button" onClick={() => accept(s)} className="inline-flex h-7 items-center gap-1 rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none"><Check aria-hidden="true" className="size-3.5" />{msg("writing-assistant.accept", "Accept")}<span className="sr-only">: {s.replace}</span></button>
                    <button type="button" onClick={() => dismiss(s)} className="inline-flex h-7 items-center gap-1 rounded-md border bg-background px-2.5 text-xs font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none"><X aria-hidden="true" className="size-3.5" />{msg("writing-assistant.dismiss", "Dismiss")}<span className="sr-only">: {s.find}</span></button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <p aria-live="polite" className="sr-only">{announce}</p>
    </section>
  )
}

export { WritingAssistant, segmentText, type SuggestionKind, type WritingAssistantProps, type WritingSuggestion }

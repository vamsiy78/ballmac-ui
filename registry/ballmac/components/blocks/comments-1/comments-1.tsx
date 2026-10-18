// Ballmac UI: Comments 1. https://ui.ballmac.com/blocks/comments-1
"use client"

import * as React from "react"
import { Check, CircleAlert, CornerDownRight, Loader2, MessageSquare, Pencil, SmilePlus, Trash2, Undo2 } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { CoverArt } from "@/components/ballmac/cover-art"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { Textarea } from "@/components/ballmac/textarea"
import { cn } from "@/lib/utils"

type Comments1Person = { id: string; name: string }
type Comments1Comment = {
  id: string
  author: string
  body: string
  /** ISO date and time in UTC. */
  at: string
  /** Emoji to the names of the people who reacted. */
  reactions?: Record<string, string[]>
  edited?: boolean
  replies?: Comments1Comment[]
  resolvedBy?: string
}

type Comments1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    comments?: Comments1Comment[]
    people?: Comments1Person[]
    /** Your name, so your comments can be edited and your reactions toggled. */
    me?: string
    /** An ISO date and time in UTC for "now". The block never reads the clock. */
    now?: string
    title?: string
    /** Called to post a comment or a reply. Return a promise; reject and it stays with Not posted and Retry. */
    onPost?: (input: { body: string; replyTo?: string }) => void | Promise<void>
    onEdit?: (id: string, body: string) => void
    onDelete?: (id: string) => void
    onReact?: (id: string, emoji: string, on: boolean) => void
    onResolve?: (id: string, resolved: boolean) => void
  }

const team: Comments1Person[] = [{ id: "p1", name: "Priya Shah" }, { id: "p2", name: "Theo Nakamura" }, { id: "p3", name: "Noor Haddad" }, { id: "p4", name: "Sam Okafor" }, { id: "p5", name: "Mara Ellison" }]

const sample: Comments1Comment[] = [
  { id: "c1", author: "Noor Haddad", at: "2026-10-18T08:15:00Z", body: "The new onboarding flow reads much better. @Priya Shah could we try the shorter headline on step two?", reactions: { "👍": ["Priya Shah", "Sam Okafor", "Theo Nakamura"], "🎉": ["Mara Ellison"] }, replies: [
    { id: "c1a", author: "Priya Shah", at: "2026-10-18T08:40:00Z", body: "Yes, shipping it to ten percent this afternoon.", reactions: { "👍": ["Noor Haddad"] } },
    { id: "c1b", author: "Sam Okafor", at: "2026-10-18T09:05:00Z", body: "Support will watch the queue for confusion. @Noor Haddad send me the new copy and I will update the help article." },
  ] },
  { id: "c2", author: "Theo Nakamura", at: "2026-10-17T16:30:00Z", body: "Heads up: the import step times out above 20,000 rows. Not a blocker for this release.", reactions: { "👀": ["Priya Shah"] }, edited: true, replies: [] },
  { id: "c3", author: "Mara Ellison", at: "2026-10-15T11:00:00Z", body: "Pricing page copy is approved. Closing this thread.", resolvedBy: "Mara Ellison", replies: [{ id: "c3a", author: "Sam Okafor", at: "2026-10-15T11:20:00Z", body: "Thanks, publishing now." }] },
]

const emojis = ["👍", "🎉", "❤️", "👀", "🙏"]

function ago(iso: string, now: string) {
  const s = Math.round((Date.parse(now) - Date.parse(iso)) / 1000)
  if (s < 60) return "just now"
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} ${h === 1 ? "hour" : "hours"} ago`
  const d = Math.round(h / 24)
  return d === 1 ? "yesterday" : `${d} days ago`
}

function Body({ text, people }: { text: string; people: Comments1Person[] }) {
  // Highlights each @Name that is a real person, keeping the rest as plain text.
  const names = people.map((p) => p.name).sort((a, b) => b.length - a.length)
  const out: React.ReactNode[] = []
  let rest = text
  let k = 0
  while (rest) {
    const at = rest.indexOf("@")
    if (at === -1) { out.push(rest); break }
    if (at > 0) out.push(rest.slice(0, at))
    const hit = names.find((n) => rest.slice(at + 1).startsWith(n))
    if (hit) { out.push(<span key={k++} className="bg-chart-1/15 rounded px-1 font-medium">@{hit}</span>); rest = rest.slice(at + 1 + hit.length) } else { out.push("@"); rest = rest.slice(at + 1) }
  }
  return <>{out}</>
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-5">
      <Skeleton className="h-32 rounded-2xl" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-24 flex-1 rounded-2xl" />
        </div>
      ))}
    </div>
  )
}

function Composer({ people, label, placeholder, onSubmit, onCancel, initial = "", cta = "Comment", autoFocus }: { people: Comments1Person[]; label: string; placeholder: string; onSubmit: (body: string) => void; onCancel?: () => void; initial?: string; cta?: string; autoFocus?: boolean }) {
  const id = React.useId()
  const [text, setText] = React.useState(initial)
  const [menu, setMenu] = React.useState<{ at: number; q: string } | null>(null)
  const [active, setActive] = React.useState(0)
  const ref = React.useRef<HTMLTextAreaElement>(null)
  const matches = menu ? people.filter((p) => p.name.toLowerCase().includes(menu.q.toLowerCase())).slice(0, 5) : []

  function change(v: string, caret: number) {
    setText(v)
    const m = v.slice(0, caret).match(/(?:^|\s)@([\p{L} ]{0,20})$/u)
    setMenu(m ? { at: caret - m[1]!.length - 1, q: m[1]! } : null)
    setActive(0)
  }
  function pick(p: Comments1Person) {
    if (!menu) return
    const caret = ref.current?.selectionStart ?? text.length
    const next = `${text.slice(0, menu.at)}@${p.name} ${text.slice(caret)}`
    setText(next)
    setMenu(null)
    requestAnimationFrame(() => { const pos = menu.at + p.name.length + 2; ref.current?.focus(); ref.current?.setSelectionRange(pos, pos) })
  }
  function submit() {
    const b = text.trim()
    if (!b) return
    onSubmit(b)
    setText("")
    setMenu(null)
  }
  return (
    <form onSubmit={(e) => { e.preventDefault(); submit() }} className="relative">
      <label htmlFor={`${id}-t`} className="sr-only">
        {label}
      </label>
      <Textarea
        id={`${id}-t`}
        ref={ref}
        autoFocus={autoFocus}
        rows={3}
        value={text}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={!!matches.length}
        aria-controls={`${id}-m`}
        aria-autocomplete="list"
        aria-activedescendant={matches.length ? `${id}-o${active}` : undefined}
        onChange={(e) => change(e.target.value, e.target.selectionStart)}
        onKeyDown={(e) => {
          if (matches.length) {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % matches.length) }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + matches.length) % matches.length) }
            else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); pick(matches[active]!); return }
            else if (e.key === "Escape") { e.preventDefault(); setMenu(null); return }
          }
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit() }
        }}
      />
      {matches.length ? (
        <ul id={`${id}-m`} role="listbox" aria-label="People to mention" className="bg-popover absolute start-2 z-20 mt-1 w-60 rounded-xl border p-1 shadow-lg">
          {matches.map((p, i) => (
            <li key={p.id} id={`${id}-o${i}`} role="option" aria-selected={i === active} onMouseDown={(e) => { e.preventDefault(); pick(p) }} className={cn("flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm", i === active && "bg-accent")}>
              <span aria-hidden="true" className="relative flex size-6 items-center justify-center overflow-hidden rounded-full border text-[9px] font-semibold">
                <CoverArt seed={p.name} variant="mesh" className="absolute inset-0" />
                <span className="relative">{p.name.split(" ").map((w) => w[0]).join("")}</span>
              </span>
              {p.name}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">Type @ to mention someone. Ctrl or Command + Enter sends.</p>
        <div className="flex gap-2">
          {onCancel ? (
            <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
          <Button type="submit" size="sm" disabled={!text.trim()}>
            {cta}
          </Button>
        </div>
      </div>
    </form>
  )
}

/**
 * A comment thread you would want to work in: a composer where typing @ offers people (arrow keys and Enter pick one), comments and replies with how long
 * ago they were written, emoji reactions that count and toggle, editing and deleting your own, and a thread you can resolve and bring back. A comment you post
 * appears at once, and if it cannot be saved it stays with Not posted and Retry.
 */
function Comments1({ comments: commentsProp = sample, people = team, me = "Sam Okafor", now = "2026-10-18T10:00:00Z", title = "Discussion", onPost, onEdit, onDelete, onReact, onResolve, state = "ready", onRetry, emptyState, errorState, className, ...props }: Comments1Props) {
  const id = React.useId()
  const [items, setItems] = React.useState<(Comments1Comment & { pending?: boolean; failed?: boolean })[]>(commentsProp)
  React.useEffect(() => setItems(commentsProp), [commentsProp])
  const list = state === "empty" ? [] : items
  const [replyTo, setReplyTo] = React.useState<string | null>(null)
  const [editing, setEditing] = React.useState<string | null>(null)
  const [openResolved, setOpenResolved] = React.useState<Set<string>>(new Set())
  const [picker, setPicker] = React.useState<string | null>(null)
  const [announce, setAnnounce] = React.useState("")
  const seq = React.useRef(0)

  const update = (cid: string, fn: (c: Comments1Comment) => Comments1Comment) => setItems((xs) => xs.map((c) => (c.id === cid ? fn(c) : { ...c, replies: c.replies?.map((r) => (r.id === cid ? fn(r) : r)) })))
  async function deliver(cid: string, body: string, parent?: string) {
    try {
      await onPost?.({ body, replyTo: parent })
      update(cid, (c) => ({ ...c, pending: false, failed: false }) as Comments1Comment)
    } catch {
      update(cid, (c) => ({ ...c, pending: false, failed: true }) as Comments1Comment)
    }
  }
  function post(body: string, parent?: string) {
    const c: Comments1Comment & { pending?: boolean } = { id: `n${++seq.current}`, author: me, at: now, body, replies: [], pending: true }
    if (parent) setItems((xs) => xs.map((x) => (x.id === parent ? { ...x, replies: [...(x.replies ?? []), c] } : x)))
    else setItems((xs) => [c, ...xs])
    setReplyTo(null)
    setAnnounce(parent ? "Reply posted" : "Comment posted")
    void deliver(c.id, body, parent)
  }
  function react(c: Comments1Comment, emoji: string) {
    const names = c.reactions?.[emoji] ?? []
    const on = !names.includes(me)
    update(c.id, (x) => ({ ...x, reactions: { ...x.reactions, [emoji]: on ? [...names, me] : names.filter((n) => n !== me) } }))
    onReact?.(c.id, emoji, on)
    setPicker(null)
  }

  const one = (c: Comments1Comment & { pending?: boolean; failed?: boolean }, reply = false) => {
    const mine = c.author === me
    const r = Object.entries(c.reactions ?? {}).filter(([, n]) => n.length)
    return (
      <li key={c.id} className="flex gap-3">
        <span aria-hidden="true" className={cn("relative mt-0.5 flex shrink-0 items-center justify-center overflow-hidden rounded-full border font-semibold", reply ? "size-8 text-[10px]" : "size-10 text-xs")}>
          <CoverArt seed={c.author} variant="mesh" className="absolute inset-0" />
          <span className="relative">{c.author.split(" ").map((w) => w[0]).join("")}</span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="bg-card rounded-2xl border px-4 py-3">
            <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
              <span className="font-semibold">{c.author}</span>
              <span className="text-muted-foreground text-xs">
                {ago(c.at, now)}
                {c.edited ? " · edited" : ""}
              </span>
            </p>
            {editing === c.id ? (
              <div className="mt-2">
                <Composer people={people} label="Edit your comment" placeholder="" initial={c.body} cta="Save" autoFocus onCancel={() => setEditing(null)} onSubmit={(b) => { update(c.id, (x) => ({ ...x, body: b, edited: true })); onEdit?.(c.id, b); setEditing(null) }} />
              </div>
            ) : (
              <p className="mt-1 text-sm leading-relaxed text-pretty whitespace-pre-line">
                <Body text={c.body} people={people} />
              </p>
            )}
          </div>
          {c.pending ? (
            <p className="text-muted-foreground mt-1.5 flex items-center gap-1.5 ps-2 text-xs">
              <Loader2 aria-hidden="true" className="size-3 animate-spin motion-reduce:animate-none" />
              Posting
            </p>
          ) : null}
          {c.failed ? (
            <p role="alert" className="mt-1.5 flex items-center gap-2 ps-2 text-xs">
              <CircleAlert aria-hidden="true" className="size-3.5" />
              Not posted.
              <button type="button" onClick={() => { update(c.id, (x) => ({ ...x, pending: true, failed: false }) as Comments1Comment); void deliver(c.id, c.body) }} className="focus-visible:ring-ring/50 rounded-sm font-semibold underline underline-offset-2 outline-none focus-visible:ring-[3px]">
                Retry
              </button>
            </p>
          ) : null}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 ps-1">
            {r.map(([emoji, names]) => {
              const on = names.includes(me)
              return (
                <button key={emoji} type="button" aria-pressed={on} aria-label={`${emoji} ${names.length}: ${names.join(", ")}`} onClick={() => react(c, emoji)} className={cn("focus-visible:ring-ring/50 flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs outline-none focus-visible:ring-[3px]", on ? "bg-chart-1/15 border-chart-1/40" : "hover:bg-accent")}>
                  <span aria-hidden="true">{emoji}</span>
                  <span className="tabular-nums">{names.length}</span>
                </button>
              )
            })}
            <span className="relative">
              <Button variant="ghost" size="icon" aria-label="Add a reaction" aria-expanded={picker === c.id} onClick={() => setPicker(picker === c.id ? null : c.id)}>
                <SmilePlus aria-hidden="true" />
              </Button>
              {picker === c.id ? (
                <span role="group" aria-label="Choose a reaction" className="bg-popover absolute start-0 top-full z-20 mt-1 flex gap-0.5 rounded-xl border p-1 shadow-lg">
                  {emojis.map((e) => (
                    <button key={e} type="button" aria-label={`React with ${e}`} onClick={() => react(c, e)} className="hover:bg-accent focus-visible:ring-ring/50 rounded-lg px-2 py-1.5 text-lg outline-none focus-visible:ring-[3px]">
                      {e}
                    </button>
                  ))}
                </span>
              ) : null}
            </span>
            {!reply ? (
              <Button variant="ghost" size="sm" onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}>
                <CornerDownRight aria-hidden="true" className="rtl:-scale-x-100" />
                Reply
              </Button>
            ) : null}
            {mine ? (
              <>
                <Button variant="ghost" size="icon" aria-label={`Edit your comment from ${ago(c.at, now)}`} onClick={() => setEditing(c.id)}>
                  <Pencil aria-hidden="true" />
                </Button>
                <Button variant="ghost" size="icon" aria-label={`Delete your comment from ${ago(c.at, now)}`} onClick={() => { setItems((xs) => (reply ? xs.map((x) => ({ ...x, replies: x.replies?.filter((y) => y.id !== c.id) })) : xs.filter((x) => x.id !== c.id))); onDelete?.(c.id); setAnnounce("Comment deleted") }}>
                  <Trash2 aria-hidden="true" />
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </li>
    )
  }

  const content = (
    <div className="grid gap-8">
      <div className="bg-card rounded-2xl border p-4 sm:p-5">
        <Composer people={people} label="Write a comment" placeholder="Add to the discussion…" onSubmit={(b) => post(b)} />
      </div>
      {!list.length ? (
        <div className="rounded-2xl border border-dashed px-6 py-14 text-center">
          <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
            <MessageSquare className="size-6" />
          </span>
          <h3 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "No comments yet"}</h3>
          <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm text-pretty">{emptyState?.description ?? "Start the conversation. Mention a teammate with @ to bring them in."}</p>
          {emptyState?.action}
        </div>
      ) : (
        <ul className="grid gap-7">
          {list.map((c) => {
            const resolved = !!c.resolvedBy
            const open = openResolved.has(c.id)
            return (
              <li key={c.id}>
                {resolved && !open ? (
                  <div className="bg-muted/50 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm">
                    <p className="flex items-center gap-2">
                      <Check aria-hidden="true" className="text-chart-2 size-4" />
                      Resolved by {c.resolvedBy} · {c.author}&rsquo;s thread, {(c.replies?.length ?? 0) + 1} comments
                    </p>
                    <Button variant="outline" size="sm" aria-expanded={false} onClick={() => setOpenResolved(new Set(openResolved).add(c.id))}>
                      Show
                    </Button>
                  </div>
                ) : (
                  <article aria-label={`Thread by ${c.author}`}>
                    <ul className="grid gap-4">
                      {one(c)}
                      {c.replies?.length ? (
                        <li>
                          <ul className="border-border ms-5 grid gap-4 border-s ps-6">{c.replies.map((r) => one(r, true))}</ul>
                        </li>
                      ) : null}
                    </ul>
                    {replyTo === c.id ? (
                      <div className="ms-11 mt-4">
                        <Composer people={people} label={`Reply to ${c.author}`} placeholder={`Reply to ${c.author.split(" ")[0]}…`} cta="Reply" autoFocus onCancel={() => setReplyTo(null)} onSubmit={(b) => post(b, c.id)} />
                      </div>
                    ) : null}
                    <div className="ms-11 mt-3">
                      <Button variant="ghost" size="sm" onClick={() => { const next = !resolved; update(c.id, (x) => ({ ...x, resolvedBy: next ? me : undefined })); if (!next) setOpenResolved((s) => { const n = new Set(s); n.delete(c.id); return n }); onResolve?.(c.id, next); setAnnounce(next ? "Thread resolved" : "Thread reopened") }}>
                        {resolved ? <Undo2 aria-hidden="true" className="rtl:-scale-x-100" /> : <Check aria-hidden="true" />}
                        {resolved ? "Reopen thread" : "Resolve thread"}
                      </Button>
                    </div>
                  </article>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )

  return (
    <section data-slot="comments-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-3xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <h2 id={`${id}-title`} className="mb-6 text-2xl font-semibold tracking-[-0.03em]">
        {title} <span className="text-muted-foreground font-normal tabular-nums">· {list.reduce((n, c) => n + 1 + (c.replies?.length ?? 0), 0)}</span>
      </h2>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading the discussion" loading={<Skel />} error={{ title: errorState?.title ?? "The discussion could not be loaded", description: errorState?.description ?? "Nothing was changed. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </section>
  )
}

export { Comments1, type Comments1Props, type Comments1Comment, type Comments1Person }

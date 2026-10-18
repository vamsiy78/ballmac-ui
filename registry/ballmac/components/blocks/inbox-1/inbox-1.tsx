// Ballmac UI: Inbox 1. https://ui.ballmac.com/blocks/inbox-1
"use client"

import * as React from "react"
import { Archive, AtSign, BellOff, Check, CheckCheck, CircleDot, CreditCard, MessageSquare, Settings, ShieldCheck, Sparkles, Undo2, UserPlus } from "lucide-react"

import { BlurFadeGroup } from "@/components/ballmac/blur-fade"
import { Button } from "@/components/ballmac/button"
import { Kbd } from "@/components/ballmac/kbd"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Inbox1Kind = "mention" | "comment" | "approval" | "invite" | "system" | "billing"

type Inbox1Item = {
  id: string
  kind: Inbox1Kind
  /** Who did it. Leave out for something the system did. */
  actor?: string
  /** What happened, as a phrase that follows the actor: "mentioned you in". For the system, the whole sentence. */
  action: string
  /** The thing it happened to, shown in bold after the action. */
  target?: string
  /** A quoted excerpt, such as the comment itself. */
  preview?: string
  /** The group heading ("Today", "Yesterday", "Earlier this week"). Items with the same day are grouped. */
  day: string
  /** Already written for people ("09:42"). */
  time: string
  unread?: boolean
  /** Inline buttons for something that needs an answer. */
  actions?: { primary: string; secondary?: string }
  /** What happened after it was answered ("Approved"). Hides the buttons. */
  outcome?: string
  href?: string
}

type Inbox1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    items?: Inbox1Item[]
    title?: string
    /** Called when an item is opened with a click or Enter. Opening marks it read. */
    onOpen?: (item: Inbox1Item) => void
    /** Called when an item is marked read or unread. */
    onMarkRead?: (id: string, read: boolean) => void
    /** Called straight away when an item is archived. The block offers Undo for a few seconds. */
    onArchive?: (id: string) => void
    /** Called when Undo is pressed, with the item to put back. */
    onRestore?: (item: Inbox1Item) => void
    /** Called by "Mark all as read". */
    onMarkAllRead?: () => void
    /** Called when an inline button is pressed. The block shows its outcome straight away. */
    onAction?: (id: string, which: "primary" | "secondary") => void
    /** Called by the settings button. Without it the button is hidden. */
    onSettings?: () => void
    /** The view shown first. */
    defaultTab?: "all" | "unread" | "mentions"
  }

const kinds: Record<Inbox1Kind, { icon: typeof AtSign; tile: string; label: string }> = {
  mention: { icon: AtSign, tile: "bg-chart-1/20", label: "Mention" },
  comment: { icon: MessageSquare, tile: "bg-chart-4/20", label: "Comment" },
  approval: { icon: ShieldCheck, tile: "bg-chart-3/25", label: "Approval" },
  invite: { icon: UserPlus, tile: "bg-chart-2/20", label: "Invitation" },
  system: { icon: Sparkles, tile: "bg-chart-5/20", label: "Update" },
  billing: { icon: CreditCard, tile: "bg-chart-3/25", label: "Billing" },
}

const sample: Inbox1Item[] = [
  { id: "n1", kind: "approval", actor: "Support agent", action: "wants to refund $129.00 on", target: "order 4821", preview: "The second charge is a duplicate made 40 seconds after the first, with the same card and amount.", day: "Today", time: "09:42", unread: true, actions: { primary: "Approve", secondary: "Deny" } },
  { id: "n2", kind: "mention", actor: "Priya Shah", action: "mentioned you in", target: "Launch checklist", preview: "@Jordan can you approve the announcement email before noon?", day: "Today", time: "09:12", unread: true },
  { id: "n3", kind: "comment", actor: "Alex Kim", action: "commented on", target: "Release notes 2.5", preview: "Screenshots still need the new sidebar. I’ll add them after lunch.", day: "Today", time: "08:30", unread: true },
  { id: "n4", kind: "invite", actor: "Mara Ellison", action: "invited you to join", target: "Design systems", day: "Yesterday", time: "17:20", actions: { primary: "Accept", secondary: "Decline" } },
  { id: "n5", kind: "system", action: "Your data export is ready to download", preview: "142 MB · available for 7 days", day: "Yesterday", time: "11:02" },
  { id: "n6", kind: "mention", actor: "Sam Okafor", action: "mentioned you in", target: "Support macros", preview: "@Jordan this one needs your sign-off too.", day: "Yesterday", time: "10:15" },
  { id: "n7", kind: "billing", action: "Your invoice for October is ready", preview: "$296.10 · paid with Visa ending 4242", day: "Earlier this week", time: "Mon", },
  { id: "n8", kind: "comment", actor: "Theo Nakamura", action: "replied in", target: "Webhook retries", preview: "Moving the backoff to the queue makes this much simpler.", day: "Earlier this week", time: "Mon" },
]

const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2)

function InboxSkeleton() {
  return (
    <div className="grid gap-3" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-4 rounded-xl border p-4">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <Skeleton className="h-3 w-10" />
        </div>
      ))}
    </div>
  )
}

/**
 * A notifications page: grouped by day with unread marked by an accent and a dot, mentions and comments with their excerpts, requests
 * you can answer without leaving (Approve, Deny, Accept, Decline), keyboard triage (J and K, E to archive, U for read or unread), and
 * an Undo bar after archiving.
 */
function Inbox1({
  items: itemsProp = sample,
  title = "Notifications",
  onOpen,
  onMarkRead,
  onArchive,
  onRestore,
  onMarkAllRead,
  onAction,
  onSettings,
  defaultTab = "all",
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Inbox1Props) {
  const id = React.useId()
  const listRef = React.useRef<HTMLDivElement>(null)
  const [items, setItems] = React.useState(itemsProp)
  React.useEffect(() => setItems(itemsProp), [itemsProp])
  const [tab, setTab] = React.useState<"all" | "unread" | "mentions">(defaultTab)
  const [undo, setUndo] = React.useState<{ item: Inbox1Item; index: number } | null>(null)
  const [announce, setAnnounce] = React.useState("")
  const ready = state === "ready" || state === "empty"
  const unreadCount = items.filter((i) => i.unread).length

  React.useEffect(() => {
    if (!undo) return
    const t = setTimeout(() => setUndo(null), 7000)
    return () => clearTimeout(t)
  }, [undo])

  const visible = state === "empty" ? [] : items.filter((i) => (tab === "all" ? true : tab === "unread" ? i.unread : i.kind === "mention"))
  const days = visible.reduce<{ day: string; items: Inbox1Item[] }[]>((acc, i) => {
    const last = acc[acc.length - 1]
    if (last && last.day === i.day) last.items.push(i)
    else acc.push({ day: i.day, items: [i] })
    return acc
  }, [])

  const setRead = (item: Inbox1Item, read: boolean) => {
    setItems((l) => l.map((x) => (x.id === item.id ? { ...x, unread: !read } : x)))
    onMarkRead?.(item.id, read)
    setAnnounce(read ? "Marked as read" : "Marked as unread")
  }

  function archive(item: Inbox1Item) {
    const index = items.findIndex((x) => x.id === item.id)
    // move focus to a neighbour so keyboard triage can carry on
    const mains = [...(listRef.current?.querySelectorAll<HTMLElement>("[data-inbox-main]") ?? [])]
    const at = mains.findIndex((m) => m.dataset.inboxMain === item.id)
    const next = mains[at + 1] ?? mains[at - 1]
    setItems((l) => l.filter((x) => x.id !== item.id))
    onArchive?.(item.id)
    setUndo({ item, index })
    setAnnounce("Archived. Undo is available for a few seconds.")
    requestAnimationFrame(() => next?.focus())
  }

  function restore() {
    if (!undo) return
    const { item, index } = undo
    setItems((l) => [...l.slice(0, index), item, ...l.slice(index)])
    onRestore?.(item)
    setUndo(null)
    setAnnounce("Restored")
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    const target = e.target as HTMLElement
    const key = e.key.toLowerCase()
    const mains = [...(listRef.current?.querySelectorAll<HTMLElement>("[data-inbox-main]") ?? [])]
    const at = mains.findIndex((m) => m.dataset.inboxMain === (target.closest("[data-inbox-row]") as HTMLElement | null)?.dataset.inboxRow)
    if (key === "j" || key === "k" || key === "arrowdown" || key === "arrowup") {
      if (at === -1 && target.tagName === "BUTTON" && !target.hasAttribute("data-inbox-main")) return
      e.preventDefault()
      const delta = key === "j" || key === "arrowdown" ? 1 : -1
      mains[Math.max(0, Math.min(mains.length - 1, (at === -1 ? 0 : at) + delta))]?.focus()
      return
    }
    const row = target.closest<HTMLElement>("[data-inbox-row]")
    const item = items.find((i) => i.id === row?.dataset.inboxRow)
    if (!item) return
    if (key === "e") {
      e.preventDefault()
      archive(item)
    } else if (key === "u") {
      e.preventDefault()
      setRead(item, !!item.unread)
    }
  }

  const empty = ready && visible.length === 0
  const emptyCopy =
    tab === "unread"
      ? { title: "No unread notifications", description: "You have read everything. New activity will show up here." }
      : tab === "mentions"
        ? { title: "Nobody has mentioned you", description: "When someone @mentions you, it lands here first." }
        : { title: "You’re all caught up", description: "Nothing new right now. Enjoy the quiet." }

  const content = (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <SegmentedControl value={tab} onValueChange={(v) => setTab(v as typeof tab)} aria-label="Show" size="sm" disabled={!ready}>
          <SegmentedControlItem value="all">All</SegmentedControlItem>
          <SegmentedControlItem value="unread">Unread{ready && unreadCount ? ` ${unreadCount}` : ""}</SegmentedControlItem>
          <SegmentedControlItem value="mentions">Mentions</SegmentedControlItem>
        </SegmentedControl>
        <p className="text-muted-foreground ms-auto hidden items-center gap-1.5 text-xs md:flex">
          <Kbd>J</Kbd>
          <Kbd>K</Kbd> move <span aria-hidden="true">·</span> <Kbd>E</Kbd> archive <span aria-hidden="true">·</span> <Kbd>U</Kbd> read
        </p>
      </div>

      {empty ? (
        <div className="bg-card rounded-2xl border px-6 py-16 text-center">
          <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
            {tab === "all" ? <BellOff className="size-6" /> : <CheckCheck className="size-6" />}
          </span>
          <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? emptyCopy.title}</h2>
          <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm text-pretty">{emptyState?.description ?? emptyCopy.description}</p>
          {emptyState?.action}
        </div>
      ) : (
        <div ref={listRef} onKeyDown={onKeyDown} className="grid gap-8">
          {days.map((d) => (
            <section key={d.day} aria-labelledby={`${id}-${d.day}`}>
              <h2 id={`${id}-${d.day}`} className="text-muted-foreground mb-3 text-xs font-medium">
                {d.day}
              </h2>
              <BlurFadeGroup role="list" itemAs="li" stagger={0.04} item={{ direction: "up", offset: 6, blur: 3 }} className="grid list-none grid-cols-1 gap-2">
                {d.items.map((n) => {
                  const K = kinds[n.kind]
                  const human = !!n.actor && (n.kind === "mention" || n.kind === "comment" || n.kind === "invite")
                  return (
                    <div
                      key={n.id}
                      data-inbox-row={n.id}
                      className={cn(
                        "group/row focus-within:ring-ring/50 relative flex gap-4 rounded-xl border p-4 transition-colors duration-200 focus-within:ring-[3px]",
                        n.unread ? "bg-card border-foreground/15" : "bg-card/50 hover:bg-card",
                        "hover:border-foreground/25"
                      )}
                    >
                      {n.unread ? <span aria-hidden="true" className="bg-chart-1 absolute inset-y-4 -start-px w-[3px] rounded-full" /> : null}
                      <span aria-hidden="true" className={cn("flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold [&_svg]:size-[1.15rem]", K.tile)}>
                        {human ? initials(n.actor!) : <K.icon />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-relaxed text-pretty">
                          <button
                            type="button"
                            data-inbox-main={n.id}
                            onClick={() => {
                              if (n.unread) setRead(n, true)
                              onOpen?.(n)
                            }}
                            className="rounded-sm text-start outline-none after:absolute after:inset-0 after:content-['']"
                          >
                            {n.unread ? <><span className="sr-only">Unread.</span>{" "}</> : null}
                            <span className="sr-only">{K.label}: </span>
                            {n.actor ? (
                              <>
                                <strong className="font-semibold">{n.actor}</strong>{" "}
                              </>
                            ) : null}
                            <span className={cn(n.actor ? "text-muted-foreground" : "font-medium")}>{n.action}</span>
                            {n.target ? (
                              <>
                                {" "}
                                <strong className="font-semibold">{n.target}</strong>
                              </>
                            ) : null}
                          </button>
                        </p>
                        {n.preview ? (
                          <p className={cn("text-muted-foreground mt-1.5 line-clamp-2 text-[13px] text-pretty", n.kind !== "system" && n.kind !== "billing" && "border-border border-s-2 ps-3")}>{n.preview}</p>
                        ) : null}
                        {n.actions && !n.outcome ? (
                          <div className="relative z-10 mt-3 flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setItems((l) => l.map((x) => (x.id === n.id ? { ...x, outcome: n.actions!.primary === "Approve" ? "Approved" : n.actions!.primary === "Accept" ? "Accepted" : n.actions!.primary, unread: false } : x)))
                                onAction?.(n.id, "primary")
                                setAnnounce(`${n.actions!.primary} confirmed`)
                              }}
                            >
                              {n.actions.primary}
                            </Button>
                            {n.actions.secondary ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setItems((l) => l.map((x) => (x.id === n.id ? { ...x, outcome: n.actions!.secondary === "Deny" ? "Denied" : n.actions!.secondary === "Decline" ? "Declined" : n.actions!.secondary, unread: false } : x)))
                                  onAction?.(n.id, "secondary")
                                  setAnnounce(`${n.actions!.secondary} confirmed`)
                                }}
                              >
                                {n.actions.secondary}
                              </Button>
                            ) : null}
                          </div>
                        ) : null}
                        {n.outcome ? (
                          <p className="mt-2.5 flex items-center gap-1.5 text-xs font-medium">
                            <Check aria-hidden="true" className="size-3.5" />
                            {n.outcome}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className="text-muted-foreground text-xs tabular-nums">{n.time}</span>
                        <span className="relative z-10 flex gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within/row:opacity-100 sm:group-hover/row:opacity-100">
                          <Button variant="ghost" size="icon-sm" aria-label={n.unread ? "Mark as read" : "Mark as unread"} aria-pressed={!n.unread} onClick={() => setRead(n, !!n.unread)}>
                            {n.unread ? <Check aria-hidden="true" /> : <CircleDot aria-hidden="true" />}
                          </Button>
                          <Button variant="ghost" size="icon-sm" aria-label="Archive" onClick={() => archive(n)}>
                            <Archive aria-hidden="true" />
                          </Button>
                        </span>
                      </div>
                    </div>
                  )
                })}
              </BlurFadeGroup>
            </section>
          ))}
        </div>
      )}
    </>
  )

  return (
    <section data-slot="inbox-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-3xl px-4 py-8 pb-24 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-6 flex flex-wrap items-center gap-3">
        <h1 id={`${id}-title`} className="flex items-center gap-3 text-3xl font-semibold tracking-[-0.035em]">
          {title}
          {ready && unreadCount ? (
            <span className="bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums">
              {unreadCount}
              {" "}<span className="sr-only">unread</span>
            </span>
          ) : null}
        </h1>
        <div className="ms-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!ready || !unreadCount}
            onClick={() => {
              setItems((l) => l.map((x) => ({ ...x, unread: false })))
              onMarkAllRead?.()
              setAnnounce("All marked as read")
            }}
          >
            <CheckCheck aria-hidden="true" />
            Mark all as read
          </Button>
          {onSettings ? (
            <Button variant="ghost" size="icon" aria-label="Notification settings" onClick={onSettings}>
              <Settings aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </header>

      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading notifications" loading={<InboxSkeleton />} error={{ title: errorState?.title ?? "Notifications could not be loaded", description: errorState?.description ?? "Nothing was lost. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>

      {undo ? (
        <div role="status" className="bg-popover text-popover-foreground fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-md items-center gap-3 rounded-xl border p-3 ps-4 shadow-lg">
          <p className="min-w-0 flex-1 truncate text-sm">Archived “{undo.item.target ?? undo.item.action}”</p>
          <Button variant="outline" size="sm" onClick={restore}>
            <Undo2 aria-hidden="true" className="rtl:-scale-x-100" />
            Undo
          </Button>
        </div>
      ) : null}
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </section>
  )
}

export { Inbox1, type Inbox1Props, type Inbox1Item, type Inbox1Kind }

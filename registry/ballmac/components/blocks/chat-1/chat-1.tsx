// Ballmac UI: Chat 1. https://ui.ballmac.com/blocks/chat-1
"use client"

import * as React from "react"
import { Hash, Lock, MessageSquare, MessagesSquare, SendHorizontal, SmilePlus, X } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ballmac/avatar"
import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Chat1Person = { id: string; name: string; status?: "online" | "away" | "offline" }

type Chat1Channel = {
  id: string
  name: string
  kind?: "channel" | "dm"
  private?: boolean
  topic?: string
  unread?: number
  /** For a direct message: the other person's id. */
  personId?: string
}

type Chat1Message = {
  id: string
  authorId: string
  text: string
  /** The group heading, already written for people ("Today"). */
  day: string
  /** Already written for people ("09:41"). */
  time: string
  reactions?: { emoji: string; count: number; mine?: boolean }[]
  /** Replies in the thread, oldest first. */
  replies?: Chat1Message[]
  /** Set while a message you sent is on its way, or when it failed. */
  delivery?: "sending" | "failed"
}

type Chat1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    people?: Chat1Person[]
    /** The person using the app. */
    meId?: string
    channels?: Chat1Channel[]
    /** Messages by channel id, oldest first. */
    messages?: Record<string, Chat1Message[]>
    defaultChannelId?: string
    /** A message whose thread is open at first. */
    defaultThreadId?: string
    /** Message id before which a "New" divider is drawn, by channel id. */
    firstUnread?: Record<string, string>
    /** Called with a new message (and the thread it belongs to). Throw to mark it not sent; it can then be retried. Defaults to a short delay. */
    onSend?: (message: { channelId: string; text: string; threadId?: string }) => void | Promise<void>
    /** Called when a reaction is added or removed. */
    onReact?: (reaction: { channelId: string; messageId: string; emoji: string; on: boolean }) => void
    /** Called when the channel changes, to load its messages. */
    onChannelChange?: (channelId: string) => void
  }

const quick = ["👍", "🎉", "❤️", "👀", "✅", "😄"]

const samplePeople: Chat1Person[] = [
  { id: "me", name: "Jordan Lee", status: "online" },
  { id: "priya", name: "Priya Shah", status: "online" },
  { id: "alex", name: "Alex Kim", status: "away" },
  { id: "sam", name: "Sam Okafor", status: "offline" },
]

const sampleChannels: Chat1Channel[] = [
  { id: "launch", name: "launch", topic: "Everything for the 2.5 release on Thursday", unread: 3 },
  { id: "design", name: "design", topic: "Reviews, critiques and work in progress" },
  { id: "leads", name: "leads", private: true, topic: "Team leads only" },
  { id: "dm-priya", name: "Priya Shah", kind: "dm", personId: "priya", unread: 1 },
  { id: "dm-alex", name: "Alex Kim", kind: "dm", personId: "alex" },
]

const sampleMessages: Record<string, Chat1Message[]> = {
  launch: [
    { id: "m1", authorId: "alex", day: "Yesterday", time: "16:02", text: "Release notes draft is in the doc. I kept it to the five changes people asked for most." },
    { id: "m2", authorId: "alex", day: "Yesterday", time: "16:03", text: "Screenshots still need the new sidebar.", reactions: [{ emoji: "👀", count: 1 }] },
    {
      id: "m3",
      authorId: "priya",
      day: "Today",
      time: "09:12",
      text: "The migration ran on staging in 4 minutes with no errors. I think we’re clear for Thursday.",
      reactions: [{ emoji: "🎉", count: 3, mine: true }, { emoji: "✅", count: 2 }],
      replies: [
        { id: "r1", authorId: "me", day: "Today", time: "09:20", text: "Great. Can you post the timing on the release checklist?" },
        { id: "r2", authorId: "priya", day: "Today", time: "09:24", text: "Done, it’s under step 4." },
      ],
    },
    { id: "m4", authorId: "sam", day: "Today", time: "09:40", text: "Support macros are updated for the new export flow." },
    { id: "m5", authorId: "priya", day: "Today", time: "09:41", text: "@Jordan Lee can you approve the announcement email before noon?" },
  ],
  design: [],
  leads: [{ id: "l1", authorId: "priya", day: "Monday", time: "11:00", text: "Hiring plan for Q1 is in the shared folder." }],
  "dm-priya": [{ id: "d1", authorId: "priya", day: "Today", time: "08:55", text: "Got a minute after standup?" }],
  "dm-alex": [],
}

const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2)

function MessagesSkeleton() {
  return (
    <div className="grid gap-5 p-4" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3.5" style={{ width: `${80 - i * 15}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/** The message box: Enter sends, Shift+Enter adds a line, and typing @ suggests people to mention. */
function Composer({ people, placeholder, onSend, label }: { people: Chat1Person[]; placeholder: string; onSend: (text: string) => void; label: string }) {
  const id = React.useId()
  const [text, setText] = React.useState("")
  const [active, setActive] = React.useState(0)
  const mention = /(?:^|\s)@([\w]*)$/.exec(text)
  const matches = mention ? people.filter((p) => p.name.toLowerCase().startsWith(mention[1]!.toLowerCase())).slice(0, 5) : []
  const open = matches.length > 0
  const insert = (p: Chat1Person) => {
    setText((t) => t.replace(/@([\w]*)$/, `@${p.name} `))
    setActive(0)
  }
  const send = () => {
    const value = text.trim()
    if (!value) return
    onSend(value)
    setText("")
  }
  return (
    <div className="relative">
      {open ? (
        <ul id={`${id}-people`} role="listbox" aria-label="People to mention" className="bg-popover absolute bottom-full start-0 z-10 mb-2 w-60 overflow-hidden rounded-lg border p-1 shadow-lg">
          {matches.map((p, i) => (
            <li
              key={p.id}
              id={`${id}-p-${p.id}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault()
                insert(p)
              }}
              className={cn("flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm", i === active && "bg-accent")}
            >
              <Avatar className="size-5">
                <AvatarFallback className="text-[9px]">{initials(p.name)}</AvatarFallback>
              </Avatar>
              {p.name}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="bg-background focus-within:ring-ring/50 flex items-end gap-2 rounded-xl border p-2 ps-3 focus-within:ring-[3px]">
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label={label}
          role={open ? "combobox" : undefined}
          aria-expanded={open ? true : undefined}
          aria-controls={open ? `${id}-people` : undefined}
          aria-activedescendant={open ? `${id}-p-${matches[active]?.id}` : undefined}
          aria-describedby={`${id}-hint`}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (open) {
              if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault()
                setActive((a) => (a + (e.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length)
                return
              }
              if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault()
                insert(matches[active] ?? matches[0]!)
                return
              }
            }
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              send()
            }
          }}
          className="placeholder:text-muted-foreground max-h-32 min-h-7 min-w-0 flex-1 resize-none bg-transparent py-1 text-sm outline-none [field-sizing:content]"
        />
        <Button size="icon-sm" aria-label="Send" onClick={send} disabled={!text.trim()}>
          <SendHorizontal aria-hidden="true" className="rtl:-scale-x-100" />
        </Button>
      </div>
      <p id={`${id}-hint`} className="sr-only">
        Enter sends, Shift and Enter adds a line. Type @ to mention someone.
      </p>
    </div>
  )
}

function Reactions({ m, onToggle }: { m: Chat1Message; onToggle: (emoji: string) => void }) {
  if (!m.reactions?.length) return null
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1">
      {m.reactions.map((r) => (
        <button
          key={r.emoji}
          type="button"
          aria-pressed={!!r.mine}
          aria-label={`${r.emoji} ${r.count}${r.mine ? ", including you" : ""}`}
          onClick={() => onToggle(r.emoji)}
          className={cn("flex h-6 items-center gap-1 rounded-full border px-2 text-xs tabular-nums outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50", r.mine ? "border-primary/40 bg-primary/10" : "hover:bg-accent")}
        >
          <span aria-hidden="true">{r.emoji}</span>
          <span aria-hidden="true">{r.count}</span>
        </button>
      ))}
    </div>
  )
}

/** One message, or a run of messages from the same person within the same day when `compact`. */
function Message({
  m,
  author,
  compact,
  meName,
  onReact,
  onReply,
  onRetry,
  inThread,
}: {
  m: Chat1Message
  author?: Chat1Person
  compact: boolean
  meName?: string
  onReact: (emoji: string, on: boolean) => void
  onReply?: () => void
  onRetry?: () => void
  inThread?: boolean
}) {
  const [picking, setPicking] = React.useState(false)
  const name = author?.name ?? "Someone"
  // mentions of the reader stand out, as they do in every team chat
  const parts = m.text.split(/(@[A-Z][\w]*(?: [A-Z][\w]*)?)/g)
  return (
    <article aria-label={`${name}, ${m.time}`} className={cn("group/msg hover:bg-accent/40 relative flex gap-3 rounded-lg px-3 focus-within:bg-accent/40", compact ? "py-0.5" : "pt-2 pb-0.5")}>
      <div className="w-8 shrink-0">
        {compact ? (
          <span className="text-muted-foreground hidden pt-0.5 text-[10px] tabular-nums group-hover/msg:block">{m.time}</span>
        ) : (
          <Avatar className="size-8" status={author?.status}>
            <AvatarFallback className="text-xs">{initials(name)}</AvatarFallback>
          </Avatar>
        )}
      </div>
      <div className="min-w-0 flex-1">
        {!compact ? (
          <p className="flex items-baseline gap-2">
            <span className="text-sm font-semibold">{name}</span>
            <span className="text-muted-foreground text-xs tabular-nums">{m.time}</span>
          </p>
        ) : null}
        <p className={cn("text-sm leading-relaxed break-words whitespace-pre-wrap", m.delivery === "sending" && "text-muted-foreground")}>
          {parts.map((p, i) =>
            p.startsWith("@") ? (
              <span key={i} className={cn("rounded px-0.5 font-medium", p.slice(1) === meName ? "bg-chart-3/25" : "text-primary")}>
                {p}
              </span>
            ) : (
              p
            )
          )}
        </p>
        {m.delivery ? (
          <p className={cn("mt-0.5 text-xs", m.delivery === "failed" ? "text-destructive" : "text-muted-foreground")} role={m.delivery === "failed" ? "alert" : undefined}>
            {m.delivery === "sending" ? "Sending…" : "Not sent."}{" "}
            {m.delivery === "failed" && onRetry ? (
              <button type="button" onClick={onRetry} className="rounded-sm font-medium underline underline-offset-2 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                Retry
              </button>
            ) : null}
          </p>
        ) : null}
        <Reactions m={m} onToggle={(e) => onReact(e, !m.reactions?.find((r) => r.emoji === e)?.mine)} />
        {picking ? (
          <span role="group" aria-label="Add a reaction" className="mt-1 flex w-fit gap-0.5 rounded-full border px-1">
            {quick.map((e) => (
              <button
                key={e}
                type="button"
                aria-label={`React with ${e}`}
                onClick={() => {
                  setPicking(false)
                  onReact(e, true)
                }}
                className="hover:bg-accent size-7 rounded-full text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {e}
              </button>
            ))}
          </span>
        ) : null}
        {!inThread && m.replies?.length ? (
          <button type="button" onClick={onReply} className="text-primary mt-1 flex items-center gap-1.5 rounded-sm text-xs font-medium outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <MessageSquare aria-hidden="true" className="size-3.5" />
            {m.replies.length === 1 ? "1 reply" : `${m.replies.length} replies`}
          </button>
        ) : null}
      </div>
      {!m.delivery ? (
        <div className="bg-background absolute -top-3 end-3 hidden gap-0.5 rounded-md border p-0.5 shadow-sm group-focus-within/msg:flex group-hover/msg:flex">
          <Button variant="ghost" size="icon-sm" className="size-7" aria-label={`Add a reaction to ${name}’s message`} aria-pressed={picking} onClick={() => setPicking((p) => !p)}>
            <SmilePlus aria-hidden="true" />
          </Button>
          {!inThread && onReply ? (
            <Button variant="ghost" size="icon-sm" className="size-7" aria-label={`Reply in thread to ${name}`} onClick={onReply}>
              <MessageSquare aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

/**
 * A team chat: channels and direct messages with unread counts and presence, messages grouped by person and day with a New divider,
 * reactions, threads in a side panel, @mentions that suggest people, and messages that show while sending and offer Retry when they fail.
 */
function Chat1({
  people = samplePeople,
  meId = "me",
  channels = sampleChannels,
  messages: messagesProp = sampleMessages,
  defaultChannelId,
  defaultThreadId,
  firstUnread = { launch: "m4" },
  onSend,
  onReact,
  onChannelChange,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Chat1Props) {
  const id = React.useId()
  const [channelId, setChannelId] = React.useState(defaultChannelId ?? channels[0]?.id ?? "")
  const [store, setStore] = React.useState(messagesProp)
  React.useEffect(() => setStore(messagesProp), [messagesProp])
  const [read, setRead] = React.useState<Record<string, boolean>>({})
  const [threadId, setThreadId] = React.useState<string | null>(defaultThreadId ?? null)
  const channel = channels.find((c) => c.id === channelId)
  const list = store[channelId] ?? []
  const thread = threadId ? list.find((m) => m.id === threadId) : undefined
  const person = (pid: string) => people.find((p) => p.id === pid)
  const me = person(meId)
  const logRef = React.useRef<HTMLDivElement>(null)
  const localId = React.useRef(0)

  React.useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [channelId, list.length, state])

  const update = (fn: (msgs: Chat1Message[]) => Chat1Message[], cid = channelId) => setStore((s) => ({ ...s, [cid]: fn(s[cid] ?? []) }))

  function mapMessage(msgs: Chat1Message[], msgId: string, fn: (m: Chat1Message) => Chat1Message): Chat1Message[] {
    return msgs.map((m) => (m.id === msgId ? fn(m) : m.replies ? { ...m, replies: mapMessage(m.replies, msgId, fn) } : m))
  }

  async function send(text: string, inThread?: string, retryId?: string) {
    const cid = channelId
    const mid = retryId ?? `local-${++localId.current}`
    const draft: Chat1Message = { id: mid, authorId: meId, text, day: "Today", time: "Now", delivery: "sending" }
    if (retryId) update((msgs) => mapMessage(msgs, mid, (m) => ({ ...m, delivery: "sending" })), cid)
    else if (inThread) update((msgs) => msgs.map((m) => (m.id === inThread ? { ...m, replies: [...(m.replies ?? []), draft] } : m)), cid)
    else update((msgs) => [...msgs, draft], cid)
    try {
      if (onSend) await onSend({ channelId: cid, text, threadId: inThread })
      else await new Promise((r) => setTimeout(r, 500))
      update((msgs) => mapMessage(msgs, mid, ({ delivery: _, ...m }) => m), cid)
    } catch {
      update((msgs) => mapMessage(msgs, mid, (m) => ({ ...m, delivery: "failed" })), cid)
    }
  }

  function react(messageId: string, emoji: string, on: boolean) {
    update((msgs) =>
      mapMessage(msgs, messageId, (m) => {
        const existing = m.reactions?.find((r) => r.emoji === emoji)
        let reactions = m.reactions ?? []
        if (existing) reactions = reactions.map((r) => (r.emoji === emoji ? { ...r, mine: on, count: r.count + (on === !!r.mine ? 0 : on ? 1 : -1) } : r)).filter((r) => r.count > 0)
        else if (on) reactions = [...reactions, { emoji, count: 1, mine: true }]
        return { ...m, reactions }
      })
    )
    onReact?.({ channelId, messageId, emoji, on })
  }

  const renderList = (msgs: Chat1Message[], inThread?: boolean) => {
    const out: React.ReactNode[] = []
    msgs.forEach((m, i) => {
      const prev = msgs[i - 1]
      if (!inThread && m.day !== prev?.day)
        out.push(
          <div key={`day-${m.day}-${m.id}`} role="separator" aria-label={m.day} className="flex items-center gap-3 px-3 py-2">
            <span className="bg-border h-px flex-1" />
            <span className="text-muted-foreground text-xs font-medium">{m.day}</span>
            <span className="bg-border h-px flex-1" />
          </div>
        )
      if (!inThread && firstUnread[channelId] === m.id && !read[channelId])
        out.push(
          <div key={`new-${m.id}`} role="separator" aria-label="New messages" className="flex items-center gap-3 px-3 py-1">
            <span className="bg-destructive/50 h-px flex-1" />
            <span className="text-destructive text-xs font-semibold">New</span>
          </div>
        )
      const compact = !!prev && prev.authorId === m.authorId && prev.day === m.day && firstUnread[channelId] !== m.id
      out.push(
        <Message
          key={m.id}
          m={m}
          author={person(m.authorId)}
          compact={compact}
          meName={me?.name}
          inThread={inThread}
          onReact={(e, on) => react(m.id, e, on)}
          onReply={() => setThreadId(m.id)}
          onRetry={() => send(m.text, inThread ? threadId ?? undefined : undefined, m.id)}
        />
      )
    })
    return out
  }

  const chooseChannel = (cid: string) => {
    setRead((r) => ({ ...r, [channelId]: true }))
    setChannelId(cid)
    setThreadId(null)
    onChannelChange?.(cid)
  }

  const channelItem = (c: Chat1Channel) => {
    const unread = !read[c.id] && c.id !== channelId ? c.unread : undefined
    const p = c.personId ? person(c.personId) : undefined
    return (
      <li key={c.id}>
        <button
          type="button"
          aria-current={c.id === channelId ? "page" : undefined}
          onClick={() => chooseChannel(c.id)}
          className={cn(
            "flex h-8 w-full items-center gap-2 rounded-md px-2 text-start text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            c.id === channelId ? "bg-accent font-medium" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
            unread && "text-foreground font-semibold"
          )}
        >
          {c.kind === "dm" ? (
            <Avatar className="size-6" status={p?.status}>
              <AvatarFallback className="text-[10px]">{initials(c.name)}</AvatarFallback>
            </Avatar>
          ) : c.private ? (
            <Lock aria-hidden="true" className="size-3.5 shrink-0" />
          ) : (
            <Hash aria-hidden="true" className="size-3.5 shrink-0" />
          )}
          <span className="min-w-0 flex-1 truncate">{c.name}</span>
          {c.private ? <span className="sr-only">(private)</span> : null}
          {unread ? (
            <span className="bg-primary text-primary-foreground rounded-full px-1.5 text-[10px] leading-4 font-semibold tabular-nums">
              {unread}
              {" "}<span className="sr-only">unread</span>
            </span>
          ) : null}
        </button>
      </li>
    )
  }

  return (
    <section data-slot="chat-1" data-state={state} aria-label="Team chat" className={cn("bg-card relative mx-auto flex h-[38rem] w-full max-w-6xl overflow-hidden rounded-xl border", className)} {...frameProps(props)}>
      <nav aria-label="Channels" className="bg-muted/40 hidden w-56 shrink-0 flex-col gap-4 overflow-y-auto border-e p-3 md:flex">
        <div>
          <h2 className="text-muted-foreground px-2 pb-1 text-xs font-semibold">Channels</h2>
          <ul className="grid gap-0.5">{channels.filter((c) => c.kind !== "dm").map(channelItem)}</ul>
        </div>
        <div>
          <h2 className="text-muted-foreground px-2 pb-1 text-xs font-semibold">Direct messages</h2>
          <ul className="grid gap-0.5">{channels.filter((c) => c.kind === "dm").map(channelItem)}</ul>
        </div>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b px-4 py-2.5">
          <div className="min-w-0 flex-1">
            <h2 id={`${id}-channel`} className="flex items-center gap-1.5 text-sm font-semibold">
              {channel?.kind === "dm" ? null : channel?.private ? <Lock aria-hidden="true" className="size-3.5" /> : <Hash aria-hidden="true" className="size-3.5" />}
              {channel?.name}
            </h2>
            {channel?.topic ? <p className="text-muted-foreground truncate text-xs">{channel.topic}</p> : null}
          </div>
          <label className="sr-only" htmlFor={`${id}-switch`}>
            Channel
          </label>
          <select
            id={`${id}-switch`}
            value={channelId}
            onChange={(e) => chooseChannel(e.target.value)}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm md:hidden"
          >
            {channels.map((c) => (
              <option key={c.id} value={c.id}>
                {c.kind === "dm" ? c.name : `# ${c.name}`}
              </option>
            ))}
          </select>
        </header>

        <StateView
          state={state === "ready" && !list.length ? "empty" : state}
          onRetry={onRetry}
          bare
          label="Loading messages"
          loading={<MessagesSkeleton />}
          empty={{
            title: emptyState?.title ?? (channel?.kind === "dm" ? `This is the start of your conversation with ${channel.name}` : `This is the start of #${channel?.name ?? ""}`),
            description: emptyState?.description ?? "Say hello. Messages you send here are visible to everyone in it.",
            icon: emptyState?.icon ?? <MessagesSquare />,
            action: emptyState?.action,
          }}
          error={{ title: errorState?.title ?? "Messages could not be loaded", ...errorState }}
          className="min-h-0 flex-1"
        >
          <div ref={logRef} role="log" aria-labelledby={`${id}-channel`} className="h-full overflow-y-auto py-2">
            {renderList(list)}
          </div>
        </StateView>

        <div className="p-3 pt-1">
          <Composer people={people.filter((p) => p.id !== meId)} label={`Message ${channel?.kind === "dm" ? channel.name : `#${channel?.name ?? ""}`}`} placeholder={`Message ${channel?.kind === "dm" ? channel.name : `#${channel?.name ?? ""}`}`} onSend={(t) => send(t)} />
        </div>
      </div>

      {thread ? (
        <aside aria-label="Thread" className="absolute inset-0 z-20 flex flex-col border-s bg-card md:static md:w-80 md:shrink-0">
          <div className="flex items-center justify-between border-b px-4 py-2.5">
            <h3 className="text-sm font-semibold">Thread</h3>
            <Button variant="ghost" size="icon-sm" aria-label="Close thread" onClick={() => setThreadId(null)}>
              <X aria-hidden="true" />
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto py-2">
            <Message m={thread} author={person(thread.authorId)} compact={false} meName={me?.name} inThread onReact={(e, on) => react(thread.id, e, on)} />
            <div role="separator" aria-label="Replies" className="text-muted-foreground flex items-center gap-3 px-4 py-2 text-xs">
              {thread.replies?.length === 1 ? "1 reply" : `${thread.replies?.length ?? 0} replies`}
              <span className="bg-border h-px flex-1" />
            </div>
            {renderList(thread.replies ?? [], true)}
          </div>
          <div className="p-3 pt-1">
            <Composer people={people.filter((p) => p.id !== meId)} label="Reply in thread" placeholder="Reply…" onSend={(t) => send(t, thread.id)} />
          </div>
        </aside>
      ) : null}
    </section>
  )
}

export { Chat1, type Chat1Props, type Chat1Channel, type Chat1Message, type Chat1Person }

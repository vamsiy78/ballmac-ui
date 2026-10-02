// Ballmac UI: Mail 1. https://ui.ballmac.com/blocks/mail-1
"use client"

import * as React from "react"
import { Archive, ArrowLeft, Inbox, MailOpen, Paperclip, PenSquare, Reply, Send, Star, Trash2 } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ballmac/avatar"
import { Button, buttonVariants } from "@/components/ballmac/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ballmac/dialog"
import { Input } from "@/components/ballmac/input"
import { SearchField } from "@/components/ballmac/search-field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ballmac/select"
import { Textarea } from "@/components/ballmac/textarea"
import { cn } from "@/lib/utils"

type Mail1Folder = "inbox" | "sent" | "archive"

type Mail1Message = {
  id: string
  folder: Mail1Folder
  from: { name: string; email: string }
  subject: string
  /** Paragraphs of the message body. */
  body: string[]
  /** When it arrived, in words (e.g. "9:41 AM" or "Yesterday"). */
  time: string
  unread?: boolean
  starred?: boolean
  attachments?: { name: string; size: string }[]
}

type Mail1Props = Omit<React.ComponentProps<"div">, "children"> & {
  /** The messages. */
  messages?: Mail1Message[]
  /** Name shown on messages you send. */
  me?: { name: string; email: string }
  /** Called with the new message when something is sent or replied to. */
  onSend?: (to: string, subject: string, body: string) => void
  /** Height of the frame. */
  height?: string
}

const defaults: Mail1Message[] = [
  {
    id: "m1", folder: "inbox", unread: true, starred: true, time: "9:41 AM",
    from: { name: "Maya Kim", email: "maya@northwind.co" },
    subject: "Q4 budget: can you review before Friday?",
    body: ["Hi Jordan,", "I’ve put the draft Q4 budget in the shared folder. The main change is the extra headcount in support, which moves total spend up about 6%.", "Could you look at the assumptions tab and flag anything that looks off? I’d like to send it to finance on Friday morning.", "Thanks,\nMaya"],
    attachments: [{ name: "Q4-budget-draft.xlsx", size: "184 KB" }],
  },
  {
    id: "m2", folder: "inbox", unread: true, time: "8:15 AM",
    from: { name: "Stripe", email: "receipts@stripe.com" },
    subject: "Your payout of $12,480.00 is on the way",
    body: ["Your payout was initiated and should arrive in your bank account by Thursday.", "You can follow its status any time from the Payouts page in your dashboard."],
  },
  {
    id: "m3", folder: "inbox", time: "Yesterday",
    from: { name: "Jonas Ortiz", email: "jonas@acme.com" },
    subject: "Launch checklist is ready",
    body: ["Everything is green except the pricing page copy. Elena is finishing it this afternoon.", "I’ll post the final checklist in the channel at 5pm. Shout if you want anything added."],
  },
  {
    id: "m4", folder: "inbox", time: "Yesterday",
    from: { name: "Amara Singh", email: "amara@acme.com" },
    subject: "Postmortem: the slow Tuesday",
    body: ["Draft attached. The short version: a retry storm after a deploy, fixed in two places.", "Comments welcome before we publish it internally."],
    attachments: [{ name: "postmortem-tuesday.pdf", size: "92 KB" }],
  },
  {
    id: "m5", folder: "inbox", time: "Mon",
    from: { name: "Northwind Billing", email: "billing@northwind.co" },
    subject: "Invoice INV-1042 is overdue",
    body: ["This is a friendly reminder that invoice INV-1042 for $4,200.00 was due on September 25.", "You can pay online with the link in your customer portal."],
  },
  {
    id: "m6", folder: "inbox", time: "Mon",
    from: { name: "Elena Fischer", email: "elena@acme.com" },
    subject: "New empty states, take a look",
    body: ["I redrew the empty states for inbox, projects and reports. They’re calmer and give one clear next step.", "Figma link is in the design channel."],
  },
  {
    id: "m7", folder: "sent", time: "Sep 26",
    from: { name: "Jordan Lee", email: "jordan@acme.com" },
    subject: "Re: Hiring plan for next quarter",
    body: ["Thanks for sending this over. I’m on board with two engineers and a designer. Let’s hold the third role until we see the October numbers."],
  },
  {
    id: "m8", folder: "archive", time: "Sep 24",
    from: { name: "Tomás Herrera", email: "tomas@acme.com" },
    subject: "Customer story: Northwind goes paperless",
    body: ["The interview is done and the write-up is approved. It goes live on Thursday."],
  },
]

const folderMeta: { id: Mail1Folder; label: string; icon: typeof Inbox }[] = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "sent", label: "Sent", icon: Send },
  { id: "archive", label: "Archive", icon: Archive },
]

const tones = ["bg-chart-1/25", "bg-chart-3/25", "bg-chart-5/25", "bg-chart-2/25", "bg-chart-4/25"]
const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2)
const toneOf = (name: string) => tones[name.split("").reduce((n, c) => n + c.charCodeAt(0), 0) % tones.length]

function Mail1({
  messages: initial = defaults,
  me = { name: "Jordan Lee", email: "jordan@acme.com" },
  onSend,
  height = "44rem",
  className,
  style,
  ...props
}: Mail1Props) {
  // The message that opens first counts as read.
  const firstOpen = initial.find((m) => m.folder === "inbox")?.id ?? null
  const [mails, setMails] = React.useState(() => initial.map((m) => (m.id === firstOpen ? { ...m, unread: false } : m)))
  const [folder, setFolder] = React.useState<Mail1Folder | "starred">("inbox")
  const [openId, setOpenId] = React.useState<string | null>(firstOpen)
  const [query, setQuery] = React.useState("")
  const [mobileView, setMobileView] = React.useState<"list" | "read">("list")
  const [reply, setReply] = React.useState<string | null>(null)
  const [announce, setAnnounce] = React.useState("")
  const [compose, setCompose] = React.useState(false)
  const [draft, setDraft] = React.useState({ to: "", subject: "", body: "" })
  const listRef = React.useRef<HTMLUListElement>(null)

  const q = query.trim().toLowerCase()
  const visible = mails.filter((m) => (folder === "starred" ? m.starred : m.folder === folder) && (!q || `${m.from.name} ${m.subject} ${m.body.join(" ")}`.toLowerCase().includes(q)))
  const open = mails.find((m) => m.id === openId)
  const shown = open && visible.some((m) => m.id === open.id) ? open : undefined
  const unread = mails.filter((m) => m.folder === "inbox" && m.unread).length

  const update = (id: string, patch: Partial<Mail1Message>) => setMails((all) => all.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  function select(id: string) {
    setOpenId(id)
    update(id, { unread: false })
    setMobileView("read")
    setReply(null)
  }
  function after(removedId: string, text: string) {
    const idx = visible.findIndex((m) => m.id === removedId)
    const next = visible[idx + 1] ?? visible[idx - 1]
    setOpenId(next && next.id !== removedId ? next.id : null)
    setMobileView("list")
    setAnnounce(text)
  }
  function keyNav(e: React.KeyboardEvent<HTMLUListElement>) {
    const keys = ["ArrowDown", "ArrowUp", "j", "k"]
    if (!keys.includes(e.key)) return
    const items = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("[data-mail]") ?? [])
    const i = items.indexOf(document.activeElement as HTMLButtonElement)
    if (i === -1) return
    e.preventDefault()
    const next = e.key === "ArrowDown" || e.key === "j" ? items[i + 1] : items[i - 1]
    next?.focus()
  }
  function send(to: string, subject: string, body: string, from: Mail1Folder = "sent") {
    setMails((all) => [{ id: `sent-${all.length + 1}`, folder: from, from: me, subject, body: body.split("\n").filter(Boolean), time: "Just now" }, ...all])
    onSend?.(to, subject, body)
    setAnnounce("Message sent.")
  }

  return (
    <div
      data-slot="mail-1"
      className={cn("bg-background @container flex overflow-hidden rounded-2xl border shadow-[0_30px_80px_-50px_rgb(0_0_0/0.4)]", className)}
      style={{ height, ...style }}
      {...props}
    >
      <p role="status" className="sr-only">{announce}</p>

      {/* Folders */}
      <nav aria-label="Folders" className="bg-muted/30 hidden w-52 shrink-0 flex-col border-e p-3 md:flex">
        <Dialog open={compose} onOpenChange={setCompose}>
          <DialogTrigger className={buttonVariants({ className: "w-full" })}><PenSquare /> Compose</DialogTrigger>
          <DialogContent>
            <form onSubmit={(e) => { e.preventDefault(); if (!draft.to.trim() || !draft.subject.trim()) return; send(draft.to, draft.subject, draft.body); setDraft({ to: "", subject: "", body: "" }); setCompose(false) }}>
              <DialogHeader>
                <DialogTitle>New message</DialogTitle>
                <DialogDescription>It will appear in Sent.</DialogDescription>
              </DialogHeader>
              <div className="my-5 grid gap-3">
                <Input aria-label="To" type="email" placeholder="To" value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} required />
                <Input aria-label="Subject" placeholder="Subject" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} required />
                <Textarea aria-label="Message" rows={6} placeholder="Write your message…" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setCompose(false)}>Discard</Button>
                <Button type="submit"><Send  className="rtl:-scale-x-100"/> Send</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <ul className="mt-4 space-y-0.5">
          {folderMeta.map((f) => (
            <li key={f.id}>
              <button type="button" aria-current={folder === f.id ? "true" : undefined} onClick={() => { setFolder(f.id); setOpenId(null); setMobileView("list") }} className={cn("focus-visible:ring-ring/50 flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px]", folder === f.id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground")}>
                <f.icon className="size-4" aria-hidden="true" />
                <span className="flex-1 text-start">{f.label}</span>
                {f.id === "inbox" && unread > 0 && <span className="bg-foreground text-background rounded-full px-1.5 py-px text-[11px] font-semibold tabular-nums">{unread}<span className="sr-only"> unread</span></span>}
              </button>
            </li>
          ))}
          <li>
            <button type="button" aria-current={folder === "starred" ? "true" : undefined} onClick={() => { setFolder("starred"); setOpenId(null); setMobileView("list") }} className={cn("focus-visible:ring-ring/50 flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px]", folder === "starred" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground")}>
              <Star className="size-4" aria-hidden="true" /><span className="flex-1 text-start">Starred</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Message list */}
      <section aria-label="Messages" className={cn("flex w-full min-w-0 flex-col border-e md:w-80 md:shrink-0 lg:w-96", mobileView === "read" && "hidden md:flex")}>
        <div className="space-y-2 border-b p-3">
          <div className="flex items-center gap-2 md:hidden">
            <Select value={folder} onValueChange={(v) => { setFolder(v as Mail1Folder | "starred"); setOpenId(null) }}>
              <SelectTrigger aria-label="Folder" size="sm" className="flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {folderMeta.map((f) => <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>)}
                <SelectItem value="starred">Starred</SelectItem>
              </SelectContent>
            </Select>
            <Button size="icon" className="size-8" aria-label="Compose" onClick={() => setCompose(true)}><PenSquare /></Button>
          </div>
          <SearchField label="Search mail" placeholder="Search mail" value={query} onValueChange={setQuery} />
        </div>
        <ul ref={listRef} onKeyDown={keyNav} aria-label={`${folder === "starred" ? "Starred" : folderMeta.find((f) => f.id === folder)?.label} messages`} className="min-h-0 flex-1 divide-y overflow-y-auto">
          {visible.map((m) => (
            <li key={m.id} className="relative">
              <button type="button" data-mail="" aria-current={shown?.id === m.id ? "true" : undefined} onClick={() => select(m.id)} className={cn("focus-visible:ring-ring/50 flex w-full gap-3 p-4 pe-11 text-start outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-inset", shown?.id === m.id ? "bg-accent/70" : "hover:bg-accent/40")}>
                <Avatar size="sm"><AvatarFallback className={cn("text-foreground text-[11px] font-semibold", toneOf(m.from.name))}>{initials(m.from.name)}</AvatarFallback></Avatar>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className={cn("truncate text-sm", m.unread ? "font-semibold" : "font-medium")}>{m.unread && <span className="sr-only">Unread, </span>}{m.from.name}</span>
                    <span className="text-muted-foreground shrink-0 text-xs">{m.time}</span>
                  </span>
                  <span className={cn("mt-0.5 block truncate text-sm", m.unread ? "text-foreground font-medium" : "text-muted-foreground")}>{m.subject}</span>
                  <span className="text-muted-foreground mt-0.5 line-clamp-1 block text-xs">{m.body[0]}</span>
                </span>
                {m.unread && <span aria-hidden="true" className="bg-chart-1 mt-1.5 size-2 shrink-0 rounded-full" />}
              </button>
              <button type="button" aria-label={m.starred ? "Remove star" : "Star"} aria-pressed={!!m.starred} onClick={() => update(m.id, { starred: !m.starred })} className="hover:bg-accent focus-visible:ring-ring/50 absolute end-2 bottom-2 flex size-8 items-center justify-center rounded-lg outline-none focus-visible:ring-[3px]">
                <Star className={cn("size-4", m.starred ? "fill-chart-3 text-chart-3" : "text-muted-foreground")} aria-hidden="true" />
              </button>
            </li>
          ))}
          {visible.length === 0 && (
            <li className="text-muted-foreground flex h-full flex-col items-center justify-center px-6 py-16 text-center text-sm">
              <MailOpen className="size-8" aria-hidden="true" />
              <p className="mt-3 font-medium">{q ? "No messages match" : "Nothing here"}</p>
              <p className="mt-1 text-xs">{q ? "Try a different search." : "Messages you move here will show up."}</p>
            </li>
          )}
        </ul>
      </section>

      {/* Reading pane */}
      <article aria-label={shown ? shown.subject : "Message"} className={cn("min-w-0 flex-1 flex-col", mobileView === "read" ? "flex" : "hidden md:flex")}>
        {shown ? (
          <>
            <div className="flex items-center gap-1 border-b p-2">
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Back to messages" onClick={() => setMobileView("list")}><ArrowLeft  className="rtl:rotate-180"/></Button>
              <Button variant="ghost" size="icon" aria-label="Archive" onClick={() => { update(shown.id, { folder: "archive" }); after(shown.id, "Conversation archived.") }}><Archive /></Button>
              <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => { setMails((all) => all.filter((m) => m.id !== shown.id)); after(shown.id, "Conversation deleted.") }}><Trash2 /></Button>
              <Button variant="ghost" size="icon" aria-label="Mark as unread" onClick={() => { update(shown.id, { unread: true }); after(shown.id, "Marked as unread.") }}><MailOpen /></Button>
              <Button variant="ghost" size="sm" className="ms-auto" onClick={() => setReply("")}><Reply  className="rtl:-scale-x-100"/> Reply</Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-8" tabIndex={0}>
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-balance sm:text-2xl">{shown.subject}</h2>
              <div className="mt-5 flex items-center gap-3">
                <Avatar><AvatarFallback className={cn("text-foreground text-xs font-semibold", toneOf(shown.from.name))}>{initials(shown.from.name)}</AvatarFallback></Avatar>
                <div className="min-w-0 text-sm leading-tight">
                  <p className="font-medium">{shown.from.name}</p>
                  <p className="text-muted-foreground truncate">{shown.from.email}</p>
                </div>
                <p className="text-muted-foreground ms-auto text-xs">{shown.time}</p>
              </div>
              <div className="mt-6 space-y-4 text-[15px] leading-7">
                {shown.body.map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
              </div>
              {shown.attachments && (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {shown.attachments.map((a) => (
                    <li key={a.name} className="bg-muted/50 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"><Paperclip className="size-4" aria-hidden="true" />{a.name}<span className="text-muted-foreground text-xs">{a.size}</span></li>
                  ))}
                </ul>
              )}
              {reply !== null && (
                <form
                  className="bg-card mt-8 rounded-2xl border p-3"
                  onSubmit={(e) => { e.preventDefault(); if (!reply.trim()) return; send(shown.from.email, `Re: ${shown.subject}`, reply); setReply(null) }}
                >
                  <Textarea aria-label={`Reply to ${shown.from.name}`} autoFocus rows={4} placeholder={`Reply to ${shown.from.name}…`} value={reply} onChange={(e) => setReply(e.target.value)} className="border-0 shadow-none focus-visible:ring-0" />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setReply(null)}>Discard</Button>
                    <Button type="submit" size="sm" disabled={!reply.trim()}><Send  className="rtl:-scale-x-100"/> Send</Button>
                  </div>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center p-8 text-center">
            <MailOpen className="size-10" aria-hidden="true" />
            <p className="mt-4 font-medium">Select a message</p>
            <p className="mt-1 text-sm">Use the arrow keys or J and K to move through your list.</p>
          </div>
        )}
      </article>
    </div>
  )
}

export { Mail1, type Mail1Props, type Mail1Message, type Mail1Folder }

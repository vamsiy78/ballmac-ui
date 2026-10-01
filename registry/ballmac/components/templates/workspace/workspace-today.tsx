// Ballmac UI: Parcel today page. https://ui.ballmac.com/templates/template-workspace
"use client"

import * as React from "react"
import { Archive, Check, Pause, Play, Plus, Reply, RotateCcw } from "lucide-react"

import { WorkspaceShell, type WorkspaceHrefs } from "@/components/ballmac/templates/workspace/workspace-theme"
import { cn } from "@/lib/utils"

type Task = { id: string; text: string; done: boolean }

const startTasks: Task[] = [
  { id: "t1", text: "Send the Q4 plan to Priya", done: true },
  { id: "t2", text: "Review Dev’s onboarding mockups", done: false },
  { id: "t3", text: "Book the Lisbon flights", done: false },
  { id: "t4", text: "Write Friday’s team update", done: false },
]

const agenda = [
  { time: "09:00", end: "09:30", title: "Design standup", where: "Meet", tone: "bg-chart-1" },
  { time: "10:30", end: "11:30", title: "Onboarding review", where: "Room 4", tone: "bg-chart-2" },
  { time: "13:00", end: "13:45", title: "Lunch with Amara", where: "Bar Lucia", tone: "bg-chart-3" },
  { time: "15:00", end: "16:00", title: "1:1 with Dev", where: "Meet", tone: "bg-chart-4" },
]

const inbox = [
  { id: "m1", from: "Priya Raman", subject: "Re: Q4 plan — two small edits", preview: "Love it. Can we add owners to the risks?", time: "8:12 AM" },
  { id: "m2", from: "Amara Okafor", subject: "Lunch today?", preview: "Still on for 13:00 at Bar Lucia?", time: "7:48 AM" },
  { id: "m3", from: "Billing", subject: "Your October invoice", preview: "Your invoice for $48.00 is ready.", time: "Yesterday" },
]

const NOW = "09:41"
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3))

const card = "bg-card rounded-2xl border"

type WorkspaceTodayProps = React.ComponentProps<"div"> & { hrefs?: Partial<WorkspaceHrefs> }

/** The Parcel today page: your agenda with a now line, tasks you can tick and add, inbox highlights you can archive, and a focus timer. */
function WorkspaceToday({ hrefs, ...props }: WorkspaceTodayProps) {
  const [tasks, setTasks] = React.useState(startTasks)
  const [draft, setDraft] = React.useState("")
  const [mail, setMail] = React.useState(inbox)
  const [secs, setSecs] = React.useState(25 * 60)
  const [running, setRunning] = React.useState(false)
  const [note, setNote] = React.useState("")

  React.useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSecs((s) => (s <= 1 ? 0 : s - 1)), 1000)
    return () => clearInterval(id)
  }, [running])
  const finished = secs === 0
  const done = tasks.filter((t) => t.done).length
  const pct = tasks.length ? (done / tasks.length) * 100 : 0
  const mm = String(Math.floor(secs / 60)).padStart(2, "0")
  const ss = String(secs % 60).padStart(2, "0")

  function add(e: React.FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setTasks((all) => [...all, { id: `n${all.length}`, text, done: false }])
    setDraft("")
  }

  return (
    <WorkspaceShell page="today" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-6xl px-4 py-6 pb-10 sm:px-6">
        <p className="text-muted-foreground text-sm font-medium">Thursday, October 1</p>
        <h2 className="mt-1 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">Good morning, Mina.</h2>
        <p className="text-muted-foreground mt-2 text-pretty">You have {agenda.length} meetings, {tasks.length - done} tasks left and {mail.length} messages worth a look.</p>

        <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-3">
          <section aria-labelledby="wt-agenda" className={cn(card, "p-5 lg:row-span-2")}>
            <h3 id="wt-agenda" className="font-bold">Agenda</h3>
            <ol className="mt-4 space-y-1">
              {agenda.map((e, i) => {
                const past = toMin(e.end) <= toMin(NOW)
                const live = toMin(e.time) <= toMin(NOW) && toMin(NOW) < toMin(e.end)
                const showNow = !past && !live && (i === 0 || toMin(agenda[i - 1].end) <= toMin(NOW))
                return (
                  <React.Fragment key={e.title}>
                    {showNow && (
                      <li aria-label={`Now, ${NOW}`} className="flex items-center gap-2 py-1.5"><span className="bg-destructive size-2 rounded-full" aria-hidden="true" /><span className="bg-destructive/50 h-px flex-1" aria-hidden="true" /><span className="text-destructive text-xs font-semibold tabular-nums">{NOW}</span></li>
                    )}
                    <li className={cn("flex gap-3 rounded-xl p-2.5", live && "bg-accent", past && "text-muted-foreground")}>
                      <span className={cn("w-1 shrink-0 rounded-full", e.tone)} aria-hidden="true" />
                      <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{e.title}</p><p className="text-muted-foreground text-xs">{e.time}–{e.end} · {e.where}</p></div>
                      {past && <Check className="text-chart-2 size-4 shrink-0" aria-label="Done" />}
                    </li>
                  </React.Fragment>
                )
              })}
            </ol>
          </section>

          <section aria-labelledby="wt-tasks" className={cn(card, "p-5")}>
            <div className="flex items-center justify-between"><h3 id="wt-tasks" className="font-bold">Tasks</h3><p className="text-muted-foreground text-sm tabular-nums" role="status">{done} of {tasks.length} done</p></div>
            <div className="bg-muted mt-3 h-1.5 rounded-full" aria-hidden="true"><div className="bg-chart-2 h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${pct}%` }} /></div>
            <ul className="mt-4 space-y-1">
              {tasks.map((t) => (
                <li key={t.id}>
                  <label className="hover:bg-accent flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm">
                    <input type="checkbox" checked={t.done} onChange={() => setTasks((all) => all.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))} className="accent-chart-1 size-4" />
                    <span className={cn(t.done && "text-muted-foreground line-through")}>{t.text}</span>
                  </label>
                </li>
              ))}
            </ul>
            <form onSubmit={add} className="mt-3 flex gap-2">
              <label htmlFor="wt-new" className="sr-only">Add a task</label>
              <input id="wt-new" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a task" className="bg-background focus-visible:ring-ring/50 placeholder:text-muted-foreground h-9 min-w-0 flex-1 rounded-lg border px-3 text-sm outline-none focus-visible:ring-[3px]" />
              <button type="submit" aria-label="Add task" className="bg-primary text-primary-foreground focus-visible:ring-ring/50 inline-flex size-9 items-center justify-center rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]"><Plus className="size-4" aria-hidden="true" /></button>
            </form>
          </section>

          <section aria-labelledby="wt-focus" className={cn(card, "flex flex-col items-center p-5 text-center")}>
            <h3 id="wt-focus" className="self-start font-bold">Focus</h3>
            <p className="mt-6 text-6xl font-extrabold tracking-[-0.04em] tabular-nums" role="timer" aria-label={`${mm} minutes ${ss} seconds left`}>{mm}:{ss}</p>
            <p className="text-muted-foreground mt-2 text-sm" aria-live="polite">{finished ? "Nice work. Take five." : running ? "Stay with one thing." : "Pick a task and begin."}</p>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => { if (finished) setSecs(25 * 60); setRunning((r) => !r) }} className="bg-primary text-primary-foreground focus-visible:ring-ring/50 inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-semibold outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]">
                {running ? <><Pause className="size-4" aria-hidden="true" />Pause</> : <><Play className="size-4" aria-hidden="true" />{secs === 25 * 60 ? "Start" : "Resume"}</>}
              </button>
              <button type="button" aria-label="Reset timer" onClick={() => { setRunning(false); setSecs(25 * 60) }} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex size-10 items-center justify-center rounded-xl border outline-none focus-visible:ring-[3px]"><RotateCcw className="size-4" aria-hidden="true" /></button>
            </div>
          </section>

          <section aria-labelledby="wt-inbox" className={cn(card, "p-5 lg:col-span-2")}>
            <div className="flex items-center justify-between"><h3 id="wt-inbox" className="font-bold">Worth a look</h3><a href={hrefs?.mail ?? "/workspace/mail"} className="text-chart-1 rounded text-sm font-semibold underline underline-offset-4">Open inbox</a></div>
            <p className="sr-only" role="status">{note}</p>
            {mail.length === 0 ? (
              <p className="text-muted-foreground mt-6 rounded-xl border border-dashed p-8 text-center text-sm">Inbox zero. Enjoy the quiet.</p>
            ) : (
              <ul className="mt-3 divide-y">
                {mail.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 py-3">
                    <span className="bg-chart-1/15 flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold" aria-hidden="true">{m.from.split(" ").map((w) => w[0]).join("")}</span>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm"><span className="font-semibold">{m.from}</span> <span className="text-muted-foreground">· {m.time}</span></p><p className="truncate text-sm font-medium">{m.subject}</p><p className="text-muted-foreground truncate text-xs">{m.preview}</p></div>
                    <div className="flex shrink-0 gap-1">
                      <a href={hrefs?.mail ?? "/workspace/mail"} aria-label={`Reply to ${m.from}`} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex size-8 items-center justify-center rounded-lg outline-none focus-visible:ring-[3px]"><Reply className="size-4" aria-hidden="true" /></a>
                      <button type="button" aria-label={`Archive: ${m.subject}`} onClick={() => { setMail((all) => all.filter((x) => x.id !== m.id)); setNote(`Archived ${m.subject}`) }} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex size-8 items-center justify-center rounded-lg outline-none focus-visible:ring-[3px]"><Archive className="size-4" aria-hidden="true" /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </WorkspaceShell>
  )
}

export { WorkspaceToday, type WorkspaceTodayProps }

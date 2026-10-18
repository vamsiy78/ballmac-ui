// Ballmac UI: Tasks 1. https://ui.ballmac.com/blocks/tasks-1
"use client"

import * as React from "react"
import { CalendarDays, Check, ChevronDown, ChevronUp, CircleCheckBig, Flag, ListTodo, Pencil, Plus, Trash2, Undo2 } from "lucide-react"

import { BlurFade } from "@/components/ballmac/blur-fade"
import { Button } from "@/components/ballmac/button"
import { Checkbox } from "@/components/ballmac/checkbox"
import { CircularProgress } from "@/components/ballmac/circular-progress"
import { Kbd } from "@/components/ballmac/kbd"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ballmac/select"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Tasks1Task = {
  id: string
  title: string
  done?: boolean
  /** A date as YYYY-MM-DD. */
  due?: string
  priority?: "normal" | "high"
  /** Initials of who it is for. */
  assignee?: string
  /** Short labels, such as "Design". */
  labels?: string[]
}

type Tasks1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    tasks?: Tasks1Task[]
    title?: string
    /** Today's date as YYYY-MM-DD. Pass it in so server and browser agree; it decides what is overdue. */
    today?: string
    /** BCP 47 locale for dates. */
    locale?: string
    /** Called with the new task. */
    onAdd?: (task: Tasks1Task) => void
    /** Called when a task is completed or reopened. */
    onToggle?: (id: string, done: boolean) => void
    /** Called when a title is changed. */
    onEdit?: (id: string, title: string) => void
    /** Called straight away when a task is deleted. The block offers Undo for a few seconds. */
    onDelete?: (id: string) => void
    /** Called when Undo is pressed, with the task to put back. */
    onRestore?: (task: Tasks1Task) => void
    /** Called after a task is moved, with the new order of ids. */
    onReorder?: (ids: string[]) => void
    /** Show the completed tasks open at first. */
    defaultShowCompleted?: boolean
  }

const sample: Tasks1Task[] = [
  { id: "t1", title: "Send the Q4 plan to Priya", due: "2026-10-16", priority: "high", assignee: "JL", labels: ["Planning"] },
  { id: "t2", title: "Review the release notes for 2.5", due: "2026-10-18", priority: "high", assignee: "JL", labels: ["Release"] },
  { id: "t3", title: "Reply to the pull request on Gridwork", due: "2026-10-18", assignee: "JL", labels: ["Code"] },
  { id: "t4", title: "Book the venue for the autumn offsite", due: "2026-10-19", assignee: "MA", labels: ["Team"] },
  { id: "t5", title: "Update the copy on the pricing page", due: "2026-10-21", assignee: "AK", labels: ["Website"] },
  { id: "t6", title: "Write the launch announcement", due: "2026-10-23", priority: "high", assignee: "JL", labels: ["Release", "Writing"] },
  { id: "t7", title: "Tidy up the icon set", labels: ["Design"] },
  { id: "t8", title: "Plan first-quarter hiring", assignee: "JL", labels: ["Planning"] },
  { id: "t9", title: "Fix the webhook retry bug", done: true, due: "2026-10-17", assignee: "TN", labels: ["Code"] },
  { id: "t10", title: "Order lunch for the team", done: true, due: "2026-10-17", assignee: "MA" },
  { id: "t11", title: "Rotate the staging key", done: true, assignee: "JL", labels: ["Security"] },
]

const DAY = 86_400_000
const toTime = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10))
const addDays = (iso: string, n: number) => new Date(toTime(iso) + n * DAY).toISOString().slice(0, 10)

function TasksSkeleton() {
  return (
    <div className="grid gap-3" aria-hidden="true">
      <Skeleton className="h-28 rounded-2xl" />
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border p-4">
          <Skeleton className="size-5 rounded-md" />
          <Skeleton className="h-4 flex-1" style={{ maxWidth: `${70 - i * 8}%` }} />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

/**
 * A tasks page: a progress ring and quick add, tasks grouped as overdue, today, upcoming and no date with the due date written
 * plainly, a strike-through that draws itself when you complete one, inline editing, priority with a word and a flag, reordering by
 * button or Alt and the arrow keys, keyboard shortcuts, and an Undo bar after deleting.
 */
function Tasks1({
  tasks: tasksProp = sample,
  title = "My tasks",
  today = "2026-10-18",
  locale = "en-US",
  onAdd,
  onToggle,
  onEdit,
  onDelete,
  onRestore,
  onReorder,
  defaultShowCompleted = false,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Tasks1Props) {
  const id = React.useId()
  const addRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const counter = React.useRef(0)
  const [tasks, setTasks] = React.useState(tasksProp)
  React.useEffect(() => setTasks(tasksProp), [tasksProp])
  const [draft, setDraft] = React.useState("")
  const [dueChoice, setDueChoice] = React.useState<"today" | "tomorrow" | "week" | "none">("today")
  const [high, setHigh] = React.useState(false)
  const [filter, setFilter] = React.useState<"all" | "high">("all")
  const [showDone, setShowDone] = React.useState(defaultShowCompleted)
  const [editing, setEditing] = React.useState<string | null>(null)
  const [editText, setEditText] = React.useState("")
  const [undo, setUndo] = React.useState<{ task: Tasks1Task; index: number } | null>(null)
  const [announce, setAnnounce] = React.useState("")
  const ready = state === "ready" || state === "empty"
  const all = state === "empty" ? [] : tasks

  React.useEffect(() => {
    if (!undo) return
    const t = setTimeout(() => setUndo(null), 7000)
    return () => clearTimeout(t)
  }, [undo])
  // "n" jumps to the new task box from anywhere, unless you are typing
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "n" || e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) return
      e.preventDefault()
      addRef.current?.focus()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  const dateFmt = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" })
  function dueLabel(iso: string, done?: boolean): { text: string; tone: "overdue" | "today" | "normal" } {
    const diff = Math.round((toTime(iso) - toTime(today)) / DAY)
    if (done) return { text: dateFmt.format(toTime(iso)), tone: "normal" }
    if (diff < 0) return { text: diff === -1 ? "Overdue by 1 day" : `Overdue by ${-diff} days`, tone: "overdue" }
    if (diff === 0) return { text: "Today", tone: "today" }
    if (diff === 1) return { text: "Tomorrow", tone: "normal" }
    return { text: dateFmt.format(toTime(iso)), tone: "normal" }
  }

  const shown = all.filter((t) => filter === "all" || t.priority === "high")
  const open = shown.filter((t) => !t.done)
  const groups = [
    { key: "overdue", title: "Overdue", tone: "text-destructive", tasks: open.filter((t) => t.due && toTime(t.due) < toTime(today)) },
    { key: "today", title: "Today", tone: "", tasks: open.filter((t) => t.due === today) },
    { key: "upcoming", title: "Upcoming", tone: "", tasks: open.filter((t) => t.due && toTime(t.due) > toTime(today)) },
    { key: "none", title: "No date", tone: "", tasks: open.filter((t) => !t.due) },
  ].filter((g) => g.tasks.length)
  const done = shown.filter((t) => t.done)
  const doneAll = all.filter((t) => t.done).length
  const pct = all.length ? Math.round((doneAll / all.length) * 100) : 0

  const commitOrder = (list: Tasks1Task[]) => {
    setTasks(list)
    onReorder?.(list.map((t) => t.id))
  }

  function move(task: Tasks1Task, delta: -1 | 1) {
    // reorder among the tasks that are open and in the same group, so a move is always visible
    const sameGroup = (a: Tasks1Task) => !a.done && (a.due ?? "") === (task.due ?? "")
    const peers = tasks.filter(sameGroup)
    const at = peers.findIndex((p) => p.id === task.id)
    const other = peers[at + delta]
    if (!other) return
    const next = [...tasks]
    const i = next.findIndex((t) => t.id === task.id)
    const j = next.findIndex((t) => t.id === other.id)
    ;[next[i], next[j]] = [next[j]!, next[i]!]
    commitOrder(next)
    setAnnounce(`Moved ${delta < 0 ? "up" : "down"}`)
    requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(`[data-task-main="${task.id}"]`)?.focus())
  }

  function toggle(task: Tasks1Task, checked: boolean) {
    setTasks((l) => l.map((t) => (t.id === task.id ? { ...t, done: checked } : t)))
    onToggle?.(task.id, checked)
    setAnnounce(checked ? `Completed: ${task.title}` : `Reopened: ${task.title}`)
  }

  function remove(task: Tasks1Task) {
    const index = tasks.findIndex((t) => t.id === task.id)
    const mains = [...(listRef.current?.querySelectorAll<HTMLElement>("[data-task-main]") ?? [])]
    const at = mains.findIndex((m) => m.dataset.taskMain === task.id)
    const next = mains[at + 1] ?? mains[at - 1]
    setTasks((l) => l.filter((t) => t.id !== task.id))
    onDelete?.(task.id)
    setUndo({ task, index })
    setAnnounce("Deleted. Undo is available for a few seconds.")
    requestAnimationFrame(() => (next ?? addRef.current)?.focus())
  }

  function restore() {
    if (!undo) return
    const { task, index } = undo
    setTasks((l) => [...l.slice(0, index), task, ...l.slice(index)])
    onRestore?.(task)
    setUndo(null)
    setAnnounce("Task restored")
  }

  function add(e: React.FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    const due = dueChoice === "today" ? today : dueChoice === "tomorrow" ? addDays(today, 1) : dueChoice === "week" ? addDays(today, 7) : undefined
    const task: Tasks1Task = { id: `${id}-new-${++counter.current}`, title: text, due, priority: high ? "high" : "normal" }
    setTasks((l) => [task, ...l])
    onAdd?.(task)
    setDraft("")
    setHigh(false)
    setAnnounce(`Added: ${text}`)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const target = e.target as HTMLElement
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return
    const row = target.closest<HTMLElement>("[data-task-row]")
    const mains = [...(listRef.current?.querySelectorAll<HTMLElement>("[data-task-main]") ?? [])]
    const at = mains.findIndex((m) => m.dataset.taskMain === row?.dataset.taskRow)
    const key = e.key.toLowerCase()
    const task = tasks.find((t) => t.id === row?.dataset.taskRow)
    if (e.altKey && (key === "arrowup" || key === "arrowdown") && task && !task.done) {
      e.preventDefault()
      move(task, key === "arrowup" ? -1 : 1)
      return
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return
    if (key === "j" || key === "k" || key === "arrowdown" || key === "arrowup") {
      if (at === -1) return
      e.preventDefault()
      mains[Math.max(0, Math.min(mains.length - 1, at + (key === "j" || key === "arrowdown" ? 1 : -1)))]?.focus()
    } else if (task && target.hasAttribute("data-task-main")) {
      if (key === "x") {
        e.preventDefault()
        toggle(task, !task.done)
      } else if (key === "e") {
        e.preventDefault()
        setEditing(task.id)
        setEditText(task.title)
      } else if (key === "delete" || key === "backspace") {
        e.preventDefault()
        remove(task)
      }
    }
  }

  function row(task: Tasks1Task, canMove: boolean, first: boolean, last: boolean) {
    const d = task.due ? dueLabel(task.due, task.done) : null
    const isEditing = editing === task.id
    return (
      <div
        key={task.id}
        data-task-row={task.id}
        className={cn("group/task bg-card relative flex items-start gap-3.5 rounded-xl border p-3.5 pe-2 transition-[border-color,background-color] duration-200 focus-within:border-foreground/25 hover:border-foreground/20", task.done && "bg-card/50")}
      >
        <Checkbox checked={!!task.done} onCheckedChange={(c) => toggle(task, c === true)} aria-label={`Complete: ${task.title}`} className="mt-0.5 size-5" />
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <input
              autoFocus
              aria-label="Task title"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setEditing(null)
                  requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(`[data-task-main="${task.id}"]`)?.focus())
                } else if (e.key === "Enter") {
                  const text = editText.trim()
                  if (text) {
                    setTasks((l) => l.map((t) => (t.id === task.id ? { ...t, title: text } : t)))
                    onEdit?.(task.id, text)
                    setAnnounce("Task updated")
                  }
                  setEditing(null)
                  requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(`[data-task-main="${task.id}"]`)?.focus())
                }
              }}
              onBlur={() => setEditing(null)}
              className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-md border px-2 text-sm outline-none focus-visible:ring-[3px]"
            />
          ) : (
            <button
              type="button"
              data-task-main={task.id}
              onClick={() => {
                setEditing(task.id)
                setEditText(task.title)
              }}
              aria-label={`${task.title}. Press to edit.`}
              className="focus-visible:ring-ring/50 block w-full rounded-sm text-start outline-none focus-visible:ring-[3px]"
            >
              <span
                data-done={task.done || undefined}
                className={cn(
                  "relative inline text-[15px] leading-snug text-pretty transition-colors duration-300",
                  task.done && "text-muted-foreground"
                )}
              >
                <span className={cn("bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_55%] bg-no-repeat transition-[background-size] duration-300 motion-reduce:transition-none rtl:bg-[position:100%_55%]", task.done && "bg-[length:100%_1px]")}>{task.title}</span>
              </span>
            </button>
          )}
          {(d || task.priority === "high" || task.labels?.length) && !isEditing ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
              {d ? (
                <span className={cn("flex items-center gap-1.5 tabular-nums", d.tone === "overdue" ? "text-destructive font-medium" : d.tone === "today" ? "text-foreground font-medium" : "text-muted-foreground")}>
                  <CalendarDays aria-hidden="true" className="size-3.5" />
                  {d.text}
                </span>
              ) : null}
              {task.priority === "high" && !task.done ? (
                <span className="text-foreground flex items-center gap-1.5 font-medium">
                  <Flag aria-hidden="true" className="fill-chart-3 text-chart-3 size-3.5" />
                  High priority
                </span>
              ) : null}
              {task.labels?.map((l) => (
                <span key={l} className="bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                  {l}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {!isEditing ? (
          <div className="flex shrink-0 items-center gap-1">
            <div className="flex gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within/task:opacity-100 sm:group-hover/task:opacity-100">
            {canMove ? (
              <>
                <Button variant="ghost" size="icon-sm" className="size-7" aria-label={`Move up: ${task.title}`} disabled={first} onClick={() => move(task, -1)}>
                  <ChevronUp aria-hidden="true" />
                </Button>
                <Button variant="ghost" size="icon-sm" className="size-7" aria-label={`Move down: ${task.title}`} disabled={last} onClick={() => move(task, 1)}>
                  <ChevronDown aria-hidden="true" />
                </Button>
              </>
            ) : null}
            <Button variant="ghost" size="icon-sm" className="size-7" aria-label={`Delete: ${task.title}`} onClick={() => remove(task)}>
              <Trash2 aria-hidden="true" />
            </Button>
            </div>
            {task.assignee ? (
              <span aria-label={`For ${task.assignee}`} className="bg-muted flex size-6 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold">
                {task.assignee}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    )
  }

  const empty = ready && !shown.length
  const content = (
    <>
      <BlurFade direction="up" offset={10} duration={0.45}>
        <div className="bg-card mb-8 grid gap-5 rounded-2xl border p-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-6 sm:p-6">
          <div className="flex items-center gap-4">
            <CircularProgress size={72} thickness={8} legend={false} duration={0.8} rings={[{ label: "Done", value: doneAll, max: Math.max(1, all.length), tone: "chart-2" }]} aria-label={`${doneAll} of ${all.length} tasks done`}>
              <span className="text-base font-semibold tabular-nums">{pct}%</span>
            </CircularProgress>
            <div className="sm:hidden">
              <p className="text-sm font-semibold tabular-nums">
                {doneAll} of {all.length} done
              </p>
            </div>
          </div>
          <form onSubmit={add} className="grid gap-2.5">
            <p className="hidden text-sm font-semibold tabular-nums sm:block">
              {doneAll} of {all.length} done
              <span className="text-muted-foreground font-normal"> · {all.filter((t) => !t.done && t.due && toTime(t.due) < toTime(today)).length} overdue</span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor={`${id}-new`} className="sr-only">
                New task
              </label>
              <input
                id={`${id}-new`}
                ref={addRef}
                value={draft}
                disabled={!ready}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a task and press Enter"
                className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 placeholder:text-muted-foreground h-9 min-w-0 flex-1 basis-56 rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px] disabled:opacity-50"
              />
              <Select value={dueChoice} onValueChange={(v) => setDueChoice(v as typeof dueChoice)} disabled={!ready}>
                <SelectTrigger aria-label="Due date" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="week">In a week</SelectItem>
                  <SelectItem value="none">No date</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" variant={high ? "secondary" : "outline"} size="icon" aria-label="High priority" aria-pressed={high} onClick={() => setHigh((h) => !h)} disabled={!ready}>
                <Flag aria-hidden="true" className={cn(high && "fill-chart-3 text-chart-3")} />
              </Button>
              <Button type="submit" disabled={!ready || !draft.trim()}>
                <Plus aria-hidden="true" />
                Add
              </Button>
            </div>
          </form>
        </div>
      </BlurFade>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <SegmentedControl value={filter} onValueChange={(v) => setFilter(v as typeof filter)} aria-label="Show" size="sm" disabled={!ready}>
          <SegmentedControlItem value="all">All</SegmentedControlItem>
          <SegmentedControlItem value="high">High priority</SegmentedControlItem>
        </SegmentedControl>
        <p className="text-muted-foreground ms-auto hidden items-center gap-1.5 text-xs lg:flex">
          <Kbd>N</Kbd> new <span aria-hidden="true">·</span> <Kbd>X</Kbd> complete <span aria-hidden="true">·</span> <Kbd>E</Kbd> edit <span aria-hidden="true">·</span> <Kbd>Alt</Kbd>
          <Kbd>↑</Kbd> move
        </p>
      </div>

      {empty ? (
        <div className="bg-card rounded-2xl border px-6 py-16 text-center">
          <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
            {all.length ? <ListTodo className="size-6" /> : <CircleCheckBig className="size-6" />}
          </span>
          <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? (all.length ? "No high priority tasks" : "Nothing to do")}</h2>
          <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm text-pretty">{emptyState?.description ?? (all.length ? "Everything on your list is at a normal pace." : "Add a task above, or enjoy the quiet.")}</p>
          {emptyState?.action}
        </div>
      ) : (
        <div ref={listRef} onKeyDown={onKeyDown} className="grid grid-cols-1 gap-9">
          {groups.map((g) => (
            <section key={g.key} aria-labelledby={`${id}-${g.key}`}>
              <h2 id={`${id}-${g.key}`} className={cn("mb-3 flex items-center gap-2 text-xs font-semibold", g.tone || "text-muted-foreground")}>
                {g.title}
                <span className="text-muted-foreground font-normal tabular-nums">{g.tasks.length}</span>
              </h2>
              <ul className="grid list-none grid-cols-1 gap-2">
                {g.tasks.map((t, i) => (
                  <li key={t.id}>{row(t, true, i === 0, i === g.tasks.length - 1)}</li>
                ))}
              </ul>
            </section>
          ))}
          {done.length ? (
            <section aria-labelledby={`${id}-done`}>
              <h2 id={`${id}-done`} className="mb-3">
                <button type="button" aria-expanded={showDone} aria-controls={`${id}-done-list`} onClick={() => setShowDone((s) => !s)} className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex items-center gap-2 rounded-sm text-xs font-semibold outline-none focus-visible:ring-[3px]">
                  <ChevronDown aria-hidden="true" className={cn("size-4 transition-transform duration-150 motion-reduce:transition-none", showDone ? "" : "-rotate-90 rtl:rotate-90")} />
                  Completed
                  <span className="font-normal tabular-nums">{done.length}</span>
                </button>
              </h2>
              {showDone ? (
                <ul id={`${id}-done-list`} className="animate-in fade-in-0 slide-in-from-top-1 grid list-none grid-cols-1 gap-2 duration-200 motion-reduce:animate-none">
                  {done.map((t) => (
                    <li key={t.id}>{row(t, false, true, true)}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}
        </div>
      )}
    </>
  )

  return (
    <section data-slot="tasks-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-3xl px-4 py-8 pb-24 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-6">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em]">
          {title}
        </h1>
      </header>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading tasks" loading={<TasksSkeleton />} error={{ title: errorState?.title ?? "Your tasks could not be loaded", description: errorState?.description ?? "Nothing was lost. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
      {undo ? (
        <div role="status" className="bg-popover text-popover-foreground fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-md items-center gap-3 rounded-xl border p-3 ps-4 shadow-lg">
          <p className="min-w-0 flex-1 truncate text-sm">Deleted “{undo.task.title}”</p>
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

export { Tasks1, type Tasks1Props, type Tasks1Task }

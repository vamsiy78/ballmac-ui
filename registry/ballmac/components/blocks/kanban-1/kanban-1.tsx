// Ballmac UI: Kanban 1. https://ui.ballmac.com/blocks/kanban-1
"use client"

import * as React from "react"
import { CalendarDays, MessageSquare, MoreHorizontal, Plus, X } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ballmac/avatar"
import { Badge } from "@/components/ballmac/badge"
import { Button } from "@/components/ballmac/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ballmac/dropdown-menu"
import { Input } from "@/components/ballmac/input"
import { cn } from "@/lib/utils"

type Kanban1Task = {
  id: string
  title: string
  /** Short labels, e.g. "Design". */
  tags?: string[]
  priority?: "low" | "medium" | "high"
  /** Name of the person it is assigned to. */
  assignee?: string
  /** Due date label, e.g. "Oct 14". */
  due?: string
  comments?: number
}

type Kanban1Column = { id: string; title: string; tasks: Kanban1Task[] }

type Kanban1Props = Omit<React.ComponentProps<"section">, "title" | "onChange"> & {
  /** Board heading. */
  title?: string
  /** One line under the heading. */
  description?: string
  /** Starting board. */
  defaultColumns?: Kanban1Column[]
  /** Called with the whole board after a task moves, is added or removed. */
  onChange?: (columns: Kanban1Column[]) => void
  /** Height of the board area. Columns scroll inside it. */
  height?: string
}

const priorityTone = { low: "bg-chart-2", medium: "bg-chart-3", high: "bg-destructive" } as const

const defaults: Kanban1Column[] = [
  {
    id: "todo", title: "To do",
    tasks: [
      { id: "t1", title: "Write the Q4 launch announcement", tags: ["Marketing"], priority: "medium", assignee: "Elena Fischer", due: "Oct 14", comments: 2 },
      { id: "t2", title: "Audit log export as CSV", tags: ["Engineering"], priority: "low", assignee: "Amara Singh", due: "Oct 21" },
      { id: "t3", title: "Redraw empty states", tags: ["Design"], priority: "low", assignee: "Yuki Tanaka" },
    ],
  },
  {
    id: "doing", title: "In progress",
    tasks: [
      { id: "t4", title: "SAML SSO for Pro plans", tags: ["Engineering", "Security"], priority: "high", assignee: "Marcus Webb", due: "Oct 9", comments: 5 },
      { id: "t5", title: "Pricing page experiment", tags: ["Growth"], priority: "medium", assignee: "Jonas Ortiz", due: "Oct 12", comments: 1 },
    ],
  },
  {
    id: "review", title: "In review",
    tasks: [{ id: "t6", title: "Approval digest email", tags: ["Product"], priority: "medium", assignee: "Maya Kim", due: "Oct 6", comments: 3 }],
  },
  {
    id: "done", title: "Done",
    tasks: [
      { id: "t7", title: "Faster invoice search", tags: ["Engineering"], priority: "low", assignee: "Amara Singh" },
      { id: "t8", title: "Dark mode chart tooltips", tags: ["Design"], assignee: "Yuki Tanaka" },
    ],
  },
]

const tones = ["bg-chart-1/25", "bg-chart-3/25", "bg-chart-5/25", "bg-chart-2/25", "bg-chart-4/25"]
const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2)
const toneOf = (name: string) => tones[name.split("").reduce((n, c) => n + c.charCodeAt(0), 0) % tones.length]

function Kanban1({
  title = "Launch plan",
  description = "Drag cards between columns, or pick one up with Space and move it with the arrow keys.",
  defaultColumns = defaults,
  onChange,
  height = "34rem",
  className,
  ...props
}: Kanban1Props) {
  const [cols, setCols] = React.useState(defaultColumns)
  const [who, setWho] = React.useState("Everyone")
  const [grabbed, setGrabbed] = React.useState<{ id: string; from: { col: string; index: number } } | null>(null)
  const [dragId, setDragId] = React.useState<string | null>(null)
  const [over, setOver] = React.useState<{ col: string; index: number } | null>(null)
  const [adding, setAdding] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState("")
  const [announce, setAnnounce] = React.useState("")
  const focusId = React.useRef<string | null>(null)
  const boardRef = React.useRef<HTMLDivElement>(null)

  const people = ["Everyone", ...Array.from(new Set(cols.flatMap((c) => c.tasks.map((t) => t.assignee).filter((a): a is string => !!a))))]
  const total = cols.reduce((n, c) => n + c.tasks.length, 0)

  // After a card moves in the DOM, put keyboard focus back on it.
  React.useEffect(() => {
    if (!focusId.current) return
    boardRef.current?.querySelector<HTMLElement>(`[data-task="${focusId.current}"]`)?.focus()
    focusId.current = null
  })

  const commit = (next: Kanban1Column[]) => {
    setCols(next)
    onChange?.(next)
  }

  function locate(id: string) {
    for (const c of cols) {
      const i = c.tasks.findIndex((t) => t.id === id)
      if (i !== -1) return { col: c.id, index: i }
    }
    return null
  }

  function move(id: string, toCol: string, toIndex: number) {
    const from = locate(id)
    if (!from) return
    const task = cols.find((c) => c.id === from.col)?.tasks[from.index]
    if (!task) return
    const without = cols.map((c) => (c.id === from.col ? { ...c, tasks: c.tasks.filter((t) => t.id !== id) } : c))
    const next = without.map((c) => {
      if (c.id !== toCol) return c
      const index = Math.max(0, Math.min(toIndex, c.tasks.length))
      const tasks = [...c.tasks]
      tasks.splice(index, 0, task)
      return { ...c, tasks }
    })
    focusId.current = id
    commit(next)
  }

  function onCardKey(e: React.KeyboardEvent, task: Kanban1Task, colId: string, index: number) {
    const colIndex = cols.findIndex((c) => c.id === colId)
    if (!grabbed) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        setGrabbed({ id: task.id, from: { col: colId, index } })
        setAnnounce(`Picked up ${task.title}. Use the arrow keys to move it, Space to drop, Escape to cancel.`)
      }
      return
    }
    if (grabbed.id !== task.id) return
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault()
      const target = cols[colIndex + (e.key === "ArrowRight" ? 1 : -1)]
      if (!target) return
      move(task.id, target.id, Math.min(index, target.tasks.length))
      setAnnounce(`${task.title} moved to ${target.title}, position ${Math.min(index, target.tasks.length) + 1}.`)
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()
      const to = index + (e.key === "ArrowDown" ? 1 : -1)
      const column = cols[colIndex]
      if (to < 0 || to >= column.tasks.length) return
      move(task.id, colId, to)
      setAnnounce(`${task.title} moved to position ${to + 1} of ${column.tasks.length}.`)
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault()
      setGrabbed(null)
      setAnnounce(`Dropped ${task.title}.`)
    } else if (e.key === "Escape") {
      e.preventDefault()
      move(task.id, grabbed.from.col, grabbed.from.index)
      setGrabbed(null)
      setAnnounce(`Cancelled. ${task.title} is back where it was.`)
    }
  }

  function dropIndex(colEl: HTMLElement, y: number) {
    const cards = Array.from(colEl.querySelectorAll<HTMLElement>("[data-card]"))
    let i = cards.length
    for (let k = 0; k < cards.length; k++) {
      const r = cards[k].getBoundingClientRect()
      if (y < r.top + r.height / 2) {
        i = k
        break
      }
    }
    return i
  }

  function addTask(colId: string) {
    const text = draft.trim()
    if (!text) return setAdding(null)
    const id = `new-${total + 1}`
    commit(cols.map((c) => (c.id === colId ? { ...c, tasks: [...c.tasks, { id, title: text }] } : c)))
    setDraft("")
    setAdding(null)
    setAnnounce(`Added ${text}.`)
  }

  function remove(task: Kanban1Task) {
    commit(cols.map((c) => ({ ...c, tasks: c.tasks.filter((t) => t.id !== task.id) })))
    setAnnounce(`Removed ${task.title}.`)
  }

  return (
    <section data-slot="kanban-1" className={cn("mx-auto w-full max-w-7xl px-4 py-8 sm:px-6", className)} {...props}>
      <p role="status" className="sr-only">{announce}</p>
      <div className="flex flex-wrap items-end justify-between gap-4 px-1">
        <div className="max-w-xl">
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
          <p className="text-muted-foreground mt-1 text-sm text-pretty">{description}</p>
        </div>
        <div role="group" aria-label="Filter by person" className="flex max-w-full gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {people.map((p) => (
            <button key={p} type="button" aria-pressed={who === p} onClick={() => setWho(p)} className={cn("focus-visible:ring-ring/50 h-8 shrink-0 rounded-full border px-3.5 text-[13px] font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-[3px]", who === p ? "bg-foreground text-background border-transparent" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>{p === "Everyone" ? p : p.split(" ")[0]}</button>
          ))}
        </div>
      </div>

      <div ref={boardRef} className="mt-5 flex snap-x gap-3 overflow-x-auto pb-2" style={{ height }} tabIndex={-1}>
        {cols.map((col) => {
          const tasks = col.tasks.filter((t) => who === "Everyone" || t.assignee === who)
          return (
            <div
              key={col.id}
              role="group"
              aria-label={`${col.title}, ${col.tasks.length} tasks`}
              data-column={col.id}
              onDragOver={(e) => { if (!dragId) return; e.preventDefault(); setOver({ col: col.id, index: dropIndex(e.currentTarget, e.clientY) }) }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(null) }}
              onDrop={(e) => { e.preventDefault(); if (dragId && over) { const real = who === "Everyone" ? over.index : cols.find((c) => c.id === col.id)!.tasks.length; move(dragId, col.id, real); setAnnounce(`Moved to ${col.title}.`) } setDragId(null); setOver(null) }}
              className={cn("bg-muted/40 flex w-72 shrink-0 snap-start flex-col md:min-w-64 md:flex-1 rounded-2xl border p-2 transition-colors motion-reduce:transition-none", over?.col === col.id && "bg-accent/60 border-foreground/30")}
            >
              <div className="flex items-center justify-between px-2 py-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold">{col.title}<span className="bg-background text-muted-foreground rounded-full border px-2 py-px text-xs font-medium tabular-nums">{col.tasks.length}</span></h3>
                <Button variant="ghost" size="icon" className="size-7" aria-label={`Add a task to ${col.title}`} onClick={() => { setAdding(col.id); setDraft("") }}><Plus /></Button>
              </div>
              <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-1">
                {tasks.map((t, i) => {
                  const index = col.tasks.indexOf(t)
                  const picked = grabbed?.id === t.id
                  return (
                    <React.Fragment key={t.id}>
                      {over?.col === col.id && over.index === index && dragId !== t.id && <li aria-hidden="true" className="bg-foreground/60 -my-0.5 h-0.5 rounded-full" />}
                      <li data-card="" className={cn("group/card relative", dragId === t.id && "opacity-40")}>
                        <div
                          draggable
                          data-task={t.id}
                          tabIndex={0}
                          role="button"
                          aria-roledescription="draggable task"
                          aria-pressed={picked}
                          aria-label={`${t.title}${t.assignee ? `, assigned to ${t.assignee}` : ""}${t.due ? `, due ${t.due}` : ""}. Press Space to pick up.`}
                          onKeyDown={(e) => onCardKey(e, t, col.id, index)}
                          onBlur={() => picked && setGrabbed(null)}
                          onDragStart={(e) => { setDragId(t.id); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", t.id) }}
                          onDragEnd={() => { setDragId(null); setOver(null) }}
                          className={cn("bg-card focus-visible:ring-ring/50 cursor-grab rounded-xl border p-3.5 shadow-xs outline-none transition-shadow focus-visible:ring-[3px] active:cursor-grabbing motion-reduce:transition-none hover:shadow-md", picked && "ring-foreground ring-2 shadow-lg")}
                        >
                          {t.tags && t.tags.length > 0 && <div className="mb-2 flex flex-wrap gap-1">{t.tags.map((tag) => <Badge key={tag} variant="secondary" className="px-1.5 py-0 text-[11px]">{tag}</Badge>)}</div>}
                          <p className="pr-6 text-sm leading-snug font-medium text-pretty">{t.title}</p>
                          <div className="mt-3 flex items-center gap-3 text-xs">
                            {t.priority && <span className="text-muted-foreground flex items-center gap-1.5"><span aria-hidden="true" className={cn("size-2 rounded-full", priorityTone[t.priority])} />{t.priority[0].toUpperCase() + t.priority.slice(1)}</span>}
                            {t.due && <span className="text-muted-foreground flex items-center gap-1"><CalendarDays className="size-3.5" aria-hidden="true" />{t.due}</span>}
                            {t.comments ? <span className="text-muted-foreground flex items-center gap-1"><MessageSquare className="size-3.5" aria-hidden="true" />{t.comments}<span className="sr-only"> comments</span></span> : null}
                            {t.assignee && <Avatar size="sm" className="ml-auto size-6"><AvatarFallback className={cn("text-foreground text-[10px] font-semibold", toneOf(t.assignee))}>{initials(t.assignee)}</AvatarFallback></Avatar>}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger aria-label={`Actions for ${t.title}`} className="hover:bg-accent focus-visible:ring-ring/50 absolute top-2 right-2 flex size-7 items-center justify-center rounded-md opacity-0 outline-none group-focus-within/card:opacity-100 group-hover/card:opacity-100 focus-visible:ring-[3px] data-[state=open]:opacity-100 motion-reduce:transition-none"><MoreHorizontal className="size-4" aria-hidden="true" /></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Move to</DropdownMenuLabel>
                            {cols.filter((c) => c.id !== col.id).map((c) => <DropdownMenuItem key={c.id} onSelect={() => { move(t.id, c.id, c.tasks.length); setAnnounce(`${t.title} moved to ${c.title}.`) }}>{c.title}</DropdownMenuItem>)}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem destructive onSelect={() => remove(t)}><X /> Remove</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </li>
                      {i === tasks.length - 1 && over?.col === col.id && over.index >= col.tasks.length && <li aria-hidden="true" className="bg-foreground/60 -my-0.5 h-0.5 rounded-full" />}
                    </React.Fragment>
                  )
                })}
                {tasks.length === 0 && <li className="text-muted-foreground rounded-xl border border-dashed px-3 py-8 text-center text-xs">{over?.col === col.id ? "Drop here" : "No tasks"}</li>}
              </ul>
              {adding === col.id ? (
                <form className="p-1" onSubmit={(e) => { e.preventDefault(); addTask(col.id) }}>
                  <Input autoFocus aria-label={`New task in ${col.title}`} placeholder="Task title" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Escape" && setAdding(null)} onBlur={() => addTask(col.id)} />
                </form>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export { Kanban1, type Kanban1Props, type Kanban1Column, type Kanban1Task }

// Ballmac UI: Git Graph. https://ui.ballmac.com/components/git-graph
"use client"

import * as React from "react"
import { GitBranch, GitMerge, Tag } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type GitCommit = {
  /** Full commit hash (any unique string works). */
  hash: string
  /** Parent hashes. The first is the line this commit continues; more than one makes it a merge. */
  parents: string[]
  /** First line of the message. */
  message: string
  /** Author name. */
  author: string
  /** Commit date as an ISO string. Shown in UTC. */
  date: string
  /** Branch names pointing here. */
  branches?: string[]
  /** Tag names pointing here. */
  tags?: string[]
}

const LANE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]
const TONES = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

type Edge = { from: number; to: number; color: number }
type Row = {
  commit: GitCommit
  col: number
  color: number
  /** Lanes drawn straight through this row. */
  through: { lane: number; color: number }[]
  /** Lanes that arrive at this commit from above. */
  incoming: Edge[]
  /** Lines that leave this commit downward. */
  outgoing: Edge[]
}

/** Assigns each commit a lane. Commits must be newest first, parents after children. */
function layout(commits: GitCommit[]) {
  let lanes: (string | null)[] = []
  const laneColor: number[] = []
  let nextColor = 0
  const rows: Row[] = []
  let width = 1

  for (const commit of commits) {
    const before = lanes.slice()
    let col = before.indexOf(commit.hash)
    if (col === -1) {
      col = before.indexOf(null)
      if (col === -1) col = before.length
      laneColor[col] = nextColor++ % LANE_COLORS.length
    }
    const ending = before.map((h, l) => (h === commit.hash ? l : -1)).filter((l) => l >= 0)
    const incoming: Edge[] = ending.map((l) => ({ from: l, to: col, color: laneColor[l] ?? 0 }))

    const after = before.slice()
    while (after.length <= col) after.push(null)
    for (const l of ending) after[l] = null

    const outgoing: Edge[] = []
    commit.parents.forEach((parent, index) => {
      let target = after.indexOf(parent)
      if (target === -1) {
        if (index === 0) target = col
        else {
          target = after.indexOf(null)
          if (target === -1) target = after.length
          laneColor[target] = nextColor++ % LANE_COLORS.length
        }
        while (after.length <= target) after.push(null)
        after[target] = parent
        if (index === 0) laneColor[target] = laneColor[col] ?? 0
      }
      outgoing.push({ from: col, to: target, color: laneColor[target] ?? 0 })
    })

    const through = before
      .map((h, l) => (h !== null && h !== commit.hash && after[l] === h ? { lane: l, color: laneColor[l] ?? 0 } : null))
      .filter((x): x is { lane: number; color: number } => x !== null)

    while (after.length && after[after.length - 1] === null) after.pop()
    lanes = after
    width = Math.max(width, before.length, after.length, col + 1)
    rows.push({ commit, col, color: laneColor[col] ?? 0, through, incoming, outgoing })
  }
  return { rows, width }
}

const LANE = 18
const ROW = 56

function curve(x1: number, y1: number, x2: number, y2: number) {
  if (x1 === x2) return `M${x1} ${y1} L${x2} ${y2}`
  const mid = (y1 + y2) / 2
  return `M${x1} ${y1} C${x1} ${mid} ${x2} ${mid} ${x2} ${y2}`
}

function shortDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`
}

function hue(text: string) {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0
  return h % TONES.length
}

type GitGraphProps = Omit<React.ComponentProps<"div">, "onSelect" | "children"> & {
  /** Commits, newest first, parents after children. */
  commits: GitCommit[]
  /** Selected commit hash (controlled). */
  selected?: string
  /** Initially selected hash when uncontrolled. */
  defaultSelected?: string
  /** Called with the hash of the chosen commit. */
  onSelect?: (hash: string, commit: GitCommit) => void
  /** Accessible name of the list. */
  label?: string
  /** Hide the author column. */
  hideAuthors?: boolean
}

function GitGraph({
  commits,
  selected: selectedProp,
  defaultSelected,
  onSelect,
  label,
  hideAuthors = false,
  className,
  ...props
}: GitGraphProps) {
  const msg = useMessages()
  label ??= msg("git-graph.label", "Commit history")
  const uid = React.useId()
  const { rows, width } = React.useMemo(() => layout(commits), [commits])
  const [internal, setInternal] = React.useState(defaultSelected)
  const selected = selectedProp ?? internal
  const [active, setActive] = React.useState(0)
  const selectedIndex = Math.max(0, rows.findIndex((r) => r.commit.hash === selected))
  const optionId = (i: number) => `${uid}-${i}`
  const gutter = width * LANE + 12

  function choose(index: number) {
    const row = rows[index]
    if (!row) return
    setActive(index)
    if (selectedProp === undefined) setInternal(row.commit.hash)
    onSelect?.(row.commit.hash, row.commit)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const last = rows.length - 1
    const map: Record<string, number> = {
      ArrowDown: Math.min(last, active + 1),
      ArrowUp: Math.max(0, active - 1),
      Home: 0,
      End: last,
    }
    if (event.key in map) {
      event.preventDefault()
      setActive(map[event.key]!)
      document.getElementById(optionId(map[event.key]!))?.scrollIntoView({ block: "nearest" })
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      choose(active)
    }
  }

  return (
    <div
      data-slot="git-graph"
      className={cn("@container w-full overflow-hidden rounded-xl border bg-card text-card-foreground", className)}
      {...props}
    >
      <div
        role="listbox"
        aria-label={label}
        tabIndex={0}
        aria-activedescendant={optionId(active)}
        onKeyDown={onKeyDown}
        onFocus={() => setActive((a) => (a === 0 && selectedIndex ? selectedIndex : a))}
        className="max-h-[32rem] overflow-auto outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50"
      >
        {rows.map((row, i) => {
          const c = row.commit
          const isSelected = c.hash === selected
          const merge = c.parents.length > 1
          const x = (lane: number) => lane * LANE + LANE / 2 + 6
          const mid = ROW / 2
          const refs = [...(c.branches ?? []), ...(c.tags ?? [])]
          const refChips = refs.map((r) => {
            const tag = c.tags?.includes(r) && !c.branches?.includes(r)
            return (
              <span key={r} className="inline-flex shrink-0 items-center gap-1 rounded-full border bg-background px-1.5 py-px font-mono text-[11px] text-foreground">
                {tag ? <Tag aria-hidden="true" className="size-3" /> : <GitBranch aria-hidden="true" className="size-3" />}
                {r}
              </span>
            )
          })
          const desc = `${c.message}, by ${c.author}, ${shortDate(c.date)}, ${c.hash.slice(0, 7)}${merge ? ", merge commit" : ""}${c.branches?.length ? `, branch ${c.branches.join(", ")}` : ""}${c.tags?.length ? `, tag ${c.tags.join(", ")}` : ""}`
          return (
            <div
              key={c.hash}
              id={optionId(i)}
              role="option"
              aria-selected={isSelected}
              aria-label={desc}
              data-active={active === i || undefined}
              onClick={() => choose(i)}
              className={cn(
                "relative flex cursor-pointer items-center gap-3 pe-4 transition-colors duration-100 select-none hover:bg-accent/50 motion-reduce:transition-none",
                isSelected && "bg-accent",
                active === i && "outline-2 -outline-offset-2 outline-ring/60 [&:not(:focus-within)]:outline-0 group-focus-within:outline-2"
              )}
              style={{ height: ROW }}
            >
              <svg aria-hidden="true" width={gutter} height={ROW} className="shrink-0 overflow-visible">
                {row.through.map((t) => (
                  <path key={`t${t.lane}`} d={`M${x(t.lane)} 0 L${x(t.lane)} ${ROW}`} stroke={LANE_COLORS[t.color]} strokeWidth="2" fill="none" />
                ))}
                {row.incoming.map((e, k) => (
                  <path key={`i${k}`} d={curve(x(e.from), 0, x(e.to), mid)} stroke={LANE_COLORS[e.color]} strokeWidth="2" fill="none" />
                ))}
                {row.outgoing.map((e, k) => (
                  <path key={`o${k}`} d={curve(x(e.from), mid, x(e.to), ROW)} stroke={LANE_COLORS[e.color]} strokeWidth="2" fill="none" />
                ))}
                <circle cx={x(row.col)} cy={mid} r={merge ? 6 : 5} className="fill-card" stroke={LANE_COLORS[row.color]} strokeWidth="2.5" />
                {merge && <circle cx={x(row.col)} cy={mid} r="2" fill={LANE_COLORS[row.color]} />}
              </svg>
              <div className="min-w-0 flex-1 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-sm font-medium text-foreground">{c.message}</p>
                  <span className="hidden items-center gap-1.5 @md:flex">{refChips}</span>
                </div>
                <p className="mt-0.5 flex items-center gap-2 overflow-hidden text-xs whitespace-nowrap text-muted-foreground">
                  <code className="font-mono text-foreground/80">{c.hash.slice(0, 7)}</code>
                  {merge && (
                    <span className="inline-flex items-center gap-0.5">
                      <GitMerge aria-hidden="true" className="size-3" />
                      {msg("git-graph.merge", "Merge")}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 @md:hidden">{refChips}</span>
                </p>
              </div>
              {!hideAuthors && (
                <span className="hidden shrink-0 items-center gap-2 text-xs text-muted-foreground @md:flex">
                  <span aria-hidden="true" className={cn("flex size-5 items-center justify-center rounded-full text-[10px] font-semibold text-background uppercase", TONES[hue(c.author)])}>
                    {c.author.charAt(0)}
                  </span>
                  <span className="max-w-24 truncate">{c.author}</span>
                </span>
              )}
              <time dateTime={c.date} className="w-12 shrink-0 text-end text-xs text-muted-foreground tabular-nums">
                {shortDate(c.date)}
              </time>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { GitGraph, layout as layoutCommits, type GitGraphProps, type GitCommit }

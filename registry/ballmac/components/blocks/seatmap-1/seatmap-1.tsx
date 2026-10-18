// Ballmac UI: Seat map 1. https://ui.ballmac.com/blocks/seatmap-1
"use client"

import * as React from "react"
import { Accessibility, CircleAlert, Loader2, Armchair, Sparkles, Ticket, X } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Seatmap1Tier = { id: string; label: string; price: number }
type Seatmap1Seat = { id: string; row: string; number: number; tier: string; taken?: boolean; accessible?: boolean }
type Seatmap1Row = { row: string; tier: string; /** Seat numbers to leave empty, such as a walkway. */ gaps?: number[]; seats: number }

type Seatmap1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    /** "Dune: Part Three · Sat 24 Oct, 20:15 · Screen 2". */
    show?: string
    tiers?: Seatmap1Tier[]
    rows?: Seatmap1Row[]
    /** Ids like "C7" that are already taken. */
    taken?: string[]
    /** Ids of seats set aside for wheelchair users. */
    accessible?: string[]
    maxSeats?: number
    currency?: string
    locale?: string
    defaultSelected?: string[]
    /** Called to hold the seats. Return a promise; reject, and put `taken: string[]` on the error if someone else got a seat first. */
    onContinue?: (seats: Seatmap1Seat[], total: number) => void | Promise<void>
  }

const tiers0: Seatmap1Tier[] = [{ id: "std", label: "Standard", price: 12 }, { id: "prem", label: "Premium", price: 16 }, { id: "rec", label: "Recliner", price: 22 }]
const rows0: Seatmap1Row[] = "ABCDEFGHI".split("").map((r, i) => ({ row: r, tier: i < 3 ? "std" : i < 7 ? "prem" : "rec", seats: i < 3 ? 12 : 14, gaps: i < 3 ? [6] : [7] }))
const taken0 = ["B4", "B5", "C9", "D6", "D7", "D8", "E3", "E10", "E11", "F7", "F8", "G5", "G12", "H2", "H3", "H9", "I6", "I7", "A3", "A10"]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Skeleton className="h-[30rem] rounded-3xl" />
      <Skeleton className="h-64 rounded-3xl" />
    </div>
  )
}

/**
 * A seat map for a cinema, theatre or venue: a screen at the front, rows of seats with walkways, three price tiers, taken and wheelchair seats marked in words
 * as well as color, up to a limit chosen seats with their prices and a running total, and a helper that picks the best seats together for a party. It works
 * from the keyboard with the arrow keys, and if someone else takes a seat first the hold fails, those seats are marked taken and your others stay chosen.
 */
function Seatmap1({
  title = "Choose your seats",
  show = "Dune: Part Three · Sat 24 Oct, 20:15 · Screen 2",
  tiers = tiers0,
  rows = rows0,
  taken: takenProp = taken0,
  accessible = ["A1", "A12"],
  maxSeats = 6,
  currency = "USD",
  locale = "en",
  defaultSelected = [],
  onContinue,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Seatmap1Props) {
  const id = React.useId()
  const [takenIds, setTakenIds] = React.useState<string[]>(takenProp)
  React.useEffect(() => setTakenIds(takenProp), [takenProp])
  const [selected, setSelected] = React.useState<string[]>(defaultSelected)
  const [party, setParty] = React.useState(2)
  const [focusId, setFocusId] = React.useState<string>(() => rows[0] ? `${rows[0].row}1` : "")
  const [sending, setSending] = React.useState(false)
  const [error, setError] = React.useState<string>()
  const [done, setDone] = React.useState(false)
  const [announce, setAnnounce] = React.useState("")
  const grid = React.useRef<HTMLDivElement>(null)
  const money = (n: number) => new Intl.NumberFormat(locale, { style: "currency", currency }).format(n)
  const tier = (t: string) => tiers.find((x) => x.id === t) ?? tiers[0]!

  const seats = React.useMemo(() => rows.flatMap((r) => Array.from({ length: r.seats }, (_, i) => i + 1).filter((n) => !(r.gaps ?? []).includes(n)).map((n): Seatmap1Seat => ({ id: `${r.row}${n}`, row: r.row, number: n, tier: r.tier, accessible: accessible.includes(`${r.row}${n}`) }))), [rows, accessible])
  const byId = React.useMemo(() => new Map(seats.map((s) => [s.id, s])), [seats])
  const isTaken = (s: Seatmap1Seat) => takenIds.includes(s.id)
  const chosen = selected.map((i) => byId.get(i)).filter((s): s is Seatmap1Seat => !!s)
  const total = chosen.reduce((n, s) => n + tier(s.tier).price, 0)
  const empty = state === "empty"

  const toggle = (s: Seatmap1Seat) => {
    if (isTaken(s) || done) return
    setError(undefined)
    setSelected((cur) => {
      if (cur.includes(s.id)) { setAnnounce(`Row ${s.row}, seat ${s.number} removed`); return cur.filter((x) => x !== s.id) }
      if (cur.length >= maxSeats) { setError(`You can choose up to ${maxSeats} seats. Remove one to pick another.`); return cur }
      setAnnounce(`Row ${s.row}, seat ${s.number} added, ${tier(s.tier).label}, ${money(tier(s.tier).price)}`)
      return [...cur, s.id]
    })
  }

  // Best seats: the middle of the best-priced middle rows, as a block of neighbours with no taken seat between them.
  function best() {
    setError(undefined)
    const order = [...rows].sort((a, b) => Math.abs(rows.indexOf(a) - rows.length * 0.55) - Math.abs(rows.indexOf(b) - rows.length * 0.55))
    for (const r of order) {
      const rowSeats = seats.filter((s) => s.row === r.row)
      const mid = (r.seats + 1) / 2
      let pick: Seatmap1Seat[] | null = null
      let score = Infinity
      for (let i = 0; i + party <= rowSeats.length; i++) {
        const block = rowSeats.slice(i, i + party)
        const contiguous = block.every((s, k) => k === 0 || s.number === block[k - 1]!.number + 1)
        if (!contiguous || block.some((s) => isTaken(s) || s.accessible)) continue
        const d = Math.abs(block.reduce((n, s) => n + s.number, 0) / party - mid)
        if (d < score) { score = d; pick = block }
      }
      if (pick) {
        setSelected(pick.map((s) => s.id))
        setFocusId(pick[0]!.id)
        setAnnounce(`${party} seats together chosen in row ${r.row}`)
        return
      }
    }
    setError(`There are no ${party} seats together left. Try a smaller group.`)
  }

  function move(e: React.KeyboardEvent, s: Seatmap1Seat) {
    const ri = rows.findIndex((r) => r.row === s.row)
    const rowSeats = seats.filter((x) => x.row === s.row)
    const si = rowSeats.indexOf(s)
    let next: Seatmap1Seat | undefined
    if (e.key === "ArrowRight") next = rowSeats[Math.min(rowSeats.length - 1, si + 1)]
    else if (e.key === "ArrowLeft") next = rowSeats[Math.max(0, si - 1)]
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      const tr = rows[ri + (e.key === "ArrowDown" ? 1 : -1)]
      if (tr) { const rs = seats.filter((x) => x.row === tr.row); next = rs.reduce((a, b) => (Math.abs(b.number / tr.seats - s.number / rows[ri]!.seats) < Math.abs(a.number / tr.seats - s.number / rows[ri]!.seats) ? b : a)) }
    } else if (e.key === "Home") next = rowSeats[0]
    else if (e.key === "End") next = rowSeats.at(-1)
    else return
    e.preventDefault()
    if (next) { setFocusId(next.id); requestAnimationFrame(() => grid.current?.querySelector<HTMLElement>(`[data-seat="${next!.id}"]`)?.focus()) }
  }

  async function hold() {
    setError(undefined)
    setSending(true)
    try {
      await onContinue?.(chosen, total)
      setDone(true)
      setAnnounce("Your seats are held")
    } catch (e) {
      const lost = (e as { taken?: string[] }).taken
      if (lost?.length) {
        setTakenIds((t) => [...new Set([...t, ...lost])])
        setSelected((cur) => cur.filter((x) => !lost.includes(x)))
        setError(`${lost.map((l) => `${byId.get(l)?.row ?? ""}${byId.get(l)?.number ?? l}`).join(", ")} ${lost.length === 1 ? "was" : "were"} just taken by someone else. Your other seats are still chosen.`)
      } else setError(e instanceof Error ? e.message : "We could not hold your seats. Nothing was charged, so try again.")
    } finally {
      setSending(false)
    }
  }

  const content = empty ? (
    <div className="bg-card rounded-3xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <Ticket className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "No showing selected"}</h2>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm text-pretty">{emptyState?.description ?? "Choose a date and time first, then the seats for it appear here."}</p>
      {emptyState?.action}
    </div>
  ) : done ? (
    <div role="status" className="bg-card rounded-3xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-chart-2/15 mx-auto flex size-14 items-center justify-center rounded-full">
        <Ticket className="size-7" />
      </span>
      <h2 className="mt-5 text-2xl font-semibold tracking-tight">Seats held for you</h2>
      <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-pretty">
        {chosen.map((s) => `${s.row}${s.number}`).join(", ")} for {show.split("·")[0]!.trim()}. Pay within 10 minutes to keep them. Total {money(total)}.
      </p>
    </div>
  ) : (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="bg-card min-w-0 rounded-3xl border p-4 sm:p-7">
        <div aria-hidden="true" className="mx-auto mb-8 max-w-md">
          <div className="from-foreground/25 mx-auto h-1.5 rounded-[50%] bg-gradient-to-b to-transparent" style={{ boxShadow: "0 14px 22px -8px color-mix(in oklab, var(--foreground) 22%, transparent)" }} />
          <p className="text-muted-foreground mt-2 text-center text-xs tracking-widest uppercase">Screen</p>
        </div>
        <div role="region" tabIndex={0} aria-label="Seat map" className="focus-visible:ring-ring/50 overflow-x-auto rounded-xl pb-2 outline-none focus-visible:ring-[3px]">
          <div ref={grid} role="grid" aria-label={`Seats, rows ${rows[0]?.row} to ${rows.at(-1)?.row}`} dir="ltr" className="mx-auto grid w-max gap-1.5">
            {rows.map((r) => (
              <div key={r.row} role="row" className="flex items-center gap-1.5">
                <span aria-hidden="true" className="text-muted-foreground w-5 text-center text-xs font-medium">
                  {r.row}
                </span>
                {Array.from({ length: r.seats }, (_, i) => i + 1).map((n) => {
                  if ((r.gaps ?? []).includes(n)) return <span key={n} role="presentation" className="w-4" />
                  const s = byId.get(`${r.row}${n}`)!
                  const t = tier(s.tier)
                  const tk = isTaken(s)
                  const on = selected.includes(s.id)
                  return (
                    <button
                      key={n}
                      type="button"
                      role="gridcell"
                      data-seat={s.id}
                      aria-selected={on}
                      aria-disabled={tk || undefined}
                      tabIndex={focusId === s.id ? 0 : -1}
                      aria-label={`Row ${s.row}, seat ${s.number}, ${t.label}, ${money(t.price)}${s.accessible ? ", wheelchair space" : ""}, ${tk ? "taken" : on ? "selected" : "available"}`}
                      onFocus={() => setFocusId(s.id)}
                      onKeyDown={(e) => move(e, s)}
                      onClick={() => toggle(s)}
                      className={cn(
                        "focus-visible:ring-ring/60 relative flex size-7 items-center justify-center rounded-t-lg rounded-b-sm border text-[10px] font-medium tabular-nums outline-none transition-[transform,background-color] focus-visible:ring-[3px] motion-reduce:transition-none sm:size-8",
                        tk ? "bg-muted text-muted-foreground cursor-not-allowed border-transparent" : on ? "bg-foreground text-background border-foreground scale-110" : s.tier === "rec" ? "bg-chart-5/20 border-chart-5/50 hover:bg-chart-5/35" : s.tier === "prem" ? "bg-chart-1/15 border-chart-1/40 hover:bg-chart-1/30" : "bg-background hover:bg-accent"
                      )}
                    >
                      {tk ? <X aria-hidden="true" className="size-3.5" /> : s.accessible ? <Accessibility aria-hidden="true" className="size-4" /> : on ? <Armchair aria-hidden="true" className="size-4" /> : n}
                    </button>
                  )
                })}
                <span aria-hidden="true" className="text-muted-foreground w-5 text-center text-xs font-medium">
                  {r.row}
                </span>
              </div>
            ))}
          </div>
        </div>
        <ul className="text-muted-foreground mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs">
          {tiers.map((t) => (
            <li key={t.id} className="flex items-center gap-2">
              <span aria-hidden="true" className={cn("size-4 rounded-t-md rounded-b-sm border", t.id === "rec" ? "bg-chart-5/20 border-chart-5/50" : t.id === "prem" ? "bg-chart-1/15 border-chart-1/40" : "bg-background")} />
              {t.label} {money(t.price)}
            </li>
          ))}
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="bg-foreground size-4 rounded-t-md rounded-b-sm" />
            Selected
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="bg-muted flex size-4 items-center justify-center rounded-t-md rounded-b-sm">
              <X className="size-3" />
            </span>
            Taken
          </li>
          <li className="flex items-center gap-2">
            <Accessibility aria-hidden="true" className="size-4" />
            Wheelchair space
          </li>
        </ul>
      </div>

      <aside aria-labelledby={`${id}-sum`} className="bg-card rounded-3xl border p-5 sm:p-6 lg:sticky lg:top-6">
        <h2 id={`${id}-sum`} className="font-semibold tracking-tight">
          Your seats <span className="text-muted-foreground font-normal tabular-nums">· {chosen.length} of {maxSeats}</span>
        </h2>
        <div className="bg-muted/50 mt-4 rounded-2xl p-4">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Sparkles aria-hidden="true" className="size-4" />
            Best seats together
          </p>
          <div className="mt-3 flex items-center gap-2">
            <label htmlFor={`${id}-p`} className="text-muted-foreground text-sm">
              For
            </label>
            <select id={`${id}-p`} value={party} onChange={(e) => setParty(Number(e.target.value))} className="bg-background focus-visible:ring-ring/50 h-9 rounded-md border px-2 text-sm outline-none focus-visible:ring-[3px]">
              {Array.from({ length: maxSeats }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "person" : "people"}
                </option>
              ))}
            </select>
            <Button size="sm" variant="outline" onClick={best} className="ms-auto">
              Pick for me
            </Button>
          </div>
        </div>

        {chosen.length ? (
          <ul className="mt-4 grid gap-2">
            {chosen.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <span className="font-semibold">
                    Row {s.row}, seat {s.number}
                  </span>
                  <span className="text-muted-foreground block text-xs">{tier(s.tier).label}</span>
                </span>
                <span className="flex items-center gap-1 tabular-nums">
                  {money(tier(s.tier).price)}
                  <Button variant="ghost" size="icon" aria-label={`Remove row ${s.row}, seat ${s.number}`} onClick={() => toggle(s)}>
                    <X aria-hidden="true" />
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground mt-4 text-sm text-pretty">Press a seat to choose it, or let us pick the best ones together.</p>
        )}

        <div className="mt-5 flex items-baseline justify-between border-t pt-4">
          <p className="text-muted-foreground text-sm">Total</p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{money(total)}</p>
        </div>
        {error ? (
          <p role="alert" className="text-destructive mt-3 flex items-start gap-2 text-sm">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        ) : null}
        <Button className="mt-4 w-full" size="lg" disabled={!chosen.length || sending} onClick={() => void hold()}>
          {sending ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <Ticket aria-hidden="true" />}
          {sending ? "Holding" : chosen.length ? `Hold ${chosen.length} ${chosen.length === 1 ? "seat" : "seats"}` : "Choose seats"}
        </Button>
      </aside>
    </div>
  )

  return (
    <section data-slot="seatmap-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 text-pretty">{show}</p>
      </header>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading the seats" loading={<Skel />} error={{ title: errorState?.title ?? "The seats could not be loaded", description: errorState?.description ?? "Nothing was held. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </section>
  )
}

export { Seatmap1, type Seatmap1Props, type Seatmap1Seat, type Seatmap1Tier, type Seatmap1Row }

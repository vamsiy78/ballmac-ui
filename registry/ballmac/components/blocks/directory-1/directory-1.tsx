// Ballmac UI: Directory 1. https://ui.ballmac.com/blocks/directory-1
"use client"

import * as React from "react"
import { Clock, LayoutGrid, List, Mail, MapPin, Search, UsersRound, X } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { CoverArt } from "@/components/ballmac/cover-art"
import { MatchHighlight, matchesAll, queryTokens } from "@/components/ballmac/match-highlight"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ballmac/select"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Directory1Person = {
  id: string
  name: string
  title: string
  department: string
  location: string
  /** Hours from UTC, such as 1 or -5 or 5.5. Used to show their local time. */
  utcOffset: number
  email?: string
  /** "she/her", shown beside the name when given. */
  pronouns?: string
  status?: "available" | "away" | "out"
}

type Directory1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    people?: Directory1Person[]
    title?: string
    description?: string
    /** An ISO date and time in UTC for "now". The block never reads the clock. */
    now?: string
    locale?: string
    defaultView?: "grid" | "list"
    onSelect?: (person: Directory1Person) => void
  }

const sample: Directory1Person[] = [
  { id: "1", name: "Mara Ellison", title: "Chief Executive", department: "Leadership", location: "Lisbon", utcOffset: 1, email: "mara@acme.com", pronouns: "she/her", status: "available" },
  { id: "2", name: "Theo Nakamura", title: "Chief Technology Officer", department: "Engineering", location: "Osaka", utcOffset: 9, email: "theo@acme.com", status: "away" },
  { id: "3", name: "Priya Shah", title: "Head of Platform", department: "Engineering", location: "Lisbon", utcOffset: 1, email: "priya@acme.com", pronouns: "she/her", status: "available" },
  { id: "4", name: "Diego Marín", title: "Staff Engineer", department: "Engineering", location: "Madrid", utcOffset: 2, email: "diego@acme.com", status: "available" },
  { id: "5", name: "Kofi Mensah", title: "Senior Engineer", department: "Engineering", location: "Accra", utcOffset: 0, email: "kofi@acme.com", status: "out" },
  { id: "6", name: "Noor Haddad", title: "Head of Design", department: "Design", location: "Porto", utcOffset: 1, email: "noor@acme.com", pronouns: "she/they", status: "available" },
  { id: "7", name: "Amara Okoye", title: "Product Designer", department: "Design", location: "Lagos", utcOffset: 1, email: "amara@acme.com", status: "available" },
  { id: "8", name: "Jordan Lee", title: "Design Systems Lead", department: "Design", location: "New York", utcOffset: -4, email: "jordan@acme.com", status: "away" },
  { id: "9", name: "Sam Okafor", title: "Head of Support", department: "Support", location: "Dublin", utcOffset: 1, email: "sam@acme.com", status: "available" },
  { id: "10", name: "Mia Laurent", title: "Support Specialist", department: "Support", location: "Paris", utcOffset: 2, email: "mia@acme.com", status: "available" },
  { id: "11", name: "Alex Kim", title: "Support Lead", department: "Support", location: "Seoul", utcOffset: 9, email: "alex@acme.com", status: "out" },
  { id: "12", name: "Ana Souza", title: "Head of Operations", department: "Operations", location: "Lisbon", utcOffset: 1, email: "ana@acme.com", status: "available" },
  { id: "13", name: "Oliver Reed", title: "Finance Manager", department: "Operations", location: "London", utcOffset: 1, email: "oliver@acme.com", pronouns: "he/him", status: "away" },
  { id: "14", name: "Yuki Tanaka", title: "Frontend Engineer", department: "Engineering", location: "Tokyo", utcOffset: 9, email: "yuki@acme.com", status: "available" },
]

const statusMeta = { available: { label: "Available", dot: "bg-chart-2" }, away: { label: "Away", dot: "bg-amber-400" }, out: { label: "Out of office", dot: "bg-muted-foreground/50" } }
const initials = (n: string) => n.split(" ").map((w) => w[0]).join("").slice(0, 2)

function Avatar({ p, size }: { p: Directory1Person; size: "md" | "lg" }) {
  const s = p.status ? statusMeta[p.status] : null
  return (
    <span aria-hidden="true" className={cn("relative flex shrink-0 items-center justify-center rounded-full border font-semibold", size === "lg" ? "size-16 text-lg" : "size-11 text-sm")}>
      <span className="absolute inset-0 overflow-hidden rounded-full">
        <CoverArt seed={p.name} variant="mesh" className="absolute inset-0" />
      </span>
      <span className="relative">{initials(p.name)}</span>
      {s ? <span className={cn("border-card absolute end-0 bottom-0 size-3.5 rounded-full border-2", s.dot)} /> : null}
    </span>
  )
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="bg-card rounded-2xl border p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="mt-5 h-3 w-1/3" />
        </div>
      ))}
    </div>
  )
}

/**
 * A people directory: search across names, roles and departments, department chips with counts, a location filter, a grid and a compact list,
 * each person with availability and their local time right now. The time is worked out from the moment you pass, never from the clock.
 */
function Directory1({
  people = sample,
  title = "Our people",
  description = "Find who does what, where they are, and whether it is a good time to write.",
  now = "2026-10-18T10:42:00Z",
  locale = "en",
  defaultView = "grid",
  onSelect,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Directory1Props) {
  const id = React.useId()
  const all = state === "empty" ? [] : people
  const [query, setQuery] = React.useState("")
  const [dept, setDept] = React.useState<string | null>(null)
  const [place, setPlace] = React.useState("all")
  const [view, setView] = React.useState<"grid" | "list">(defaultView)
  const tokens = queryTokens(query)
  const fmt = React.useMemo(() => new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }), [locale])
  const nowMs = Date.parse(now)
  const localTime = (p: Directory1Person) => fmt.format(nowMs + p.utcOffset * 3_600_000)
  const localHour = (p: Directory1Person) => new Date(nowMs + p.utcOffset * 3_600_000).getUTCHours()

  const matches = (p: Directory1Person) => !tokens.length || matchesAll(`${p.name} ${p.title} ${p.department} ${p.location}`, tokens)
  const departments = [...new Set(all.map((p) => p.department))]
  const places = [...new Set(all.map((p) => p.location))].sort()
  const inPlace = (p: Directory1Person) => place === "all" || p.location === place
  const shown = all.filter((p) => matches(p) && inPlace(p) && (!dept || p.department === dept)).sort((a, b) => a.name.localeCompare(b.name, locale))
  const countFor = (d: string | null) => all.filter((p) => matches(p) && inPlace(p) && (d ? p.department === d : true)).length
  const filtered = !!(tokens.length || dept || place !== "all")

  const card = (p: Directory1Person) => {
    const night = localHour(p) < 7 || localHour(p) >= 21
    const s = p.status ? statusMeta[p.status] : null
    const body = (
      <>
        <Avatar p={p} size={view === "grid" ? "lg" : "md"} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold tracking-tight">
            <MatchHighlight text={p.name} query={tokens} />
            {p.pronouns ? <span className="text-muted-foreground ms-2 text-xs font-normal">{p.pronouns}</span> : null}
          </span>
          <span className="text-muted-foreground block truncate text-sm">
            <MatchHighlight text={p.title} query={tokens} />
          </span>
          {view === "grid" ? (
            <span className="bg-muted mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium">
              <MatchHighlight text={p.department} query={tokens} />
            </span>
          ) : null}
        </span>
      </>
    )
    return view === "grid" ? (
      <li key={p.id}>
        <article className="bg-card hover:border-foreground/30 group relative h-full rounded-2xl border p-5 transition-[border-color,box-shadow] duration-150 hover:shadow-md motion-reduce:transition-none">
          <button type="button" onClick={() => onSelect?.(p)} className="focus-visible:ring-ring/50 flex w-full items-center gap-4 rounded-lg text-start outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:ring-[3px]">
            {body}
          </button>
          <dl className="text-muted-foreground mt-5 grid gap-2 border-t pt-4 text-sm">
            <div className="flex items-center gap-2">
              <dt className="sr-only">Location</dt>
              <MapPin aria-hidden="true" className="size-4 shrink-0" />
              <dd className="truncate">
                <MatchHighlight text={p.location} query={tokens} />
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Their time</dt>
              <Clock aria-hidden="true" className="size-4 shrink-0" />
              <dd className="tabular-nums">
                {localTime(p)}
                {night ? <span> · probably offline</span> : null}
              </dd>
            </div>
            {s ? (
              <div className="flex items-center gap-2">
                <dt className="sr-only">Status</dt>
                <span aria-hidden="true" className={cn("ms-1 size-2 rounded-full", s.dot)} />
                <dd>{s.label}</dd>
              </div>
            ) : null}
          </dl>
          {p.email ? (
            <a href={`mailto:${p.email}`} aria-label={`Email ${p.name}`} className="hover:bg-accent focus-visible:ring-ring/50 absolute end-4 top-4 z-10 flex size-8 items-center justify-center rounded-full border opacity-0 outline-none transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:ring-[3px] motion-reduce:transition-none [@media(hover:none)]:opacity-100">
              <Mail aria-hidden="true" className="size-4" />
            </a>
          ) : null}
        </article>
      </li>
    ) : (
      <li key={p.id} className="hover:bg-accent/40 relative flex items-center gap-4 px-4 py-3 transition-colors motion-reduce:transition-none">
        <button type="button" onClick={() => onSelect?.(p)} className="focus-visible:ring-ring/50 flex min-w-0 flex-1 items-center gap-4 rounded-lg text-start outline-none after:absolute after:inset-0 focus-visible:ring-[3px]">
          {body}
        </button>
        <span className="text-muted-foreground hidden w-32 truncate text-sm md:block">
          <span className="sr-only">Department: </span>
          <MatchHighlight text={p.department} query={tokens} />
        </span>
        <span className="text-muted-foreground hidden w-28 truncate text-sm sm:block">
          <span className="sr-only">Location: </span>
          <MatchHighlight text={p.location} query={tokens} />
        </span>
        <span className="text-muted-foreground w-14 text-end text-sm tabular-nums">
          <span className="sr-only">Their time: </span>
          {localTime(p)}
        </span>
      </li>
    )
  }

  const content = !all.length ? (
    <div className="bg-card rounded-2xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <UsersRound className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "Nobody is listed yet"}</h2>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm text-pretty">{emptyState?.description ?? "People appear here once they are added to the directory."}</p>
      {emptyState?.action}
    </div>
  ) : (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="bg-background focus-within:ring-ring/50 flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border px-3 focus-within:ring-[3px]">
          <Search aria-hidden="true" className="text-muted-foreground size-4" />
          <input type="search" aria-label="Search people" placeholder="Search by name, role, team or city" value={query} onChange={(e) => setQuery(e.target.value)} className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </div>
        <div className="flex items-center gap-3">
          <Select value={place} onValueChange={setPlace}>
            <SelectTrigger aria-label="Location" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {places.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SegmentedControl value={view} onValueChange={(v) => setView(v as "grid" | "list")} aria-label="View" size="sm">
            <SegmentedControlItem value="grid" aria-label="Grid">
              <LayoutGrid aria-hidden="true" className="size-4" />
            </SegmentedControlItem>
            <SegmentedControlItem value="list" aria-label="List">
              <List aria-hidden="true" className="size-4" />
            </SegmentedControlItem>
          </SegmentedControl>
        </div>
      </div>
      <div role="group" aria-label="Filter by department" className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        {[null, ...departments].map((d) => (
          <button
            key={d ?? "all"}
            type="button"
            aria-pressed={dept === d}
            onClick={() => setDept(d)}
            className={cn("focus-visible:ring-ring/50 shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", dept === d ? "bg-foreground text-background border-foreground" : "hover:bg-accent")}
          >
            {d ?? "Everyone"} <span className={cn("tabular-nums", dept === d ? "opacity-70" : "text-muted-foreground")}>{countFor(d)}</span>
          </button>
        ))}
      </div>

      <p aria-live="polite" className="text-muted-foreground mt-6 text-sm">
        {shown.length} {shown.length === 1 ? "person" : "people"}
        {filtered ? " match" : ""}
      </p>

      {shown.length ? (
        view === "grid" ? (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{shown.map(card)}</ul>
        ) : (
          <ul className="bg-card mt-4 divide-y overflow-hidden rounded-2xl border">{shown.map(card)}</ul>
        )
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed px-6 py-14 text-center">
          <p className="font-medium">Nobody matches</p>
          <p className="text-muted-foreground mt-1 text-sm">Try fewer words, or look across every team and city.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setQuery("")
              setDept(null)
              setPlace("all")
            }}
          >
            <X aria-hidden="true" />
            Clear filters
          </Button>
        </div>
      )}
    </>
  )

  return (
    <section data-slot="directory-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16", className)} {...frameProps(props)}>
      <header className="mb-8 max-w-2xl">
        <h1 id={`${id}-title`} className="text-4xl font-semibold tracking-[-0.04em] text-balance">
          {title}
        </h1>
        <p className="text-muted-foreground mt-3 text-lg text-pretty">{description}</p>
      </header>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading the directory" loading={<Skel />} error={{ title: errorState?.title ?? "The directory could not be loaded", description: errorState?.description ?? "Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
    </section>
  )
}

export { Directory1, type Directory1Props, type Directory1Person }

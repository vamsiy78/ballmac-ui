// Ballmac UI: Org Chart 1. https://ui.ballmac.com/blocks/orgchart-1
"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"
import { ChevronsDownUp, ChevronsUpDown, Mail, MapPin, Minus, Network, Search, UserRound, UsersRound } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { CoverArt } from "@/components/ballmac/cover-art"
import { MatchHighlight, matchesAll, queryTokens } from "@/components/ballmac/match-highlight"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { useDirection } from "@/lib/ballmac/direction"
import { cn } from "@/lib/utils"

type Org1Person = {
  id: string
  name: string
  title: string
  /** The team, shown as a small label. */
  team?: string
  location?: string
  email?: string
  /** The people who report to this person. */
  reports?: Org1Person[]
}

type Org1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    /** The top of the organization. */
    root?: Org1Person
    title?: string
    description?: string
    /** How many levels are open at first. 1 shows only the top. */
    defaultExpandedDepth?: number
    /** The person whose details are open at first. */
    defaultSelectedId?: string
    /** Called when a person is chosen. */
    onSelect?: (person: Org1Person) => void
  }

const sample: Org1Person = {
  id: "mara",
  name: "Mara Ellison",
  title: "Chief Executive",
  location: "Lisbon",
  email: "mara@acme.com",
  reports: [
    {
      id: "theo",
      name: "Theo Nakamura",
      title: "Chief Technology Officer",
      team: "Engineering",
      location: "Osaka",
      email: "theo@acme.com",
      reports: [
        { id: "priya", name: "Priya Shah", title: "Head of Platform", team: "Engineering", location: "Lisbon", email: "priya@acme.com", reports: [{ id: "diego", name: "Diego Marín", title: "Staff Engineer", team: "Platform", location: "Madrid" }, { id: "kofi", name: "Kofi Mensah", title: "Senior Engineer", team: "Platform", location: "Accra" }] },
        { id: "lena", name: "Lena Fischer", title: "Head of Product Engineering", team: "Engineering", location: "Berlin", reports: [{ id: "yuki", name: "Yuki Tanaka", title: "Engineer", team: "Web", location: "Tokyo" }, { id: "oliver", name: "Oliver Reed", title: "Engineer", team: "Desktop", location: "Leeds" }] },
      ],
    },
    {
      id: "noor",
      name: "Noor Haddad",
      title: "Head of Design",
      team: "Design",
      location: "Porto",
      email: "noor@acme.com",
      reports: [
        { id: "amara", name: "Amara Okoye", title: "Product Designer", team: "Design", location: "Lagos" },
        { id: "jordan", name: "Jordan Lee", title: "Design Systems Lead", team: "Design", location: "Lisbon" },
        { id: "ines", name: "Ines Costa", title: "Researcher", team: "Design", location: "Porto" },
      ],
    },
    {
      id: "sam",
      name: "Sam Okafor",
      title: "Head of Customer Support",
      team: "Support",
      location: "Dublin",
      email: "sam@acme.com",
      reports: [
        { id: "alex", name: "Alex Kim", title: "Support Lead", team: "Support", location: "Dublin" },
        { id: "mia", name: "Mia Laurent", title: "Support Specialist", team: "Support", location: "Paris" },
      ],
    },
    { id: "ana", name: "Ana Souza", title: "Head of Operations", team: "Operations", location: "Lisbon", email: "ana@acme.com" },
  ],
}

const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2)

function walk(p: Org1Person, depth = 0, parent?: string, out: Map<string, { person: Org1Person; parent?: string; depth: number }> = new Map()) {
  out.set(p.id, { person: p, parent, depth })
  p.reports?.forEach((r) => walk(r, depth + 1, p.id, out))
  return out
}
const countBelow = (p: Org1Person): number => (p.reports ?? []).reduce((n, r) => n + 1 + countBelow(r), 0)

function OrgSkeleton() {
  return (
    <div className="grid justify-items-center gap-8 py-8" aria-hidden="true">
      <Skeleton className="h-20 w-52 rounded-2xl" />
      <div className="flex flex-wrap justify-center gap-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-20 w-52 max-w-full rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

/**
 * An organization chart built as a real tree: connected cards, a toggle on each team, search that opens the path to a person, a panel with
 * their details and the people who report to them, and the standard tree keys (arrows to move, Left and Right to collapse and expand, Enter to
 * choose). The connectors mirror in right-to-left.
 */
function Org1({
  root = sample,
  title = "Our organization",
  description = "Who leads what, and who reports to whom. Select a person to see their team.",
  defaultExpandedDepth = 2,
  defaultSelectedId,
  onSelect,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Org1Props) {
  const id = React.useId()
  const reduce = useReducedMotion()
  const dir = useDirection()
  const treeRef = React.useRef<HTMLUListElement>(null)
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const index = React.useMemo(() => (state === "empty" ? null : walk(root)), [root, state])
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set([...walk(root)].filter(([, v]) => v.depth < defaultExpandedDepth && v.person.reports?.length).map(([k]) => k)))
  const [selectedId, setSelectedId] = React.useState<string | undefined>(defaultSelectedId ?? root.id)
  const [activeId, setActiveId] = React.useState(root.id)
  const [query, setQuery] = React.useState("")
  const [announce, setAnnounce] = React.useState("")
  const ready = state === "ready" || state === "empty"

  const tokens = queryTokens(query)
  const matches = index && tokens.length ? [...index.values()].filter((v) => matchesAll(`${v.person.name} ${v.person.title} ${v.person.team ?? ""}`, tokens)).map((v) => v.person) : []
  const matchIds = new Set(matches.map((m) => m.id))
  const selected = index && selectedId ? index.get(selectedId)?.person : undefined

  // Open with the chosen person (or the top) in the middle of the view, not at the left edge of a wide tree.
  React.useEffect(() => {
    const center = () => {
      const box = scrollerRef.current
      const el = box?.querySelector<HTMLElement>(`[data-node="${defaultSelectedId ?? root.id}"] > div`)
      if (!box || !el) return
      const b = box.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      box.scrollLeft += r.left + r.width / 2 - (b.left + b.width / 2)
      if (defaultSelectedId) box.scrollTop += Math.max(0, r.top - b.top - b.height / 2 + r.height / 2)
    }
    // Once now, and again after the direction and fonts have settled, so it holds in right-to-left too.
    center()
    const raf = requestAnimationFrame(center)
    const later = setTimeout(center, 200)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(later)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, dir])

  const focusNode = (nodeId: string) => {
    setActiveId(nodeId)
    requestAnimationFrame(() => {
      const el = treeRef.current?.querySelector<HTMLElement>(`[data-node="${nodeId}"]`)
      el?.focus({ preventScroll: true })
      el?.scrollIntoView({ block: "nearest", inline: "center", behavior: reduce ? "auto" : "smooth" })
    })
  }
  const choose = (p: Org1Person) => {
    setSelectedId(p.id)
    onSelect?.(p)
  }
  const toggle = (nodeId: string, open?: boolean) =>
    setExpanded((s) => {
      const n = new Set(s)
      const next = open ?? !n.has(nodeId)
      if (next) n.add(nodeId)
      else n.delete(nodeId)
      return n
    })
  const reveal = (p: Org1Person) => {
    if (!index) return
    const next = new Set(expanded)
    for (let at = index.get(p.id)?.parent; at; at = index.get(at)?.parent) next.add(at)
    setExpanded(next)
    choose(p)
    focusNode(p.id)
    setAnnounce(`Showing ${p.name}, ${p.title}`)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    const item = (e.target as HTMLElement).closest<HTMLElement>("[role=treeitem]")
    if (!item || e.target !== item || !index) return
    const nodeId = item.dataset.node!
    const info = index.get(nodeId)!
    const items = [...(treeRef.current?.querySelectorAll<HTMLElement>("[role=treeitem]") ?? [])]
    const at = items.indexOf(item)
    const open = expanded.has(nodeId)
    const hasKids = !!info.person.reports?.length
    const go = (el?: HTMLElement) => el && (e.preventDefault(), focusNode(el.dataset.node!))
    if (e.key === "ArrowDown") go(items[at + 1])
    else if (e.key === "ArrowUp") go(items[at - 1])
    else if (e.key === "Home") go(items[0])
    else if (e.key === "End") go(items[items.length - 1])
    else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const forward = (e.key === "ArrowRight") !== (getComputedStyle(item).direction === "rtl")
      e.preventDefault()
      if (forward) {
        if (hasKids && !open) {
          toggle(nodeId, true)
          setAnnounce(`${info.person.name}'s team opened`)
        } else if (hasKids) focusNode(info.person.reports![0]!.id)
      } else if (hasKids && open) {
        toggle(nodeId, false)
        setAnnounce(`${info.person.name}'s team closed`)
      } else if (info.parent) focusNode(info.parent)
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      choose(info.person)
    }
  }

  const renderNode = (p: Org1Person, level: number, place: "root" | "only" | "first" | "middle" | "last"): React.ReactNode => {
    const kids = p.reports ?? []
    const open = expanded.has(p.id)
    const below = countBelow(p)
    const isSel = selectedId === p.id
    return (
      <li
        key={p.id}
        role="treeitem"
        data-node={p.id}
        aria-level={level}
        aria-expanded={kids.length ? open : undefined}
        aria-selected={isSel}
        aria-labelledby={`${id}-n-${p.id}`}
        tabIndex={activeId === p.id ? 0 : -1}
        onFocus={(e) => e.target === e.currentTarget && setActiveId(p.id)}
        className={cn("relative flex flex-col items-center px-2 outline-none", place !== "root" && "pt-6")}
      >
        {place !== "root" ? (
          <>
            <span aria-hidden="true" className="bg-border absolute start-1/2 top-0 h-6 w-px" />
            {place !== "only" ? <span aria-hidden="true" className={cn("bg-border absolute top-0 h-px", place === "first" ? "start-1/2 end-0" : place === "last" ? "start-0 end-1/2" : "inset-x-0")} /> : null}
          </>
        ) : null}
        <div
          onClick={() => choose(p)}
          className={cn(
            "bg-card relative w-56 cursor-pointer rounded-2xl border p-3 shadow-xs transition-[border-color,box-shadow] duration-150 hover:border-foreground/30 hover:shadow-md motion-reduce:transition-none",
            isSel && "border-foreground ring-foreground ring-1",
            matchIds.has(p.id) && !isSel && "ring-chart-3 border-chart-3 ring-2",
            "[li:focus-visible>&]:ring-ring/60 [li:focus-visible>&]:ring-[3px]"
          )}
        >
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border text-xs font-semibold">
              <CoverArt seed={p.name} variant="mesh" className="absolute inset-0" />
              <span className="relative">{initials(p.name)}</span>
            </span>
            <div className="min-w-0 flex-1">
              <p id={`${id}-n-${p.id}`} className="truncate text-sm leading-tight font-semibold">
                <MatchHighlight text={p.name} query={tokens} />
                <span className="sr-only">, {p.title}{p.team ? `, ${p.team}` : ""}{kids.length ? `, ${below} ${below === 1 ? "person" : "people"} in their organization` : ""}</span>
              </p>
              <p aria-hidden="true" className="text-muted-foreground mt-0.5 truncate text-xs">
                <MatchHighlight text={p.title} query={tokens} />
              </p>
            </div>
          </div>
          {p.team ? (
            <p aria-hidden="true" className="text-muted-foreground mt-2.5 flex items-center gap-1.5 text-[11px]">
              <UsersRound className="size-3" />
              {p.team}
            </p>
          ) : null}
          {kids.length ? (
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              onClick={(e) => {
                e.stopPropagation()
                toggle(p.id)
              }}
              className={cn("bg-background hover:bg-accent absolute -bottom-3 start-1/2 z-10 flex h-6 min-w-6 -translate-x-1/2 items-center justify-center rounded-full border px-1.5 text-[11px] font-medium tabular-nums shadow-sm rtl:translate-x-1/2")}
            >
              {open ? <Minus className="size-3" /> : kids.length}
            </button>
          ) : null}
        </div>
        {kids.length && open ? (
          <>
            <span aria-hidden="true" className="bg-border h-6 w-px" />
            <ul role="group" className="flex justify-center">
              {kids.map((c, i) => renderNode(c, level + 1, kids.length === 1 ? "only" : i === 0 ? "first" : i === kids.length - 1 ? "last" : "middle"))}
            </ul>
          </>
        ) : null}
      </li>
    )
  }

  const manager = selected && index ? index.get(selected.id)?.parent : undefined

  const content =
    !index ? (
      <div className="bg-card rounded-2xl border px-6 py-16 text-center">
        <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
          <Network className="size-6" />
        </span>
        <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "No organization chart yet"}</h2>
        <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm text-pretty">{emptyState?.description ?? "Add people and who they report to, and the chart draws itself."}</p>
        {emptyState?.action}
      </div>
    ) : (
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="bg-background focus-within:ring-ring/50 flex h-9 min-w-0 flex-1 basis-56 items-center gap-2 rounded-md border px-2.5 focus-within:ring-[3px]">
              <Search aria-hidden="true" className="text-muted-foreground size-4" />
              <input type="search" aria-label="Find a person" placeholder="Find a person, a role or a team" value={query} onChange={(e) => setQuery(e.target.value)} className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none" />
              {tokens.length ? <span className="text-muted-foreground text-xs tabular-nums">{matches.length}</span> : null}
            </div>
            <Button variant="outline" size="sm" onClick={() => setExpanded(new Set([...index.values()].filter((v) => v.person.reports?.length).map((v) => v.person.id)))}>
              <ChevronsUpDown aria-hidden="true" />
              Expand all
            </Button>
            <Button variant="outline" size="sm" onClick={() => setExpanded(new Set())}>
              <ChevronsDownUp aria-hidden="true" />
              Collapse
            </Button>
          </div>
          {tokens.length ? (
            <ul aria-label="Matches" className="mb-4 flex flex-wrap gap-2">
              {matches.slice(0, 6).map((m) => (
                <li key={m.id}>
                  <button type="button" onClick={() => reveal(m)} className="hover:bg-accent focus-visible:ring-ring/50 rounded-full border px-3 py-1 text-xs outline-none focus-visible:ring-[3px]">
                    <MatchHighlight text={m.name} query={tokens} /> <span className="text-muted-foreground">· {m.title}</span>
                  </button>
                </li>
              ))}
              {!matches.length ? <li className="text-muted-foreground text-sm">Nobody matches “{query.trim()}”.</li> : null}
            </ul>
          ) : null}
          <div ref={scrollerRef} tabIndex={-1} className="bg-card relative max-h-[40rem] overflow-auto rounded-2xl border p-6 pb-10" onKeyDown={onKeyDown}>
            <ul ref={treeRef} role="tree" aria-label="Organization chart" className="mx-auto flex w-max min-w-full justify-center">
              {renderNode(root, 1, "root")}
            </ul>
          </div>
        </div>

        <aside aria-labelledby={`${id}-person`} className="bg-card min-w-0 rounded-2xl border p-5 lg:sticky lg:top-6">
          {selected ? (
            <>
              <div className="flex items-center gap-4">
                <span aria-hidden="true" className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border text-lg font-semibold">
                  <CoverArt seed={selected.name} variant="mesh" className="absolute inset-0" />
                  <span className="relative">{initials(selected.name)}</span>
                </span>
                <div className="min-w-0">
                  <h2 id={`${id}-person`} className="text-lg leading-tight font-semibold tracking-tight">
                    {selected.name}
                  </h2>
                  <p className="text-muted-foreground mt-0.5 text-sm text-pretty">{selected.title}</p>
                </div>
              </div>
              <dl className="mt-5 grid gap-2.5 text-sm">
                {selected.team ? (
                  <div className="flex items-center gap-2.5">
                    <dt className="sr-only">Team</dt>
                    <UsersRound aria-hidden="true" className="text-muted-foreground size-4 shrink-0" />
                    <dd>{selected.team}</dd>
                  </div>
                ) : null}
                {selected.location ? (
                  <div className="flex items-center gap-2.5">
                    <dt className="sr-only">Location</dt>
                    <MapPin aria-hidden="true" className="text-muted-foreground size-4 shrink-0" />
                    <dd>{selected.location}</dd>
                  </div>
                ) : null}
                {selected.email ? (
                  <div className="flex items-center gap-2.5">
                    <dt className="sr-only">Email</dt>
                    <Mail aria-hidden="true" className="text-muted-foreground size-4 shrink-0" />
                    <dd className="min-w-0 truncate">
                      <a href={`mailto:${selected.email}`} className="focus-visible:ring-ring/50 rounded-sm underline underline-offset-4 outline-none focus-visible:ring-[3px]">
                        {selected.email}
                      </a>
                    </dd>
                  </div>
                ) : null}
              </dl>
              {manager ? (
                <div className="mt-5 border-t pt-4">
                  <p className="text-muted-foreground mb-2 text-xs font-medium">Reports to</p>
                  <button type="button" onClick={() => reveal(index.get(manager)!.person)} className="hover:bg-accent focus-visible:ring-ring/50 -mx-2 flex w-[calc(100%+1rem)] items-center gap-2.5 rounded-lg px-2 py-1.5 text-start text-sm outline-none focus-visible:ring-[3px]">
                    <UserRound aria-hidden="true" className="text-muted-foreground size-4" />
                    {index.get(manager)!.person.name}
                    <span className="text-muted-foreground truncate text-xs">{index.get(manager)!.person.title}</span>
                  </button>
                </div>
              ) : null}
              {selected.reports?.length ? (
                <div className="mt-5 border-t pt-4">
                  <p className="text-muted-foreground mb-2 text-xs font-medium">
                    {selected.reports.length} direct {selected.reports.length === 1 ? "report" : "reports"}
                    {countBelow(selected) > selected.reports.length ? `, ${countBelow(selected)} in the organization` : ""}
                  </p>
                  <ul className="grid gap-0.5">
                    {selected.reports.map((r) => (
                      <li key={r.id}>
                        <button type="button" onClick={() => reveal(r)} className="hover:bg-accent focus-visible:ring-ring/50 -mx-2 flex w-[calc(100%+1rem)] items-center gap-2.5 rounded-lg px-2 py-1.5 text-start text-sm outline-none focus-visible:ring-[3px]">
                          <span className="truncate">{r.name}</span>
                          <span className="text-muted-foreground ms-auto truncate text-xs">{r.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : (
            <p id={`${id}-person`} className="text-muted-foreground text-sm">
              Select a person to see their details.
            </p>
          )}
        </aside>
      </div>
    )

  return (
    <section data-slot="orgchart-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8 max-w-2xl">
        <h1 id={`${id}-title`} className="text-4xl font-semibold tracking-[-0.04em] text-balance">
          {title}
        </h1>
        <p className="text-muted-foreground mt-3 text-base text-pretty">{description}</p>
      </header>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading the organization chart" loading={<OrgSkeleton />} error={{ title: errorState?.title ?? "The organization chart could not be loaded", description: errorState?.description ?? "Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </section>
  )
}

export { Org1, type Org1Props, type Org1Person }

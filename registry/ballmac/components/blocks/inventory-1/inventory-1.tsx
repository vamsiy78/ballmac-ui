// Ballmac UI: Inventory 1. https://ui.ballmac.com/blocks/inventory-1
"use client"

import * as React from "react"
import { AlertTriangle, Boxes, CircleCheck, Loader2, PackageX, Search, Truck, X } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Input } from "@/components/ballmac/input"
import { MatchHighlight, matchesAll, queryTokens } from "@/components/ballmac/match-highlight"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Inventory1Item = {
  id: string
  sku: string
  name: string
  category: string
  onHand: number
  /** When stock falls to this or below, it is low. */
  reorderAt: number
  /** Units on their way, and when. */
  incoming?: { qty: number; eta: string }
  /** Units sold or used a day, for days of cover. */
  perDay: number
  cost: number
}

type Inventory1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    items?: Inventory1Item[]
    title?: string
    currency?: string
    locale?: string
    /** The item whose order form is open at first. */
    defaultOrderingId?: string
    /** Called to order more. Return a promise; reject and the order is not shown as placed. */
    onReorder?: (item: Inventory1Item, qty: number) => void | Promise<void>
  }

const items0: Inventory1Item[] = [
  { id: "1", sku: "TS-BLK-M", name: "Classic tee, black, M", category: "Tops", onHand: 148, reorderAt: 60, perDay: 6, cost: 7.4 },
  { id: "2", sku: "TS-BLK-L", name: "Classic tee, black, L", category: "Tops", onHand: 41, reorderAt: 60, perDay: 8, cost: 7.4, incoming: { qty: 200, eta: "Oct 24" } },
  { id: "3", sku: "HD-GRY-M", name: "Heavy hoodie, grey, M", category: "Tops", onHand: 0, reorderAt: 25, perDay: 3, cost: 21.5 },
  { id: "4", sku: "HD-GRY-L", name: "Heavy hoodie, grey, L", category: "Tops", onHand: 12, reorderAt: 25, perDay: 4, cost: 21.5 },
  { id: "5", sku: "CP-NVY", name: "Dad cap, navy", category: "Accessories", onHand: 520, reorderAt: 80, perDay: 5, cost: 3.9 },
  { id: "6", sku: "TB-CNV", name: "Canvas tote", category: "Accessories", onHand: 96, reorderAt: 50, perDay: 7, cost: 2.8 },
  { id: "7", sku: "SK-WHT-9", name: "Court sneaker, white, 9", category: "Shoes", onHand: 9, reorderAt: 20, perDay: 2, cost: 34 },
  { id: "8", sku: "SK-WHT-10", name: "Court sneaker, white, 10", category: "Shoes", onHand: 28, reorderAt: 20, perDay: 2, cost: 34 },
  { id: "9", sku: "BT-STL", name: "Steel water bottle", category: "Accessories", onHand: 233, reorderAt: 70, perDay: 9, cost: 6.2 },
]

type Status = "out" | "low" | "ok" | "over"
const statusMeta: Record<Status, { label: string; chip: string; icon: typeof Boxes }> = {
  out: { label: "Out of stock", chip: "bg-destructive/10 border-destructive/40", icon: PackageX },
  low: { label: "Low", chip: "bg-amber-500/15 border-amber-500/40", icon: AlertTriangle },
  ok: { label: "In stock", chip: "bg-chart-2/10 border-chart-2/30", icon: CircleCheck },
  over: { label: "Plenty", chip: "bg-muted border-border", icon: Boxes },
}
const statusOf = (i: Inventory1Item): Status => (i.onHand <= 0 ? "out" : i.onHand <= i.reorderAt ? "low" : i.onHand > i.reorderAt * 4 ? "over" : "ok")
const cover = (i: Inventory1Item) => (i.perDay > 0 ? Math.floor(i.onHand / i.perDay) : Infinity)

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )
}

/**
 * A stock overview: what the stock is worth, how many lines are low or out, and what is on its way, then every item with a bar against its reorder point, how
 * many days it will last at today's pace, and an order form that suggests how many to buy. Status is worked out from the numbers and written in words; filters, search
 * and a sort by days left help you find what to reorder first.
 */
function Inventory1({ items: itemsProp = items0, title = "Inventory", currency = "USD", locale = "en", defaultOrderingId, onReorder, state = "ready", onRetry, emptyState, errorState, className, ...props }: Inventory1Props) {
  const id = React.useId()
  const [items, setItems] = React.useState(itemsProp)
  React.useEffect(() => setItems(itemsProp), [itemsProp])
  const list = state === "empty" ? [] : items
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<Status | "all">("all")
  const [sort, setSort] = React.useState<"cover" | "name">("cover")
  const [ordering, setOrdering] = React.useState<string | null>(defaultOrderingId ?? null)
  const [qty, setQty] = React.useState(() => { const it = (itemsProp ?? items0).find((x) => x.id === defaultOrderingId); return it ? String(Math.max(1, Math.ceil(it.reorderAt * 2 + it.perDay * 14 - it.onHand - (it.incoming?.qty ?? 0)))) : "" })
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string>()
  const [announce, setAnnounce] = React.useState("")
  const tokens = queryTokens(query)
  const money = (n: number) => new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: n < 100 ? 2 : 0 }).format(n)
  const nf = new Intl.NumberFormat(locale)

  const value = list.reduce((n, i) => n + i.onHand * i.cost, 0)
  const counts = (["out", "low", "ok", "over"] as Status[]).map((s) => [s, list.filter((i) => statusOf(i) === s).length] as const)
  const incomingUnits = list.reduce((n, i) => n + (i.incoming?.qty ?? 0), 0)
  const shown = list
    .filter((i) => (filter === "all" || statusOf(i) === filter) && (!tokens.length || matchesAll(`${i.name} ${i.sku} ${i.category}`, tokens)))
    .sort((a, b) => (sort === "cover" ? cover(a) - cover(b) || a.name.localeCompare(b.name) : a.name.localeCompare(b.name)))

  const suggest = (i: Inventory1Item) => Math.max(1, Math.ceil(i.reorderAt * 2 + i.perDay * 14 - i.onHand - (i.incoming?.qty ?? 0)))
  async function order(i: Inventory1Item) {
    const n = Math.floor(Number(qty))
    if (!Number.isFinite(n) || n < 1) return setError("Enter how many to order, as a whole number.")
    setError(undefined)
    setBusy(true)
    try {
      await onReorder?.(i, n)
      setItems((x) => x.map((y) => (y.id === i.id ? { ...y, incoming: { qty: (y.incoming?.qty ?? 0) + n, eta: "in 7 days" } } : y)))
      setOrdering(null)
      setAnnounce(`Ordered ${n} of ${i.name}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "The order was not placed. Nothing was charged, so try again.")
    } finally {
      setBusy(false)
    }
  }

  const content = !list.length ? (
    <div className="bg-card rounded-2xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <Boxes className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "No stock recorded"}</h2>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-sm text-sm text-pretty">{emptyState?.description ?? "Add products or connect your store and their stock levels appear here."}</p>
      {emptyState?.action}
    </div>
  ) : (
    <div className="grid grid-cols-1 gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Stock value", value: money(value), note: `${list.length} products` },
          { label: "Out of stock", value: String(counts[0]![1]), note: counts[0]![1] ? "Selling is paused" : "Nothing missing" },
          { label: "Running low", value: String(counts[1]![1]), note: "At or under reorder point" },
          { label: "On the way", value: nf.format(incomingUnits), note: "Units already ordered" },
        ].map((c) => (
          <div key={c.label} className="bg-card rounded-2xl border p-5">
            <p className="text-muted-foreground text-sm">{c.label}</p>
            <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] tabular-nums">{c.value}</p>
            <p className="text-muted-foreground mt-1 text-xs">{c.note}</p>
          </div>
        ))}
      </div>

      <div className="bg-card min-w-0 rounded-2xl border">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="bg-background focus-within:ring-ring/50 flex h-10 flex-1 items-center gap-2 rounded-lg border px-3 focus-within:ring-[3px]">
            <Search aria-hidden="true" className="text-muted-foreground size-4" />
            <input type="search" aria-label="Search products" placeholder="Search by name, SKU or category" value={query} onChange={(e) => setQuery(e.target.value)} className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <label htmlFor={`${id}-sort`} className="text-muted-foreground">Sort by</label>
            <select id={`${id}-sort`} value={sort} onChange={(e) => setSort(e.target.value as "cover" | "name")} className="bg-background focus-visible:ring-ring/50 h-9 rounded-md border px-3 outline-none focus-visible:ring-[3px]">
              <option value="cover">Days left, soonest first</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
        <div role="group" aria-label="Filter by stock level" className="flex flex-wrap gap-2 border-b px-4 py-3 sm:px-5">
          {([["all", "All"], ["out", "Out of stock"], ["low", "Low"], ["ok", "In stock"], ["over", "Plenty"]] as const).map(([k, l]) => (
            <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)} className={cn("focus-visible:ring-ring/50 rounded-full border px-3 py-1 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", filter === k ? "bg-foreground text-background border-foreground" : "hover:bg-accent")}>
              {l} <span className={cn("tabular-nums", filter === k ? "opacity-70" : "text-muted-foreground")}>{k === "all" ? list.length : counts.find(([s]) => s === k)![1]}</span>
            </button>
          ))}
        </div>
        <p aria-live="polite" className="text-muted-foreground px-5 pt-4 text-sm">
          {shown.length} {shown.length === 1 ? "product" : "products"}
        </p>

        {shown.length ? (
          <ul className="divide-y">
            {shown.map((i) => {
              const st = statusOf(i)
              const M = statusMeta[st]
              const days = cover(i)
              const max = Math.max(i.onHand, i.reorderAt * 4, 1)
              const open = ordering === i.id
              return (
                <li key={i.id} className="px-4 py-4 sm:px-5">
                  <div className="grid items-center gap-x-6 gap-y-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)_9rem_auto]">
                    <div className="min-w-0">
                      <p className="font-medium text-pretty">
                        <MatchHighlight text={i.name} query={tokens} />
                      </p>
                      <p className="text-muted-foreground mt-0.5 font-mono text-xs" dir="ltr">
                        <MatchHighlight text={i.sku} query={tokens} /> · {i.category}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-semibold tabular-nums">{nf.format(i.onHand)} <span className="text-muted-foreground font-normal">on hand</span></span>
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", M.chip)}>
                          <M.icon aria-hidden="true" className="size-3" />
                          {M.label}
                        </span>
                      </div>
                      <div role="img" aria-label={`${nf.format(i.onHand)} on hand, reorder at ${nf.format(i.reorderAt)}`} className="bg-muted relative mt-2 h-2 overflow-hidden rounded-full">
                        <span className={cn("block h-full rounded-full", st === "out" || st === "low" ? (st === "out" ? "bg-destructive" : "bg-amber-500") : "bg-chart-2")} style={{ width: `${(i.onHand / max) * 100}%` }} />
                        <span aria-hidden="true" className="bg-foreground/60 absolute inset-y-0 w-0.5" style={{ insetInlineStart: `${(i.reorderAt / max) * 100}%` }} />
                      </div>
                      {i.incoming ? (
                        <p className="text-muted-foreground mt-1.5 flex items-center gap-1.5 text-xs">
                          <Truck aria-hidden="true" className="size-3.5" />
                          {nf.format(i.incoming.qty)} arriving {i.incoming.eta}
                        </p>
                      ) : null}
                    </div>
                    <p className="text-sm tabular-nums">
                      <span className={cn("font-semibold", days <= 7 && "text-amber-700 dark:text-amber-400")}>{days === Infinity ? "No sales" : days === 0 ? "None left" : `${days} ${days === 1 ? "day" : "days"} left`}</span>
                      <span className="text-muted-foreground block text-xs">
                        {i.perDay} a day · {money(i.onHand * i.cost)}
                      </span>
                    </p>
                    <Button size="sm" variant={st === "out" || st === "low" ? "default" : "outline"} aria-expanded={open} onClick={() => { setOrdering(open ? null : i.id); setQty(String(suggest(i))); setError(undefined) }}>
                      Reorder <span className="sr-only">{i.name}</span>
                    </Button>
                  </div>
                  {open ? (
                    <form onSubmit={(e) => { e.preventDefault(); void order(i) }} className="bg-muted/40 mt-4 flex flex-wrap items-end gap-3 rounded-xl border p-3.5">
                      <div>
                        <label htmlFor={`${id}-q${i.id}`} className="text-muted-foreground mb-1.5 block text-xs font-medium">How many</label>
                        <Input id={`${id}-q${i.id}`} inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} className="w-28 tabular-nums" autoFocus />
                      </div>
                      <p className="text-muted-foreground pb-2 text-sm text-pretty">
                        Suggested {nf.format(suggest(i))}: enough for two weeks plus a buffer. About {money((Math.floor(Number(qty)) || 0) * i.cost)}.
                      </p>
                      <div className="ms-auto flex gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setOrdering(null)}>
                          <X aria-hidden="true" />
                          Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={busy}>
                          {busy ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : null}
                          {busy ? "Ordering" : "Place order"}
                        </Button>
                      </div>
                      {error ? (
                        <p role="alert" className="text-destructive w-full text-sm">
                          {error}
                        </p>
                      ) : null}
                    </form>
                  ) : null}
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="font-medium">No products match</p>
            <p className="text-muted-foreground mt-1 text-sm">Try another word or look at every stock level.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => { setQuery(""); setFilter("all") }}>
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <section data-slot="inventory-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <h1 id={`${id}-title`} className="mb-6 text-3xl font-semibold tracking-[-0.035em] text-balance">
        {title}
      </h1>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading stock" loading={<Skel />} error={{ title: errorState?.title ?? "Stock could not be loaded", description: errorState?.description ?? "Nothing was changed. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </section>
  )
}

export { Inventory1, type Inventory1Props, type Inventory1Item }

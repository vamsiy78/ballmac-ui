// Ballmac UI: Atlas orders page. https://ui.ballmac.com/templates/template-atlas
"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download, Printer, Search, Truck, X } from "lucide-react"

import { Checkbox } from "@/components/ballmac/checkbox"
import { formatDate, formatTime, getCustomer, initials, moneyExact, orderGrand, orders as seed, type AtlasOrder } from "@/components/ballmac/templates/atlas/atlas-data"
import { AtlasPageHeader, AtlasShell, FulfilmentBadge, PaymentBadge, atlasButton, type AtlasHrefs } from "@/components/ballmac/templates/atlas/atlas-theme"
import { cn } from "@/lib/utils"

type Tab = "all" | "unfulfilled" | "unpaid" | "shipped" | "delivered"
type SortKey = "date" | "customer" | "channel" | "total"

const tabs: { id: Tab; label: string; test: (o: AtlasOrder) => boolean }[] = [
  { id: "all", label: "All", test: () => true },
  { id: "unfulfilled", label: "Unfulfilled", test: (o) => o.fulfillment === "unfulfilled" },
  { id: "unpaid", label: "Unpaid", test: (o) => o.payment === "pending" },
  { id: "shipped", label: "Shipped", test: (o) => o.fulfillment === "shipped" },
  { id: "delivered", label: "Delivered", test: (o) => o.fulfillment === "delivered" },
]

const PAGE = 10
const tones = ["bg-chart-1/20", "bg-chart-2/20", "bg-chart-3/25", "bg-chart-4/20", "bg-chart-5/20"]

type AtlasOrdersProps = React.ComponentProps<"div"> & { hrefs?: Partial<AtlasHrefs> }

/** The Atlas orders page: status tabs with counts, search, sortable columns, row selection with bulk actions, and pagination. */
function AtlasOrders({ hrefs, ...props }: AtlasOrdersProps) {
  const [rows, setRows] = React.useState<AtlasOrder[]>(seed)
  const [tab, setTab] = React.useState<Tab>("all")
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "date", dir: "desc" })
  const [page, setPage] = React.useState(0)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const orderHref = hrefs?.order ?? "/atlas/orders/ORD-10479"

  const q = query.trim().toLowerCase()
  const filtered = rows
    .filter(tabs.find((t) => t.id === tab)!.test)
    .filter((o) => !q || [o.id, getCustomer(o.customerId).name, o.channel].join(" ").toLowerCase().includes(q))
  const sorted = [...filtered].sort((a, b) => {
    const dir = sort.dir === "asc" ? 1 : -1
    const val = (o: AtlasOrder) => (sort.key === "date" ? o.date : sort.key === "customer" ? getCustomer(o.customerId).name : sort.key === "channel" ? o.channel : orderGrand(o))
    const x = val(a)
    const y = val(b)
    return (x < y ? -1 : x > y ? 1 : 0) * dir
  })
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE))
  const safePage = Math.min(page, pages - 1)
  const view = sorted.slice(safePage * PAGE, safePage * PAGE + PAGE)
  const allOnPage = view.length > 0 && view.every((o) => selected.has(o.id))
  const someOnPage = view.some((o) => selected.has(o.id))

  function toggleSort(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "total" || key === "date" ? "desc" : "asc" }))
    setPage(0)
  }
  function toggleAll(on: boolean) {
    setSelected((s) => {
      const next = new Set(s)
      for (const o of view) on ? next.add(o.id) : next.delete(o.id)
      return next
    })
  }
  function toggleOne(id: string, on: boolean) {
    setSelected((s) => {
      const next = new Set(s)
      on ? next.add(id) : next.delete(id)
      return next
    })
  }
  function markShipped() {
    setRows((all) => all.map((o) => (selected.has(o.id) && o.fulfillment === "unfulfilled" && o.payment !== "pending" ? { ...o, fulfillment: "shipped" } : o)))
    setSelected(new Set())
  }

  const head = (k: SortKey, children: React.ReactNode, right?: boolean) => (
    <th key={k} scope="col" aria-sort={sort.key === k ? (sort.dir === "asc" ? "ascending" : "descending") : "none"} className={cn("px-3 py-2.5 font-semibold", right && "text-right")}>
      <button type="button" onClick={() => toggleSort(k)} className={cn("hover:text-foreground focus-visible:ring-ring/50 -mx-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 outline-none focus-visible:ring-[3px]", sort.key === k && "text-foreground")}>
        {children}
        {sort.key === k ? (sort.dir === "asc" ? <ArrowUp className="size-3" aria-hidden="true" /> : <ArrowDown className="size-3" aria-hidden="true" />) : <ArrowUpDown className="size-3 opacity-50" aria-hidden="true" />}
      </button>
    </th>
  )

  return (
    <AtlasShell page="orders" title="Orders" hrefs={hrefs} actions={<button type="button" className={cn(atlasButton.outline, "hidden sm:inline-flex")}><Download aria-hidden="true" /> Export</button>} {...props}>
      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
        <AtlasPageHeader title="Orders" description="Everything customers have bought, across every channel." />

        <div className="bg-card rounded-xl border">
          <div className="flex flex-col gap-3 border-b p-3 lg:flex-row lg:items-center lg:justify-between">
            <div role="group" aria-label="Filter by status" className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
              {tabs.map((t) => {
                const count = rows.filter(t.test).length
                const on = tab === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => { setTab(t.id); setPage(0); setSelected(new Set()) }}
                    className={cn("focus-visible:ring-ring/50 flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold outline-none transition-colors focus-visible:ring-[3px]", on ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")}
                  >
                    {t.label} <span className="text-muted-foreground text-xs font-medium tabular-nums">{count}</span>
                  </button>
                )
              })}
            </div>
            <div className="relative lg:w-72">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden="true" />
              <input
                type="search"
                aria-label="Search orders"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(0) }}
                placeholder="Search order, customer or channel"
                className="bg-background focus-visible:ring-ring/50 placeholder:text-muted-foreground h-9 w-full rounded-lg border pr-3 pl-9 text-sm outline-none focus-visible:ring-[3px]"
              />
            </div>
          </div>

          {selected.size > 0 && (
            <div role="region" aria-label="Bulk actions" className="bg-accent flex flex-wrap items-center gap-2 border-b px-3 py-2">
              <p className="mr-auto text-sm font-semibold" aria-live="polite">{selected.size} selected</p>
              <button type="button" onClick={markShipped} className={atlasButton.outline}><Truck aria-hidden="true" /> Mark as shipped</button>
              <button type="button" className={atlasButton.outline}><Printer aria-hidden="true" /> Print labels</button>
              <button type="button" onClick={() => setSelected(new Set())} aria-label="Clear selection" className={cn(atlasButton.ghost, "px-2.5")}><X aria-hidden="true" /></button>
            </div>
          )}

          <div tabIndex={0} role="region" aria-label="Orders table" className="focus-visible:ring-ring/50 overflow-x-auto outline-none focus-visible:ring-[3px] focus-visible:ring-inset">
            <table className="w-full min-w-[52rem] text-left text-sm">
              <caption className="sr-only">Orders, {sorted.length} shown</caption>
              <thead>
                <tr className="text-muted-foreground bg-surface border-b text-xs">
                  <th scope="col" className="w-10 px-3 py-2.5"><Checkbox aria-label="Select all orders on this page" checked={allOnPage ? true : someOnPage ? "indeterminate" : false} onCheckedChange={(v) => toggleAll(v === true)} /></th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Order</th>
                  {head("date", "Date")}
                  {head("customer", "Customer")}
                  {head("channel", "Channel")}
                  <th scope="col" className="px-3 py-2.5 font-semibold">Payment</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Fulfilment</th>
                  {head("total", "Total", true)}
                </tr>
              </thead>
              <tbody className="divide-y">
                {view.map((o) => {
                  const c = getCustomer(o.customerId)
                  const on = selected.has(o.id)
                  return (
                    <tr key={o.id} data-state={on ? "selected" : undefined} className="hover:bg-accent/40 data-[state=selected]:bg-accent/60">
                      <td className="px-3 py-3"><Checkbox aria-label={`Select ${o.id}`} checked={on} onCheckedChange={(v) => toggleOne(o.id, v === true)} /></td>
                      <td className="px-3 py-3"><a href={orderHref} className="text-chart-1 font-semibold underline-offset-4 hover:underline" style={{ fontFamily: "var(--atlas-mono)" }}>{o.id}</a></td>
                      <td className="text-muted-foreground px-3 py-3 whitespace-nowrap">{formatDate(o.date)}<span className="ml-1.5 text-xs">{formatTime(o.date)}</span></td>
                      <td className="px-3 py-3"><span className="flex items-center gap-2.5 whitespace-nowrap"><span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold", tones[c.tone - 1])} aria-hidden="true">{initials(c.name)}</span>{c.name}</span></td>
                      <td className="text-muted-foreground px-3 py-3 whitespace-nowrap">{o.channel}</td>
                      <td className="px-3 py-3"><PaymentBadge value={o.payment} /></td>
                      <td className="px-3 py-3"><FulfilmentBadge value={o.fulfillment} /></td>
                      <td className="px-3 py-3 text-right font-semibold tabular-nums">{moneyExact.format(orderGrand(o))}</td>
                    </tr>
                  )
                })}
                {view.length === 0 && (
                  <tr><td colSpan={8} className="text-muted-foreground px-3 py-16 text-center">No orders match. Try another status or clear the search.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 border-t px-3 py-2.5 text-sm">
            <p className="text-muted-foreground" role="status">
              {sorted.length === 0 ? "No orders" : `Showing ${safePage * PAGE + 1}–${safePage * PAGE + view.length} of ${sorted.length}`}
            </p>
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Previous page" disabled={safePage === 0} onClick={() => setPage(safePage - 1)} className={cn(atlasButton.outline, "px-2.5")}><ChevronLeft aria-hidden="true" /></button>
              <span className="text-muted-foreground px-2 text-xs tabular-nums">Page {safePage + 1} of {pages}</span>
              <button type="button" aria-label="Next page" disabled={safePage >= pages - 1} onClick={() => setPage(safePage + 1)} className={cn(atlasButton.outline, "px-2.5")}><ChevronRight aria-hidden="true" /></button>
            </div>
          </div>
        </div>
      </main>
    </AtlasShell>
  )
}

export { AtlasOrders, type AtlasOrdersProps }

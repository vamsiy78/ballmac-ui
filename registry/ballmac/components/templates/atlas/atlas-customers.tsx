// Ballmac UI: Atlas customers page. https://ui.ballmac.com/templates/template-atlas
"use client"

import * as React from "react"
import { Mail, Search } from "lucide-react"

import { Badge } from "@/components/ballmac/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ballmac/sheet"
import { customers, formatDate, initials, money, moneyExact, orderGrand, orders, type AtlasCustomer } from "@/components/ballmac/templates/atlas/atlas-data"
import { AtlasPageHeader, AtlasShell, FulfilmentBadge, atlasButton, type AtlasHrefs } from "@/components/ballmac/templates/atlas/atlas-theme"
import { cn } from "@/lib/utils"

type Segment = "All" | AtlasCustomer["segment"]
const segments: Segment[] = ["All", "VIP", "Regular", "New", "At risk"]
const tones = ["bg-chart-1/20", "bg-chart-2/20", "bg-chart-3/25", "bg-chart-4/20", "bg-chart-5/20"]
const segmentStatus = { VIP: "success", Regular: "neutral", New: "neutral", "At risk": "warning" } as const

function stats(c: AtlasCustomer) {
  const mine = orders.filter((o) => o.customerId === c.id)
  const spent = mine.reduce((n, o) => n + (o.payment === "refunded" ? 0 : orderGrand(o)), 0)
  return { mine, spent, last: mine[0]?.date }
}

type AtlasCustomersProps = React.ComponentProps<"div"> & { hrefs?: Partial<AtlasHrefs> }

/** The Atlas customers page: segment filters, search, lifetime value bars and a profile drawer with recent orders. */
function AtlasCustomers({ hrefs, ...props }: AtlasCustomersProps) {
  const [segment, setSegment] = React.useState<Segment>("All")
  const [query, setQuery] = React.useState("")
  const [openId, setOpenId] = React.useState<string | null>(null)
  const q = query.trim().toLowerCase()
  const rows = customers
    .map((c) => ({ c, ...stats(c) }))
    .filter((r) => (segment === "All" || r.c.segment === segment) && (!q || [r.c.name, r.c.email, r.c.city].join(" ").toLowerCase().includes(q)))
    .sort((a, b) => b.spent - a.spent)
  const max = Math.max(...customers.map((c) => stats(c).spent))
  const open = customers.find((c) => c.id === openId)
  const openStats = open ? stats(open) : null

  return (
    <AtlasShell page="customers" title="Customers" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
        <AtlasPageHeader title="Customers" description={`${customers.length} people have bought from Fieldnote Goods.`} />
        <div className="bg-card rounded-xl border">
          <div className="flex flex-col gap-3 border-b p-3 lg:flex-row lg:items-center lg:justify-between">
            <div role="group" aria-label="Filter by segment" className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
              {segments.map((s) => {
                const on = segment === s
                const count = s === "All" ? customers.length : customers.filter((c) => c.segment === s).length
                return (
                  <button key={s} type="button" aria-pressed={on} onClick={() => setSegment(s)} className={cn("focus-visible:ring-ring/50 flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold outline-none transition-colors focus-visible:ring-[3px]", on ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")}>
                    {s} <span className="text-muted-foreground text-xs font-medium tabular-nums">{count}</span>
                  </button>
                )
              })}
            </div>
            <div className="relative lg:w-72">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden="true" />
              <input type="search" aria-label="Search customers" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email or city" className="bg-background focus-visible:ring-ring/50 placeholder:text-muted-foreground h-9 w-full rounded-lg border pr-3 pl-9 text-sm outline-none focus-visible:ring-[3px]" />
            </div>
          </div>
          <div tabIndex={0} role="region" aria-label="Customers table" className="focus-visible:ring-ring/50 overflow-x-auto outline-none focus-visible:ring-[3px] focus-visible:ring-inset">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <caption className="sr-only">Customers by lifetime spend</caption>
              <thead><tr className="text-muted-foreground bg-surface border-b text-xs">{["Customer", "Segment", "Orders", "Last order", "Lifetime spend"].map((c) => <th key={c} scope="col" className="px-4 py-2.5 font-semibold">{c}</th>)}</tr></thead>
              <tbody className="divide-y">
                {rows.map(({ c, mine, spent, last }) => (
                  <tr key={c.id} className="hover:bg-accent/40">
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => setOpenId(c.id)} className="focus-visible:ring-ring/50 -m-1 flex items-center gap-3 rounded-lg p-1 text-left outline-none focus-visible:ring-[3px]">
                        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold", tones[c.tone - 1])} aria-hidden="true">{initials(c.name)}</span>
                        <span><span className="block font-semibold">{c.name}</span><span className="text-muted-foreground block text-xs">{c.email} · {c.city}</span></span>
                      </button>
                    </td>
                    <td className="px-4 py-3"><Badge status={segmentStatus[c.segment]} variant="outline">{c.segment}</Badge></td>
                    <td className="px-4 py-3 tabular-nums">{mine.length}</td>
                    <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">{last ? formatDate(last) : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-muted hidden h-1.5 w-24 rounded-full sm:block" aria-hidden="true"><div className="bg-chart-1 h-full rounded-full" style={{ width: `${(spent / max) * 100}%` }} /></div>
                        <span className="w-20 text-right font-semibold tabular-nums">{money.format(spent)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={5} className="text-muted-foreground px-4 py-16 text-center">No customers match.</td></tr>}
              </tbody>
            </table>
          </div>
          <p className="text-muted-foreground border-t px-4 py-2.5 text-sm" role="status">{rows.length} of {customers.length} customers</p>
        </div>
      </main>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md" closeLabel="Close profile">
          {open && openStats && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <span className={cn("flex size-12 items-center justify-center rounded-full text-sm font-bold", tones[open.tone - 1])} aria-hidden="true">{initials(open.name)}</span>
                  <div><SheetTitle>{open.name}</SheetTitle><SheetDescription>{open.city} · {open.segment}</SheetDescription></div>
                </div>
              </SheetHeader>
              <div className="space-y-5 overflow-y-auto px-4 pb-6">
                <dl className="grid grid-cols-3 gap-2 text-center">
                  {[["Spent", money.format(openStats.spent)], ["Orders", String(openStats.mine.length)], ["Average", openStats.mine.length ? moneyExact.format(openStats.spent / openStats.mine.length) : "—"]].map(([k, v]) => (
                    <div key={k} className="bg-surface rounded-lg border p-3"><dt className="text-muted-foreground text-xs">{k}</dt><dd className="mt-1 font-bold tabular-nums">{v}</dd></div>
                  ))}
                </dl>
                <a href={`mailto:${open.email}`} className={cn(atlasButton.outline, "w-full")}><Mail aria-hidden="true" /> Email {open.name.split(" ")[0]}</a>
                <section aria-labelledby="ac-recent">
                  <h3 id="ac-recent" className="text-sm font-bold">Recent orders</h3>
                  <ul className="mt-2 divide-y rounded-lg border">
                    {openStats.mine.slice(0, 4).map((o) => (
                      <li key={o.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                        <span><span className="font-semibold" style={{ fontFamily: "var(--atlas-mono)" }}>{o.id}</span><span className="text-muted-foreground ml-2 text-xs">{formatDate(o.date)}</span></span>
                        <span className="flex items-center gap-2"><FulfilmentBadge value={o.fulfillment} /><span className="tabular-nums">{moneyExact.format(orderGrand(o))}</span></span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AtlasShell>
  )
}

export { AtlasCustomers, type AtlasCustomersProps }

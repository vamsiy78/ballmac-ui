// Ballmac UI: Atlas dashboard page. https://ui.ballmac.com/templates/template-atlas
"use client"

import * as React from "react"
import { AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Download, PackageX, Truck } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ballmac/chart"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Sparkline } from "@/components/ballmac/sparkline"
import { formatDate, getCustomer, initials, money, moneyExact, orderGrand, orders, products, revenueSeries } from "@/components/ballmac/templates/atlas/atlas-data"
import { AtlasPageHeader, AtlasShell, FulfilmentBadge, PaymentBadge, ProductTile, atlasButton, type AtlasHrefs } from "@/components/ballmac/templates/atlas/atlas-theme"
import { cn } from "@/lib/utils"

type Range = "7" | "30"

const config = { revenue: { label: "This period", color: "var(--chart-1)" }, previous: { label: "Previous period", color: "var(--chart-3)" } } satisfies ChartConfig

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const pct = (a: number, b: number) => ((a - b) / b) * 100

type AtlasDashboardProps = React.ComponentProps<"div"> & { hrefs?: Partial<AtlasHrefs> }

/** The Atlas dashboard: a date range that recomputes the KPIs and chart, work that needs attention, top products and recent orders. */
function AtlasDashboard({ hrefs, ...props }: AtlasDashboardProps) {
  const [range, setRange] = React.useState<Range>("30")
  const n = Number(range)
  const data = revenueSeries.slice(-n)
  const revenue = sum(data.map((d) => d.revenue))
  const previous = sum(data.map((d) => d.previous))
  const orderCount = Math.round(revenue / 71)
  const prevOrders = Math.round(previous / 69)
  const conversion = 2.1 + n * 0.004
  const aov = revenue / orderCount

  const kpis = [
    { label: "Revenue", value: money.format(revenue), delta: pct(revenue, previous), trend: data.map((d) => d.revenue) },
    { label: "Orders", value: orderCount.toLocaleString("en-US"), delta: pct(orderCount, prevOrders), trend: data.map((d) => Math.round(d.revenue / 70)) },
    { label: "Conversion", value: `${conversion.toFixed(1)}%`, delta: 4.2, trend: data.map((d, i) => 2 + Math.sin(i * 0.5) * 0.3 + i * 0.01) },
    { label: "Average order", value: moneyExact.format(aov), delta: -1.8, trend: data.map((d, i) => 70 + Math.cos(i * 0.7) * 6 - i * 0.1) },
  ]

  const unfulfilled = orders.filter((o) => o.fulfillment === "unfulfilled" && o.payment !== "pending").length
  const pending = orders.filter((o) => o.payment === "pending").length
  const low = products.filter((p) => p.stock <= 10 && p.status === "active")
  const top = [...products].filter((p) => p.status === "active").sort((a, b) => b.sold * b.price - a.sold * a.price).slice(0, 5)
  const topMax = top[0].sold * top[0].price
  const recent = orders.slice(0, 6)
  const h = { orders: hrefs?.orders ?? "/atlas/orders", order: hrefs?.order ?? "/atlas/orders/ORD-10479", products: hrefs?.products ?? "/atlas/products" }

  return (
    <AtlasShell
      page="dashboard"
      title="Dashboard"
      hrefs={hrefs}
      actions={<a href={h.orders} className={cn(atlasButton.primary, "hidden sm:inline-flex")}>View orders</a>}
      {...props}
    >
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        <AtlasPageHeader title="Good morning, Mina" description="Here is how Fieldnote Goods is doing.">
          <SegmentedControl aria-label="Date range" value={range} onValueChange={(v) => setRange(v as Range)} size="sm">
            <SegmentedControlItem value="7">7 days</SegmentedControlItem>
            <SegmentedControlItem value="30">30 days</SegmentedControlItem>
          </SegmentedControl>
          <button type="button" className={atlasButton.outline}><Download aria-hidden="true" /> Export</button>
        </AtlasPageHeader>

        <section aria-label="Key figures" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k) => {
            const up = k.delta >= 0
            const Arrow = up ? ArrowUpRight : ArrowDownRight
            return (
              <div key={k.label} className="bg-card rounded-xl border p-4">
                <p className="text-muted-foreground text-sm font-medium">{k.label}</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-[1.65rem] leading-none font-extrabold tracking-[-0.03em] tabular-nums">{k.value}</p>
                  <Sparkline values={k.trend} label={`${k.label} trend over ${n} days`} height={32} showEnd={false} className="text-chart-1 w-20 shrink-0" />
                </div>
                <p className="mt-3 flex items-center gap-1 text-xs">
                  <Arrow className={cn("size-3.5", up ? "text-chart-2" : "text-destructive")} aria-hidden="true" />
                  <span className="font-semibold tabular-nums">{Math.abs(k.delta).toFixed(1)}%</span>
                  <span className="text-muted-foreground">{up ? "up" : "down"} from the previous {n} days</span>
                </p>
              </div>
            )
          })}
        </section>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]">
          <section aria-labelledby="atlas-rev" className="bg-card min-w-0 rounded-xl border p-4 sm:p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h3 id="atlas-rev" className="text-sm font-bold">Revenue</h3>
              <p className="text-muted-foreground text-xs">Daily, last {n} days</p>
            </div>
            <ChartContainer
              config={config}
              label={`Daily revenue for the last ${n} days compared with the previous period`}
              summary={`Revenue totalled ${money.format(revenue)}, ${Math.abs(pct(revenue, previous)).toFixed(1)} percent ${revenue >= previous ? "above" : "below"} the previous period.`}
              className="mt-4 aspect-[16/7] w-full"
            >
              <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }} accessibilityLayer>
                <defs>
                  <linearGradient id="atlas-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} interval={n === 7 ? 0 : 4} />
                <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" formatter={(v) => money.format(Number(v))} />} />
                <Area dataKey="previous" type="monotone" fill="none" stroke="var(--color-previous)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
                <Area dataKey="revenue" type="monotone" fill="url(#atlas-fill)" stroke="var(--color-revenue)" strokeWidth={2} dot={false} isAnimationActive={false} />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </section>

          <section aria-labelledby="atlas-attn" className="bg-card rounded-xl border">
            <h3 id="atlas-attn" className="px-4 pt-4 text-sm font-bold sm:px-5">Needs attention</h3>
            <ul className="mt-2 divide-y">
              {[
                { icon: Truck, text: `${unfulfilled} orders to fulfil`, hint: "Oldest from 2 days ago", href: h.orders, tone: "bg-chart-3/20" },
                { icon: AlertTriangle, text: `${pending} payments pending`, hint: "Bank transfers, 1 to 3 days", href: h.orders, tone: "bg-chart-5/20" },
                { icon: PackageX, text: `${low.length} products low on stock`, hint: low.slice(0, 2).map((p) => p.name.split(",")[0]).join(", ") + " and more", href: h.products, tone: "bg-destructive/15" },
              ].map((a) => (
                <li key={a.text}>
                  <a href={a.href} className="hover:bg-accent focus-visible:ring-ring/50 flex items-center gap-3 px-4 py-3 outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-inset sm:px-5">
                    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", a.tone)}><a.icon className="size-4" aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{a.text}</span><span className="text-muted-foreground block truncate text-xs">{a.hint}</span></span>
                    <ArrowRight className="text-muted-foreground size-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <div className="border-t p-4 sm:p-5">
              <h3 className="text-sm font-bold">Top products</h3>
              <ul className="mt-3 space-y-3">
                {top.map((p) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <ProductTile hue={p.hue} className="size-9 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <div className="bg-muted mt-1.5 h-1.5 rounded-full"><div className="bg-chart-1 h-full rounded-full" style={{ width: `${(p.sold * p.price / topMax) * 100}%` }} /></div>
                    </div>
                    <p className="text-sm font-semibold tabular-nums">{money.format(p.sold * p.price)}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <section aria-labelledby="atlas-recent" className="bg-card overflow-hidden rounded-xl border">
          <div className="flex items-center justify-between px-4 py-3.5 sm:px-5">
            <h3 id="atlas-recent" className="text-sm font-bold">Recent orders</h3>
            <a href={h.orders} className="text-chart-1 focus-visible:ring-ring/50 rounded text-sm font-semibold underline-offset-4 outline-none hover:underline focus-visible:ring-[3px]">View all</a>
          </div>
          <div tabIndex={0} role="region" aria-label="Recent orders" className="focus-visible:ring-ring/50 overflow-x-auto outline-none focus-visible:ring-[3px] focus-visible:ring-inset">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <caption className="sr-only">Most recent orders</caption>
              <thead>
                <tr className="text-muted-foreground bg-surface border-y text-xs">
                  {["Order", "Date", "Customer", "Payment", "Fulfilment", "Total"].map((c, i) => <th key={c} scope="col" className={cn("px-4 py-2.5 font-semibold sm:px-5", i === 5 && "text-right")}>{c}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y">
                {recent.map((o) => {
                  const c = getCustomer(o.customerId)
                  return (
                    <tr key={o.id} className="hover:bg-accent/50">
                      <td className="px-4 py-3 sm:px-5"><a href={h.order} className="text-chart-1 font-semibold underline-offset-4 hover:underline" style={{ fontFamily: "var(--atlas-mono)" }}>{o.id}</a></td>
                      <td className="text-muted-foreground px-4 py-3 whitespace-nowrap sm:px-5">{formatDate(o.date)}</td>
                      <td className="px-4 py-3 sm:px-5"><span className="flex items-center gap-2.5"><span className={cn("flex size-7 items-center justify-center rounded-full text-[11px] font-bold", ["bg-chart-1/20", "bg-chart-2/20", "bg-chart-3/25", "bg-chart-4/20", "bg-chart-5/20"][c.tone - 1])} aria-hidden="true">{initials(c.name)}</span>{c.name}</span></td>
                      <td className="px-4 py-3 sm:px-5"><PaymentBadge value={o.payment} /></td>
                      <td className="px-4 py-3 sm:px-5"><FulfilmentBadge value={o.fulfillment} /></td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums sm:px-5">{moneyExact.format(orderGrand(o))}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </AtlasShell>
  )
}

export { AtlasDashboard, type AtlasDashboardProps }

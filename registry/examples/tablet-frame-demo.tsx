import { BarChart3, Bell, CreditCard, Home, Inbox, Search, Settings, Users } from "lucide-react"

import { TabletFrame } from "@/components/ballmac/tablet-frame"

const nav = [
  { icon: Home, label: "Overview", active: true },
  { icon: BarChart3, label: "Reports" },
  { icon: Users, label: "Customers" },
  { icon: Inbox, label: "Inbox" },
  { icon: CreditCard, label: "Billing" },
  { icon: Settings, label: "Settings" },
]
const stats = [
  { label: "Revenue", value: "$48,920", delta: "+12.4%" },
  { label: "Active users", value: "8,214", delta: "+5.1%" },
  { label: "Conversion", value: "3.8%", delta: "+0.6%" },
]
const bars = [38, 52, 44, 66, 58, 74, 62, 84, 70, 92, 80, 96]

function Dashboard() {
  return (
    <div className="flex h-full text-[15px]">
      <aside className="flex w-[210px] shrink-0 flex-col gap-1 border-r bg-muted/40 p-4">
        <p className="px-3 pt-1 pb-3 text-[19px] font-bold tracking-tight">Northwind</p>
        {nav.map((n) => (
          <span key={n.label} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium ${n.active ? "bg-foreground text-background" : "text-muted-foreground"}`}>
            <n.icon className="size-[18px]" aria-hidden="true" />
            {n.label}
          </span>
        ))}
      </aside>
      <main className="flex min-w-0 flex-1 flex-col gap-5 p-6">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[26px] font-bold tracking-tight">Good morning, Alex</p>
            <p className="text-muted-foreground">Here is how the store is doing this week.</p>
          </div>
          <span className="ml-auto flex h-10 w-56 items-center gap-2 rounded-full border bg-background px-4 text-muted-foreground">
            <Search className="size-4" aria-hidden="true" /> Search
          </span>
          <span className="flex size-10 items-center justify-center rounded-full border bg-background">
            <Bell className="size-[18px]" aria-hidden="true" />
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border bg-card p-4">
              <p className="text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-[28px] font-bold tracking-tight tabular-nums">{s.value}</p>
              <p className="text-[13px] font-semibold text-chart-2">{s.delta}</p>
            </div>
          ))}
        </div>
        <div className="flex min-h-0 flex-1 flex-col rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Sales, last 12 weeks</p>
            <span className="rounded-full bg-muted px-3 py-1 text-[13px] font-medium">Weekly</span>
          </div>
          <div className="mt-4 flex min-h-0 flex-1 items-end gap-3">
            {bars.map((h, i) => (
              <span key={i} className="flex-1 rounded-t-lg bg-[linear-gradient(to_top,var(--chart-1),var(--chart-4))]" style={{ height: `${h}%`, opacity: 0.55 + i * 0.04 }} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function TabletFrameDemo() {
  return (
    <div className="flex w-full justify-center px-2 py-6">
      <TabletFrame screenWidth={1194} className="max-w-[680px]">
        <Dashboard />
      </TabletFrame>
    </div>
  )
}

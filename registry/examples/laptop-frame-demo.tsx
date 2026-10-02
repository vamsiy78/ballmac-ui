import { Activity, BarChart3, Globe, LayoutGrid, Search, Settings, Users } from "lucide-react"

import { LaptopFrame } from "@/components/ballmac/laptop-frame"

const nav = [
  { icon: LayoutGrid, label: "Overview", active: true },
  { icon: BarChart3, label: "Analytics" },
  { icon: Globe, label: "Regions" },
  { icon: Users, label: "Customers" },
  { icon: Settings, label: "Settings" },
]

const stats = [
  { label: "Revenue", value: "$48,290", delta: "+12.4%" },
  { label: "Active users", value: "9,214", delta: "+5.1%" },
  { label: "p95 latency", value: "182 ms", delta: "−8 ms" },
]

const deploys = [
  { name: "api-gateway", region: "iad1", time: "2m ago", status: "Ready" },
  { name: "web-dashboard", region: "fra1", time: "14m ago", status: "Ready" },
  { name: "billing-worker", region: "sfo1", time: "1h ago", status: "Ready" },
]

// Revenue line in a 600 × 160 box.
const line = "M0 128 C 40 120, 70 96, 110 102 S 180 76, 220 84 S 290 50, 330 62 S 400 34, 440 44 S 520 18, 600 22"

function Dashboard() {
  return (
    <div className="flex size-full flex-col bg-background text-[13px] text-foreground">
      {/* Menu bar; the notch sits in its middle. */}
      <div className="flex h-7 shrink-0 items-center gap-4 border-b bg-muted/60 px-4 text-[11px] font-medium">
        <span className="font-semibold">Acme</span>
        <span className="text-muted-foreground">File</span>
        <span className="text-muted-foreground">View</span>
        <span className="ms-auto font-mono text-muted-foreground tabular-nums">Tue 9:41</span>
      </div>
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-44 shrink-0 flex-col gap-0.5 border-e bg-muted/30 p-3">
          <div className="mb-3 flex items-center gap-2 px-2">
            <span className="size-5 rounded-md bg-[conic-gradient(from_200deg,var(--chart-1),var(--chart-4),var(--chart-2),var(--chart-1))]" />
            <span className="text-[13px] font-semibold tracking-tight">Acme Cloud</span>
          </div>
          {nav.map(({ icon: Icon, label, active }) => (
            <span
              key={label}
              className={
                active
                  ? "flex items-center gap-2 rounded-md bg-background px-2 py-1.5 font-medium shadow-xs ring-1 ring-border"
                  : "flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground"
              }
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {label}
            </span>
          ))}
        </aside>
        <main className="flex min-w-0 flex-1 flex-col gap-4 p-5">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[17px] font-semibold tracking-tight">Overview</p>
              <p className="text-xs text-muted-foreground">Last 30 days · all regions</p>
            </div>
            <span className="ms-auto flex h-7 w-44 items-center gap-2 rounded-md border bg-background px-2 text-xs text-muted-foreground">
              <Search className="size-3" aria-hidden="true" /> Search
              <span className="ms-auto rounded border px-1 font-mono text-[10px]">⌘K</span>
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">{s.value}</p>
                <p className="mt-0.5 text-[11px] font-medium text-chart-2">{s.delta}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2 text-xs">
              <Activity className="size-3.5 text-chart-1" aria-hidden="true" />
              <span className="font-medium">Revenue</span>
              <span className="ms-auto text-muted-foreground">USD</span>
            </div>
            <svg viewBox="0 0 600 160" className="mt-2 h-32 w-full" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="laptop-demo-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[40, 80, 120].map((y) => (
                <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="var(--border)" strokeDasharray="3 5" />
              ))}
              <path d={`${line} L 600 160 L 0 160 Z`} fill="url(#laptop-demo-fill)" />
              <path d={line} fill="none" stroke="var(--chart-1)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <div className="rounded-lg border bg-card">
            {deploys.map((d, i) => (
              <div key={d.name} className={`flex items-center gap-3 px-3 py-2 text-xs ${i ? "border-t" : ""}`}>
                <span className="size-1.5 rounded-full bg-chart-2" aria-hidden="true" />
                <span className="font-mono">{d.name}</span>
                <span className="text-muted-foreground">{d.region}</span>
                <span className="ms-auto text-muted-foreground">{d.time}</span>
                <span className="rounded-full border px-2 py-0.5 text-[10px] font-medium">{d.status}</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function LaptopFrameDemo() {
  return (
    <div className="w-full max-w-xl px-2 py-6">
      <LaptopFrame screenWidth={900} openAnimation="in-view">
        <Dashboard />
      </LaptopFrame>
    </div>
  )
}

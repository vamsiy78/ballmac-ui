// Ballmac UI: Devices 1. https://ui.ballmac.com/blocks/devices-1
"use client"

import * as React from "react"
import { Bell, Home, Laptop, PieChart, Receipt, Smartphone, Tablet, Users, Watch } from "lucide-react"

import { LaptopFrame } from "@/components/ballmac/laptop-frame"
import { PhoneFrame } from "@/components/ballmac/phone-frame"
import { TabletFrame } from "@/components/ballmac/tablet-frame"
import { WatchFrame } from "@/components/ballmac/watch-frame"
import { cn } from "@/lib/utils"

type Devices1Device = "mac" | "ipad" | "iphone" | "watch"

type Devices1Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Label above the heading. */
  eyebrow?: string
  /** Section heading. */
  title?: string
  /** One or two sentences under the heading. */
  description?: string
  /** Names and one-line descriptions for each device, shown as the buttons under the picture. */
  captions?: Partial<Record<Devices1Device, { title: string; description: string }>>
  /** Replaces a device's sample screen. Each screen is laid out at the real device width: 1280, 834, 393 and 208 CSS pixels. */
  screens?: Partial<Record<Devices1Device, React.ReactNode>>
}

const defaultCaptions: Record<Devices1Device, { title: string; description: string }> = {
  mac: { title: "Mac", description: "The full workspace, with keyboard shortcuts and a menu bar companion." },
  ipad: { title: "iPad", description: "Review and approve on the couch, with Pencil markup on receipts." },
  iphone: { title: "iPhone", description: "Snap a receipt, approve a payment, check cash from anywhere." },
  watch: { title: "Apple Watch", description: "A glance at what’s been paid today, with a tap to nudge late invoices." },
}

const icons = { mac: Laptop, ipad: Tablet, iphone: Smartphone, watch: Watch }

function MacScreen() {
  return (
    <div className="bg-background flex h-full w-[1280px] text-[15px]">
      <aside className="bg-muted/40 w-[220px] shrink-0 space-y-1 border-r p-4">
        <div className="mb-4 flex items-center gap-2.5 px-2"><span className="bg-foreground text-background flex size-7 items-center justify-center rounded-lg text-sm font-bold">L</span><span className="text-base font-semibold">Ledger</span></div>
        {[["Overview", Home], ["Invoices", Receipt], ["Customers", Users], ["Reports", PieChart]].map(([l, I], i) => {
          const Icon = I as typeof Home
          return <span key={String(l)} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium ${i === 0 ? "bg-background shadow-sm ring-1 ring-border" : "text-muted-foreground"}`}><Icon className="size-[18px]" />{String(l)}</span>
        })}
      </aside>
      <div className="min-w-0 flex-1 space-y-5 p-8">
        <p className="text-2xl font-semibold tracking-tight">Overview</p>
        <div className="grid grid-cols-4 gap-4">
          {[["Revenue", "$128,430"], ["Customers", "2,847"], ["Avg. invoice", "$1,260"], ["Paid on time", "94.2%"]].map(([k, v]) => (
            <div key={k} className="bg-card rounded-xl border p-4"><p className="text-muted-foreground text-sm">{k}</p><p className="mt-2 text-[26px] font-semibold tracking-tight">{v}</p></div>
          ))}
        </div>
        <div className="bg-card rounded-xl border p-5">
          <p className="font-medium">Revenue</p>
          <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="mt-3 h-[260px] w-full" aria-hidden="true">
            <defs><linearGradient id="d1-mac" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" style={{ stopColor: "var(--chart-1)", stopOpacity: 0.35 }} /><stop offset="100%" style={{ stopColor: "var(--chart-1)", stopOpacity: 0 }} /></linearGradient></defs>
            <path d="M0 150 C60 140 90 110 150 120 S250 155 310 100 S420 70 470 55 S560 45 600 30 L600 200 L0 200Z" fill="url(#d1-mac)" />
            <path d="M0 150 C60 140 90 110 150 120 S250 155 310 100 S420 70 470 55 S560 45 600 30" fill="none" stroke="var(--chart-1)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  )
}

function IpadScreen() {
  return (
    <div className="bg-background h-full w-[834px] p-8 text-[17px]">
      <p className="text-3xl font-semibold tracking-tight">Approvals</p>
      <p className="text-muted-foreground mt-1">4 waiting for you</p>
      <ul className="mt-6 divide-y rounded-2xl border">
        {[["Northwind Studio", "Design retainer", "$4,200"], ["Globex Corp", "Annual license", "$12,800"], ["Initech", "Support plan", "$960"], ["Umbrella Labs", "Hardware", "$3,450"]].map(([a, b, c]) => (
          <li key={a} className="flex items-center gap-4 px-5 py-4"><span className="bg-chart-1/20 flex size-11 items-center justify-center rounded-xl font-semibold">{a[0]}</span><span className="flex-1"><span className="block font-medium">{a}</span><span className="text-muted-foreground block text-[15px]">{b}</span></span><span className="font-semibold tabular-nums">{c}</span></li>
        ))}
      </ul>
      <div className="mt-6 flex gap-3"><span className="bg-foreground text-background rounded-full px-6 py-3 font-medium">Approve all</span><span className="rounded-full border px-6 py-3 font-medium">Review</span></div>
    </div>
  )
}

function PhoneScreen() {
  return (
    <div className="bg-background flex h-full w-[393px] flex-col px-5 pt-14 text-[16px]">
      <p className="text-muted-foreground text-sm">Cash on hand</p>
      <p className="text-[40px] font-semibold tracking-tight tabular-nums">$84,210</p>
      <p className="text-chart-2 text-sm font-medium">+$4,200 today</p>
      <ul className="mt-5 divide-y rounded-2xl border">
        {[["Northwind", "Paid", "$4,200"], ["Globex", "Due", "$12,800"], ["Initech", "Paid", "$960"]].map(([a, s, v]) => (
          <li key={a} className="flex items-center gap-3 px-4 py-3.5"><span className="flex-1 font-medium">{a}</span><span className={`rounded-full px-2 py-0.5 text-xs ${s === "Paid" ? "bg-chart-2/15" : "bg-chart-3/20"}`}>{s}</span><span className="w-16 text-right tabular-nums">{v}</span></li>
        ))}
      </ul>
      <div className="mt-auto -mx-5 flex justify-around border-t px-4 pt-3 pb-8 text-xs">
        {[[Home, "Home"], [Receipt, "Invoices"], [Bell, "Alerts"], [Users, "People"]].map(([I, l], i) => { const Icon = I as typeof Home; return <span key={String(l)} className={`flex flex-col items-center gap-1 ${i === 0 ? "" : "text-muted-foreground"}`}><Icon className="size-5" />{String(l)}</span> })}
      </div>
    </div>
  )
}

function WatchScreen() {
  return (
    <div className="flex h-full w-[208px] flex-col items-center justify-center bg-black text-white">
      <div className="relative flex size-28 items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden="true"><circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeOpacity="0.18" strokeWidth="9" /><circle cx="50" cy="50" r="42" fill="none" stroke="var(--chart-2)" strokeWidth="9" strokeLinecap="round" strokeDasharray="264" strokeDashoffset="70" /></svg>
        <div className="text-center"><p className="text-[22px] leading-none font-semibold tabular-nums">$4.2k</p><p className="mt-1 text-[11px] text-white/70">paid today</p></div>
      </div>
      <p className="mt-3 text-[12px] text-white/70">2 invoices due</p>
    </div>
  )
}

function Devices1({
  eyebrow = "Everywhere you work",
  title = "One app, every screen.",
  description = "Start on your Mac, approve on your iPad, check in from your iPhone and glance at your wrist. Everything stays in sync.",
  captions,
  screens,
  className,
  ...props
}: Devices1Props) {
  const [pinned, setPinned] = React.useState<Devices1Device | null>(null)
  const [hovered, setHovered] = React.useState<Devices1Device | null>(null)
  const focus = hovered ?? pinned
  const text = { ...defaultCaptions, ...captions }
  const order: Devices1Device[] = ["mac", "ipad", "iphone", "watch"]
  const dim = (d: Devices1Device) => focus !== null && focus !== d
  const lift = (d: Devices1Device) => focus === d

  return (
    <section data-slot="devices-1" className={cn("mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28", className)} {...props}>
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-muted-foreground text-sm font-medium">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl lg:text-5xl">{title}</h2>
        <p className="text-muted-foreground mt-4 text-lg text-pretty">{description}</p>
      </div>

      {/* The picture is decorative; the buttons below say the same thing in words. */}
      <div aria-hidden="true" className="@container mt-14 md:mt-20">
        <div className="relative aspect-[2/1] sm:aspect-[2.5/1] w-full">
          <div className="bg-chart-1/15 absolute inset-x-[8%] bottom-0 h-1/2 rounded-[50%] blur-3xl" />
          {[
            { d: "ipad" as const, pos: "left-[1%] bottom-[2%] w-[20cqw] z-0", node: <TabletFrame orientation="portrait" screenWidth={834}>{screens?.ipad ?? <IpadScreen />}</TabletFrame> },
            { d: "mac" as const, pos: "left-[18%] bottom-0 w-[62cqw] z-10", node: <LaptopFrame screenWidth={1280}>{screens?.mac ?? <MacScreen />}</LaptopFrame> },
            { d: "iphone" as const, pos: "right-[6%] bottom-0 w-[14cqw] z-20", node: <PhoneFrame screenWidth={393}>{screens?.iphone ?? <PhoneScreen />}</PhoneFrame> },
            { d: "watch" as const, pos: "right-[0.5%] bottom-[3%] w-[7.5cqw] z-20", node: <WatchFrame screenWidth={208} band="sport" bandTone="blue" variant="black">{screens?.watch ?? <WatchScreen />}</WatchFrame> },
          ].map(({ d, pos, node }) => (
            <div key={d} className={cn("absolute origin-bottom transition-[transform,opacity,filter] duration-500 ease-out motion-reduce:transition-none", pos, dim(d) && "opacity-40 blur-[2px] saturate-50", lift(d) && "-translate-y-[3%] scale-[1.04]")}>{node}</div>
          ))}
        </div>
      </div>

      <div role="group" aria-label="Choose a device to highlight" className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {order.map((d) => {
          const Icon = icons[d]
          const on = pinned === d
          const lit = focus === d
          return (
            <button
              key={d}
              type="button"
              aria-pressed={on}
              onClick={() => setPinned(on ? null : d)}
              onMouseEnter={() => setHovered(d)}
              onMouseLeave={() => setHovered(null)}
              className={cn("focus-visible:ring-ring/50 rounded-2xl border p-4 text-left outline-none transition-colors focus-visible:ring-[3px]", lit ? "border-foreground bg-accent/50" : "hover:bg-accent/30")}
            >
              <span className="flex items-center gap-2 font-semibold"><Icon className="size-4" aria-hidden="true" />{text[d].title}</span>
              <span className="text-muted-foreground mt-1.5 block text-sm text-pretty">{text[d].description}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export { Devices1, type Devices1Props, type Devices1Device }

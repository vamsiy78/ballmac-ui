// Ballmac UI: Hero 7. https://ui.ballmac.com/blocks/hero-7
"use client"

import * as React from "react"
import { ArrowRight, BarChart3, Bell, FileText, Home, Search, Settings, Users } from "lucide-react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"

import { Badge } from "@/components/ballmac/badge"
import { BrowserFrame } from "@/components/ballmac/browser-frame"
import { buttonVariants } from "@/components/ballmac/button"
import { cn } from "@/lib/utils"

type Action = { label: string; href: string }

type Hero7Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Short label above the headline. */
  eyebrow?: string
  /** The headline. */
  title?: string
  /** One or two sentences under the headline. */
  description?: string
  /** Main call to action. */
  primaryAction?: Action
  /** Secondary call to action. */
  secondaryAction?: Action
  /** Address shown in the browser frame. */
  url?: string
  /** A screenshot of your product. Omit it to show the sample dashboard. */
  screenshot?: { src: string; alt: string }
  /** Your own UI instead of the screenshot or sample dashboard. It is laid out 1180px wide, then scaled to fit. */
  screen?: React.ReactNode
  /** How steeply the frame leans back before it scrolls into place, in degrees. */
  tilt?: number
}

const NAV = [
  { label: "Overview", icon: Home, active: true },
  { label: "Reports", icon: BarChart3 },
  { label: "Customers", icon: Users },
  { label: "Invoices", icon: FileText },
  { label: "Settings", icon: Settings },
]

const KPIS = [
  { label: "Revenue", value: "$128,430", delta: "+12.4%" },
  { label: "Active customers", value: "2,847", delta: "+4.1%" },
  { label: "Avg. invoice", value: "$1,260", delta: "+2.8%" },
  { label: "Paid on time", value: "94.2%", delta: "+1.3%" },
]

/** A sample product screen, drawn with theme tokens. Laid out at 1180 x 700. */
function SampleDashboard() {
  return (
    <div aria-hidden="true" inert className="bg-background text-foreground flex h-[700px] w-[1180px] text-[15px]">
      <aside className="bg-muted/40 flex w-[210px] shrink-0 flex-col gap-1 border-r p-4">
        <div className="mb-4 flex items-center gap-2.5 px-2">
          <span className="bg-foreground text-background flex size-7 items-center justify-center rounded-lg text-sm font-bold">A</span>
          <span className="text-base font-semibold">Acme</span>
        </div>
        {NAV.map(({ label, icon: Icon, active }) => (
          <span key={label} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium", active ? "bg-background shadow-sm ring-1 ring-border" : "text-muted-foreground")}>
            <Icon className="size-[18px]" />
            {label}
          </span>
        ))}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-5 p-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-semibold tracking-tight">Overview</p>
            <p className="text-muted-foreground mt-0.5 text-sm">Last 30 days, compared to the previous period</p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-muted-foreground flex h-9 w-56 items-center gap-2 rounded-lg border px-3 text-sm">
              <Search className="size-4" /> Search
            </span>
            <span className="flex size-9 items-center justify-center rounded-lg border">
              <Bell className="size-4" />
            </span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {KPIS.map((k) => (
            <div key={k.label} className="bg-card rounded-xl border p-4">
              <p className="text-muted-foreground text-sm">{k.label}</p>
              <p className="mt-2 text-[26px] font-semibold tracking-tight">{k.value}</p>
              <p className="text-chart-2 mt-1 text-sm font-medium">{k.delta}</p>
            </div>
          ))}
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[1fr_300px] gap-4">
          <div className="bg-card flex flex-col rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <p className="font-medium">Revenue</p>
              <div className="text-muted-foreground flex gap-4 text-sm">
                <span className="flex items-center gap-1.5"><span className="bg-chart-1 size-2 rounded-full" /> This period</span>
                <span className="flex items-center gap-1.5"><span className="bg-chart-3 size-2 rounded-full" /> Previous</span>
              </div>
            </div>
            <svg viewBox="0 0 600 220" preserveAspectRatio="none" className="mt-3 min-h-0 w-full flex-1" aria-hidden="true">
              <defs>
                <linearGradient id="hero7-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" style={{ stopColor: "var(--chart-1)", stopOpacity: 0.35 }} />
                  <stop offset="100%" style={{ stopColor: "var(--chart-1)", stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              {[55, 110, 165].map((y) => (
                <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="var(--border)" strokeDasharray="3 5" />
              ))}
              <path d="M0 170 C60 160 90 130 150 140 S250 175 310 120 S420 90 470 70 S560 60 600 40 L600 220 L0 220Z" fill="url(#hero7-fill)" />
              <path d="M0 170 C60 160 90 130 150 140 S250 175 310 120 S420 90 470 70 S560 60 600 40" fill="none" stroke="var(--chart-1)" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M0 185 C70 175 110 160 170 165 S270 170 330 150 S430 140 480 125 S560 115 600 105" fill="none" stroke="var(--chart-3)" strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="bg-card rounded-xl border p-5">
            <p className="font-medium">Recent invoices</p>
            <ul className="mt-3 space-y-3.5">
              {[
                ["Northwind Studio", "$4,200", "Paid"],
                ["Globex Corp", "$12,800", "Due"],
                ["Initech", "$960", "Paid"],
                ["Umbrella Labs", "$3,450", "Paid"],
              ].map(([n, a, s]) => (
                <li key={n} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{n}</p>
                    <p className={cn("text-xs", s === "Paid" ? "text-chart-2" : "text-chart-3")}>{s}</p>
                  </div>
                  <span className="tabular-nums">{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function Hero7({
  eyebrow = "New · Reports that write themselves",
  title = "See your whole business in one calm view.",
  description = "Revenue, customers and invoices in a single dashboard that updates as it happens. No exports, no stale numbers.",
  primaryAction = { label: "Start free", href: "#" },
  secondaryAction = { label: "Book a demo", href: "#" },
  url = "app.acme.com/overview",
  screenshot,
  screen,
  tilt = 24,
  className,
  ...props
}: Hero7Props) {
  const reduce = useReducedMotion()
  const frameRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: frameRef, offset: ["start 98%", "start 30%"] })
  const rotateX = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : tilt, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0.92, 1])
  const lift = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 36, 0])

  return (
    <section data-slot="hero-7" className={cn("relative isolate overflow-hidden", className)} {...props}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklch,var(--chart-1)_16%,transparent),transparent)]" />
      <div className="mx-auto max-w-6xl px-4 pt-20 sm:px-6 md:pt-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Badge variant="outline" className="rounded-full px-3 py-1">{eyebrow}</Badge>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-5xl lg:text-6xl lg:leading-[1.04]">{title}</h1>
          <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed text-pretty">{description}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a className={buttonVariants({ size: "lg", shape: "pill" })} href={primaryAction.href}>
              {primaryAction.label} <ArrowRight />
            </a>
            <a className={buttonVariants({ variant: "outline", size: "lg", shape: "pill" })} href={secondaryAction.href}>{secondaryAction.label}</a>
          </div>
        </div>
        <div className="relative mt-14 pb-16 [perspective:1600px] md:mt-20 md:pb-24">
          <motion.div ref={frameRef} style={{ rotateX, scale, y: lift, transformOrigin: "50% 0%" }} className="relative">
            <div aria-hidden="true" className="bg-chart-1/20 absolute inset-x-[8%] -bottom-6 h-24 rounded-full blur-3xl" />
            <BrowserFrame
              url={url}
              secure
              screenWidth={1180}
              aspectRatio={1180 / 700}
              className="shadow-[0_50px_120px_-40px_rgb(0_0_0/0.45)]"
              {...(screenshot && !screen ? { src: screenshot.src, alt: screenshot.alt } : {})}
            >
              {screen ?? (screenshot ? null : <SampleDashboard />)}
            </BrowserFrame>
          </motion.div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>
      </div>
    </section>
  )
}

export { Hero7, type Hero7Props }

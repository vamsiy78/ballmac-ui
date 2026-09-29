"use client"

import * as React from "react"
import { CalendarDays, GitPullRequest, Mail, MessageCircle, Rocket, ShieldCheck } from "lucide-react"

import { Notification, NotificationStack } from "@/components/ballmac/notification-stack"

type Item = { id: number; kind: keyof typeof kinds; title: string; body: string }

const kinds = {
  message: { icon: <MessageCircle fill="currentColor" />, tile: "bg-linear-to-b from-chart-2/80 to-chart-2 text-white" },
  mail: { icon: <Mail />, tile: "bg-linear-to-b from-chart-1/80 to-chart-1 text-white" },
  calendar: { icon: <CalendarDays />, tile: "bg-white text-destructive" },
  deploy: { icon: <Rocket />, tile: "bg-black/85 text-white" },
  review: { icon: <GitPullRequest />, tile: "bg-linear-to-b from-chart-4/80 to-chart-4 text-white" },
  security: { icon: <ShieldCheck />, tile: "bg-linear-to-b from-chart-3/80 to-chart-3 text-white" },
} as const

const pool: Omit<Item, "id">[] = [
  { kind: "deploy", title: "Deploy succeeded", body: "acme-web is live on production. Build took 42 seconds." },
  { kind: "review", title: "Review requested", body: "Maya asked you to review “Menu bar redesign” (#482)." },
  { kind: "calendar", title: "Design review in 10 minutes", body: "Studio B · with Leo, Maya and 3 others" },
  { kind: "security", title: "New sign-in", body: "Your account was used on a new Mac in Lisbon." },
  { kind: "mail", title: "Invoice #2041 paid", body: "Acme Inc. paid $4,200.00. The receipt is attached." },
  { kind: "message", title: "Leo", body: "Shipping the DMG tonight. Can you check the notarization log?" },
]

const initial: Item[] = [
  { id: 3, kind: "message", title: "Maya", body: "The new icons look great on the dark wallpaper. Ship it!" },
  { id: 2, kind: "mail", title: "Weekly usage report", body: "Active installs grew 18% this week. Top country: Germany." },
  { id: 1, kind: "calendar", title: "Standup at 10:00", body: "Daily · Zoom room 2" },
]

export default function NotificationStackDemo() {
  const [items, setItems] = React.useState(initial)
  const next = React.useRef(0)
  const id = React.useRef(10)

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      const n = pool[next.current % pool.length]
      next.current += 1
      id.current += 1
      setItems((current) => [{ ...n, id: id.current }, ...current].slice(0, 5))
    }, 4000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="relative isolate flex h-[420px] w-full max-w-[640px] justify-center overflow-hidden rounded-2xl border border-foreground/10 px-4 pt-6 sm:justify-end sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 dark:brightness-[0.55]">
        <div className="absolute inset-0 bg-linear-to-bl from-chart-4 via-chart-1 to-chart-2" />
        <div className="absolute -inset-x-1/4 top-1/2 h-full rounded-[50%] bg-white/20 blur-2xl" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute bottom-6 left-6 text-white [text-shadow:0_1px_12px_rgb(0_0_0/0.2)]">
        <p className="text-sm font-medium opacity-90">Tuesday, September 29</p>
        <p className="text-6xl font-semibold tracking-tight">9:41</p>
      </div>

      <NotificationStack className="w-full max-w-[340px]" onClearAll={() => setItems([])}>
        {items.map((item, i) => (
          <Notification
            key={item.id}
            icon={kinds[item.kind].icon}
            iconClassName={kinds[item.kind].tile}
            title={item.title}
            time={i === 0 ? "now" : `${i * 4}m ago`}
            onDismiss={() => setItems((current) => current.filter((x) => x.id !== item.id))}
          >
            {item.body}
          </Notification>
        ))}
      </NotificationStack>
    </div>
  )
}

"use client"

import { Bell, Calendar, House, Inbox, Search, Settings, Star } from "lucide-react"

import { Dock, DockItem, DockSeparator } from "@/components/ballmac/dock"

const tile = "bg-background/70 text-foreground/80 dark:bg-white/10"

export default function DockVertical() {
  return (
    <div className="relative isolate flex h-[400px] w-full max-w-[560px] items-center overflow-hidden rounded-2xl border border-foreground/10 ps-3">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 dark:brightness-[0.55]">
        <div className="absolute inset-0 bg-linear-to-bl from-chart-4 via-chart-1 to-chart-2" />
        <div className="absolute inset-x-0 top-1/2 h-full rounded-[50%] bg-white/15 blur-2xl" />
      </div>
      <Dock orientation="vertical" size={38} magnification={58} distance={110} aria-label="Workspace">
        <DockItem label="Home" icon={<House />} active className="bg-linear-to-b from-chart-1/80 to-chart-1 text-white" />
        <DockItem label="Search" icon={<Search />} className={tile} />
        <DockItem label="Inbox" icon={<Inbox />} active className={tile} />
        <DockItem label="Calendar" icon={<Calendar />} className={tile} />
        <DockItem label="Starred" icon={<Star />} className={tile} />
        <DockSeparator />
        <DockItem label="Notifications" icon={<Bell />} bounce={false} className={tile} />
        <DockItem label="Settings" icon={<Settings />} bounce={false} className={tile} />
      </Dock>
      <div className="flex flex-1 flex-col items-center text-white [text-shadow:0_1px_12px_rgb(0_0_0/0.2)]">
        <p className="text-sm font-medium opacity-90">Tuesday, September 29</p>
        <p className="text-6xl font-semibold tracking-tight tabular-nums sm:text-7xl">9:41</p>
      </div>
    </div>
  )
}

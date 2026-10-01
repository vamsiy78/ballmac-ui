"use client"

import { Calendar, Camera, Music } from "lucide-react"

import { DesktopIcons, type DesktopItem } from "@/components/ballmac/desktop-icons"

const items: DesktopItem[] = [
  { id: "p", name: "Photos", kind: "app", tone: "orange", glyph: <Camera />, col: 0, row: 0 },
  { id: "m", name: "Music", kind: "app", tone: "red", glyph: <Music />, col: 1, row: 0 },
  { id: "c", name: "Calendar", kind: "app", tone: "green", glyph: <Calendar />, col: 2, row: 0 },
  { id: "f", name: "Projects", kind: "folder", tone: "teal", col: 0, row: 1 },
  { id: "n", name: "notes.txt", kind: "file", ext: "txt", col: 1, row: 1 },
]

export default function DesktopIconsWindow() {
  return (
    <div className="relative isolate w-full max-w-[560px] overflow-hidden rounded-2xl border border-foreground/10">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-b from-chart-2 to-chart-1 dark:brightness-[0.55]" />
      <DesktopIcons items={items} cell={88} label="Apps desktop" className="h-[240px] text-white" />
    </div>
  )
}

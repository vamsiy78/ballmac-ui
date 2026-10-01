"use client"

import * as React from "react"
import { Compass, Mail } from "lucide-react"

import { DesktopIcons, type DesktopItem } from "@/components/ballmac/desktop-icons"

const initial: DesktopItem[] = [
  { id: "disk", name: "Macintosh HD", kind: "drive", col: 0, row: 0 },
  { id: "docs", name: "Documents", kind: "folder", col: 0, row: 1 },
  { id: "photos", name: "Photos", kind: "folder", tone: "purple", col: 0, row: 2 },
  { id: "report", name: "Q3 Report.pdf", kind: "file", ext: "pdf", tone: "red", col: 1, row: 0 },
  { id: "safari", name: "Safari", kind: "app", tone: "blue", glyph: <Compass />, col: 2, row: 1 },
  { id: "mail", name: "Mail", kind: "app", tone: "teal", glyph: <Mail />, col: 3, row: 0 },
]

export default function DesktopIconsDemo() {
  const [opened, setOpened] = React.useState<string | null>(null)
  return (
    <div className="flex w-full max-w-[720px] flex-col gap-3">
      <div className="relative isolate overflow-hidden rounded-2xl border border-foreground/10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 dark:brightness-[0.55]">
          <div className="absolute inset-0 bg-linear-to-br from-chart-1 via-chart-4 to-chart-5" />
          <div className="absolute -inset-x-1/4 top-1/2 h-full rounded-[50%] bg-white/20 blur-2xl" />
        </div>
        <DesktopIcons items={initial} onOpen={(i) => setOpened(i.name)} className="h-[340px] text-white" />
      </div>
      <p className="text-sm text-muted-foreground" role="status">
        {opened ? `Opened ${opened}` : "Drag icons, drag a box to select, double-click to open."}
      </p>
    </div>
  )
}

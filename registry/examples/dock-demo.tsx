"use client"

import * as React from "react"
import {
  Download,
  Flower2,
  Folder,
  Mail,
  MessageCircle,
  Music2,
  SquareTerminal,
  StickyNote,
  Trash2,
} from "lucide-react"

import { Dock, DockItem, DockSeparator } from "@/components/ballmac/dock"

const tile = "text-white [&_svg]:drop-shadow-[0_1px_1px_rgb(0_0_0/0.25)]"

export default function DockDemo() {
  const [running, setRunning] = React.useState(["Files", "Messages", "Music", "Terminal"])
  const launch = (name: string) => setRunning((r) => (r.includes(name) ? r : [...r, name]))
  // Smaller screens get a gentler magnification so the dock stays inside its frame.
  const [compact, setCompact] = React.useState(false)
  React.useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)")
    const update = () => setCompact(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])
  const item = (name: string) => ({ label: name, active: running.includes(name), onClick: () => launch(name) })

  return (
    <div className="relative isolate flex h-[320px] w-full max-w-[640px] items-end justify-center overflow-hidden rounded-2xl border border-foreground/10 px-3 pb-3">
      {/* Wallpaper */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 dark:brightness-[0.6] dark:saturate-[1.2]">
        <div className="absolute inset-0 bg-linear-to-br from-chart-1 via-chart-4 to-chart-5" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_15%_100%,var(--chart-2),transparent_70%),radial-gradient(60%_55%_at_85%_0%,var(--chart-3),transparent_70%)] opacity-70" />
        <div className="absolute -inset-x-1/4 top-[38%] h-[70%] rounded-[50%] bg-white/15 blur-2xl" />
        <div className="absolute -inset-x-1/3 top-[58%] h-[80%] rounded-[50%] bg-white/10 blur-xl" />
      </div>

      <Dock size={42} magnification={compact ? 54 : 74} distance={compact ? 100 : 150} aria-label="Applications">
        <DockItem {...item("Files")} icon={<Folder fill="currentColor" fillOpacity={0.25} />} className={`${tile} bg-linear-to-b from-chart-1/80 to-chart-1`} />
        <DockItem {...item("Mail")} icon={<Mail />} containerClassName="max-[400px]:hidden" className={`${tile} bg-linear-to-b from-chart-1/70 to-chart-1`} />
        <DockItem {...item("Messages")} icon={<MessageCircle fill="currentColor" />} className={`${tile} bg-linear-to-b from-chart-2/80 to-chart-2`} />
        <DockItem {...item("Calendar")} className="@container bg-white text-black/85">
          <span className="relative flex flex-col items-center leading-none">
            <span className="text-[18cqw] font-semibold tracking-wide text-destructive uppercase">Sep</span>
            <span className="-mt-[2cqw] text-[46cqw] font-light tracking-tight tabular-nums">29</span>
          </span>
        </DockItem>
        <DockItem
          {...item("Photos")}
          icon={<Flower2 />}
          containerClassName="max-sm:hidden"
          className={tile}
          style={{ background: "conic-gradient(from 20deg, var(--chart-3), var(--chart-5), var(--chart-4), var(--chart-1), var(--chart-2), var(--chart-3))" }}
        />
        <DockItem {...item("Music")} icon={<Music2 />} containerClassName="max-sm:hidden" className={`${tile} bg-linear-to-b from-chart-5 to-chart-4`} />
        <DockItem {...item("Notes")} icon={<StickyNote />} className={`${tile} bg-linear-to-b from-chart-3/80 to-chart-3`} />
        <DockItem {...item("Terminal")} icon={<SquareTerminal />} containerClassName="max-sm:hidden" className={`${tile} bg-black/85`} />
        <DockSeparator />
        <DockItem label="Downloads" icon={<Download />} bounce={false} containerClassName="max-sm:hidden" className="bg-white/30 text-foreground/80 dark:bg-white/10" />
        <DockItem label="Trash" icon={<Trash2 />} bounce={false} className="bg-white/30 text-foreground/80 dark:bg-white/10" />
      </Dock>
    </div>
  )
}

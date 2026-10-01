"use client"

import * as React from "react"

import { WindowManager, type ManagedWindow } from "@/components/ballmac/window-manager"

const initial: ManagedWindow[] = [
  {
    id: "notes",
    title: "Notes",
    x: 24,
    y: 24,
    width: 300,
    height: 220,
    content: (
      <div className="p-4 text-sm">
        <h3 className="font-semibold">Ideas</h3>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
          <li>Ship the window manager</li>
          <li>Drag me by the title bar</li>
          <li>Resize from any edge</li>
        </ul>
      </div>
    ),
  },
  {
    id: "terminal",
    title: "Terminal",
    x: 180,
    y: 80,
    width: 320,
    height: 200,
    content: (
      <pre className="h-full bg-neutral-950 p-3 font-mono text-xs leading-5 text-emerald-300">{"$ pnpm build\n✓ compiled in 2.1s\n$ _"}</pre>
    ),
  },
  {
    id: "about",
    title: "About",
    x: 340,
    y: 20,
    width: 240,
    height: 170,
    content: <p className="p-4 text-sm text-muted-foreground">Double-click a title bar to zoom. Yellow light minimizes into the tray.</p>,
  },
]

export default function WindowManagerDemo() {
  const [windows, setWindows] = React.useState(initial)
  return (
    <div className="relative isolate w-full max-w-[720px] overflow-hidden rounded-2xl border border-foreground/10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 dark:brightness-[0.55]">
        <div className="absolute inset-0 bg-linear-to-br from-chart-4 via-chart-1 to-chart-2" />
        <div className="absolute -inset-x-1/4 top-1/2 h-full rounded-[50%] bg-white/20 blur-2xl" />
      </div>
      <WindowManager windows={windows} onClose={(id) => setWindows((w) => w.filter((x) => x.id !== id))} className="h-[380px]" />
    </div>
  )
}

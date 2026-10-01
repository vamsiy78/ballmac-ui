"use client"

import * as React from "react"

import { WindowManager, type ManagedWindow } from "@/components/ballmac/window-manager"

export default function WindowManagerControlled() {
  const [count, setCount] = React.useState(1)
  const [windows, setWindows] = React.useState<ManagedWindow[]>([
    { id: "w1", title: "Window 1", content: <p className="p-4 text-sm text-muted-foreground">Hello from window 1.</p> },
  ])

  function add() {
    const n = count + 1
    setCount(n)
    setWindows((w) => [...w, { id: `w${n}`, title: `Window ${n}`, content: <p className="p-4 text-sm text-muted-foreground">Hello from window {n}.</p> }])
  }

  return (
    <div className="flex w-full max-w-[720px] flex-col gap-3">
      <button
        type="button"
        onClick={add}
        className="inline-flex h-9 w-fit items-center rounded-md border bg-background px-3 text-sm font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        Open new window
      </button>
      <div className="relative isolate overflow-hidden rounded-2xl border border-foreground/10">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-b from-chart-2 to-chart-3 dark:brightness-[0.55]" />
        <WindowManager windows={windows} onClose={(id) => setWindows((w) => w.filter((x) => x.id !== id))} className="h-[320px]" />
      </div>
    </div>
  )
}

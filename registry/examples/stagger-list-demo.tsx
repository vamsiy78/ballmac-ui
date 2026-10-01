"use client"

import * as React from "react"

import { StaggerItem, StaggerList } from "@/components/ballmac/stagger-list"

const all = [
  { id: 1, name: "Button", tag: "Primitives" },
  { id: 2, name: "Dialog", tag: "Overlays" },
  { id: 3, name: "Data table", tag: "Data" },
  { id: 4, name: "Tabs", tag: "Navigation" },
  { id: 5, name: "Command menu", tag: "Overlays" },
  { id: 6, name: "Calendar", tag: "Data" },
]
const tags = ["All", "Primitives", "Overlays", "Data", "Navigation"]

export default function StaggerListDemo() {
  const [tag, setTag] = React.useState("All")
  const shown = all.filter((x) => tag === "All" || x.tag === tag)
  return (
    <div className="grid w-full max-w-md gap-3">
      <div role="group" aria-label="Filter components" className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={tag === t}
            onClick={() => setTag(t)}
            className="h-8 rounded-full border px-3 text-[13px] font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:border-transparent aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          >
            {t}
          </button>
        ))}
      </div>
      <StaggerList inView={false} className="grid grid-cols-2 gap-2" aria-label="Components">
        {shown.map((x) => (
          <StaggerItem key={x.id} className="rounded-xl border bg-card p-3.5">
            <p className="text-sm font-medium text-foreground">{x.name}</p>
            <p className="text-xs text-muted-foreground">{x.tag}</p>
          </StaggerItem>
        ))}
      </StaggerList>
    </div>
  )
}

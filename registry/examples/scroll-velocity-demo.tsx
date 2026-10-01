"use client"

import * as React from "react"

import { ScrollVelocity } from "@/components/ballmac/scroll-velocity"

export default function ScrollVelocityDemo() {
  const scroller = React.useRef<HTMLDivElement>(null)
  return (
    <div className="relative h-80 w-full max-w-2xl overflow-hidden rounded-2xl border bg-card">
      <div ref={scroller} className="h-full overflow-y-auto" tabIndex={0} role="region" aria-label="Scroll here to speed up the rows">
        <div className="h-[200%]">
          <div className="sticky top-0 grid h-80 content-center gap-2">
            <ScrollVelocity scrollContainer={scroller} baseVelocity={40} direction="left" className="text-5xl font-semibold tracking-tight text-foreground">
              <span>Design</span>
              <span aria-hidden="true" className="text-muted-foreground">✦</span>
              <span>Build</span>
              <span aria-hidden="true" className="text-muted-foreground">✦</span>
            </ScrollVelocity>
            <ScrollVelocity scrollContainer={scroller} baseVelocity={40} direction="right" className="text-5xl font-semibold tracking-tight text-muted-foreground">
              <span>Ship</span>
              <span aria-hidden="true">✦</span>
              <span>Repeat</span>
              <span aria-hidden="true">✦</span>
            </ScrollVelocity>
            <p className="mt-3 text-center text-xs text-muted-foreground">Scroll inside this box</p>
          </div>
        </div>
      </div>
    </div>
  )
}

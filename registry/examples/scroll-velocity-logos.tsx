"use client"

import * as React from "react"

import { ScrollVelocity } from "@/components/ballmac/scroll-velocity"

const names = ["Northwind", "Acme", "Globex", "Initech", "Umbrella", "Hooli", "Stark", "Wayne"]

export default function ScrollVelocityLogos() {
  const scroller = React.useRef<HTMLDivElement>(null)
  return (
    <div className="relative h-56 w-full max-w-2xl overflow-hidden rounded-2xl border bg-card">
      <div ref={scroller} className="h-full overflow-y-auto" tabIndex={0} role="region" aria-label="Scroll here to speed up the logos">
        <div className="h-[220%]">
          <div className="sticky top-0 grid h-56 content-center">
            <ScrollVelocity scrollContainer={scroller} baseVelocity={55} gap="3rem" sensitivity={1.4}>
              {names.map((n) => (
                <span key={n} className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                  <span aria-hidden="true" className="size-6 rounded-md bg-muted" />
                  {n}
                </span>
              ))}
            </ScrollVelocity>
          </div>
        </div>
      </div>
    </div>
  )
}

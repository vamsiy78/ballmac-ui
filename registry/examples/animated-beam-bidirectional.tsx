"use client"

import * as React from "react"
import { Cloud, Laptop } from "lucide-react"

import { AnimatedBeam } from "@/components/ballmac/animated-beam"

export default function AnimatedBeamBidirectional() {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const laptopRef = React.useRef<HTMLDivElement>(null)
  const cloudRef = React.useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="relative flex w-full max-w-md items-center justify-between px-4 py-10">
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div
          ref={laptopRef}
          className="flex size-14 items-center justify-center rounded-2xl border bg-card shadow-sm"
        >
          <Laptop className="size-6" aria-hidden="true" />
        </div>
        <span className="text-xs text-muted-foreground">This Mac</span>
      </div>
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div
          ref={cloudRef}
          className="flex size-14 items-center justify-center rounded-2xl border bg-card shadow-sm"
        >
          <Cloud className="size-6" aria-hidden="true" />
        </div>
        <span className="text-xs text-muted-foreground">Cloud</span>
      </div>
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={laptopRef}
        toRef={cloudRef}
        curvature={36}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={laptopRef}
        toRef={cloudRef}
        curvature={-36}
        reverse
        delay={1.6}
        gradientStartColor="var(--chart-2)"
        gradientStopColor="var(--chart-1)"
      />
    </div>
  )
}

"use client"

import * as React from "react"

import { MacWindow, MacWindowContent, MacWindowTitleBar } from "@/components/ballmac/mac-window"

export default function MacWindowStack() {
  const [front, setFront] = React.useState<"terminal" | "about">("about")

  return (
    <div className="relative h-[340px] w-full max-w-[560px]">
      <MacWindow
        active={front === "terminal"}
        onPointerDown={() => setFront("terminal")}
        onClose={() => {}}
        onMinimize={() => {}}
        onZoom={() => {}}
        className={`absolute top-0 start-0 h-[250px] w-[88%] sm:w-[440px] ${front === "terminal" ? "z-10" : "z-0"}`}
      >
        <MacWindowTitleBar title="acme — zsh — 80×24" />
        <MacWindowContent className="bg-card p-3 font-mono text-xs leading-relaxed text-foreground/80">
          <p>
            <span className="text-[color-mix(in_oklch,var(--chart-2),black_42%)] dark:text-chart-2">~/acme</span> <span className="text-muted-foreground">on</span> <span className="text-[color-mix(in_oklch,var(--chart-4),black_42%)] dark:text-chart-4">main</span> ❯ pnpm release
          </p>
          <p className="text-muted-foreground">▸ Building universal binary…</p>
          <p className="text-muted-foreground">▸ Signing with Developer ID…</p>
          <p>
            <span className="text-[color-mix(in_oklch,var(--chart-2),black_42%)] dark:text-chart-2">✓</span> Notarized in 48s
          </p>
          <p>
            <span className="text-[color-mix(in_oklch,var(--chart-2),black_42%)] dark:text-chart-2">✓</span> Acme-2.4.0.dmg uploaded
          </p>
          <p>
            <span className="text-[color-mix(in_oklch,var(--chart-2),black_42%)] dark:text-chart-2">~/acme</span> ❯ <span className="inline-block h-3.5 w-1.5 translate-y-0.5 bg-foreground/60" />
          </p>
        </MacWindowContent>
      </MacWindow>

      <MacWindow
        active={front === "about"}
        onPointerDown={() => setFront("about")}
        onClose={() => {}}
        className={`absolute end-0 bottom-0 w-[260px] ${front === "about" ? "z-10" : "z-0"}`}
      >
        <MacWindowTitleBar className="border-b-0" />
        <MacWindowContent className="flex flex-col items-center px-6 pt-2 pb-6 text-center">
          <span className="flex size-16 items-center justify-center rounded-[22%] bg-linear-to-b from-chart-1/80 to-chart-1 text-2xl font-bold text-white shadow-[0_6px_16px_-6px_rgb(0_0_0/0.4)]">
            A
          </span>
          <p className="mt-3 text-base font-semibold">Acme</p>
          <p className="text-xs text-muted-foreground">Version 2.4.0 (2408)</p>
          <p className="mt-3 text-[11px] text-muted-foreground">Copyright © 2026 Acme Inc.</p>
        </MacWindowContent>
      </MacWindow>
    </div>
  )
}

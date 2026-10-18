"use client"

import * as React from "react"
import { ArrowRight, Moon, Sun } from "lucide-react"
import { getFontFace, matchPersonality, FEELS, SYSTEMS, type PresetSystem } from "@ballmac-ui/theme-engine"

import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import Link from "@/components/site/link"
import { CopyButton } from "@/components/site/copy-button"

import { SystemPreview } from "./system-preview"
import type { Mode } from "./theme-style"

const subscribeNever = () => () => {}

/** What a system is made of, in words: typeface, platform feel and motion. */
export function systemFacts(s: PresetSystem) {
  const font = getFontFace(s.spec.font)?.label ?? (s.spec.font === "system" ? "System font" : s.spec.font === "keep" ? "Your font" : s.spec.font)
  const feel = FEELS.find((f) => f.slug === s.spec.feel)?.title ?? s.spec.feel
  const motion = matchPersonality(s.spec)?.title ?? "Custom"
  return [font, `${feel} feel`, `${motion} motion`]
}

export const presetCommand = (slug: string) => `npx shadcn@latest add @ballmac/preset-${slug}`

export function SystemCard({ system, mode }: { system: PresetSystem; mode: Mode }) {
  const command = presetCommand(system.slug)
  return (
    <article aria-labelledby={`sys-${system.slug}`} className="bg-card flex min-w-0 flex-col overflow-hidden rounded-2xl border shadow-xs">
      <div className="bg-muted/40 p-3 sm:p-4">
        {/* a picture of the system: inert, so its controls are not 75 tab stops down the page */}
        <div inert className="overflow-hidden rounded-xl border shadow-sm">
          <SystemPreview spec={system.spec} mode={mode} id={system.slug} />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
        <div>
          <h2 id={`sys-${system.slug}`} className="text-lg font-semibold tracking-tight">
            {system.title}
          </h2>
          <p className="text-muted-foreground text-sm">{system.tagline}</p>
        </div>
        <ul className="flex flex-wrap gap-1.5" aria-label={`${system.title} is made of`}>
          {systemFacts(system).map((f) => (
            <li key={f} className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs">
              {f}
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground text-sm leading-relaxed">{system.description}</p>
        <div className="mt-auto grid min-w-0 grid-cols-1 gap-3 pt-1">
          <div className="bg-muted/60 flex min-w-0 items-center justify-between gap-2 rounded-lg border ps-3 pe-1">
            <code className="min-w-0 flex-1 py-2 font-mono text-[12.5px] leading-5" dir="ltr">
              <span className="text-muted-foreground block">npx shadcn@latest add</span>
              <span className="block truncate">@ballmac/preset-{system.slug}</span>
            </code>
            <CopyButton value={command} label={`Copy the install command for ${system.title}`} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground font-mono text-xs" dir="ltr">
              {system.code}
            </span>
            <Link href={`/presets/${system.slug}`} className="focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-md font-medium outline-none hover:underline focus-visible:ring-[3px]">
              Customise <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

/** All the systems, with one switch for light and dark. */
export function SystemGallery() {
  // Starts on the site's own colour scheme; read through a store so the server HTML is the same for everyone.
  const siteDark = React.useSyncExternalStore(subscribeNever, () => document.documentElement.classList.contains("dark"), () => false)
  const [picked, setPicked] = React.useState<Mode | null>(null)
  const mode: Mode = picked ?? (siteDark ? "dark" : "light")
  const setMode = setPicked
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">{SYSTEMS.length} design systems. Each is checked for contrast in light and dark.</p>
        <SegmentedControl aria-label="Preview mode" value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <SegmentedControlItem value="light" aria-label="Light">
            <Sun className="size-3.5" aria-hidden="true" /> Light
          </SegmentedControlItem>
          <SegmentedControlItem value="dark" aria-label="Dark">
            <Moon className="size-3.5" aria-hidden="true" /> Dark
          </SegmentedControlItem>
        </SegmentedControl>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {SYSTEMS.map((s) => (
          <SystemCard key={s.slug} system={s} mode={mode} />
        ))}
      </div>
    </div>
  )
}

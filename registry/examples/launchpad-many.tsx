"use client"

import * as React from "react"

import { AppIcon, type IconTone } from "@/components/ballmac/mac-icons"
import { Launchpad, type LaunchpadApp } from "@/components/ballmac/launchpad"

const tones: IconTone[] = ["blue", "teal", "green", "amber", "orange", "red", "purple", "graphite"]
const names = ["Atlas", "Beacon", "Canvas", "Drift", "Ember", "Fable", "Glide", "Harbor", "Ivy", "Jolt", "Kite", "Lumen", "Mosaic", "Nova", "Orbit", "Pulse", "Quill", "Relay", "Sketch", "Tide", "Unity", "Vale", "Wave", "Xenon", "Yarn", "Zephyr", "Alder", "Birch", "Cedar", "Dune", "Elm", "Fern", "Grove", "Hazel", "Iris", "Juniper"]

const apps: LaunchpadApp[] = names.map((name, i) => ({
  id: name.toLowerCase(),
  name,
  icon: <AppIcon size={60} tone={tones[i % tones.length]}>{name[0]}</AppIcon>,
}))

export default function LaunchpadMany() {
  const [open, setOpen] = React.useState(true)
  return (
    <div className="relative isolate h-[400px] w-full max-w-[720px] overflow-hidden rounded-2xl border border-foreground/10">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-br from-chart-1 to-chart-2 dark:brightness-[0.55]" />
      {!open && (
        <div className="flex h-full items-center justify-center">
          <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-white/25 px-4 py-2 text-sm font-medium text-white outline-none focus-visible:ring-[3px] focus-visible:ring-white/70">
            Reopen Launchpad
          </button>
        </div>
      )}
      <Launchpad apps={apps} open={open} onClose={() => setOpen(false)} onLaunch={() => setOpen(false)} />
    </div>
  )
}

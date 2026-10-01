"use client"

import * as React from "react"
import { Calculator, Calendar, Camera, Compass, Film, Mail, Map, MessageCircle, Music, Notebook, Settings, Terminal } from "lucide-react"

import { AppIcon, type IconTone } from "@/components/ballmac/mac-icons"
import { Launchpad, type LaunchpadApp } from "@/components/ballmac/launchpad"

const spec: [string, IconTone, React.ReactNode][] = [
  ["Safari", "blue", <Compass key="a" />],
  ["Mail", "teal", <Mail key="b" />],
  ["Messages", "green", <MessageCircle key="c" />],
  ["Maps", "green", <Map key="d" />],
  ["Photos", "orange", <Camera key="e" />],
  ["Calendar", "red", <Calendar key="f" />],
  ["Music", "red", <Music key="g" />],
  ["TV", "graphite", <Film key="h" />],
  ["Notes", "amber", <Notebook key="i" />],
  ["Terminal", "graphite", <Terminal key="j" />],
  ["Calculator", "graphite", <Calculator key="k" />],
  ["Settings", "graphite", <Settings key="l" />],
]

const apps: LaunchpadApp[] = spec.map(([name, tone, glyph]) => ({
  id: name.toLowerCase(),
  name,
  icon: <AppIcon size={64} tone={tone}>{glyph}</AppIcon>,
}))

export default function LaunchpadDemo() {
  const [open, setOpen] = React.useState(false)
  const [launched, setLaunched] = React.useState<string | null>(null)
  return (
    <div className="relative isolate h-[420px] w-full max-w-[720px] overflow-hidden rounded-2xl border border-foreground/10">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-br from-chart-3 via-chart-5 to-chart-4 dark:brightness-[0.55]" />
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-white">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-9 items-center rounded-full bg-white/25 px-4 text-sm font-medium backdrop-blur outline-none hover:bg-white/35 focus-visible:ring-[3px] focus-visible:ring-white/70"
        >
          Open Launchpad
        </button>
        <p className="text-sm" role="status">{launched ? `Launched ${launched}` : "Pick an app to launch it."}</p>
      </div>
      <Launchpad
        apps={apps}
        open={open}
        onClose={() => setOpen(false)}
        onLaunch={(a) => {
          setLaunched(a.name)
          setOpen(false)
        }}
      />
    </div>
  )
}

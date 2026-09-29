"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { BatteryFull, Check, Command, Rocket, Timer, UploadCloud, Wifi } from "lucide-react"

import { DynamicIsland, DynamicIslandView } from "@/components/ballmac/dynamic-island"
import { cn } from "@/lib/utils"

const views = [
  { value: "idle", label: "Idle" },
  { value: "thinking", label: "Thinking" },
  { value: "timer", label: "Timer" },
  { value: "upload", label: "Upload" },
  { value: "deploy", label: "Notification" },
] as const

type View = (typeof views)[number]["value"]

function Waveform() {
  return (
    <span aria-hidden="true" className="flex h-4 items-center gap-[3px]">
      {[0.5, 0.9, 0.65, 1, 0.55].map((peak, i) => (
        <motion.span
          key={i}
          className="h-full w-[3px] origin-center rounded-full bg-linear-to-b from-chart-1 to-chart-4"
          initial={{ scaleY: 0.35 }}
          animate={{ scaleY: [0.3, peak, 0.3] }}
          transition={{ duration: 0.9 + i * 0.13, repeat: Infinity, ease: "easeInOut", delay: i * 0.08 }}
        />
      ))}
    </span>
  )
}

function Timecode({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60)
  const s = String(seconds % 60).padStart(2, "0")
  return (
    <span className="font-medium tabular-nums text-chart-3">
      {m}:{s}
    </span>
  )
}

export default function DynamicIslandDemo() {
  const [view, setView] = React.useState<View>("idle")
  const [auto, setAuto] = React.useState(true)
  const [seconds, setSeconds] = React.useState(272)
  const reduceMotion = useReducedMotion()

  React.useEffect(() => {
    if (!auto || reduceMotion) return
    const id = window.setTimeout(() => {
      setView((v) => views[(views.findIndex((x) => x.value === v) + 1) % views.length].value)
    }, view === "idle" ? 1600 : 3200)
    return () => window.clearTimeout(id)
  }, [auto, view, reduceMotion])

  React.useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 300)), 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="flex w-full max-w-[640px] flex-col items-center gap-5">
      {/* A MacBook screen, cropped to the top edge. */}
      <div className="relative w-full rounded-t-[26px] bg-black p-[7px] pb-0 shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_30px_60px_-30px_rgb(0_0_0/0.5)] [mask-image:linear-gradient(to_bottom,black_75%,transparent)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.12)]">
        <div className="relative h-[220px] overflow-hidden rounded-t-[19px] sm:h-[240px]">
          <div aria-hidden="true" className="absolute inset-0 dark:brightness-[0.6]">
            <div className="absolute inset-0 bg-linear-to-br from-chart-1 via-chart-4 to-chart-5" />
            <div className="absolute -inset-x-1/4 top-[45%] h-full rounded-[50%] bg-white/15 blur-2xl" />
          </div>

          {/* Menu bar, split by the notch. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 flex h-7 items-center justify-between bg-white/30 px-3 text-[12px] font-medium text-black/80 backdrop-blur-xl dark:bg-black/25 dark:text-white/90"
          >
            <div className="flex items-center gap-3.5">
              <Command className="size-3.5" />
              <span className="font-bold">Acme</span>
              <span className="max-sm:hidden">File</span>
              <span className="max-sm:hidden">Edit</span>
              <span className="max-md:hidden">View</span>
            </div>
            <div className="flex items-center gap-3">
              <Wifi className="size-3.5 max-sm:hidden" />
              <BatteryFull className="size-4" />
              <span className="tabular-nums">
                <span className="max-md:hidden">Tue Sep 29 </span>9:41
              </span>
            </div>
          </div>

          <DynamicIsland view={view} shape="notch" className="absolute inset-x-0 top-0 z-10">
            <DynamicIslandView value="idle" radius={10} className="h-7 w-[120px] justify-center sm:w-[150px]">
              <span aria-hidden="true" className="size-2 rounded-full bg-white/[0.07] ring-1 ring-white/10" />
            </DynamicIslandView>

            <DynamicIslandView value="thinking" radius={14} label="Assistant is thinking" className="h-8 w-[250px] justify-between gap-3 px-3 sm:w-[310px]">
              <span className="flex items-center gap-2">
                <motion.span
                  aria-hidden="true"
                  className="size-4 rounded-full blur-[1px]"
                  style={{ background: "conic-gradient(from 0deg, var(--chart-1), var(--chart-4), var(--chart-5), var(--chart-2), var(--chart-1))" }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                />
                <motion.span
                  className="bg-[linear-gradient(90deg,rgb(255_255_255/0.5)_0%,rgb(255_255_255/0.5)_35%,white_50%,rgb(255_255_255/0.5)_65%,rgb(255_255_255/0.5)_100%)] bg-size-[200%_100%] bg-clip-text text-[13px] font-medium text-transparent"
                  initial={{ backgroundPosition: "100% 0" }}
                  animate={reduceMotion ? undefined : { backgroundPosition: ["100% 0", "-100% 0"] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                >
                  Thinking…
                </motion.span>
              </span>
              <Waveform />
            </DynamicIslandView>

            <DynamicIslandView value="timer" radius={12} label="Focus timer running" className="h-7 w-[230px] justify-between px-3 text-[13px] sm:w-[280px]">
              <span className="flex items-center gap-1.5 text-chart-3">
                <Timer className="size-4" aria-hidden="true" />
                <span className="font-medium max-sm:sr-only">Focus</span>
              </span>
              <Timecode seconds={seconds} />
            </DynamicIslandView>

            <DynamicIslandView value="upload" radius={24} label="Uploading 5 files" className="w-[300px] flex-col items-stretch gap-3 px-4 pt-9 pb-4 sm:w-[360px]">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-linear-to-b from-chart-1/80 to-chart-1">
                  <UploadCloud className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold">Uploading to Acme Drive</span>
                  <span className="block truncate text-xs text-white/55">3 of 5 files · 1.2 GB left</span>
                </span>
                <span className="text-xs font-medium tabular-nums text-white/70">68%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                <motion.div
                  className="h-full origin-left rounded-full bg-linear-to-r from-chart-1 to-chart-2"
                  initial={{ scaleX: 0.2 }}
                  animate={{ scaleX: 0.68 }}
                  transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </DynamicIslandView>

            <DynamicIslandView value="deploy" radius={24} label="Deploy succeeded: acme-web is live" className="w-[300px] gap-3 px-3.5 pt-9 pb-3.5 sm:w-[360px]">
              <span className="relative flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-linear-to-b from-chart-2/80 to-chart-2">
                <Rocket className="size-5" aria-hidden="true" />
                <span className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full bg-white text-black ring-2 ring-black">
                  <Check className="size-2.5" strokeWidth={3} aria-hidden="true" />
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold">Deploy succeeded</span>
                <span className="block truncate text-xs text-white/55">acme-web is live · 42s</span>
              </span>
              <button
                type="button"
                className="h-7 shrink-0 rounded-full bg-white/15 px-3 text-xs font-medium outline-none transition-colors hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/60"
              >
                Open
              </button>
            </DynamicIslandView>
          </DynamicIsland>
        </div>
      </div>

      <div role="group" aria-label="Island state" className="flex flex-wrap justify-center gap-1.5">
        {views.map((v) => (
          <button
            key={v.value}
            type="button"
            aria-pressed={view === v.value}
            onClick={() => {
              setAuto(false)
              setView(v.value)
            }}
            className={cn(
              "h-7 rounded-full border px-3 text-xs font-medium outline-none transition-[color,background-color,border-color] duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50",
              view === v.value ? "border-transparent bg-foreground text-background" : "bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  )
}

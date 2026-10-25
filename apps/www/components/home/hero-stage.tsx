"use client"

import { Check, Copy } from "lucide-react"
import * as React from "react"

import { LiveScreen, type LiveScreenId } from "@/components/home/live-screen"
import { useReducedMotionSafe } from "@/lib/ballmac/motion"
import { cn } from "@/lib/utils"

export type StageScreen = { id: LiveScreenId; name: string; poster: React.ReactNode }

/**
 * One product, in one frame. The tabs along the top choose which real screen is shown; the bar along the bottom is the command that installs it, typed out
 * when the screen changes. It moves on by itself every few seconds until someone chooses a screen or points at it, and holds still with reduced motion.
 */
export function HeroStage({ screens, className }: { screens: StageScreen[]; className?: string }) {
  const id = React.useId()
  const reduced = useReducedMotionSafe()
  const [index, setIndex] = React.useState(0)
  const [typed, setTyped] = React.useState(() => `npx shadcn@latest add @ballmac/${screens[0]?.id ?? ""}`.length)
  const [added, setAdded] = React.useState(true)
  const [auto, setAuto] = React.useState(true)
  const [hover, setHover] = React.useState(false)
  const [visible, setVisible] = React.useState(true)
  const [copied, setCopied] = React.useState(false)
  const root = React.useRef<HTMLDivElement>(null)
  const tabs = React.useRef<(HTMLButtonElement | null)[]>([])
  const screen = screens[index] ?? screens[0]
  const command = `npx shadcn@latest add @ballmac/${screen?.id ?? ""}`

  React.useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Type the command whenever the screen changes. With reduced motion it is simply there.
  React.useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    let type: ReturnType<typeof setInterval> | undefined
    timers.push(
      setTimeout(() => {
        if (reduced) {
          setTyped(command.length)
          setAdded(true)
          return
        }
        setAdded(false)
        setTyped(0)
        let n = 0
        type = setInterval(() => {
          n += 2
          setTyped(Math.min(n, command.length))
          if (n >= command.length) {
            clearInterval(type)
            timers.push(setTimeout(() => setAdded(true), 250))
          }
        }, 24)
      }, 0)
    )
    return () => {
      timers.forEach(clearTimeout)
      if (type) clearInterval(type)
    }
  }, [index, command, reduced])

  // Move on while nobody is choosing or pointing, and the frame is on screen.
  React.useEffect(() => {
    if (reduced || !auto || hover || !visible || !added) return
    const t = setTimeout(() => setIndex((i) => (i + 1) % screens.length), 7000)
    return () => clearTimeout(t)
  }, [reduced, auto, hover, visible, added, index, screens.length])

  if (!screen) return null

  function choose(i: number) {
    setAuto(false)
    setIndex(i)
  }
  function onKey(e: React.KeyboardEvent, i: number) {
    const n = e.key === "ArrowRight" ? (i + 1) % screens.length : e.key === "ArrowLeft" ? (i + screens.length - 1) % screens.length : e.key === "Home" ? 0 : e.key === "End" ? screens.length - 1 : -1
    if (n < 0) return
    e.preventDefault()
    choose(n)
    tabs.current[n]?.focus()
  }

  return (
    <div ref={root} className={cn("w-full", className)} onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b10] shadow-[0_40px_100px_-40px_rgb(0_0_0/0.9)] ring-1 ring-white/[0.03]">
        <div className="flex items-center gap-4 border-b border-white/10 bg-white/[0.03] px-4">
          <span className="flex shrink-0 gap-1.5 max-sm:hidden" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
          </span>
          <div role="tablist" aria-label="Screens you can install" className="flex min-w-0 flex-1 gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {screens.map((s, i) => (
              <button
                key={s.id}
                ref={(el) => {
                  tabs.current[i] = el
                }}
                role="tab"
                type="button"
                id={`${id}-tab-${s.id}`}
                aria-selected={index === i}
                aria-controls={`${id}-panel`}
                tabIndex={index === i ? 0 : -1}
                onClick={() => choose(i)}
                onKeyDown={(e) => onKey(e, i)}
                className={cn("focus-visible:ring-ring/70 shrink-0 rounded-md px-3 py-1.5 text-[13px] font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", index === i ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/[0.06] hover:text-white")}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${screen.id}`}>
          <LiveScreen key={screen.id} id={screen.id} poster={screen.poster} theme="dark" className="animate-in fade-in duration-500 motion-reduce:animate-none" />
        </div>

        <div className="flex items-center gap-3 border-t border-white/10 bg-white/[0.03] py-2 ps-4 pe-2 font-mono text-[13px]">
          <p dir="ltr" className="min-w-0 flex-1 truncate text-white/90" aria-label={command}>
            <span className="text-white/55">$ </span>
            <span aria-hidden="true">{command.slice(0, typed)}</span>
          </p>
          <span aria-hidden="true" className={cn("hidden shrink-0 items-center gap-1.5 font-sans text-xs text-emerald-300 transition-opacity sm:flex motion-reduce:transition-none", added ? "opacity-100" : "opacity-0")}>
            <Check className="size-3.5" /> Added to your project
          </span>
          <button
            type="button"
            aria-label="Copy the install command"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(command)
                setCopied(true)
                setTimeout(() => setCopied(false), 1500)
              } catch {}
            }}
            className="focus-visible:ring-ring/70 flex size-8 shrink-0 items-center justify-center rounded-md text-white/65 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-[3px] motion-reduce:transition-none"
          >
            {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
          </button>
        </div>
      </div>
      <p aria-live="polite" className="sr-only">{copied ? "Copied" : ""}</p>
    </div>
  )
}

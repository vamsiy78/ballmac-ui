"use client"

import { Check, Copy } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { useReducedMotionSafe } from "@/lib/ballmac/motion"

// Each demo is the real example from the library, drawn at its own size so the text stays readable. They load one at a time, when chosen.
const Demos = {
  "cited-answer": React.lazy(() => import("@/registry/examples/cited-answer-demo")),
  "tool-call-card": React.lazy(() =>
    Promise.all([import("@/registry/examples/thinking-loader-demo"), import("@/registry/examples/tool-call-card-demo")]).then(([a, b]) => ({
      default: () => (
        <div className="grid w-full max-w-xl gap-5">
          <a.default />
          <b.default />
        </div>
      ),
    }))
  ),
  "review-center": React.lazy(() => import("@/registry/examples/review-center-demo")),
  "eval-scorecard": React.lazy(() => import("@/registry/examples/eval-scorecard-demo")),
  "autonomy-dial": React.lazy(() => import("@/registry/examples/autonomy-dial-demo")),
} as const

const SCREENS = [
  { id: "cited-answer", name: "Answers" },
  { id: "tool-call-card", name: "Tool calls" },
  { id: "review-center", name: "Review" },
  { id: "eval-scorecard", name: "Evals" },
  { id: "autonomy-dial", name: "Autonomy" },
] as const satisfies readonly { id: keyof typeof Demos; name: string }[]

/**
 * One product, in one frame, at a size you can read. The tabs choose a real AI component from the library; the bar underneath is the command that installs it, typed
 * out when the choice changes. The component is live: hover the numbers, drag the dial, open a row. It moves on by itself until someone chooses or points at it, and
 * holds still with reduced motion.
 */
export function HeroStage({ className }: { className?: string }) {
  const id = React.useId()
  const reduced = useReducedMotionSafe()
  const [index, setIndex] = React.useState(0)
  const [typed, setTyped] = React.useState(() => `npx shadcn@latest add @ballmac/${SCREENS[0].id}`.length)
  const [added, setAdded] = React.useState(true)
  const [auto, setAuto] = React.useState(true)
  const [hover, setHover] = React.useState(false)
  const [visible, setVisible] = React.useState(true)
  const [copied, setCopied] = React.useState(false)
  const root = React.useRef<HTMLDivElement>(null)
  const tabs = React.useRef<(HTMLButtonElement | null)[]>([])
  const screen = SCREENS[index]
  const Demo = Demos[screen.id]
  const command = `npx shadcn@latest add @ballmac/${screen.id}`

  React.useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Type the command whenever the choice changes. With reduced motion it is simply there.
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

  // Move on while nobody is choosing or pointing, and the frame is on screen. A little longer than the other screens need, so each can be read.
  React.useEffect(() => {
    if (reduced || !auto || hover || !visible || !added) return
    const t = setTimeout(() => setIndex((i) => (i + 1) % SCREENS.length), 9000)
    return () => clearTimeout(t)
  }, [reduced, auto, hover, visible, added, index])

  function choose(i: number) {
    setAuto(false)
    setIndex(i)
  }
  function onKey(e: React.KeyboardEvent, i: number) {
    const n = e.key === "ArrowRight" ? (i + 1) % SCREENS.length : e.key === "ArrowLeft" ? (i + SCREENS.length - 1) % SCREENS.length : e.key === "Home" ? 0 : e.key === "End" ? SCREENS.length - 1 : -1
    if (n < 0) return
    e.preventDefault()
    choose(n)
    tabs.current[n]?.focus()
  }

  return (
    <div ref={root} className={cn("w-full min-w-0", className)} onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b10] shadow-[0_40px_100px_-40px_rgb(0_0_0/0.9)] ring-1 ring-white/[0.03]">
        <div className="flex items-center gap-4 border-b border-white/10 bg-white/[0.03] px-4">
          <span className="flex shrink-0 gap-1.5 max-sm:hidden" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
          </span>
          <div role="tablist" aria-label="AI components you can install" className="flex min-w-0 flex-1 gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SCREENS.map((s, i) => (
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

        <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${screen.id}`} className="relative flex h-[27rem] flex-col overflow-hidden sm:h-[29rem]">
          <div key={screen.id} className="animate-in fade-in my-auto flex justify-center p-4 duration-500 sm:p-6 motion-reduce:animate-none">
            <React.Suspense fallback={<div aria-hidden="true" className="h-64 w-full max-w-3xl animate-pulse rounded-2xl bg-white/[0.04] motion-reduce:animate-none" />}>
              <Demo />
            </React.Suspense>
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#0b0b10] to-transparent" />
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

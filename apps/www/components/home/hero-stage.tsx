"use client"

import { Check, Command, Loader2, Moon, MousePointerClick, Pause, Play, ShieldCheck, X } from "lucide-react"
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react"
import * as React from "react"

import Link from "@/components/site/link"
import { cn } from "@/lib/utils"

/** Real Pro screens, captured from their own preview pages at 2x in dark mode (public/home/screens). */
const SCREENS = [
  { name: "dashboard-pro-1", label: "Dashboard", alt: "A revenue dashboard with four KPI tiles, a revenue chart against the previous period and a quarterly goal ring." },
  { name: "agent-16", label: "AI assistant", alt: "An AI answer where every sentence cites a numbered source, beside the memory the assistant keeps about the user." },
  { name: "kanban-pro-1", label: "Kanban", alt: "A sprint board with swimlanes per person, a work-in-progress limit and a Move menu on every card." },
  { name: "billing-pro-1", label: "Billing", alt: "A billing page with the current plan, seat and usage meters close to their limits, and the payment method." },
  { name: "mail-pro-1", label: "Mail", alt: "A mail client with an inbox list and an open message." },
  { name: "calendar-pro-1", label: "Calendar", alt: "A calendar with a week of events." },
] as const

const STEP_MS = 4800
/** The width the live frame is laid out at, then scaled to fit the window, so the block shows its desktop layout. */
const FRAME_W = 1280

/**
 * The home hero's product stage: a browser window showing real screens that change on their own, with tabs to pick one. It starts tilted back in 3D and
 * flattens and grows as the page scrolls, with small fact chips floating around it at different depths. When the visitor asks for less motion, it stays flat
 * and still, and the screens change only when a tab is picked.
 */
export function HeroStage() {
  const reduce = useReducedMotion()
  const [active, setActive] = React.useState(0)
  const [playing, setPlaying] = React.useState(true)
  const [hover, setHover] = React.useState(false)
  // "Try it live": the picture is swapped for the real block running in a frame, so the visitor can click, type and drag in it.
  const [live, setLive] = React.useState(false)
  const [loaded, setLoaded] = React.useState<string | null>(null)
  const [frameScale, setFrameScale] = React.useState(1)
  const panel = React.useRef<HTMLDivElement>(null)
  const tabs = React.useRef<(HTMLButtonElement | null)[]>([])
  const stage = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = panel.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setFrameScale(e.contentRect.width / FRAME_W))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const auto = playing && !hover && !reduce && !live
  React.useEffect(() => {
    if (!auto) return
    const t = window.setTimeout(() => setActive((i) => (i + 1) % SCREENS.length), STEP_MS)
    return () => window.clearTimeout(t)
  }, [auto, active])

  const { scrollYProgress } = useScroll({ target: stage, offset: ["start end", "start 0.2"] })
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 })
  const rotateX = useTransform(p, [0, 1], [26, 0])
  const scale = useTransform(p, [0, 1], [0.88, 1])
  const y = useTransform(p, [0, 1], [30, 0])
  const glow = useTransform(p, [0, 1], [0.35, 0.9])
  const near = useTransform(p, [0, 1], [70, -30])
  const far = useTransform(p, [0, 1], [30, -10])

  function onKey(e: React.KeyboardEvent) {
    const last = SCREENS.length - 1
    const next = e.key === "ArrowRight" ? (active === last ? 0 : active + 1) : e.key === "ArrowLeft" ? (active === 0 ? last : active - 1) : e.key === "Home" ? 0 : e.key === "End" ? last : null
    if (next === null) return
    e.preventDefault()
    pick(next)
    tabs.current[next]?.focus()
  }
  function pick(i: number) {
    setActive(i)
    setPlaying(false)
  }

  const current = SCREENS[active]
  return (
    <div className="relative mx-auto w-full max-w-[1180px]" onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
      <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
        <div role="tablist" aria-label="Screens in Ballmac UI Pro" onKeyDown={onKey} className="flex flex-wrap justify-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md">
          {SCREENS.map((s, i) => (
            <button
              key={s.name}
              ref={(el) => {
                tabs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`hero-tab-${s.name}`}
              aria-selected={i === active}
              aria-controls="hero-panel"
              tabIndex={i === active ? 0 : -1}
              onClick={() => pick(i)}
              className={cn(
                "relative overflow-hidden rounded-full px-3.5 py-1.5 text-[12.5px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/60 motion-reduce:transition-none",
                i === active ? "text-black" : "text-white/65 hover:text-white",
              )}
            >
              {i === active && <motion.span layoutId="hero-tab-pill" className="absolute inset-0 -z-10 rounded-full bg-white" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }} />}
              {i === active && auto && (
                <motion.span key={`bar-${active}`} aria-hidden="true" className="absolute inset-x-3 bottom-0.5 -z-0 h-px origin-left bg-black/35" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: STEP_MS / 1000, ease: "linear" }} />
              )}
              <span className="relative">{s.label}</span>
            </button>
          ))}
        </div>
        {!reduce && (
          <button
            type="button"
            onClick={() => setPlaying((v) => !v)}
            aria-label={playing ? "Stop changing screens" : "Change screens on their own"}
            className="grid size-8 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white/60"
          >
            {playing ? <Pause className="size-3.5" aria-hidden="true" /> : <Play className="size-3.5" aria-hidden="true" />}
          </button>
        )}
      </div>

      <div ref={stage} className="relative [perspective:1800px]">
        {/* The light the window sits in. */}
        <motion.div aria-hidden="true" style={{ opacity: reduce ? 0.8 : glow }} className="pointer-events-none absolute -inset-x-[8%] -top-[12%] bottom-[6%] -z-10 rounded-[50%] bg-[radial-gradient(closest-side,oklch(0.82_0.08_72/0.32),oklch(0.72_0.05_60/0.12)_55%,transparent)] blur-2xl" />

        <motion.div style={reduce ? undefined : { rotateX, scale, y, transformOrigin: "50% 0%" }} className="relative will-change-transform">
          <div className="overflow-hidden rounded-2xl border border-white/15 border-t-white/30 bg-[#0b0b0f] shadow-[0_0_0_1px_rgb(255_255_255/0.04),0_50px_120px_-30px_rgb(0_0_0/0.9),0_30px_80px_-40px_oklch(0.8_0.09_70/0.35)]">
            <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
              <span className="flex gap-1.5" aria-hidden="true">
                <span className="size-2.5 rounded-full bg-white/20" />
                <span className="size-2.5 rounded-full bg-white/20" />
                <span className="size-2.5 rounded-full bg-white/20" />
              </span>
              <span className="mx-auto flex max-w-full min-w-0 items-center gap-2 truncate rounded-md bg-white/[0.06] px-3 py-1 font-mono text-[11.5px] text-white/55" dir="ltr">
                ui.ballmac.com/blocks/<span className="text-white/85">{current.name}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setLive((v) => !v)
                  setPlaying(false)
                }}
                aria-pressed={live}
                className={cn(
                  "hidden shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:inline-flex",
                  live ? "bg-white/10 text-white" : "bg-[oklch(0.83_0.15_78)] text-[oklch(0.25_0.05_70)] hover:bg-[oklch(0.87_0.14_80)]",
                )}
              >
                {live ? <><X className="size-3.5" aria-hidden="true" />Back to the tour</> : <><MousePointerClick className="size-3.5" aria-hidden="true" />Try it live</>}
              </button>
              <Link href={`/blocks/${current.name}`} className="hidden shrink-0 rounded-md px-2 py-1 text-[11.5px] font-medium text-white/60 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 md:block">
                Open it
              </Link>
            </div>
            <div ref={panel} id="hero-panel" role="tabpanel" aria-labelledby={`hero-tab-${current.name}`} className="relative aspect-[16/10] overflow-hidden bg-[#0b0b0f]">
              {live && (
                <>
                  <iframe
                    key={current.name}
                    src={`/preview/${current.name}-demo`}
                    title={`${current.label}, running live`}
                    onLoad={() => setLoaded(current.name)}
                    className="absolute top-0 left-0 z-10 origin-top-left border-0 bg-background"
                    style={{ width: FRAME_W, height: FRAME_W / 1.6, transform: `scale(${frameScale})` }}
                  />
                  {loaded !== current.name && (
                    <span className="absolute inset-0 z-20 grid place-items-center bg-black/40 text-white/80" role="status">
                      <span className="flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm"><Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />Loading the live block</span>
                    </span>
                  )}
                </>
              )}
              {SCREENS.map((s, i) => (
                // eslint-disable-next-line @next/next/no-img-element -- static export, the files are already sized webp
                <img
                  key={s.name}
                  src={`/home/screens/${s.name}.dark.webp`}
                  alt={i === active ? s.alt : ""}
                  aria-hidden={i === active ? undefined : true}
                  width={2560}
                  height={1600}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  decoding="async"
                  className={cn(
                    "absolute inset-0 size-full object-cover object-top transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                    i === active ? "scale-100 opacity-100 blur-0" : "scale-[1.02] opacity-0 blur-sm",
                  )}
                />
              ))}
            </div>
          </div>

          {/* Facts that float in front of and behind the window, at different depths. */}
          <motion.div style={reduce ? undefined : { y: near }} className="absolute top-[18%] -left-6 hidden lg:block xl:-left-16" aria-hidden="true">
            <Chip className="bm-float"><Check className="size-3.5 text-emerald-400" />Loading, empty and error states</Chip>
          </motion.div>
          <motion.div style={reduce ? undefined : { y: far }} className="absolute top-[46%] -right-6 hidden lg:block xl:-right-14" aria-hidden="true">
            <Chip className="bm-float [animation-delay:-2s]"><Moon className="size-3.5 text-sky-300" />Dark, light and right to left</Chip>
          </motion.div>
          <motion.div style={reduce ? undefined : { y: near }} className="absolute bottom-[14%] -left-4 hidden lg:block xl:-left-10" aria-hidden="true">
            <Chip className="bm-float [animation-delay:-4s]"><ShieldCheck className="size-3.5 text-violet-300" />Checked in a real browser</Chip>
          </motion.div>
          <motion.div style={reduce ? undefined : { y: far }} className="absolute top-[8%] -right-4 hidden lg:block xl:-right-10" aria-hidden="true">
            <Chip className="bm-float [animation-delay:-3s] font-mono"><Command className="size-3.5 text-white/70" />npx shadcn add</Chip>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

function Chip({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("flex items-center gap-2 rounded-full border border-white/15 bg-[#14141a]/80 px-3.5 py-2 text-[12.5px] font-medium whitespace-nowrap text-white/85 shadow-[0_20px_40px_-15px_rgb(0_0_0/0.8)] backdrop-blur-xl", className)}>
      {children}
    </span>
  )
}

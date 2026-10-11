"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Pause, Play, RotateCcw } from "lucide-react"
import { matchPersonality, motionValues, reducedMotionFields, springCurve, springOvershoot, type ThemeSpec } from "@ballmac-ui/theme-engine"

import { Button } from "@/components/ballmac/button"
import { MotionProvider, useMotion } from "@/lib/ballmac/motion"
import { cn } from "@/lib/utils"

import { themeStyle, type Mode } from "./theme-style"

const W = 200
const H = 112
const X0 = 12
const X1 = W - 12
const Y0 = H - 22 // value 0
const Y1 = 26 // value 1
const yOf = (v: number) => Y0 - (Y0 - Y1) * v

/** The default ease-out as a polyline, sampled from the bezier itself. */
function bezierPoints(x1: number, y1: number, x2: number, y2: number, n = 48) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n
    const u = 1 - t
    const x = 3 * u * u * t * x1 + 3 * u * t * t * x2 + t ** 3
    const y = 3 * u * u * t * y1 + 3 * u * t * t * y2 + t ** 3
    return [X0 + (X1 - X0) * x, yOf(y)] as const
  })
}

const line = (pts: readonly (readonly [number, number])[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")

function Panel({ title, note, children, className }: { title: string; note?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("bg-card grid content-start gap-3 rounded-xl border p-4", className)}>
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        {note && <p className="text-muted-foreground mt-0.5 text-xs leading-snug">{note}</p>}
      </div>
      {children}
    </section>
  )
}

/** False the moment `run` changes, then true two frames later, so entering transitions have a starting state to leave from. */
function useReplay(run: number) {
  const [done, setDone] = React.useState(-1)
  React.useEffect(() => {
    let b = 0
    const a = requestAnimationFrame(() => {
      b = requestAnimationFrame(() => setDone(run))
    })
    return () => {
      cancelAnimationFrame(a)
      cancelAnimationFrame(b)
    }
  }, [run])
  return done === run
}

function SpringDot({ run }: { run: number }) {
  const m = useMotion()
  const on = useReplay(run)
  const track = React.useRef<HTMLDivElement>(null)
  const [distance, setDistance] = React.useState(160)
  React.useEffect(() => {
    if (track.current) setDistance(Math.max(0, track.current.clientWidth - 32))
  }, [run])
  return (
    <div ref={track} className="bg-muted/60 relative h-9 rounded-full border">
      <motion.span
        aria-hidden="true"
        className="bg-primary absolute top-1/2 left-1 size-6 -translate-y-1/2 rounded-full"
        initial={false}
        animate={{ x: on ? distance : 0 }}
        transition={m.reduced ? { duration: 0.01 } : m.spring.bouncy}
      />
    </div>
  )
}

/**
 * Every motion modulator, working live on the same tokens the components read. It sits in its own scope, so it shows the
 * theme being built and not the site's own motion.
 */
export function MotionLab({ spec, mode, reduced, id }: { spec: ThemeSpec; mode: Mode; reduced: boolean; id: string }) {
  const effective = React.useMemo(() => (reduced ? { ...spec, ...reducedMotionFields(spec) } : spec), [spec, reduced])
  const values = React.useMemo(() => motionValues(effective), [effective])
  const provided = React.useMemo(
    () => ({ speed: effective.speed, bounce: effective.bounce, travel: effective.travel, hover: effective.hover, stagger: effective.stagger, ambient: effective.ambient }),
    [effective.speed, effective.bounce, effective.travel, effective.hover, effective.stagger, effective.ambient]
  )
  const personality = matchPersonality(effective)

  const [run, setRun] = React.useState(0)
  const on = useReplay(run)

  // Replay shortly after any motion value changes, so dragging a slider and letting go shows the new feel.
  const signature = `${effective.speed}|${effective.bounce}|${effective.travel}|${effective.hover}|${effective.stagger}`
  const first = React.useRef(true)
  React.useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const t = setTimeout(() => setRun((r) => r + 1), 280)
    return () => clearTimeout(t)
  }, [signature])

  const spring = React.useMemo(() => springCurve(effective.bounce, 64), [effective.bounce])
  const overshoot = Math.round(springOvershoot(effective.bounce) * 100)
  const ease = React.useMemo(() => bezierPoints(0.22, 1, 0.36, 1), [])
  const springPts = spring.map((v, i) => [X0 + ((X1 - X0) * i) / (spring.length - 1), yOf(v)] as const)

  const durations = [
    { name: "fast", label: "Fast", use: "hover, press", s: values.duration.fast },
    { name: "base", label: "Base", use: "most changes", s: values.duration.base },
    { name: "slow", label: "Slow", use: "panels", s: values.duration.slow },
    { name: "reveal", label: "Reveal", use: "entrances", s: values.duration.reveal },
  ]
  const rows = ["Design review", "Ship the beta", "Write the changelog", "Invite the team"]
  const ms = (s: number) => `${Math.round(s * 1000)} ms`

  return (
    <div data-theme-scope={mode} className={cn(mode === "dark" && "dark", "@container")} style={themeStyle(spec, mode, reduced)}>
      <MotionProvider value={provided}>
        <div className="bg-background text-foreground grid gap-4 p-4 @xl:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 id={`${id}-title`} className="text-base font-semibold tracking-tight">
                {personality ? `${personality.title} motion` : "Custom motion"}
              </h3>
              <p className="text-muted-foreground text-xs">
                {reduced ? "Previewing reduced motion: no travel, lift or loops; fades stay." : `${values.speed.toFixed(2).replace(/\.?0+$/, "")}× speed · ${Math.round(values.bounce * 100)}% bounce · ${values.travel.toFixed(2).replace(/\.?0+$/, "")}× travel`}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setRun((r) => r + 1)}>
              <RotateCcw aria-hidden="true" /> Replay
            </Button>
          </div>

          <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
            <Panel title="Easing" note={`Spring overshoots by ${overshoot}%. The ease-out never does.`}>
              <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Easing curves. The spring overshoots its target by ${overshoot} percent; the ease-out settles without overshoot.`} className="w-full">
                <line x1={X0} x2={X1} y1={yOf(0)} y2={yOf(0)} stroke="var(--border)" strokeWidth="1" />
                <line x1={X0} x2={X1} y1={yOf(1)} y2={yOf(1)} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
                <path d={line(ease)} fill="none" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d={line(springPts)} fill="none" stroke="var(--ring)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <text x={X0} y={H - 6} fontSize="8" fill="var(--muted-foreground)">
                  <tspan fill="var(--muted-foreground)">— ease-out</tspan>
                  <tspan x={X0 + 62} fill="var(--ring)">
                    — spring
                  </tspan>
                </text>
              </svg>
              <div className="grid gap-2" aria-hidden="true">
                {[
                  { key: "out", fn: "var(--bm-ease-out)", color: "bg-muted-foreground" },
                  { key: "spring", fn: "var(--bm-ease-spring)", color: "bg-ring" },
                ].map((t) => (
                  <div key={t.key} className="bg-muted/60 relative h-5 rounded-full border">
                    <span
                      className={cn("absolute top-1/2 size-3 -translate-y-1/2 rounded-full transition-[left]", t.color)}
                      style={{ left: on ? "calc(100% - 1rem)" : "0.25rem", transitionDuration: "var(--bm-duration-reveal)", transitionTimingFunction: t.fn }}
                    />
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Hover and press" note="Lift and press depth follow the hover setting.">
              <div className="grid gap-3">
                <div
                  tabIndex={0}
                  className="bg-card focus-visible:ring-ring/50 rounded-lg border p-3 text-sm shadow-xs outline-none transition-[transform,box-shadow] duration-200 hover:translate-y-[var(--bm-lift,-2px)] hover:shadow-md focus-visible:translate-y-[var(--bm-lift,-2px)] focus-visible:ring-[3px]"
                >
                  <span className="font-medium">Hover this card</span>
                  <span className="text-muted-foreground mt-0.5 block text-xs">Lifts {Math.abs(values.lift)} px</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Press me</Button>
                  <Button size="sm" variant="secondary">
                    Or me
                  </Button>
                </div>
              </div>
            </Panel>

            <Panel title="Enter and stagger" note={`${Math.round(values.step * 1000)} ms between rows, ${values.distance} px of travel.`}>
              <ul className="grid gap-1.5">
                {rows.map((row, i) => (
                  <li
                    key={row}
                    className="bg-muted/50 flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-[transform,opacity]"
                    style={
                      {
                        "--i": i,
                        opacity: on ? 1 : 0,
                        transform: on ? "none" : "translateY(var(--bm-distance))",
                        transitionDuration: "var(--bm-duration-slow)",
                        transitionTimingFunction: "var(--bm-ease-out)",
                        transitionDelay: on ? "calc(var(--i) * var(--bm-stagger-step))" : "0ms",
                      } as React.CSSProperties
                    }
                  >
                    <span className="bg-primary size-1.5 rounded-full" aria-hidden="true" />
                    {row}
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Durations" note="Tailwind's duration-150, duration-200 and the rest scale with speed.">
              <ul className="grid gap-2">
                {durations.map((d) => (
                  <li key={d.name} className="grid grid-cols-[3.5rem_1fr_3.5rem] items-center gap-2 text-xs">
                    <span className="font-medium">{d.label}</span>
                    <span className="bg-muted relative h-2 overflow-hidden rounded-full" aria-hidden="true">
                      <span
                        className="bg-primary absolute inset-y-0 left-0 rounded-full transition-[width]"
                        style={{ width: on ? "100%" : "0%", transitionDuration: `var(--bm-duration-${d.name})`, transitionTimingFunction: "var(--bm-ease-out)" }}
                      />
                    </span>
                    <span className="text-muted-foreground text-right tabular-nums">{ms(d.s)}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Springs in JavaScript" note="Components built on Motion read the same speed and bounce.">
              <SpringDot run={run} />
            </Panel>

            <Panel title="Loops" note={effective.ambient ? "Decorative loops run." : "Decorative loops are paused."}>
              <div className="flex items-center gap-4" aria-hidden="true">
                <span className="bg-ring bm-lab-pulse size-3 rounded-full" />
                <span className="bg-muted relative h-2 flex-1 overflow-hidden rounded-full">
                  <span className="bg-primary/60 bm-lab-sweep absolute inset-y-0 w-1/3 rounded-full" />
                </span>
                {effective.ambient ? <Play className="text-muted-foreground size-3.5" /> : <Pause className="text-muted-foreground size-3.5" />}
              </div>
            </Panel>
          </div>
        </div>
      </MotionProvider>
    </div>
  )
}

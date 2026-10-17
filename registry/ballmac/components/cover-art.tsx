// Ballmac UI: Cover Art. https://ui.ballmac.com/components/cover-art
import * as React from "react"

import { cn } from "@/lib/utils"

type CoverArtVariant = "mesh" | "rings" | "bars" | "dots" | "waves"

type CoverArtProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Anything stable: an id, a name, a slug. The same seed always draws the same picture. */
  seed: string | number
  /** Which picture to draw. Leave it out (or "auto") to let the seed choose among the five. */
  variant?: CoverArtVariant | "auto"
  /** Lay a faint grid over the picture. */
  grid?: boolean
}

const variants: CoverArtVariant[] = ["mesh", "rings", "bars", "dots", "waves"]
const tones = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

/** A small deterministic random source (mulberry32). Integer maths only, so the server and every browser draw the same numbers. */
function random(seed: string | number) {
  let h = 2166136261
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  let a = h >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return (((t ^ (t >>> 14)) >>> 0) % 100000) / 100000
  }
}

/** Rounded so the markup is short and identical wherever it renders. */
const n = (v: number) => Math.round(v * 10) / 10

/**
 * A cover picture drawn from a seed, in the theme's chart colors: soft color fields, rings, bars, dots or waves. Use it where an
 * item has no image of its own: a project card, a profile cover, a channel or agent avatar. It fills its parent, never takes
 * focus, and is hidden from assistive technology.
 */
function CoverArt({ seed, variant = "auto", grid = false, className, ...props }: CoverArtProps) {
  const rnd = random(seed)
  const pick = <T,>(list: T[]) => list[Math.floor(rnd() * list.length)]!
  const kind = variant === "auto" ? pick(variants) : variant
  const first = Math.floor(rnd() * tones.length)
  const tone = tones[first]!
  const alt = tones[(first + 1 + Math.floor(rnd() * 3)) % tones.length]!
  const third = tones[(first + 2 + Math.floor(rnd() * 2)) % tones.length]!

  let shapes: React.ReactNode = null
  let field: React.CSSProperties["background"] = `linear-gradient(135deg, color-mix(in oklab, ${tone} 22%, transparent), color-mix(in oklab, ${alt} 14%, transparent))`

  if (kind === "mesh") {
    const at = () => `${Math.round(rnd() * 100)}% ${Math.round(rnd() * 100)}%`
    field = [
      `radial-gradient(60% 90% at ${at()}, color-mix(in oklab, ${tone} 60%, transparent), transparent 70%)`,
      `radial-gradient(55% 85% at ${at()}, color-mix(in oklab, ${alt} 50%, transparent), transparent 70%)`,
      `radial-gradient(70% 90% at ${at()}, color-mix(in oklab, ${third} 42%, transparent), transparent 72%)`,
    ].join(",")
  } else if (kind === "rings") {
    const cx = 190 + rnd() * 90
    const cy = 50 + rnd() * 80
    shapes = (
      <>
        {[26, 52, 80, 112, 148].map((r, i) => (
          <circle key={r} cx={n(cx)} cy={n(cy)} r={r} fill="none" stroke={i % 2 ? alt : tone} strokeWidth={i === 0 ? 2 : 1.4} strokeOpacity={n(0.7 - i * 0.12)} />
        ))}
        <circle cx={n(cx)} cy={n(cy)} r="9" fill={tone} fillOpacity="0.9" />
        <circle cx={n(cx - 62 - rnd() * 20)} cy={n(cy + 30 + rnd() * 20)} r="5" fill={third} fillOpacity="0.8" />
      </>
    )
  } else if (kind === "bars") {
    const count = 11 + Math.floor(rnd() * 4)
    const width = 320 / count
    const heights = Array.from({ length: count }, (_, i) => n(36 + rnd() * 96 + i * 2))
    const peak = heights.indexOf(Math.max(...heights))
    shapes = (
      <>
        {heights.map((h, i) => (
          <rect key={i} x={n(i * width + width * 0.2)} y={n(180 - h)} width={n(width * 0.6)} height={h} rx={n(width * 0.3)} fill={i === peak ? alt : tone} fillOpacity={i === peak ? 0.95 : n(0.28 + (i / count) * 0.4)} />
        ))}
      </>
    )
  } else if (kind === "dots") {
    const fx = 80 + rnd() * 170
    const fy = 40 + rnd() * 100
    const dots: React.ReactNode[] = []
    for (let row = 0; row < 8; row++)
      for (let col = 0; col < 15; col++) {
        const x = 12 + col * 21.4
        const y = 14 + row * 22.5
        // size falls off with distance from the focus, using squares instead of a square root
        const d2 = ((x - fx) * (x - fx) + (y - fy) * (y - fy)) / 9000
        const r = Math.max(1.2, 6.2 - d2 * 4.2)
        dots.push(<circle key={`${row}-${col}`} cx={n(x)} cy={n(y)} r={n(r)} fill={d2 < 0.7 ? alt : tone} fillOpacity={n(Math.max(0.18, 0.9 - d2 * 0.55))} />)
      }
    shapes = dots
  } else {
    const wave = (y: number, amp: number) => {
      const a = n(y + (rnd() - 0.5) * amp)
      const b = n(y + (rnd() - 0.5) * amp * 1.6)
      const c = n(y + (rnd() - 0.5) * amp)
      return `M0 ${n(y)} C 80 ${a}, 120 ${b}, 175 ${c} S 270 ${n(y + (rnd() - 0.5) * amp)}, 320 ${n(y + (rnd() - 0.5) * amp)}`
    }
    shapes = (
      <>
        {[
          { y: 62, w: 2.4, c: tone, o: 0.9 },
          { y: 92, w: 1.8, c: alt, o: 0.7 },
          { y: 120, w: 1.4, c: third, o: 0.55 },
          { y: 146, w: 1.1, c: tone, o: 0.35 },
        ].map((l) => (
          <path key={l.y} d={wave(l.y, 56)} fill="none" stroke={l.c} strokeWidth={l.w} strokeOpacity={l.o} strokeLinecap="round" />
        ))}
      </>
    )
  }

  return (
    <div
      aria-hidden="true"
      data-slot="cover-art"
      data-variant={kind}
      className={cn("bg-muted/60 pointer-events-none relative isolate size-full overflow-hidden", className)}
      {...props}
    >
      <div className="absolute inset-0" style={{ background: field }} />
      {shapes ? (
        <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
          {shapes}
        </svg>
      ) : null}
      {grid ? (
        <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" className="text-foreground absolute inset-0 size-full opacity-[0.06]">
          <path d={`${Array.from({ length: 9 }, (_, i) => `M${(i + 1) * 32} 0V180`).join("")}${Array.from({ length: 5 }, (_, i) => `M0 ${(i + 1) * 30}H320`).join("")}`} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" fill="none" />
        </svg>
      ) : null}
    </div>
  )
}

export { CoverArt, type CoverArtProps, type CoverArtVariant }

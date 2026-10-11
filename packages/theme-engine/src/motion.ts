/**
 * Motion as part of the theme.
 *
 * A theme is colour, shape and now movement. Six numbers describe how a product moves; everything else (durations, easings,
 * hover lift, stagger steps, the CSS spring curve) is derived from them, so any combination feels coherent and the whole
 * family can be tuned with one slider each.
 *
 * Output is plain CSS custom properties. Components read them through Tailwind's own theme keys (`duration-150`, `ease-out`,
 * `ease-spring`), through `--bm-*` variables, or through `useMotion()` for JavaScript springs, so a motion theme reaches
 * existing classes without editing them.
 */

export type MotionReduce = "system" | "always"

export type MotionFields = {
  /** Playback speed. 1 is the default, 2 halves every duration, 0.5 doubles them. */
  speed: number
  /** Springiness, 0 (settles with no overshoot) to 1 (clearly bouncy). */
  bounce: number
  /** How far things travel when they enter or move, as a multiple of the default distance. */
  travel: number
  /** How strongly controls answer a hover or press: lift, press depth. */
  hover: number
  /** The delay between items in a staggered list, as a multiple of the default step. */
  stagger: number
  /** Decorative loops (shimmer, floating, pulsing). Off pauses them. */
  ambient: boolean
  /** "system" follows the visitor's setting. "always" ships the reduced values to everyone. */
  reduce: MotionReduce
}

export const DEFAULT_MOTION: MotionFields = {
  speed: 1,
  bounce: 0.25,
  travel: 1,
  hover: 1,
  stagger: 1,
  ambient: true,
  reduce: "system",
}

export const MOTION_RANGES = {
  speed: { min: 0.5, max: 2.5, step: 0.05 },
  bounce: { min: 0, max: 1, step: 0.05 },
  travel: { min: 0, max: 2, step: 0.05 },
  hover: { min: 0, max: 2, step: 0.05 },
  stagger: { min: 0, max: 2, step: 0.05 },
} as const

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(v) ? v : min))
const round = (v: number, d: number) => Number(v.toFixed(d))

export function normalizeMotion(input: Partial<MotionFields> = {}): MotionFields {
  const m = { ...DEFAULT_MOTION, ...input }
  return {
    speed: round(clamp(m.speed, MOTION_RANGES.speed.min, MOTION_RANGES.speed.max), 2),
    bounce: round(clamp(m.bounce, MOTION_RANGES.bounce.min, MOTION_RANGES.bounce.max), 2),
    travel: round(clamp(m.travel, MOTION_RANGES.travel.min, MOTION_RANGES.travel.max), 2),
    hover: round(clamp(m.hover, MOTION_RANGES.hover.min, MOTION_RANGES.hover.max), 2),
    stagger: round(clamp(m.stagger, MOTION_RANGES.stagger.min, MOTION_RANGES.stagger.max), 2),
    ambient: m.ambient !== false,
    reduce: m.reduce === "always" ? "always" : "system",
  }
}

export type MotionPersonality = {
  slug: "native" | "calm" | "snappy" | "playful" | "still"
  title: string
  tagline: string
  description: string
  motion: MotionFields
}

const personality = (p: Omit<MotionPersonality, "motion"> & { motion: Partial<MotionFields> }): MotionPersonality => ({ ...p, motion: normalizeMotion(p.motion) })

/** Five ready-made ways to move. "Still" is the always-reduced option for products that should hold perfectly still. */
export const MOTION_PERSONALITIES: MotionPersonality[] = [
  personality({
    slug: "native",
    title: "Native",
    tagline: "Quick, quiet, a hint of spring",
    description: "The Ballmac default: short fades, a soft settle on spatial moves and a light lift on hover. Reads as the platform, not as an effect.",
    motion: {},
  }),
  personality({
    slug: "calm",
    title: "Calm",
    tagline: "Slower, no overshoot, small moves",
    description: "Longer, softer transitions with no bounce and short travel. Suits products people use for a long time, like editors, health and finance.",
    motion: { speed: 0.75, bounce: 0, travel: 0.7, hover: 0.5, stagger: 1.4 },
  }),
  personality({
    slug: "snappy",
    title: "Snappy",
    tagline: "Fast, tight, almost instant",
    description: "Short durations, tight stagger and very little bounce. Suits dense tools and dashboards where speed is the feature.",
    motion: { speed: 1.6, bounce: 0.05, travel: 0.7, hover: 0.8, stagger: 0.5, ambient: false },
  }),
  personality({
    slug: "playful",
    title: "Playful",
    tagline: "Bouncy, bigger moves, eager hover",
    description: "Clear overshoot, longer travel and a pronounced hover lift. Suits consumer apps, creative tools and marketing pages.",
    motion: { speed: 1.1, bounce: 0.8, travel: 1.4, hover: 1.5, stagger: 1.2 },
  }),
  personality({
    slug: "still",
    title: "Still",
    tagline: "Fades only, for everyone",
    description: "Ships the reduced-motion values to every visitor: no travel, no lift, no loops, no bounce. Opacity changes stay so state remains visible.",
    motion: { speed: 2, bounce: 0, travel: 0, hover: 0, stagger: 0.4, ambient: false, reduce: "always" },
  }),
]

export const getPersonality = (slug: string) => MOTION_PERSONALITIES.find((p) => p.slug === slug)

/** The personality a set of motion fields matches exactly, if any. */
export function matchPersonality(m: MotionFields): MotionPersonality | undefined {
  const n = normalizeMotion(m)
  return MOTION_PERSONALITIES.find((p) => (Object.keys(n) as (keyof MotionFields)[]).every((k) => p.motion[k] === n[k]))
}

// ---------- the spring curve ----------

/**
 * A damped spring, sampled into a CSS `linear()` easing.
 *
 * `bounce` maps to the damping ratio (1 = critically damped, no overshoot; lower = more overshoot). The curve is normalised
 * so it reaches 1 at the end of the transition, whatever the damping. Browsers that cannot parse `linear()` ignore the
 * declaration and keep the previous easing, so components should set a plain easing first.
 */
export function springCurve(bounce: number, samples = 40): number[] {
  const b = clamp(bounce, 0, 1)
  const zeta = 1 - b * 0.82
  const at = (tau: number) => {
    if (zeta >= 0.999) return 1 - (1 + tau) * Math.exp(-tau)
    const wd = Math.sqrt(1 - zeta * zeta)
    return 1 - Math.exp(-zeta * tau) * (Math.cos(wd * tau) + (zeta / wd) * Math.sin(wd * tau))
  }
  let settle = 1
  for (let tau = 0; tau < 80; tau += 0.02) if (Math.abs(at(tau) - 1) > 0.003) settle = tau
  settle += 0.05
  const out: number[] = []
  for (let i = 0; i <= samples; i++) out.push(round(at((i / samples) * settle), 4))
  out[0] = 0
  out[samples] = 1
  return out
}

/** The CSS `linear()` string for a spring. */
export function springEasing(bounce: number, samples = 40): string {
  return `linear(${springCurve(bounce, samples).map((v) => String(v)).join(", ")})`
}

/** How far a spring overshoots the target, as a fraction (0.12 = 12% past). */
export function springOvershoot(bounce: number): number {
  return Math.max(0, Math.max(...springCurve(bounce, 120)) - 1)
}

// ---------- derived values ----------

export const EASINGS = {
  out: "cubic-bezier(0.22, 1, 0.36, 1)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  in: "cubic-bezier(0.55, 0, 1, 0.45)",
} as const

/** Base durations at speed 1, in milliseconds. */
export const BASE_DURATIONS = { fast: 140, base: 220, slow: 320, reveal: 600 } as const
/** The Tailwind duration and delay steps the theme rescales. */
export const TAILWIND_STEPS = [75, 100, 150, 200, 300, 500, 700, 1000] as const
/** Distance, in px, an element travels on enter at travel 1. */
const DISTANCE_PX = 10
/** Hover lift in px and press scale depth at hover 1. */
const LIFT_PX = 2
const PRESS_DEPTH = 0.03
/** Gap between staggered items, in ms, at stagger 1 and speed 1. */
const STAGGER_MS = 50

/** The values `useMotion()` and the builder preview work with, already resolved to plain numbers. */
export type MotionValues = {
  speed: number
  bounce: number
  travel: number
  hover: number
  stagger: number
  ambient: boolean
  reduce: MotionReduce
  /** Durations in seconds, for Motion (framer-motion). */
  duration: { fast: number; base: number; slow: number; reveal: number }
  /** Enter distance in px. */
  distance: number
  /** Hover lift in px (negative = up) and press scale. */
  lift: number
  press: number
  /** Stagger step in seconds. */
  step: number
}

export function motionValues(input: Partial<MotionFields> = {}): MotionValues {
  const m = normalizeMotion(input)
  const d = (ms: number) => round(ms / m.speed / 1000, 4)
  return {
    ...m,
    duration: { fast: d(BASE_DURATIONS.fast), base: d(BASE_DURATIONS.base), slow: d(BASE_DURATIONS.slow), reveal: d(BASE_DURATIONS.reveal) },
    distance: round(DISTANCE_PX * m.travel, 2),
    lift: round(-LIFT_PX * m.hover, 2),
    press: round(1 - PRESS_DEPTH * m.hover, 3),
    step: round((STAGGER_MS * m.stagger) / m.speed / 1000, 4),
  }
}

export type MotionVars = {
  /** `@theme inline` keys: Tailwind's own duration, delay and easing scales, pointed at the variables below. */
  theme: Record<string, string>
  /** Plain custom properties for `:root`. */
  root: Record<string, string>
  /** What `prefers-reduced-motion: reduce` changes. Empty when `reduce` is "always" (the values are already in `root`). */
  reduced: Record<string, string>
}

/** The values that apply when motion is reduced: no travel, lift, loops or bounce; fades stay, and a little faster. */
const REDUCED: Partial<MotionFields> = { speed: 2, bounce: 0, travel: 0, hover: 0, stagger: 0.4, ambient: false }

/** The motion fields that apply when the visitor asks for reduced motion (or the theme is "always reduced"). */
export const reducedMotionFields = (m: Partial<MotionFields>): MotionFields => {
  const n = normalizeMotion(m)
  return normalizeMotion({ ...n, ...REDUCED, speed: Math.max(n.speed, REDUCED.speed!) })
}

function rootVars(m: MotionFields): Record<string, string> {
  const v = motionValues(m)
  return {
    "bm-speed": String(m.speed),
    "bm-bounce": String(m.bounce),
    "bm-travel": String(m.travel),
    "bm-hover": String(m.hover),
    "bm-stagger": String(m.stagger),
    "bm-ambient": m.ambient ? "1" : "0",
    "bm-ambient-state": m.ambient ? "running" : "paused",
    "bm-ease-out": EASINGS.out,
    "bm-ease-in-out": EASINGS.inOut,
    "bm-ease-in": EASINGS.in,
    "bm-ease-spring": springEasing(m.bounce),
    "bm-duration-fast": `calc(${BASE_DURATIONS.fast}ms / var(--bm-speed))`,
    "bm-duration-base": `calc(${BASE_DURATIONS.base}ms / var(--bm-speed))`,
    "bm-duration-slow": `calc(${BASE_DURATIONS.slow}ms / var(--bm-speed))`,
    "bm-duration-reveal": `calc(${BASE_DURATIONS.reveal}ms / var(--bm-speed))`,
    "bm-distance": `${v.distance}px`,
    "bm-lift": `${v.lift}px`,
    "bm-press": String(v.press),
    "bm-stagger-step": `calc(${STAGGER_MS}ms * var(--bm-stagger) / var(--bm-speed))`,
  }
}

/**
 * tw-animate-css (the `animate-in` / `animate-out` classes Radix overlays use, and the accordion and collapsible animations)
 * sets its default duration inside one theme variable. These repeat its definitions with that one duration divided by the
 * speed, so dialogs, popovers, menus and accordions follow the theme too. The tests compare them with the installed package.
 */
const ANIMATE_TAIL = "var(--tw-animation-delay,0s)var(--tw-animation-iteration-count,1)var(--tw-animation-direction,normal)var(--tw-animation-fill-mode,none)"
const animate = (keyframes: string, ms: number, ease: string) =>
  `${keyframes} var(--tw-animation-duration,var(--tw-duration,calc(${ms}ms / var(--bm-speed))))var(--tw-ease,${ease})${ANIMATE_TAIL}`

export const ANIMATE_THEME: Record<string, string> = {
  "animate-in": animate("enter", 150, "ease"),
  "animate-out": animate("exit", 150, "ease"),
  "animate-accordion-down": animate("accordion-down", 200, "ease-out"),
  "animate-accordion-up": animate("accordion-up", 200, "ease-out"),
  "animate-collapsible-down": animate("collapsible-down", 200, "ease-out"),
  "animate-collapsible-up": animate("collapsible-up", 200, "ease-out"),
}

export function motionVars(input: Partial<MotionFields> = {}): MotionVars {
  const m = normalizeMotion(input)
  const effective = m.reduce === "always" ? reducedMotionFields(m) : m
  const theme: Record<string, string> = {
    "ease-out": "var(--bm-ease-out)",
    "ease-in": "var(--bm-ease-in)",
    "ease-in-out": "var(--bm-ease-in-out)",
    "ease-spring": "var(--bm-ease-spring)",
  }
  Object.assign(theme, ANIMATE_THEME)
  for (const ms of TAILWIND_STEPS) {
    theme[`transition-duration-${ms}`] = `calc(${ms}ms / var(--bm-speed))`
    theme[`transition-delay-${ms}`] = `calc(${ms}ms / var(--bm-speed))`
  }
  let reduced: Record<string, string> = {}
  if (m.reduce === "system") {
    const r = rootVars(reducedMotionFields(m))
    // only what differs from the full-motion values needs to be restated
    const full = rootVars(m)
    reduced = Object.fromEntries(Object.entries(r).filter(([k, val]) => full[k] !== val))
  }
  return { theme, root: rootVars(effective), reduced }
}

/** The reduced-motion rule as CSS text, or "" when nothing changes. */
export function reducedMotionCss(reduced: Record<string, string>): string {
  const entries = Object.entries(reduced)
  if (!entries.length) return ""
  return `@media (prefers-reduced-motion: reduce) {\n  :root {\n${entries.map(([k, v]) => `    --${k}: ${v};`).join("\n")}\n  }\n}`
}

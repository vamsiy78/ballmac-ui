// Ballmac UI: Motion presets. https://ui.ballmac.com/components/motion-presets
// One set of easings, durations and springs shared by every animated Ballmac component, driven by the theme's motion tokens.
import * as React from "react"
import { useReducedMotion, type Transition, type Variants } from "motion/react"

/**
 * How the theme says things should move. These are the `--bm-*` variables from the Ballmac theme (or any motion theme),
 * read from the page. Without a motion theme every value is the default, so nothing changes.
 */
export type MotionState = {
  /** Playback speed. 2 halves every duration. */
  speed: number
  /** Springiness, 0 (no overshoot) to 1. */
  bounce: number
  /** Enter distance multiplier. */
  travel: number
  /** Hover lift and press depth multiplier. */
  hover: number
  /** Stagger step multiplier. */
  stagger: number
  /** Whether decorative loops should run. */
  ambient: boolean
}

export const defaultMotion: MotionState = { speed: 1, bounce: 0.25, travel: 1, hover: 1, stagger: 1, ambient: true }

const VARS = { speed: "--bm-speed", bounce: "--bm-bounce", travel: "--bm-travel", hover: "--bm-hover", stagger: "--bm-stagger", ambient: "--bm-ambient" } as const

const same = (a: MotionState, b: MotionState) => (Object.keys(a) as (keyof MotionState)[]).every((k) => a[k] === b[k])

function read(el: Element): MotionState {
  const css = getComputedStyle(el)
  const num = (name: string, fallback: number) => {
    const v = Number.parseFloat(css.getPropertyValue(name))
    return Number.isFinite(v) ? v : fallback
  }
  return {
    speed: Math.max(0.1, num(VARS.speed, defaultMotion.speed)),
    bounce: num(VARS.bounce, defaultMotion.bounce),
    travel: num(VARS.travel, defaultMotion.travel),
    hover: num(VARS.hover, defaultMotion.hover),
    stagger: num(VARS.stagger, defaultMotion.stagger),
    ambient: num(VARS.ambient, 1) !== 0,
  }
}

// A page has one motion theme, so it is read once and cached; the cache is dropped when the theme could have changed.
let cached: MotionState | null = null
let override: MotionState | null = null
let watching = false
const listeners = new Set<() => void>()

function refresh() {
  if (typeof document === "undefined") return
  const next = read(document.documentElement)
  if (cached && same(cached, next)) return
  cached = next
  listeners.forEach((l) => l())
}

function watch() {
  if (watching || typeof document === "undefined") return
  watching = true
  new MutationObserver(refresh).observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] })
  window.matchMedia?.("(prefers-reduced-motion: reduce)").addEventListener("change", refresh)
}

/** Reads the theme again. Call it after you change `--bm-*` variables yourself. */
export function refreshMotion() {
  cached = null
  refresh()
}

/** The motion the page is set to right now. Safe on the server, where it returns the defaults. */
export function getMotion(): MotionState {
  if (override) return override
  if (typeof document === "undefined") return defaultMotion
  watch()
  return (cached ??= read(document.documentElement))
}

function subscribe(listener: () => void) {
  watch()
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

// ---------- values derived from the state ----------

/** Cubic-bezier easings (match --bm-ease-* in the theme). */
export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
  in: [0.55, 0, 1, 0.45],
} as const

const BASE_DURATION = { fast: 0.14, base: 0.22, slow: 0.32, reveal: 0.6 } as const
const secs = (s: number, m: MotionState) => Number((s / m.speed).toFixed(4))

/** Durations in seconds (match --bm-duration-*), already divided by the theme's speed. */
export const duration = {
  get fast() { return secs(BASE_DURATION.fast, getMotion()) },
  get base() { return secs(BASE_DURATION.base, getMotion()) },
  get slow() { return secs(BASE_DURATION.slow, getMotion()) },
  get reveal() { return secs(BASE_DURATION.reveal, getMotion()) },
}

type SpringBase = { stiffness: number; damping: number; mass?: number }

/**
 * A spring tuned by the theme. Speed scales the frequency (stiffness by speed squared, damping by speed) so the character
 * of the spring stays the same; bounce moves the damping ratio, with 0.25 leaving the base spring as designed.
 */
function tuned(base: SpringBase, m: MotionState): Transition {
  const b = Math.min(1, Math.max(0, m.bounce))
  const damp = b <= 0.25 ? 1 + ((0.25 - b) / 0.25) * 0.4 : 1 - ((b - 0.25) / 0.75) * 0.55
  return {
    type: "spring",
    stiffness: Math.round(base.stiffness * m.speed ** 2),
    damping: Number((base.damping * m.speed * damp).toFixed(1)),
    ...(base.mass ? { mass: base.mass } : {}),
  }
}

/** Springs for spatial movement. */
export const spring = {
  /** UI controls: quick, no visible overshoot. */
  get snappy() { return tuned({ stiffness: 420, damping: 34, mass: 0.8 }, getMotion()) },
  /** Cards and panels: soft settle. */
  get gentle() { return tuned({ stiffness: 180, damping: 24 }, getMotion()) },
  /** Playful accents: a little bounce. */
  get bouncy() { return tuned({ stiffness: 300, damping: 16 }, getMotion()) },
}

/** Common enter/exit variants. Pair with `initial="hidden" animate="visible"`. */
export const variants = {
  fadeUp: {
    get hidden() { return { opacity: 0, y: 10 * getMotion().travel, filter: "blur(4px)" } },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", get transition() { return { duration: duration.reveal, ease: ease.out } } },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, get transition() { return { duration: duration.base, ease: ease.out } } },
  },
  scaleIn: {
    get hidden() { return { opacity: 0, scale: 1 - 0.04 * getMotion().travel } },
    visible: { opacity: 1, scale: 1, get transition() { return spring.gentle } },
  },
} satisfies Record<string, Variants>

/** Stagger children by `step` seconds. The theme's stagger and speed scale the step. */
export function stagger(step = 0.06, delayChildren = 0): Transition {
  const m = getMotion()
  return { staggerChildren: Number(((step * m.stagger) / m.speed).toFixed(4)), delayChildren: Number((delayChildren / m.speed).toFixed(4)) }
}

// ---------- React ----------

const noopSubscribe = () => () => {}

/**
 * Motion's `useReducedMotion`, made safe for server rendering. Motion reads the media query on the first
 * client render, so a component that renders different markup for reduced motion would not match the
 * server HTML. This returns `false` until hydration has finished, then the visitor's real preference.
 */
export function useReducedMotionSafe(): boolean {
  const reduce = useReducedMotion()
  const hydrated = React.useSyncExternalStore(noopSubscribe, () => true, () => false)
  return hydrated && !!reduce
}

/**
 * True when decorative loops (glows, shimmers, drifting backgrounds) should hold still: the visitor asked for reduced motion,
 * or the theme turned loops off. Use it where you would use `useReducedMotion` for a purely decorative loop. Status
 * indicators (spinners, "thinking" dots) carry meaning and should keep running either way.
 */
export function useLoopsPaused(): boolean {
  const reduced = useReducedMotionSafe()
  const ambient = React.useSyncExternalStore(subscribe, () => getMotion().ambient, () => true)
  return reduced || !ambient
}

export type Motion = MotionState & {
  /** True when the visitor asked for reduced motion. Travel, hover and loops are already 0 then. */
  reduced: boolean
  duration: { fast: number; base: number; slow: number; reveal: number }
  spring: { snappy: Transition; gentle: Transition; bouncy: Transition }
  /** Enter distance in px. */
  distance: number
  /** Hover lift in px (negative is up) and press scale. */
  lift: number
  press: number
  /** Gap between staggered items, in seconds. */
  step: number
  /** `repeat` value for a decorative loop: Infinity, or 0 when the theme turns loops off. */
  loop: number
}

const derive = (m: MotionState, reduced: boolean): Motion => ({
  ...m,
  reduced,
  duration: { fast: secs(BASE_DURATION.fast, m), base: secs(BASE_DURATION.base, m), slow: secs(BASE_DURATION.slow, m), reveal: secs(BASE_DURATION.reveal, m) },
  spring: { snappy: tuned({ stiffness: 420, damping: 34, mass: 0.8 }, m), gentle: tuned({ stiffness: 180, damping: 24 }, m), bouncy: tuned({ stiffness: 300, damping: 16 }, m) },
  distance: Number((10 * m.travel).toFixed(2)),
  lift: Number((-2 * m.hover).toFixed(2)),
  press: Number((1 - 0.03 * m.hover).toFixed(3)),
  step: Number(((0.05 * m.stagger) / m.speed).toFixed(4)),
  loop: m.ambient && !reduced ? Infinity : 0,
})

// Created on first use, not at import, so a server component can still import the constants above (`React.createContext` does not exist there).
let motionContext: React.Context<Motion | null> | undefined
const getContext = () => (motionContext ??= React.createContext<Motion | null>(null))

/**
 * Live motion for a component: durations, springs, distances and the loop switch, always matching the theme. Re-renders when
 * the theme changes. Use it where you need the numbers in JavaScript; for CSS use `duration-150`, `ease-out`, `ease-spring`
 * and the `--bm-*` variables, which the theme already rescales.
 */
export function useMotion(): Motion {
  const scoped = React.useContext(getContext())
  const state = React.useSyncExternalStore(subscribe, getMotion, () => defaultMotion)
  const reduced = useReducedMotionSafe()
  return React.useMemo(() => scoped ?? derive(state, reduced), [scoped, state, reduced])
}

/**
 * Applies a motion setting to one part of the page, for previews and demos. Motion's JavaScript springs cannot see CSS
 * variables set on a subtree, so this also hands the values to everything below it, and to the shared `spring`, `duration`
 * and `stagger` while it is mounted. For a real app, set the `--bm-*` variables on the root instead and skip this.
 */
export function MotionProvider({ value, children }: { value: Partial<MotionState>; children: React.ReactNode }) {
  const merged = React.useMemo<MotionState>(() => ({ ...defaultMotion, ...value }), [value])
  const reduced = useReducedMotionSafe()
  React.useEffect(() => {
    override = merged
    listeners.forEach((l) => l())
    return () => {
      if (override === merged) override = null
      listeners.forEach((l) => l())
    }
  }, [merged])
  const derived = React.useMemo(() => derive(merged, reduced), [merged, reduced])
  return React.createElement(getContext().Provider, { value: derived }, children)
}

// Ballmac UI: Motion presets. https://ui.ballmac.com/components/motion-presets
// One set of easings, durations and springs shared by every animated Ballmac component.
import * as React from "react"
import { useReducedMotion, type Transition, type Variants } from "motion/react"

/** Cubic-bezier easings (match --bm-ease-* in the theme). */
export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
  in: [0.55, 0, 1, 0.45],
} as const

/** Durations in seconds (match --bm-duration-*). */
export const duration = {
  fast: 0.14,
  base: 0.22,
  slow: 0.32,
  reveal: 0.6,
} as const

/** Springs for spatial movement. */
export const spring = {
  /** UI controls: quick, no visible overshoot. */
  snappy: { type: "spring", stiffness: 420, damping: 34, mass: 0.8 },
  /** Cards and panels: soft settle. */
  gentle: { type: "spring", stiffness: 180, damping: 24 },
  /** Playful accents: a little bounce. */
  bouncy: { type: "spring", stiffness: 300, damping: 16 },
} satisfies Record<string, Transition>

/** Common enter/exit variants. Pair with `initial="hidden" animate="visible"`. */
export const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.reveal, ease: ease.out } },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: duration.base, ease: ease.out } },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: spring.gentle },
  },
} satisfies Record<string, Variants>

/** Stagger children by `step` seconds. */
export function stagger(step = 0.06, delayChildren = 0): Transition {
  return { staggerChildren: step, delayChildren }
}

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

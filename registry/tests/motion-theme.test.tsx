import * as React from "react"
import { act, render, screen } from "@testing-library/react"
import { buildTheme, DEFAULT_SPEC, MOTION_PERSONALITIES, motionValues, normalizeSpec } from "@ballmac-ui/theme-engine"
import { afterEach, describe, expect, it } from "vitest"

import { duration, getMotion, MotionProvider, refreshMotion, spring, stagger, useMotion, variants } from "@/lib/ballmac/motion"

const root = document.documentElement

/** Puts a theme's motion variables on the page, the way installing it would. */
function apply(motion: Partial<typeof DEFAULT_SPEC>) {
  const vars = buildTheme(normalizeSpec({ ...DEFAULT_SPEC, ...motion })).light
  for (const [k, v] of Object.entries(vars)) if (k.startsWith("bm-")) root.style.setProperty(`--${k}`, v)
  refreshMotion()
}

afterEach(() => {
  root.removeAttribute("style")
  refreshMotion()
})

describe("shared motion without a motion theme", () => {
  it("is exactly what it was before motion was themeable", () => {
    expect(getMotion()).toEqual({ speed: 1, bounce: 0.25, travel: 1, hover: 1, stagger: 1, ambient: true })
    expect([duration.fast, duration.base, duration.slow, duration.reveal]).toEqual([0.14, 0.22, 0.32, 0.6])
    expect(spring.snappy).toEqual({ type: "spring", stiffness: 420, damping: 34, mass: 0.8 })
    expect(spring.gentle).toEqual({ type: "spring", stiffness: 180, damping: 24 })
    expect(spring.bouncy).toEqual({ type: "spring", stiffness: 300, damping: 16 })
    expect(variants.fadeUp.hidden).toEqual({ opacity: 0, y: 10, filter: "blur(4px)" })
    expect(variants.scaleIn.hidden).toEqual({ opacity: 0, scale: 0.96 })
    expect(stagger(0.06).staggerChildren).toBe(0.06)
  })
})

describe("shared motion follows the theme", () => {
  it("divides durations by speed and scales travel", () => {
    apply({ speed: 2, travel: 0.5 })
    expect(duration.base).toBe(0.11)
    expect(variants.fadeUp.hidden.y).toBe(5)
    expect(stagger(0.06).staggerChildren).toBe(0.03)
  })
  it("keeps a spring's character when speed changes, and moves its damping with bounce", () => {
    apply({ speed: 2 })
    const fast = spring.snappy as { stiffness: number; damping: number }
    expect(fast.stiffness).toBe(1680)
    expect(fast.damping).toBe(68)
    apply({ bounce: 1 })
    expect((spring.bouncy as { damping: number }).damping).toBeLessThan(16)
    apply({ bounce: 0 })
    expect((spring.bouncy as { damping: number }).damping).toBeGreaterThan(16)
  })
  for (const p of MOTION_PERSONALITIES) {
    it(`${p.slug}: agrees with the theme engine on durations, distance and stagger`, () => {
      apply(p.motion)
      const expected = motionValues(p.motion)
      expect(duration.fast).toBeCloseTo(expected.duration.fast, 3)
      expect(duration.base).toBeCloseTo(expected.duration.base, 3)
      expect(duration.slow).toBeCloseTo(expected.duration.slow, 3)
      expect(duration.reveal).toBeCloseTo(expected.duration.reveal, 3)
      expect(variants.fadeUp.hidden.y).toBeCloseTo(expected.distance, 2)
      expect(stagger(0.05).staggerChildren).toBeCloseTo(expected.step, 3)
      expect(getMotion().ambient).toBe(expected.ambient)
    })
  }
  it("falls back to defaults for junk values", () => {
    root.style.setProperty("--bm-speed", "fast")
    root.style.setProperty("--bm-travel", "")
    refreshMotion()
    expect(getMotion().speed).toBe(1)
    expect(getMotion().travel).toBe(1)
  })
})

function Probe() {
  const m = useMotion()
  return (
    <span data-testid="probe">
      {m.duration.base}|{m.distance}|{m.lift}|{m.press}|{m.loop === Infinity ? "loop" : "still"}
    </span>
  )
}

describe("useMotion", () => {
  it("re-renders when the theme changes", () => {
    render(<Probe />)
    expect(screen.getByTestId("probe")).toHaveTextContent("0.22|10|-2|0.97|loop")
    act(() => apply({ speed: 2, travel: 0, hover: 0, ambient: false }))
    expect(screen.getByTestId("probe")).toHaveTextContent("0.11|0|0|1|still")
  })
  it("MotionProvider applies a setting to one subtree and to the shared springs while mounted", () => {
    const { unmount } = render(
      <MotionProvider value={{ speed: 2, bounce: 1 }}>
        <Probe />
      </MotionProvider>
    )
    expect(screen.getByTestId("probe")).toHaveTextContent("0.11|10|-2|0.97|loop")
    expect(duration.base).toBe(0.11)
    unmount()
    expect(duration.base).toBe(0.22)
  })
})

import { describe, expect, it } from "vitest"

import {
  ANIMATE_THEME, buildTheme, DEFAULT_MOTION, DEFAULT_SPEC, decodeSpec, encodeSpec, matchPersonality, MOTION_PERSONALITIES, MOTION_RANGES, motionValues, motionVars, normalizeMotion,
  normalizeSpec, PRESETS, reducedMotionCss, springCurve, springEasing, springOvershoot, themeCss, themeRegistryItem,
} from "../src"

describe("spring curve", () => {
  it("starts at 0 and ends at exactly 1, whatever the bounce", () => {
    for (const b of [0, 0.1, 0.25, 0.5, 0.8, 1]) {
      const c = springCurve(b)
      expect(c[0]).toBe(0)
      expect(c.at(-1)).toBe(1)
      expect(c.every(Number.isFinite)).toBe(true)
    }
  })
  it("never overshoots at bounce 0 and overshoots more as bounce rises", () => {
    expect(springOvershoot(0)).toBe(0)
    const o = [0.25, 0.5, 0.8, 1].map(springOvershoot)
    expect(o[0]).toBeGreaterThan(0)
    expect([...o].sort((a, b) => a - b)).toEqual(o)
    expect(o.at(-1)).toBeLessThan(0.7)
  })
  it("is monotonic when it does not bounce", () => {
    const c = springCurve(0)
    for (let i = 1; i < c.length; i++) expect(c[i]!).toBeGreaterThanOrEqual(c[i - 1]!)
  })
  it("writes a CSS linear() easing", () => {
    expect(springEasing(0.25)).toMatch(/^linear\(0, [\d., -]+, 1\)$/)
    expect(springEasing(0.25, 20).split(",").length).toBe(21)
  })
})

describe("motion fields", () => {
  it("clamps hostile input", () => {
    const m = normalizeMotion({ speed: 99, bounce: -4, travel: NaN, hover: 9, stagger: -1, reduce: "x" as never })
    expect(m.speed).toBe(MOTION_RANGES.speed.max)
    expect(m.bounce).toBe(0)
    expect(m.travel).toBe(MOTION_RANGES.travel.min)
    expect(m.hover).toBe(MOTION_RANGES.hover.max)
    expect(m.stagger).toBe(0)
    expect(m.reduce).toBe("system")
  })
  it("makes the default feel the same as before motion was a theme field", () => {
    const v = motionValues(DEFAULT_MOTION)
    expect(v.duration).toEqual({ fast: 0.14, base: 0.22, slow: 0.32, reveal: 0.6 })
  })
  it("scales every duration with speed", () => {
    const fast = motionValues({ speed: 2 })
    expect(fast.duration.base).toBeCloseTo(0.11, 3)
    expect(fast.step).toBeCloseTo(0.025, 3)
  })
  it("has five distinct personalities, and the first is the default", () => {
    expect(MOTION_PERSONALITIES.map((p) => p.slug)).toEqual(["native", "calm", "snappy", "playful", "still"])
    expect(MOTION_PERSONALITIES[0]!.motion).toEqual(DEFAULT_MOTION)
    expect(new Set(MOTION_PERSONALITIES.map((p) => JSON.stringify(p.motion))).size).toBe(5)
    for (const p of MOTION_PERSONALITIES) {
      expect(normalizeMotion(p.motion)).toEqual(p.motion)
      expect(matchPersonality(p.motion)?.slug).toBe(p.slug)
    }
  })
})

describe("motion in the theme", () => {
  it("points Tailwind's duration, delay and easing scales at the variables", () => {
    const { theme, light } = buildTheme(DEFAULT_SPEC)
    expect(theme["transition-duration-150"]).toBe("calc(150ms / var(--bm-speed))")
    expect(theme["transition-delay-300"]).toBe("calc(300ms / var(--bm-speed))")
    expect(theme["ease-spring"]).toBe("var(--bm-ease-spring)")
    expect(light["bm-speed"]).toBe("1")
    expect(light["bm-ease-out"]).toBe("cubic-bezier(0.22, 1, 0.36, 1)")
    expect(light["bm-ease-spring"]).toMatch(/^linear\(/)
    expect(light["bm-ambient-state"]).toBe("running")
  })
  it("keeps the variable names the earlier theme used", () => {
    const { light } = buildTheme(DEFAULT_SPEC)
    for (const k of ["bm-ease-out", "bm-ease-in-out", "bm-duration-fast", "bm-duration-base", "bm-duration-slow"]) expect(light[k], k).toBeTruthy()
  })
  it("restates only what changes for reduced motion", () => {
    const { reducedMotion } = buildTheme(DEFAULT_SPEC)
    expect(reducedMotion["bm-speed"]).toBe("2")
    expect(reducedMotion["bm-travel"]).toBe("0")
    expect(reducedMotion["bm-ambient-state"]).toBe("paused")
    expect(reducedMotion["bm-ease-out"]).toBeUndefined()
    expect(themeCss(DEFAULT_SPEC)).toContain("@media (prefers-reduced-motion: reduce)")
  })
  it("a theme that is already still ships the reduced values to everyone and needs no media rule", () => {
    const still = MOTION_PERSONALITIES.find((p) => p.slug === "still")!
    const v = buildTheme({ ...still.motion })
    expect(v.light["bm-travel"]).toBe("0")
    expect(v.light["bm-ambient"]).toBe("0")
    expect(v.reducedMotion).toEqual({})
    expect(themeCss({ ...still.motion })).not.toContain("prefers-reduced-motion")
  })
  it("reduced motion never removes the ability to see state change: speed rises, it does not become zero", () => {
    const r = motionVars({ speed: 0.5 }).reduced
    expect(Number(r["bm-speed"])).toBeGreaterThanOrEqual(2)
    expect(reducedMotionCss({})).toBe("")
  })
  it("puts the reduced rule into registry items as an at-rule", () => {
    const item = themeRegistryItem(DEFAULT_SPEC, { name: "theme-custom", title: "Custom", description: "A custom theme." }) as { css?: Record<string, Record<string, Record<string, string>>> }
    expect(item.css?.["@media (prefers-reduced-motion: reduce)"]?.[":root"]?.["--bm-travel"]).toBe("0")
  })
  it("gives each preset the feel of its colours", () => {
    const by = Object.fromEntries(PRESETS.map((p) => [p.slug, p]))
    expect(by.graphite!.motion).toBe("snappy")
    expect(by.violet!.motion).toBe("playful")
    expect(by.sand!.motion).toBe("calm")
    expect(by.ocean!.motion).toBe("native")
    for (const p of PRESETS) expect(matchPersonality(p.spec)?.slug).toBe(p.motion)
  })
})

describe("motion in links", () => {
  it("adds nothing for the default feel", () => {
    expect(encodeSpec(DEFAULT_SPEC).toString()).toBe("")
  })
  it("uses one short word for a ready-made personality", () => {
    const params = encodeSpec({ ...DEFAULT_SPEC, ...MOTION_PERSONALITIES[3]!.motion })
    expect(params.toString()).toBe("mo=playful")
    expect(decodeSpec(params)).toEqual(normalizeSpec({ ...MOTION_PERSONALITIES[3]!.motion }))
  })
  it("round-trips custom values and booleans", () => {
    const spec = normalizeSpec({ hue: 30, speed: 1.35, bounce: 0.6, travel: 0.4, hover: 1.8, stagger: 0.2, ambient: false, reduce: "always" })
    const params = encodeSpec(spec)
    expect(params.get("am")).toBe("0")
    expect(decodeSpec(params)).toEqual(spec)
  })
  it("lets a single field override a personality", () => {
    const spec = decodeSpec(new URLSearchParams("mo=calm&sp=1.2"))
    expect(spec.speed).toBe(1.2)
    expect(spec.bounce).toBe(0)
  })
  it("ignores junk", () => {
    const spec = decodeSpec(new URLSearchParams("mo=wild&sp=abc&am=maybe&rm=never"))
    expect(spec.speed).toBe(1)
    expect(spec.reduce).toBe("system")
  })
})

describe("overlay animations", () => {
  it("covers tw-animate-css's enter, exit, accordion and collapsible animations and divides their duration by speed", () => {
    expect(Object.keys(ANIMATE_THEME)).toEqual(["animate-in", "animate-out", "animate-accordion-down", "animate-accordion-up", "animate-collapsible-down", "animate-collapsible-up"])
    for (const v of Object.values(ANIMATE_THEME)) expect(v).toContain("/ var(--bm-speed)")
  })
  it("puts them in the theme", () => {
    expect(buildTheme(DEFAULT_SPEC).theme["animate-in"]).toBe(ANIMATE_THEME["animate-in"])
  })
})

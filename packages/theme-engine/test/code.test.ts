import { describe, expect, it } from "vitest"

import {
  auditTheme,
  buildTheme,
  decodeCode,
  DEFAULT_SPEC,
  encodeCode,
  FONT_CHOICES,
  FONT_FACES,
  FEELS,
  isCode,
  normalizeSpec,
  parseParts,
  PRESET_PARTS,
  PRESETS,
  presetRegistryItem,
  snapSpec,
  SYSTEMS,
  themeRegistryItem,
} from "../src"

/** A tiny seeded generator, so a failure can be reproduced. */
function rng(seed: number) {
  let s = seed
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
}

describe("preset codes", () => {
  it("are 16 characters, in four groups of four", () => {
    expect(encodeCode(DEFAULT_SPEC)).toMatch(/^[0-9a-hjkmnp-tv-z]{4}(-[0-9a-hjkmnp-tv-z]{4}){3}$/)
    expect(encodeCode(DEFAULT_SPEC, { dashes: false })).toHaveLength(16)
  })

  it("round-trip every theme, every system and every feel exactly", () => {
    for (const p of PRESETS) expect(decodeCode(encodeCode(p.spec))).toEqual(p.spec)
    for (const s of SYSTEMS) expect(decodeCode(s.code)).toEqual(s.spec)
    for (const f of FEELS) {
      const spec = normalizeSpec({ ...DEFAULT_SPEC, ...f.spec, feel: f.slug })
      expect(decodeCode(encodeCode(spec))).toEqual(snapSpec(spec))
    }
  })

  it("round-trip two thousand random specs that sit on the builder's steps", () => {
    const r = rng(7)
    const pick = <T,>(list: readonly T[]) => list[Math.floor(r() * list.length)]!
    const step = (min: number, size: number, count: number) => Number((min + Math.floor(r() * count) * size).toFixed(4))
    for (let i = 0; i < 2000; i++) {
      const spec = normalizeSpec({
        hue: Math.floor(r() * 360),
        chroma: step(0, 0.005, 53),
        neutralHue: Math.floor(r() * 360),
        neutralChroma: step(0, 0.001, 31),
        radius: step(0, 0.025, 61),
        primary: pick(["brand", "ink"] as const),
        paper: r() < 0.5,
        edge: pick(["soft", "strong"] as const),
        density: pick(["compact", "default", "comfortable"] as const),
        font: pick(FONT_CHOICES),
        feel: pick(["web", "macos", "ios", "windows"] as const),
        speed: step(0.5, 0.05, 41),
        bounce: step(0, 0.05, 21),
        travel: step(0, 0.05, 41),
        hover: step(0, 0.05, 41),
        stagger: step(0, 0.05, 41),
        ambient: r() < 0.5,
        reduce: pick(["system", "always"] as const),
      })
      const code = encodeCode(spec)
      expect(decodeCode(code), code).toEqual(spec)
    }
  })

  it("snap off-grid values to the nearest step and stay safe", () => {
    const snapped = snapSpec({ hue: 262.4, chroma: 0.1976, radius: 0.61, speed: 1.02 })
    expect(snapped.hue).toBe(262)
    expect(snapped.chroma).toBe(0.2)
    expect(snapped.radius).toBe(0.6)
    expect(snapped.speed).toBe(1)
    expect(decodeCode(encodeCode(snapped))).toEqual(snapped)
  })

  it("read lower case, upper case, spaces and the letters that look like digits", () => {
    const code = encodeCode(SYSTEMS[0]!.spec)
    expect(decodeCode(code.toUpperCase())).toEqual(SYSTEMS[0]!.spec)
    expect(decodeCode(code.replace(/-/g, " "))).toEqual(SYSTEMS[0]!.spec)
    expect(decodeCode(code.replace(/0/g, "o").replace(/1/g, "l"))).toEqual(SYSTEMS[0]!.spec)
    expect(decodeCode(code.replace(/-/g, ""))).toEqual(SYSTEMS[0]!.spec)
  })

  it("reject what is not a code, and catch a mistyped character", () => {
    expect(isCode("hello")).toBe(false)
    expect(decodeCode("hello")).toBeNull()
    expect(decodeCode("")).toBeNull()
    expect(decodeCode("zzzz-zzzz-zzzz-zzzz")).toBeNull()
    const code = encodeCode(SYSTEMS[1]!.spec, { dashes: false })
    const alphabet = "0123456789abcdefghjkmnpqrstvwxyz"
    let caught = 0
    let tried = 0
    for (let i = 0; i < code.length; i++) {
      for (const ch of alphabet) {
        if (ch === code[i]) continue
        tried++
        const typo = code.slice(0, i) + ch + code.slice(i + 1)
        const spec = decodeCode(typo)
        if (spec === null || JSON.stringify(spec) !== JSON.stringify(SYSTEMS[1]!.spec)) caught++
      }
    }
    // A wrong character never decodes to the same theme; most also fail the check outright.
    expect(caught).toBe(tried)
  })

  it("give every system its own code, and the codes never change", () => {
    expect(new Set(SYSTEMS.map((s) => s.code)).size).toBe(SYSTEMS.length)
    // Pinned: a code published today must keep meaning the same. If this fails, a field order or radix changed.
    expect(encodeCode(DEFAULT_SPEC)).toBe("2c3m-0wqs-fw2m-f3rw")
  })

  it("keep the font list append-only", () => {
    expect(FONT_CHOICES.slice(0, 6)).toEqual(["keep", "system", "serif", "mono", "inter", "geist"])
    expect(FONT_CHOICES).toHaveLength(4 + FONT_FACES.length)
    expect(FONT_CHOICES.length).toBeLessThanOrEqual(32)
  })
})

describe("preset systems", () => {
  it("are fifteen, unique, and described", () => {
    expect(SYSTEMS).toHaveLength(15)
    expect(new Set(SYSTEMS.map((s) => s.slug)).size).toBe(15)
    for (const s of SYSTEMS) {
      expect(s.description.length, s.slug).toBeGreaterThanOrEqual(40)
      expect(s.description.length, s.slug).toBeLessThanOrEqual(240)
      expect(s.suits.length).toBeGreaterThanOrEqual(2)
      expect(normalizeSpec(s.spec)).toEqual(s.spec)
    }
  })

  for (const s of SYSTEMS) {
    it(`${s.slug}: every text and graphic pairing passes WCAG in light and dark`, () => {
      const failures = auditTheme(buildTheme(s.spec)).filter((c) => !c.pass)
      expect(failures.map((f) => `${f.mode} ${f.label} ${f.ratio} < ${f.min}`)).toEqual([])
    })
  }
})

describe("preset registry items", () => {
  const info = { name: "preset-x", title: "X", description: "A preset for tests.", registry: "https://ui.ballmac.com" }

  it("with every part carry what a theme item does", () => {
    for (const s of SYSTEMS) {
      const preset = presetRegistryItem(s.spec, info)
      const theme = themeRegistryItem(s.spec, info)
      expect(preset.cssVars).toEqual(theme.cssVars)
      expect(preset.css).toEqual(theme.css)
    }
  })

  it("depend on the font item only when the font is an installable typeface", () => {
    expect(presetRegistryItem({ ...DEFAULT_SPEC, font: "inter" }, info).registryDependencies).toEqual(["https://ui.ballmac.com/r/font-inter.json"])
    expect(presetRegistryItem({ ...DEFAULT_SPEC, font: "system" }, info)).not.toHaveProperty("registryDependencies")
    expect(presetRegistryItem({ ...DEFAULT_SPEC, font: "keep" }, info)).not.toHaveProperty("registryDependencies")
    expect(presetRegistryItem({ ...DEFAULT_SPEC, font: "inter" }, { ...info, parts: ["colors"] })).not.toHaveProperty("registryDependencies")
  })

  it("keep each part to its own variables", () => {
    const spec = SYSTEMS.find((s) => s.slug === "menubar")!.spec
    const only = (...parts: Parameters<typeof presetRegistryItem>[1]["parts"] & string[]) => presetRegistryItem(spec, { ...info, parts: parts as never })
    const colors = only("colors")
    expect(Object.keys(colors.cssVars.light ?? {})).toContain("background")
    expect(colors.cssVars.light).not.toHaveProperty("radius")
    expect(colors.cssVars.light).not.toHaveProperty("bm-speed")
    expect(colors).not.toHaveProperty("css")
    const shape = only("shape")
    expect(Object.keys(shape.cssVars.light ?? {})).toEqual(["radius"])
    expect(shape.cssVars.dark).toBeUndefined()
    const motion = only("motion")
    expect(motion.cssVars.light).toHaveProperty("bm-speed")
    expect(motion.cssVars.light).not.toHaveProperty("background")
    const feel = only("feel")
    expect(feel.cssVars.light).toHaveProperty("bm-control-h")
    expect(feel.css).toBeDefined()
    expect(only("font").cssVars.theme).toEqual({ "font-sans": expect.stringContaining("ui-sans-serif") })
  })

  it("parse the only filter", () => {
    expect(parseParts(null)).toBeNull()
    expect(parseParts("")).toBeNull()
    expect(parseParts("colors, Font,colors")).toEqual(["colors", "font"])
    expect(() => parseParts("colors,nope")).toThrow(/Unknown part "nope"/)
    expect(PRESET_PARTS).toHaveLength(5)
  })
})

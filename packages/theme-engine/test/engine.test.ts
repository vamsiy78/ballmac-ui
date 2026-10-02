import { describe, expect, it } from "vitest"

import { auditTheme, buildTheme, DEFAULT_SPEC, decodeSpec, encodeSpec, normalizeSpec, PRESETS, themeCss, themeRegistryItem } from "../src"
import { contrast, format, parse } from "../src/color"

describe("colour math", () => {
  it("measures contrast like WCAG", () => {
    expect(contrast({ l: 1, c: 0, h: 0 }, { l: 0, c: 0, h: 0 })).toBeCloseTo(21, 0)
    expect(contrast({ l: 1, c: 0, h: 0 }, { l: 1, c: 0, h: 0 })).toBe(1)
  })
  it("round-trips the strings it writes", () => {
    const text = format({ l: 0.62, c: 0.19, h: 262 })
    expect(text).toBe("oklch(0.62 0.19 262)")
    expect(parse(text)).toEqual({ l: 0.62, c: 0.19, h: 262 })
  })
  it("keeps colours inside sRGB by lowering chroma", () => {
    const c = parse(format({ l: 0.95, c: 0.3, h: 150 }))!
    expect(c.c).toBeLessThan(0.3)
  })
})

describe("presets", () => {
  it("has twelve unique, valid presets", () => {
    expect(PRESETS).toHaveLength(12)
    expect(new Set(PRESETS.map((p) => p.slug)).size).toBe(12)
    for (const p of PRESETS) {
      expect(p.description.length).toBeGreaterThanOrEqual(20)
      expect(p.description.length).toBeLessThanOrEqual(240)
      expect(normalizeSpec(p.spec)).toEqual(p.spec)
    }
  })

  for (const preset of PRESETS) {
    it(`${preset.slug}: every text and graphic pairing passes WCAG in light and dark`, () => {
      const failures = auditTheme(buildTheme(preset.spec)).filter((c) => !c.pass)
      expect(failures.map((f) => `${f.mode} ${f.label} ${f.ratio} < ${f.min}`)).toEqual([])
    })
    it(`${preset.slug}: defines every token the components read`, () => {
      const v = buildTheme(preset.spec)
      for (const mode of [v.light, v.dark])
        for (const key of ["background", "foreground", "card", "popover", "primary", "primary-foreground", "secondary", "muted", "muted-foreground", "accent", "destructive", "border", "input", "ring", "chart-1", "chart-5"])
          expect(mode[key], key).toMatch(/^oklch\(/)
      expect(v.light.radius).toMatch(/rem$/)
    })
  }
})

describe("any spec stays accessible", () => {
  it("passes across a sweep of hues, intensities and styles", () => {
    const failures: string[] = []
    for (let hue = 0; hue < 360; hue += 20) {
      for (const chroma of [0, 0.05, 0.12, 0.2, 0.26]) {
        for (const primary of ["brand", "ink"] as const) {
          for (const paper of [false, true]) {
            const spec = { ...DEFAULT_SPEC, hue, chroma, primary, paper, neutralHue: hue }
            for (const c of auditTheme(buildTheme(spec)).filter((x) => !x.pass)) failures.push(`h${hue} c${chroma} ${primary} paper:${paper} ${c.mode} ${c.label} ${c.ratio}`)
          }
        }
      }
    }
    expect(failures).toEqual([])
  })
})

describe("output", () => {
  it("only emits density and font when they are changed", () => {
    expect(buildTheme(DEFAULT_SPEC).theme).toEqual({})
    expect(buildTheme({ density: "compact", font: "serif" }).theme).toMatchObject({ spacing: "0.225rem" })
    expect(themeCss(DEFAULT_SPEC)).not.toContain("@theme")
    expect(themeCss({ font: "mono" })).toContain("@theme inline")
  })
  it("makes a registry item the CLI accepts", () => {
    const item = themeRegistryItem(DEFAULT_SPEC, { name: "theme-custom", title: "Custom", description: "A custom theme." })
    expect(item.type).toBe("registry:theme")
    expect(Object.keys(item.cssVars.light)).toContain("chart-3")
  })
  it("clamps hostile input", () => {
    const s = normalizeSpec({ hue: 9999, chroma: 5, radius: -3, neutralChroma: NaN, primary: "x" as never })
    expect(s.chroma).toBe(0.26)
    expect(s.radius).toBe(0)
    expect(s.neutralChroma).toBe(0)
    expect(s.primary).toBe("ink")
    expect(s.hue).toBeLessThan(360)
  })
  it("round-trips through URL parameters", () => {
    const spec = normalizeSpec({ hue: 120, chroma: 0.1, radius: 1, primary: "brand", paper: true, density: "compact", font: "serif", edge: "strong" })
    expect(decodeSpec(encodeSpec(spec))).toEqual(spec)
    expect(encodeSpec(DEFAULT_SPEC).toString()).toBe("")
  })
})

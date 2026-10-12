import { describe, expect, it } from "vitest"

import { auditTheme, feelRules, forcedColorsRule, focusRule, FOCUS_SELECTOR, FOCUS_WITHIN_SELECTOR, buildTheme, decodeSpec, DEFAULT_SPEC, encodeSpec, feelSpec, feelVars, FEELS, getFeel, matchPersonality, normalizeFeel, normalizeSpec, themeCss, themeRegistryItem } from "../src"

const rem = (v: string) => (v.endsWith("rem") ? Number.parseFloat(v) * 16 : Number.parseFloat(v))

describe("feels", () => {
  it("are web, macOS, iOS and Windows, with web first", () => {
    expect(FEELS.map((f) => f.slug)).toEqual(["web", "macos", "ios", "windows"])
    for (const f of FEELS) {
      expect(f.description.length).toBeGreaterThanOrEqual(20)
      expect(f.description.length).toBeLessThanOrEqual(300)
    }
  })

  it("every feel emits the same variables, so one page can switch between them", () => {
    const keys = Object.keys(feelVars("web").root).sort()
    for (const f of FEELS) {
      expect(Object.keys(feelVars(f.slug).root).sort()).toEqual(keys)
      expect(Object.keys(feelVars(f.slug).theme).sort()).toEqual(Object.keys(feelVars("web").theme).sort())
    }
  })

  it("web is today's look: Tailwind's own shadows, text scale and 36 px controls", () => {
    const v = feelVars("web").root
    expect(v["bm-shadow-sm"]).toBe("0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)")
    expect(v["bm-text-sm"]).toBe("0.875rem")
    expect(v["bm-focus-width"]).toBe("3px")
    expect(v["bm-focus-alpha"]).toBe("50%")
    expect(v["bm-control-h"]).toBe("calc(var(--spacing) * 9)")
    expect(feelSpec("web")).toMatchObject({ radius: 0.625, density: "default", font: "keep", speed: 1, bounce: 0.25 })
  })

  for (const f of FEELS) {
    describe(f.slug, () => {
      const t = f.tokens
      it("keeps every control at least 24 px, the WCAG 2.5.8 minimum", () => {
        // web controls are written in spacing units (9, 8 and 11 steps of 4 px by default)
        const px = (h: string) => (h.startsWith("calc(var(--spacing) * ") ? Number.parseFloat(h.slice(22)) * 4 : rem(h))
        for (const h of [t.control.h, t.control.hSm, t.control.hLg]) expect(px(h)).toBeGreaterThanOrEqual(24)
      })
      it("draws a focus indicator of at least 2 px", () => {
        expect(rem(t.focus.width)).toBeGreaterThanOrEqual(2)
      })
      it("has a spec that is already valid", () => {
        const spec = normalizeSpec({ ...DEFAULT_SPEC, ...feelSpec(f.slug) })
        expect(spec.feel).toBe(f.slug)
        expect(normalizeSpec(spec)).toEqual(spec)
      })
      it("stays accessible: every text and graphic pairing passes", () => {
        const spec = normalizeSpec({ ...DEFAULT_SPEC, ...feelSpec(f.slug) })
        expect(auditTheme(buildTheme(spec)).filter((c) => !c.pass)).toEqual([])
      })
      it("writes only variables and valid CSS values", () => {
        for (const [k, v] of Object.entries(feelVars(f.slug).root)) {
          expect(k).toMatch(/^bm-[a-z0-9-]+$/)
          expect(v.length).toBeGreaterThan(0)
          expect(v).not.toMatch(/[;{}<>]/)
        }
      })
    })
  }

  it("iOS has 44 px targets and dims on press; Windows has a crisp full-strength outline; macOS is compact", () => {
    expect(rem(getFeel("ios")!.tokens.control.target)).toBe(44)
    expect(getFeel("ios")!.tokens.pressDim).toBe("0.6")
    expect(getFeel("windows")!.tokens.focus).toMatchObject({ width: "2px", alpha: "100%" })
    expect(rem(getFeel("macos")!.tokens.control.h)).toBe(28)
    expect(rem(getFeel("windows")!.tokens.control.h)).toBe(32)
    expect(getFeel("windows")!.controls).toBe("right")
    expect(getFeel("macos")!.controls).toBe("left")
  })

  it("brings a motion personality that suits each feel", () => {
    expect(matchPersonality(normalizeSpec({ ...DEFAULT_SPEC, ...feelSpec("macos") }))?.slug).toBe("native")
    expect(feelSpec("windows").bounce).toBe(0)
    expect(feelSpec("ios").hover).toBe(0)
  })

  it("normalises junk to web", () => {
    expect(normalizeFeel("beos")).toBe("web")
    expect(normalizeSpec({ feel: "x" as never }).feel).toBe("web")
  })
})

describe("feels in the theme output", () => {
  it("point Tailwind's shadow and text scales at the variables, and set the feel's values", () => {
    const v = buildTheme(normalizeSpec({ ...DEFAULT_SPEC, ...feelSpec("windows") }))
    expect(v.theme["shadow-sm"]).toBe("var(--bm-shadow-sm)")
    expect(v.theme["text-sm--line-height"]).toBe("var(--bm-text-sm-lh)")
    expect(v.light["bm-focus-width"]).toBe("2px")
    expect(v.light.radius).toBe("0.25rem")
    expect(themeCss(feelSpec("macos") as never)).toContain("--bm-control-h: 1.75rem")
  })
  it("reach registry items", () => {
    const item = themeRegistryItem(normalizeSpec({ ...DEFAULT_SPEC, ...feelSpec("ios") }), { name: "theme-custom", title: "Custom", description: "A custom theme." })
    expect(item.cssVars.light["bm-press-dim"]).toBe("0.6")
  })
})

describe("feels in links", () => {
  it("add nothing for web and one short word otherwise", () => {
    expect(encodeSpec(DEFAULT_SPEC).toString()).toBe("")
    expect(encodeSpec({ ...DEFAULT_SPEC, ...feelSpec("macos") }).toString()).toBe("fe=macos")
    expect(encodeSpec({ ...DEFAULT_SPEC, ...feelSpec("windows") }).toString()).toBe("fe=windows")
  })
  it("round-trip, including changes made after picking a feel", () => {
    for (const f of FEELS) {
      const picked = normalizeSpec({ ...DEFAULT_SPEC, ...feelSpec(f.slug) })
      expect(decodeSpec(encodeSpec(picked))).toEqual(picked)
      const tweaked = normalizeSpec({ ...picked, hue: 140, radius: 0.5, speed: 1.7, ambient: false })
      expect(decodeSpec(encodeSpec(tweaked))).toEqual(tweaked)
    }
  })
  it("name a personality only when motion differs from the feel's own", () => {
    const calmWindows = normalizeSpec({ ...DEFAULT_SPEC, ...feelSpec("windows"), speed: 0.75, bounce: 0, travel: 0.7, hover: 0.5, stagger: 1.4 })
    const p = encodeSpec(calmWindows)
    expect(p.get("fe")).toBe("windows")
    expect(p.get("mo")).toBe("calm")
    expect(decodeSpec(p)).toEqual(calmWindows)
  })
  it("ignore junk", () => {
    expect(decodeSpec(new URLSearchParams("fe=amiga")).feel).toBe("web")
    expect(decodeSpec(new URLSearchParams("fe=ios&r=0.9")).radius).toBe(0.9)
    expect(decodeSpec(new URLSearchParams("fe=ios")).radius).toBe(0.75)
  })
})

describe("focus rule", () => {
  it("is one unlayered rule over shadcn's standard focus classes, reading the focus tokens", () => {
    const r = focusRule()[FOCUS_SELECTOR]!
    expect(FOCUS_SELECTOR).toBe('[class*="focus-visible:ring-[3px]"]:focus-visible')
    expect(r["--tw-ring-color"]).toContain("var(--bm-focus-alpha, 50%)")
    expect(r["--tw-ring-shadow"]).toContain("var(--bm-focus-width, 3px)")
    expect(focusRule()[FOCUS_WITHIN_SELECTOR]).toEqual(r)
  })
})

describe("feel rules", () => {
  it("add the scrollbar style in the base layer, so utilities still win", () => {
    expect(feelRules()["@layer base"]).toEqual({ "*": { "scrollbar-width": "var(--bm-scrollbar-width, auto)" } })
  })
})

describe("forced colours", () => {
  it("give keyboard focus an outline and a button an edge, in system colours, because box-shadow rings vanish", () => {
    const block = forcedColorsRule()["@media (forced-colors: active)"]!
    expect(block['[class*="focus-visible:ring"]:focus-visible']).toMatchObject({ outline: "2px solid Highlight" })
    expect(block['[data-slot="button"]']).toMatchObject({ border: "1px solid ButtonText" })
    expect(themeCss({ feel: "macos" } as never)).toContain("@media (forced-colors: active)")
  })
})

import { auditTheme, buildTheme } from "@ballmac-ui/theme-engine"
import { describe, expect, it } from "vitest"

import { allThemes, oklchToHex, parseOklch, themeTokens } from "../../../scripts/figma-tokens"

const hexToRgb = (hex: string) => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255)
const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
const lum = (hex: string) => {
  const [r, g, b] = hexToRgb(hex).map(lin) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a: string, b: string) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05)

describe("oklch to hex", () => {
  it("converts anchors", () => {
    expect(oklchToHex({ l: 1, c: 0, h: 0 })).toBe("#ffffff")
    expect(oklchToHex({ l: 0, c: 0, h: 0 })).toBe("#000000")
    expect(oklchToHex({ l: 0.5, c: 0, h: 0 })).toBe("#636363")
  })
  it("writes alpha as a last byte", () => {
    expect(oklchToHex({ l: 1, c: 0, h: 0 }, 0.11)).toBe("#ffffff1c")
  })
  it("parses plain and alpha colours and rejects other formats", () => {
    expect(parseOklch("oklch(0.5 0.1 200)")).toEqual({ color: { l: 0.5, c: 0.1, h: 200 }, alpha: 1 })
    expect(parseOklch("oklch(1 0 0 / 11%)")?.alpha).toBeCloseTo(0.11)
    expect(parseOklch("#fff")).toBeNull()
  })
})

describe("theme tokens", () => {
  const themes = allThemes()

  it("covers the default theme and all twelve presets", () => {
    expect(themes).toHaveLength(13)
  })

  for (const t of themes) {
    it(`${t.slug}: complete, valid hex and the contrast the engine promises`, () => {
      const vars = buildTheme(t.spec)
      const tokens = themeTokens(t.slug, t.title, vars, t.description)
      for (const mode of ["light", "dark"] as const) {
        const group = tokens.color[mode] as Record<string, { $value: string } & Record<string, unknown>>
        for (const name of ["background", "foreground", "primary", "primary-foreground", "border", "ring", "destructive"]) expect(group[name], `${mode} ${name}`).toBeTruthy()
        const flat = Object.values(group).flatMap((v) => ("$value" in v ? [v] : Object.values(v as unknown as Record<string, { $value: string }>)))
        expect(flat.length).toBeGreaterThanOrEqual(22)
        for (const v of flat) expect(v.$value).toMatch(/^#[0-9a-f]{6}([0-9a-f]{2})?$/)
      }
      // Rounding to 8-bit hex must not break the text pairs the theme engine audits.
      let measured = 0
      for (const check of auditTheme(vars)) {
        const get = (name: string) => {
          const group = tokens.color[check.mode] as Record<string, unknown>
          const chart = name.match(/^chart-(\d)$/)
          const node = chart ? (group.chart as Record<string, { $value: string }>)[chart[1]!] : (group[name] as { $value: string })
          return node!.$value
        }
        const fg = get(check.foreground)
        const bg = get(check.background)
        expect(fg).toHaveLength(7)
        expect(bg).toHaveLength(7)
        expect(ratio(fg, bg), `${t.slug} ${check.mode} ${check.label}`).toBeGreaterThanOrEqual(check.min - 0.1)
        measured++
      }
      expect(measured).toBe(32) // 16 audited pairs in each of two modes
    })
  }

  it("derives the radius scale from the theme radius", () => {
    const t = themeTokens("x", "X", buildTheme({ radius: 0.75 }), "")
    expect([t.radius.sm.$value, t.radius.md.$value, t.radius.lg.$value, t.radius.xl.$value]).toEqual(["8px", "10px", "12px", "16px"])
  })

  it("keeps the original colour and CSS variable on every token", () => {
    const t = themeTokens("x", "X", buildTheme({}), "")
    const bg = t.color.light.background as { $extensions: { ballmac: { oklch: string; cssVariable: string } } }
    expect(bg.$extensions.ballmac).toEqual({ oklch: expect.stringMatching(/^oklch\(/), cssVariable: "--background" })
  })
})

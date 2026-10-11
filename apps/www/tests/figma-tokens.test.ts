import { auditTheme, buildTheme, FEELS } from "@ballmac-ui/theme-engine"
import { describe, expect, it } from "vitest"

import { allThemes, feelTokens, lengthPx, oklchToHex, parseOklch, parseShadow, themeTokens } from "../../../scripts/figma-tokens"

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

describe("feel tokens", () => {
  it("converts the lengths feels use", () => {
    expect(lengthPx("0.875rem")).toBe(14)
    expect(lengthPx("3px")).toBe(3)
    expect(lengthPx("calc(var(--spacing) * 9)")).toBe(36)
    expect(() => lengthPx("auto")).toThrow()
  })

  it("splits a box-shadow list into W3C shadow layers", () => {
    const layers = parseShadow("0 0 2px rgb(0 0 0 / 0.12), 0 1px 3px -1px rgb(0 0 0 / 0.5)")
    expect(layers).toHaveLength(2)
    expect(layers[0]).toEqual({ color: "#0000001f", offsetX: "0px", offsetY: "0px", blur: "2px", spread: "0px" })
    expect(layers[1]).toMatchObject({ offsetY: "1px", blur: "3px", spread: "-1px", color: "#00000080" })
    expect(parseShadow("0 0 0 0.5px rgb(0 0 0 / 0.06)")[0]).toMatchObject({ spread: "0.5px" })
    expect(() => parseShadow("inset foo")).toThrow()
  })

  for (const f of FEELS) {
    it(`${f.slug}: has no colours, valid dimensions and a shadow for every step`, () => {
      const t = feelTokens(f) as unknown as Record<string, Record<string, unknown>>
      expect(t.color).toBeUndefined()
      expect(Object.keys(t.elevation!)).toEqual(["xs", "sm", "md", "lg", "xl", "2xl", "popover"])
      const walk = (node: unknown): void => {
        if (node && typeof node === "object" && "$type" in node) {
          const n = node as { $type: string; $value: unknown }
          if (n.$type === "dimension") expect(n.$value, JSON.stringify(n)).toMatch(/^-?[\d.]+px$/)
          if (n.$type === "shadow") expect(Array.isArray(n.$value) && (n.$value as unknown[]).length > 0).toBe(true)
        } else if (node && typeof node === "object") Object.values(node).forEach(walk)
      }
      walk(t)
    })
  }

  it("matches the engine: Windows controls are 32 px with a 2 px solid focus ring", () => {
    const t = feelTokens(FEELS.find((f) => f.slug === "windows")!) as { control: { height: { $value: string } }; focus: { width: { $value: string }; opacity: { $value: number } } }
    expect(t.control.height.$value).toBe("32px")
    expect(t.focus.width.$value).toBe("2px")
    expect(t.focus.opacity.$value).toBe(1)
  })
})


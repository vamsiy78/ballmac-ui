/**
 * Exports the Ballmac themes as W3C design tokens (DTCG format), ready to import into Figma variables.
 *
 *   pnpm figma:tokens [--out figma-kit/tokens]
 *
 * Writes one <theme>.tokens.json per preset (graphite, ocean, ...) plus the default theme, and index.json.
 * Colours are sRGB hex (Figma's native colour space); the original OKLCH value is kept in $extensions.ballmac.oklch.
 * Light and dark are separate groups, so each maps to a Figma variable mode.
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

import { buildTheme, DEFAULT_SPEC, fitGamut, PRESETS, type Oklch, type ThemeVars } from "@ballmac-ui/theme-engine"

const ROOT = join(import.meta.dirname, "..")

const byte = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 255)
const encode = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)
const hex2 = (n: number) => n.toString(16).padStart(2, "0")

/** OKLCH to sRGB hex (with alpha as the last byte when below 100%). Out-of-gamut colours keep lightness and hue. */
export function oklchToHex({ l, c, h }: Oklch, alpha = 1): string {
  const f = fitGamut({ l, c, h })
  const a = f.c * Math.cos((f.h * Math.PI) / 180)
  const b = f.c * Math.sin((f.h * Math.PI) / 180)
  const l_ = (f.l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m_ = (f.l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s_ = (f.l - 0.0894841775 * a - 1.291485548 * b) ** 3
  const rgb = [4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_, -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_, -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_]
  const out = `#${rgb.map((v) => hex2(byte(encode(Math.min(1, Math.max(0, v)))))).join("")}`
  return alpha < 1 ? out + hex2(byte(alpha)) : out
}

/** Parses `oklch(L C H)` and `oklch(L C H / A%)`. */
export function parseOklch(value: string): { color: Oklch; alpha: number } | null {
  const m = value.trim().match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)%\s*)?\)$/)
  return m ? { color: { l: Number(m[1]), c: Number(m[2]), h: Number(m[3]) }, alpha: m[4] ? Number(m[4]) / 100 : 1 } : null
}

const DESCRIPTIONS: Record<string, string> = {
  background: "Page background",
  foreground: "Default text",
  card: "Card and panel surface",
  "card-foreground": "Text on cards",
  popover: "Menus, popovers and dialogs",
  "popover-foreground": "Text in popovers",
  primary: "Main actions and brand colour",
  "primary-foreground": "Text on primary",
  secondary: "Quiet buttons and fills",
  "secondary-foreground": "Text on secondary",
  muted: "Subtle backgrounds",
  "muted-foreground": "Secondary text",
  accent: "Hover and selected backgrounds",
  "accent-foreground": "Text on accent",
  destructive: "Errors and destructive actions",
  border: "Borders and dividers",
  input: "Input borders",
  ring: "Focus ring",
}

const token = (type: string, value: unknown, description?: string, ext?: Record<string, unknown>) => ({
  $type: type,
  $value: value,
  ...(description ? { $description: description } : {}),
  ...(ext ? { $extensions: { ballmac: ext } } : {}),
})

function colorGroup(vars: Record<string, string>) {
  const group: Record<string, unknown> = {}
  for (const [name, value] of Object.entries(vars)) {
    if (name === "radius" || name === "spacing" || name === "font-sans") continue
    const parsed = parseOklch(value)
    if (!parsed) throw new Error(`Cannot convert "${name}: ${value}" (expected oklch)`)
    const key = name.replace(/^chart-(\d)$/, "chart.$1")
    const description = DESCRIPTIONS[name] ?? (name.startsWith("chart-") ? `Chart colour ${name.slice(6)}` : undefined)
    const t = token("color", oklchToHex(parsed.color, parsed.alpha), description, { oklch: value, cssVariable: `--${name}` })
    if (key.includes(".")) {
      const [g, k] = key.split(".") as [string, string]
      ;(group[g] ??= {} as Record<string, unknown>)
      ;(group[g] as Record<string, unknown>)[k] = t
    } else group[key] = t
  }
  return group
}

const rem = (v: string) => Number.parseFloat(v)

/** One theme as a DTCG token tree. */
export function themeTokens(slug: string, title: string, vars: ThemeVars, description: string) {
  const radius = rem(vars.light.radius ?? "0.625rem")
  const px = (r: number) => `${Math.round(r * 16 * 100) / 100}px`
  return {
    $description: `${title}: ${description}`,
    $extensions: { ballmac: { theme: slug, generator: "ballmac-ui figma:tokens", modes: ["light", "dark"] } },
    color: { light: colorGroup(vars.light), dark: colorGroup(vars.dark) },
    // Same scale the components use: sm = radius - 4px, md = radius - 2px, lg = radius, xl = radius + 4px.
    radius: {
      sm: token("dimension", px(radius - 0.25), "Small corners (checkboxes, chips)"),
      md: token("dimension", px(radius - 0.125), "Inputs and buttons"),
      lg: token("dimension", px(radius), "Cards"),
      xl: token("dimension", px(radius + 0.25), "Large cards and dialogs"),
      full: token("dimension", "9999px", "Pills and avatars"),
    },
    spacing: { unit: token("dimension", px(rem(vars.theme.spacing ?? "0.25rem")), "Tailwind spacing step; multiply for 2, 4, 8 and so on") },
    motion: {
      duration: {
        fast: token("duration", "140ms"),
        base: token("duration", "220ms"),
        slow: token("duration", "320ms"),
      },
      easing: {
        out: token("cubicBezier", [0.22, 1, 0.36, 1]),
        inOut: token("cubicBezier", [0.65, 0, 0.35, 1]),
      },
    },
    ...(vars.theme["font-sans"] ? { font: { sans: token("fontFamily", vars.theme["font-sans"].split(",").map((f) => f.trim().replace(/^"|"$/g, ""))) } } : {}),
  }
}

export function allThemes() {
  const base = { slug: "default", title: "Ballmac default", description: "The default Ballmac theme.", spec: DEFAULT_SPEC }
  return [base, ...PRESETS.map((p) => ({ slug: p.slug, title: p.title, description: p.description, spec: p.spec }))]
}

function main() {
  const flag = process.argv.indexOf("--out")
  const out = join(ROOT, flag > -1 ? process.argv[flag + 1]! : "figma-kit/tokens")
  mkdirSync(out, { recursive: true })
  const index: { slug: string; title: string; file: string; colors: number }[] = []
  for (const t of allThemes()) {
    const tokens = themeTokens(t.slug, t.title, buildTheme(t.spec), t.description)
    const file = `${t.slug}.tokens.json`
    writeFileSync(join(out, file), JSON.stringify(tokens, null, 2) + "\n")
    index.push({ slug: t.slug, title: t.title, file, colors: Object.keys(tokens.color.light).length })
  }
  writeFileSync(join(out, "index.json"), JSON.stringify({ format: "W3C design tokens (DTCG)", themes: index }, null, 2) + "\n")
  console.log(`✓ ${index.length} themes → ${out}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()

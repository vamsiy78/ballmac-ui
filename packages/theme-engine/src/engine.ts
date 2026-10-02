import { contrast, format, parse, solve, type Oklch } from "./color"

export type Density = "compact" | "default" | "comfortable"
export type FontChoice = "keep" | "system" | "serif" | "mono"

/** Everything a theme is made of. Colours are derived from these few numbers, so every result is accessible by construction. */
export type ThemeSpec = {
  /** Brand hue, 0-360 (OKLCH degrees). */
  hue: number
  /** Brand colour intensity: OKLCH chroma, 0 (grey) to 0.26. */
  chroma: number
  /** Hue the greys lean towards. */
  neutralHue: number
  /** How much colour the greys carry, 0 to 0.03. */
  neutralChroma: number
  /** Corner radius in rem, 0 to 1.5. */
  radius: number
  /** "brand": buttons use the brand colour. "ink": buttons are near-black (near-white in dark mode) and the brand colour is used for focus rings, charts and accents. */
  primary: "brand" | "ink"
  /** A warm off-white page instead of pure white in light mode. */
  paper: boolean
  /** "strong": borders and input outlines reach 3:1 contrast. */
  edge: "soft" | "strong"
  density: Density
  font: FontChoice
}

export const DEFAULT_SPEC: ThemeSpec = {
  hue: 262,
  chroma: 0.19,
  neutralHue: 265,
  neutralChroma: 0.006,
  radius: 0.625,
  primary: "ink",
  paper: false,
  edge: "soft",
  density: "default",
  font: "keep",
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(v) ? v : min))
const round = (v: number, d: number) => Number(v.toFixed(d))

/** Clamps every field into its valid range, so URL input and sliders can never produce an unsafe theme. */
export function normalizeSpec(input: Partial<ThemeSpec> = {}): ThemeSpec {
  const s = { ...DEFAULT_SPEC, ...input }
  return {
    hue: round(((s.hue % 360) + 360) % 360, 1),
    chroma: round(clamp(s.chroma, 0, 0.26), 3),
    neutralHue: round(((s.neutralHue % 360) + 360) % 360, 1),
    neutralChroma: round(clamp(s.neutralChroma, 0, 0.03), 4),
    radius: round(clamp(s.radius, 0, 1.5), 3),
    primary: s.primary === "brand" ? "brand" : "ink",
    paper: s.paper === true,
    edge: s.edge === "strong" ? "strong" : "soft",
    density: s.density === "compact" || s.density === "comfortable" ? s.density : "default",
    font: s.font === "system" || s.font === "serif" || s.font === "mono" ? s.font : "keep",
  }
}

export type ThemeVars = { theme: Record<string, string>; light: Record<string, string>; dark: Record<string, string> }

const SPACING: Record<Density, string | undefined> = { compact: "0.225rem", default: undefined, comfortable: "0.275rem" }
const FONTS: Record<FontChoice, string | undefined> = {
  keep: undefined,
  system: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
}
const CHART_OFFSETS = [0, 150, 75, 290, 215]

type Palette = Record<string, string>

function light(s: ThemeSpec): Palette {
  const { hue, chroma, neutralHue: nh, neutralChroma: nc } = s
  const bg: Oklch = { l: s.paper ? 0.978 : 1, c: s.paper ? Math.max(nc * 1.5, nc === 0 ? 0 : 0.01) : 0, h: nh }
  const card: Oklch = s.paper ? { l: 0.994, c: bg.c * 0.5, h: nh } : bg
  const nearWhite: Oklch = { l: 0.985, c: Math.min(nc * 0.5, 0.01), h: nh }
  const ink: Oklch = solve(nh, Math.min(nc * 3, 0.03), 0.2, -1, 12, [bg, card])
  const fg: Oklch = solve(nh, Math.min(nc * 2, 0.03), 0.17, -1, 12, [bg, card])
  const primary = s.primary === "ink" ? ink : solve(hue, chroma, 0.56, -1, 4.5, [bg, card, nearWhite])
  const secondary: Oklch = { l: 0.965, c: nc, h: nh }
  const muted = secondary
  const mutedFg = solve(nh, Math.min(nc * 2, 0.03), 0.5, -1, 4.5, [bg, card, muted])
  const accent: Oklch = { l: 0.955, c: chroma === 0 ? 0 : Math.min(chroma * 0.07, 0.03), h: hue }
  const border: Oklch = s.edge === "strong" ? solve(nh, nc, 0.7, -1, 3, [bg, card]) : { l: 0.915, c: nc, h: nh }
  const ring = solve(hue, chroma, 0.62, -1, 3, [bg, card])
  const destructive = solve(27, 0.22, 0.56, -1, 4.5, [bg, card, muted, nearWhite])
  const mono = chroma < 0.02
  const chartC = mono ? 0 : Math.min(Math.max(chroma * 0.85, 0.09), 0.19)
  const chartL = mono ? [0.2, 0.4, 0.56, 0.3, 0.48] : [0.6, 0.66, 0.7, 0.58, 0.64]
  const charts = CHART_OFFSETS.map((o, i) => solve(hue + o, chartC, chartL[i]!, -1, 3, [bg, card]))
  const p: Palette = {
    radius: `${s.radius}rem`,
    background: format(bg),
    foreground: format(fg),
    card: format(card),
    "card-foreground": format(fg),
    popover: format(card),
    "popover-foreground": format(fg),
    primary: format(primary),
    "primary-foreground": format(nearWhite),
    secondary: format(secondary),
    "secondary-foreground": format(ink),
    muted: format(muted),
    "muted-foreground": format(mutedFg),
    accent: format(accent),
    "accent-foreground": format(ink),
    destructive: format(destructive),
    border: format(border),
    input: format(border),
    ring: format(ring),
  }
  charts.forEach((c, i) => (p[`chart-${i + 1}`] = format(c)))
  return p
}

function dark(s: ThemeSpec): Palette {
  const { hue, chroma, neutralHue: nh, neutralChroma: nc } = s
  const bgC = nc === 0 ? 0 : Math.min(Math.max(nc * 3.3, 0.008), 0.035)
  const bg: Oklch = { l: nc === 0 ? 0.145 : 0.16, c: bgC, h: nh }
  const card: Oklch = { l: 0.2, c: bgC * 1.25, h: nh }
  const secondary: Oklch = { l: 0.25, c: bgC * 1.4, h: nh }
  const accent: Oklch = { l: 0.28, c: chroma === 0 ? 0 : Math.min(Math.max(chroma * 0.27, 0.01), 0.07), h: hue }
  const fg: Oklch = { l: 0.97, c: nc * 0.7, h: nh }
  const darkInk: Oklch = { l: 0.16, c: Math.min(bgC * 1.2, 0.03), h: s.primary === "brand" ? hue : nh }
  const primary = s.primary === "ink" ? fg : solve(hue, chroma, 0.74, 1, 4.5, [bg, card, darkInk])
  const primaryFg: Oklch = s.primary === "ink" ? card : darkInk
  const mutedFg = solve(nh, nc * 3.3, 0.72, 1, 4.5, [bg, card, secondary])
  const border: Oklch | null = s.edge === "strong" ? solve(nh, bgC, 0.5, 1, 3, [bg, card]) : null
  const ring = solve(hue, chroma, 0.66, 1, 3, [bg, card])
  const destructive = solve(25, 0.2, 0.66, 1, 4.5, [bg, card, secondary])
  const mono = chroma < 0.02
  const chartC = mono ? 0 : Math.min(Math.max(chroma * 0.8, 0.09), 0.18)
  const chartL = mono ? [0.9, 0.7, 0.55, 0.8, 0.62] : [0.7, 0.76, 0.8, 0.68, 0.74]
  const charts = CHART_OFFSETS.map((o, i) => solve(hue + o, chartC, chartL[i]!, 1, 3, [bg, card]))
  const p: Palette = {
    background: format(bg),
    foreground: format(fg),
    card: format(card),
    "card-foreground": format(fg),
    popover: format(card),
    "popover-foreground": format(fg),
    primary: format(primary),
    "primary-foreground": format(primaryFg),
    secondary: format(secondary),
    "secondary-foreground": format(fg),
    muted: format(secondary),
    "muted-foreground": format(mutedFg),
    accent: format(accent),
    "accent-foreground": format(fg),
    destructive: format(destructive),
    border: border ? format(border) : "oklch(1 0 0 / 11%)",
    input: border ? format(border) : "oklch(1 0 0 / 15%)",
    ring: format(ring),
  }
  charts.forEach((c, i) => (p[`chart-${i + 1}`] = format(c)))
  return p
}

/** Builds the CSS variables for a theme, in the shape shadcn registry items use. */
export function buildTheme(input: Partial<ThemeSpec> = {}): ThemeVars {
  const s = normalizeSpec(input)
  const theme: Record<string, string> = {}
  const spacing = SPACING[s.density]
  const font = FONTS[s.font]
  if (spacing) theme.spacing = spacing
  if (font) theme["font-sans"] = font
  return { theme, light: light(s), dark: dark(s) }
}

/** CSS to paste into globals.css. */
export function themeCss(input: Partial<ThemeSpec> = {}): string {
  const v = buildTheme(input)
  const block = (selector: string, vars: Record<string, string>) =>
    `${selector} {\n${Object.entries(vars).map(([k, val]) => `  --${k}: ${val};`).join("\n")}\n}`
  const out = [block(":root", v.light), block(".dark", v.dark)]
  if (Object.keys(v.theme).length) out.push(block("@theme inline", v.theme))
  return out.join("\n\n") + "\n"
}

export type RegistryThemeInfo = { name: string; title: string; description: string; docs?: string }

/** A shadcn `registry:theme` item, installable with `shadcn add`. */
export function themeRegistryItem(input: Partial<ThemeSpec>, info: RegistryThemeInfo) {
  const v = buildTheme(input)
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: info.name,
    type: "registry:theme",
    title: info.title,
    description: info.description,
    author: "Ballmac <https://ui.ballmac.com>",
    cssVars: { ...(Object.keys(v.theme).length ? { theme: v.theme } : {}), light: v.light, dark: v.dark },
    ...(info.docs ? { docs: info.docs } : {}),
  }
}

export type Check = { mode: "light" | "dark"; label: string; foreground: string; background: string; ratio: number; min: number; pass: boolean }

const PAIRS: { label: string; fg: string; bg: string; min: number }[] = [
  { label: "Text on page", fg: "foreground", bg: "background", min: 4.5 },
  { label: "Text on cards", fg: "card-foreground", bg: "card", min: 4.5 },
  { label: "Text in popovers", fg: "popover-foreground", bg: "popover", min: 4.5 },
  { label: "Button text", fg: "primary-foreground", bg: "primary", min: 4.5 },
  { label: "Primary used as text", fg: "primary", bg: "background", min: 4.5 },
  { label: "Secondary button text", fg: "secondary-foreground", bg: "secondary", min: 4.5 },
  { label: "Muted text on page", fg: "muted-foreground", bg: "background", min: 4.5 },
  { label: "Muted text on muted", fg: "muted-foreground", bg: "muted", min: 4.5 },
  { label: "Text on accent", fg: "accent-foreground", bg: "accent", min: 4.5 },
  { label: "Destructive text", fg: "destructive", bg: "background", min: 4.5 },
  { label: "Focus ring", fg: "ring", bg: "background", min: 3 },
  ...[1, 2, 3, 4, 5].map((n) => ({ label: `Chart ${n}`, fg: `chart-${n}`, bg: "background", min: 3 })),
]

/** Measures WCAG contrast for every text and graphic pairing a component uses. Works on any theme this package produced. */
export function auditTheme(vars: ThemeVars): Check[] {
  const checks: Check[] = []
  for (const mode of ["light", "dark"] as const) {
    const palette = vars[mode]
    for (const p of PAIRS) {
      const fg = parse(palette[p.fg] ?? "")
      const bg = parse(palette[p.bg] ?? "")
      if (!fg || !bg) continue
      const ratio = contrast(fg, bg)
      checks.push({ mode, label: p.label, foreground: p.fg, background: p.bg, ratio: Math.round(ratio * 100) / 100, min: p.min, pass: ratio >= p.min })
    }
  }
  return checks
}

// ---- URL encoding, shared by the builder page and the installable custom theme route ----

const KEYS = { hue: "h", chroma: "c", neutralHue: "nh", neutralChroma: "nc", radius: "r", primary: "p", paper: "paper", edge: "e", density: "d", font: "f" } as const

/** Writes only the fields that differ from the default, so links stay short. */
export function encodeSpec(input: Partial<ThemeSpec>): URLSearchParams {
  const s = normalizeSpec(input)
  const params = new URLSearchParams()
  for (const k of Object.keys(KEYS) as (keyof ThemeSpec)[]) {
    if (s[k] !== DEFAULT_SPEC[k]) params.set(KEYS[k], String(s[k] === true ? 1 : s[k]))
  }
  return params
}

export function decodeSpec(params: URLSearchParams | Record<string, string | string[] | undefined>, base: Partial<ThemeSpec> = {}): ThemeSpec {
  const get = (key: string) => {
    const v = params instanceof URLSearchParams ? params.get(key) : params[key]
    return Array.isArray(v) ? v[0] : (v ?? undefined)
  }
  const out: Partial<ThemeSpec> = { ...base }
  const num = (k: keyof ThemeSpec) => {
    const v = get(KEYS[k])
    if (v !== undefined && v !== "" && Number.isFinite(Number(v))) (out as Record<string, unknown>)[k] = Number(v)
  }
  num("hue"); num("chroma"); num("neutralHue"); num("neutralChroma"); num("radius")
  const p = get(KEYS.primary); if (p === "brand" || p === "ink") out.primary = p
  const e = get(KEYS.edge); if (e === "soft" || e === "strong") out.edge = e
  const d = get(KEYS.density); if (d === "compact" || d === "default" || d === "comfortable") out.density = d
  const f = get(KEYS.font); if (f === "keep" || f === "system" || f === "serif" || f === "mono") out.font = f
  const paper = get(KEYS.paper); if (paper !== undefined) out.paper = paper === "1" || paper === "true"
  return normalizeSpec(out)
}

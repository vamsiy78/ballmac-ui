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

import { BASE_DURATIONS, buildTheme, DEFAULT_MOTION, DEFAULT_SPEC, feelSpec, FEELS, fitGamut, MOTION_RANGES, normalizeMotion, PRESETS, type FeelPreset, type MotionFields, type Oklch, type ThemeVars } from "@ballmac-ui/theme-engine"

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
    if (name === "radius" || name === "spacing" || name === "font-sans" || name.startsWith("bm-")) continue
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
export function themeTokens(slug: string, title: string, vars: ThemeVars, description: string, motionFields: MotionFields = DEFAULT_MOTION) {
  const m = normalizeMotion(motionFields)
  const ms = (base: number) => `${Math.round(base / m.speed)}ms`
  const num = (key: keyof typeof MOTION_RANGES, description: string) => token("number", m[key], description, { cssVariable: `--bm-${key}` })
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
        fast: token("duration", ms(BASE_DURATIONS.fast), "Hover and press feedback", { cssVariable: "--bm-duration-fast" }),
        base: token("duration", ms(BASE_DURATIONS.base), "Most transitions", { cssVariable: "--bm-duration-base" }),
        slow: token("duration", ms(BASE_DURATIONS.slow), "Panels and larger moves", { cssVariable: "--bm-duration-slow" }),
        reveal: token("duration", ms(BASE_DURATIONS.reveal), "Entrances", { cssVariable: "--bm-duration-reveal" }),
      },
      // The modulators the durations and distances are derived from. 1 is the default for each.
      speed: num("speed", "Playback speed: 2 halves every duration"),
      bounce: num("bounce", "Springiness, 0 to 1"),
      travel: num("travel", "Enter distance multiplier"),
      hover: num("hover", "Hover lift and press depth multiplier"),
      stagger: num("stagger", "Delay between staggered items, multiplier"),
      easing: {
        out: token("cubicBezier", [0.22, 1, 0.36, 1]),
        inOut: token("cubicBezier", [0.65, 0, 0.35, 1]),
      },
    },
    ...(vars.theme["font-sans"] ? { font: { sans: token("fontFamily", vars.theme["font-sans"].split(",").map((f) => f.trim().replace(/^"|"$/g, ""))) } } : {}),
  }
}

/** A CSS length in px, for the lengths the feel tokens use: `0.875rem`, `3px`, `calc(var(--spacing) * 9)`. */
export function lengthPx(v: string): number {
  const spacing = v.match(/^calc\(var\(--spacing\) \* ([\d.]+)\)$/)
  if (spacing) return Number(spacing[1]) * 4
  const n = Number.parseFloat(v)
  if (!Number.isFinite(n)) throw new Error(`Cannot convert length "${v}"`)
  return v.endsWith("rem") ? n * 16 : n
}

const dimension = (v: string, description?: string) => token("dimension", `${Math.round(lengthPx(v) * 100) / 100}px`, description)

/** One CSS box-shadow list as W3C shadow layers (`0 1px 3px 0 rgb(0 0 0 / 0.1), ...`). */
export function parseShadow(css: string) {
  const layers: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < css.length; i++) {
    if (css[i] === "(") depth++
    else if (css[i] === ")") depth--
    else if (css[i] === "," && depth === 0) {
      layers.push(css.slice(start, i))
      start = i + 1
    }
  }
  layers.push(css.slice(start))
  return layers.map((layer) => {
    const m = layer.trim().match(/^([-\d.px\s]+?)\s+rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*(?:\/\s*([\d.]+))?\s*\)$/)
    if (!m) throw new Error(`Cannot convert shadow "${layer.trim()}"`)
    const [x = "0", y = "0", blur = "0", spread = "0"] = m[1]!.trim().split(/\s+/)
    const hex = (n: string) => Number(n).toString(16).padStart(2, "0")
    const alpha = m[5] === undefined ? 1 : Number(m[5])
    return {
      color: `#${hex(m[2]!)}${hex(m[3]!)}${hex(m[4]!)}${alpha < 1 ? hex(String(Math.round(alpha * 255))) : ""}`,
      offsetX: `${Number.parseFloat(x)}px`,
      offsetY: `${Number.parseFloat(y)}px`,
      blur: `${Number.parseFloat(blur)}px`,
      spread: `${Number.parseFloat(spread)}px`,
    }
  })
}

/** What a platform feel sets, as W3C tokens: sizes, corners, focus, text, menus, sidebars and elevation. No colours. */
export function feelTokens(f: FeelPreset) {
  const t = f.tokens
  const spec = feelSpec(f.slug)
  const elevation = Object.fromEntries(Object.entries(t.shadow).map(([k, v]) => [k, token("shadow", parseShadow(v), k === "popover" ? "Menus, popovers and hover cards" : undefined, { css: v })]))
  return {
    $description: `${f.title} feel: ${f.tagline}. ${f.description}`,
    $extensions: { ballmac: { feel: f.slug, generator: "ballmac-ui figma:tokens", windowControls: f.controls } },
    radius: { base: dimension(`${spec.radius}rem`, "--radius; controls use base - 2px, cards base, dialogs base + 4px") },
    control: {
      height: dimension(t.control.h, "Button and input height"),
      heightSm: dimension(t.control.hSm),
      heightLg: dimension(t.control.hLg),
      ...(lengthPx(t.control.target) > 0 ? { minTarget: dimension(t.control.target, "Smallest touch target") } : {}),
      checkbox: dimension(t.toggle.check, "Checkbox and radio box"),
      switch: { width: dimension(t.toggle.switchW), height: dimension(t.toggle.switchH) },
    },
    focus: {
      width: dimension(t.focus.width, "Focus ring width"),
      opacity: token("number", Number.parseFloat(t.focus.alpha) / 100, "Focus ring strength, 1 is solid"),
    },
    text: { xs: dimension(t.text.xs[0]), sm: dimension(t.text.sm[0]), base: dimension(t.text.base[0]) },
    menu: { rowHeight: dimension(t.menu.itemH), rowRadius: dimension(t.menu.itemRadius.startsWith("calc") ? "4px" : t.menu.itemRadius), padding: dimension(t.menu.pad) },
    sidebar: { rowHeight: dimension(t.sidebar.itemH), indicatorWidth: dimension(t.sidebar.indicator) },
    titleBar: { height: dimension(t.titlebarH) },
    toolbar: { height: dimension(t.toolbarH) },
    material: { blur: dimension(t.material.blur, "Backdrop blur of menus and sidebars"), opacity: token("number", Number.parseFloat(t.material.alpha) / 100) },
    press: { dim: token("number", Number(t.pressDim), "Opacity of a pressed control; 1 does not dim") },
    elevation,
    motion: {
      speed: token("number", spec.speed),
      bounce: token("number", spec.bounce),
      travel: token("number", spec.travel),
      hover: token("number", spec.hover),
      stagger: token("number", spec.stagger),
    },
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
    const tokens = themeTokens(t.slug, t.title, buildTheme(t.spec), t.description, t.spec)
    const file = `${t.slug}.tokens.json`
    writeFileSync(join(out, file), JSON.stringify(tokens, null, 2) + "\n")
    index.push({ slug: t.slug, title: t.title, file, colors: Object.keys(tokens.color.light).length })
  }
  const feels = FEELS.map((f) => {
    const file = `feel-${f.slug}.tokens.json`
    writeFileSync(join(out, file), JSON.stringify(feelTokens(f), null, 2) + "\n")
    return { slug: f.slug, title: f.title, file }
  })
  writeFileSync(join(out, "index.json"), JSON.stringify({ format: "W3C design tokens (DTCG)", themes: index, feels }, null, 2) + "\n")
  console.log(`✓ ${index.length} themes and ${feels.length} feels → ${out}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()

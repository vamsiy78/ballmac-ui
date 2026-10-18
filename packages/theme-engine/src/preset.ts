import { buildTheme, normalizeSpec, reducedMotionRule, type ThemeSpec } from "./engine"
import { DEFAULT_FEEL, feelRules, feelVars } from "./feel"
import { fontItemName, getFontFace } from "./fonts"
import { motionVars } from "./motion"

/** The pieces a preset is made of. `?only=colors,font` installs just those. */
export const PRESET_PARTS = ["colors", "shape", "font", "motion", "feel"] as const
export type PresetPart = (typeof PRESET_PARTS)[number]

export const PRESET_PART_INFO: Record<PresetPart, string> = {
  colors: "Light and dark colours, including chart colours",
  shape: "Corner radius and density",
  font: "The typeface",
  motion: "Speed, bounce, travel, hover, stagger and the reduced-motion fallback",
  feel: "Platform feel: control sizes, focus ring, shadows and materials",
}

/** Reads `colors,font` into parts. Returns null for no filter, and throws on a name that is not a part. */
export function parseParts(value: string | null | undefined): PresetPart[] | null {
  if (!value) return null
  const parts = value.split(",").map((p) => p.trim().toLowerCase()).filter(Boolean)
  if (!parts.length) return null
  const bad = parts.find((p) => !(PRESET_PARTS as readonly string[]).includes(p))
  if (bad) throw new RangeError(`Unknown part "${bad}". Use ${PRESET_PARTS.join(", ")}.`)
  return [...new Set(parts)] as PresetPart[]
}

export type PresetItemInfo = {
  name: string
  title: string
  description: string
  docs?: string
  /** The site's address, for the font items this preset depends on. */
  registry: string
  /** Only these parts. All of them when omitted. */
  parts?: PresetPart[] | null
}

/**
 * A shadcn `registry:theme` item for a spec, optionally only some of its parts. With every part it carries exactly what `themeRegistryItem`
 * does, plus a dependency on the font item when the spec asks for an installable typeface.
 */
export function presetRegistryItem(input: Partial<ThemeSpec>, info: PresetItemInfo) {
  const spec = normalizeSpec(input)
  const parts = new Set<PresetPart>(info.parts?.length ? info.parts : PRESET_PARTS)
  const v = buildTheme(spec)
  const motion = motionVars(spec)
  const feel = feelVars(spec.feel)
  const own = new Set([...Object.keys(motion.root), ...Object.keys(feel.root)])

  const theme: Record<string, string> = {}
  const light: Record<string, string> = {}
  const dark: Record<string, string> = {}
  let css: Record<string, Record<string, string | Record<string, string>>> = {}

  if (parts.has("colors")) {
    for (const [k, val] of Object.entries(v.light)) if (k !== "radius" && !own.has(k)) light[k] = val
    Object.assign(dark, v.dark)
  }
  if (parts.has("shape")) {
    if (v.light.radius) light.radius = v.light.radius
    if (v.theme.spacing) theme.spacing = v.theme.spacing
  }
  if (parts.has("font") && v.theme["font-sans"]) theme["font-sans"] = v.theme["font-sans"]
  if (parts.has("motion")) {
    Object.assign(theme, motion.theme)
    Object.assign(light, motion.root)
    if (Object.keys(v.reducedMotion).length) css = { ...css, ...reducedMotionRule(v.reducedMotion) }
  }
  if (parts.has("feel")) {
    Object.assign(theme, feel.theme)
    Object.assign(light, feel.root)
    if (spec.feel !== DEFAULT_FEEL) css = { ...css, ...feelRules() }
  }

  const face = parts.has("font") ? getFontFace(spec.font) : undefined
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: info.name,
    type: "registry:theme" as const,
    title: info.title,
    description: info.description,
    author: "Ballmac <https://ui.ballmac.com>",
    ...(face ? { registryDependencies: [`${info.registry.replace(/\/$/, "")}/r/${fontItemName(face.id)}.json`] } : {}),
    cssVars: {
      ...(Object.keys(theme).length ? { theme } : {}),
      ...(Object.keys(light).length ? { light } : {}),
      ...(Object.keys(dark).length ? { dark } : {}),
    },
    ...(Object.keys(css).length ? { css } : {}),
    ...(info.docs ? { docs: info.docs } : {}),
  }
}

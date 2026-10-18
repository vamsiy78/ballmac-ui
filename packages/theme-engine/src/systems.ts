import { DEFAULT_SPEC, normalizeSpec, type ThemeSpec } from "./engine"
import { feelSpec, type FeelId } from "./feel"
import { getPersonality, type MotionPersonality } from "./motion"
import { getPreset } from "./presets"
import { encodeCode, snapSpec } from "./code"

/**
 * A finished design system: one of the twelve themes, a typeface, a platform feel and the way it moves, tuned together and named.
 * Install one with `npx shadcn@latest add @ballmac/preset-<slug>`, or take its code to the builder and change anything.
 */
export type PresetSystem = {
  slug: string
  title: string
  /** One short line for cards. */
  tagline: string
  /** One or two sentences for the registry and docs. */
  description: string
  /** What it suits, for the registry's `ai.whenToUse`. */
  suits: string[]
  /** The theme it starts from. */
  theme: string
  /** The settings, snapped to the builder's steps so the code below decodes to exactly this. */
  spec: ThemeSpec
  /** The 16-character code for `spec`. */
  code: string
}

const system = (
  slug: string,
  title: string,
  tagline: string,
  description: string,
  suits: string[],
  theme: string,
  font: string,
  options: { feel?: FeelId; motion?: MotionPersonality["slug"]; over?: Partial<ThemeSpec> } = {}
): PresetSystem => {
  const base = getPreset(theme)
  if (!base) throw new Error(`preset system ${slug}: no theme "${theme}"`)
  const feel = options.feel ? feelSpec(options.feel) : {}
  const motion = options.motion ? getPersonality(options.motion)!.motion : {}
  const spec = snapSpec(normalizeSpec({ ...DEFAULT_SPEC, ...base.spec, ...feel, ...motion, font, ...options.over }))
  return { slug, title, tagline, description, suits, theme, spec, code: encodeCode(spec) }
}

/** Fourteen ready-made systems. Each is checked for contrast in light and dark like the themes it comes from. */
export const SYSTEMS: PresetSystem[] = [
  system("ink", "Ink", "Quiet greys, sharp type", "Graphite greys with near-black buttons, Geist for text and a quick, precise way of moving. Content leads and the interface stays out of the way.", ["Dashboards and admin tools", "Products that should look neutral and fast"], "graphite", "geist"),
  system("harbor", "Harbor", "Trustworthy blue, open type", "A confident ocean blue with Manrope's wide, modern letters and soft corners. Looks established without looking stiff.", ["Fintech and SaaS", "Anything that has to feel trustworthy"], "ocean", "manrope"),
  system("lumen", "Lumen", "Deep indigo, editorial sans", "Indigo accents with Instrument Sans, generous corners and an easy pace. Modern and a little distinct.", ["AI products and developer tools", "Marketing sites that want a recognisable colour"], "indigo", "instrument-sans"),
  system("bloom", "Bloom", "Rich purple, very round, playful", "Saturated violet, pill-like corners and Plus Jakarta Sans, with springy motion that makes controls feel alive.", ["Creative tools and communities", "Consumer apps"], "violet", "jakarta"),
  system("forge", "Forge", "Burnt orange, technical letters", "Crisp orange on warm greys, Space Grotesk's quirky edges and a lively pace. Energetic but still readable.", ["Developer platforms and media", "Calls to action that must stand out"], "ember", "space-grotesk"),
  system("rosewater", "Rosewater", "Blush and soft serif", "Warm rose with Fraunces, a soft expressive serif, and a calm, unhurried feel. The opposite of a dashboard.", ["Food, lifestyle and wellness", "Shops with a personal voice"], "rose", "fraunces", { motion: "calm" }),
  system("canopy", "Canopy", "Deep green, friendly and grounded", "A deep forest green with Figtree's open shapes and slow, steady motion.", ["Sustainability, finance and wellness", "Products meant to feel calm and established"], "forest", "figtree"),
  system("lagoon", "Lagoon", "Fresh teal, round and clear", "Blue-green with DM Sans and rounded corners. Friendly enough for health apps, clear enough for data.", ["Health, data and productivity apps", "Dashboards with a friendly tone"], "teal", "dm-sans"),
  system("atelier", "Atelier", "Paper, gold and bold type", "Warm paper tones with ink buttons, golden accents and Bricolage Grotesque for headlines that have character.", ["Studios, portfolios and publications", "Brands that want warmth without a coloured button"], "amber", "bricolage"),
  system("paper", "Paper", "Printed page, reading serif", "Off-white paper and terracotta with Newsreader, a serif made for reading, small precise corners and a calm pace. Reads like print.", ["Publications, docs and long reading", "Shops with a crafted feel"], "sand", "newsreader"),
  system("terminal", "Terminal", "Black, white, square, monospaced", "No colour at all: square corners, strong outlines and JetBrains Mono for everything. Fast and uncompromising.", ["Technical and brutalist products", "Teams that need maximum contrast"], "mono", "jetbrains-mono"),
  system("signal", "Signal", "Electric blue, built for dark", "A bright sky-blue accent with strong edges and Geist. Looks best in dark mode and moves quickly.", ["Developer and gaming products", "Apps used mostly in dark mode"], "midnight", "geist", { motion: "snappy" }),
  system("menubar", "Menubar", "A native Mac app", "The macOS feel: compact controls, tighter corners, the system font, translucent materials and a precise focus ring. For apps that live next to Finder.", ["Tauri and Electron apps on macOS", "Tools used all day on a desktop"], "graphite", "system", { feel: "macos" }),
  system("pocket", "Pocket", "An iOS app, in a browser", "The iOS feel: large touch targets, big rounded corners, springy motion and the system font, in a warm rose.", ["Mobile-first consumer apps", "Web apps people add to their home screen"], "rose", "system", { feel: "ios" }),
  system("pane", "Pane", "A Windows app", "The Windows feel: small corners, a visible two-tone focus ring, quick fades and the system font, in a calm Fluent blue.", ["Tauri and Electron apps on Windows", "Enterprise and line-of-business tools"], "ocean", "system", { feel: "windows" }),
]

export const getSystem = (slug: string) => SYSTEMS.find((s) => s.slug === slug)

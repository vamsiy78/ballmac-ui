import { defineItem } from "@ballmac-ui/metadata"
import { buildTheme, DEFAULT_SPEC, feelSpec, getFeel, normalizeSpec, themeRules } from "@ballmac-ui/theme-engine"

const feel = getFeel("web")!
const spec = normalizeSpec({ ...DEFAULT_SPEC, ...feelSpec("web") })
const vars = buildTheme(spec)
/** A feel changes handling, not colour, so only the shape, size and motion variables go in. */
const handling = (m: Record<string, string>) => Object.fromEntries(Object.entries(m).filter(([k]) => k === "radius" || k.startsWith("bm-")))

export default defineItem({
  name: "feel-web",
  type: "registry:theme",
  title: `${feel.title} feel`,
  description: feel.description,
  category: "foundation",
  tags: ["feel", "theme", "tokens", "platform", "web", "desktop"],
  cssVars: { theme: vars.theme, light: handling(vars.light) },
  css: themeRules(spec),
  docs: `Changes how everything handles (shape, size, focus, shadows, motion) and leaves your colours alone. Tune it, preview it on real components and copy the CSS at https://ui.ballmac.com/themes?fe=web`,
  ai: {
    summary: `${feel.tagline}. Sets radius, density, text scale, control and menu sizes, focus ring, shadows and motion as CSS variables that Tailwind's shadow and text scales and every Ballmac component follow, without touching colours.`,
    whenToUse: ["Going back to Ballmac UI's own default feel", "Resetting after trying another feel"],
    whenNotToUse: ["The project needs its own sizing system or does not use Tailwind", "A native app UI is required; these are web components that feel like the platform, not native controls"],
    customization: ["Change --radius, --spacing and the --bm-* variables by hand, or tune them at https://ui.ballmac.com/themes", "Set data-feel on a container to scope a feel to part of the page"],
  },
  version: "1.0.0",
  updated: "2026-10-12",
})

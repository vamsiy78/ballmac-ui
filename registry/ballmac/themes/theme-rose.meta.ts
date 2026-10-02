import { defineItem } from "@ballmac-ui/metadata"
import { buildTheme, getPreset } from "@ballmac-ui/theme-engine"

const preset = getPreset("rose")!
const vars = buildTheme(preset.spec)

export default defineItem({
  name: "theme-rose",
  type: "registry:theme",
  title: `${preset.title} theme`,
  description: preset.description,
  category: "foundation",
  tags: ["theme", "preset", "tokens", "dark mode", "rose"],
  cssVars: { ...(Object.keys(vars.theme).length ? { theme: vars.theme } : {}), light: vars.light, dark: vars.dark },
  docs: `Tune this theme, preview it on real components and copy the CSS at https://ui.ballmac.com/themes/rose`,
  ai: {
    summary: `${preset.tagline}. A complete set of light and dark tokens, with contrast checked for text, focus rings and charts.`,
    whenToUse: preset.suits,
    whenNotToUse: ["The project already has a brand theme you want to keep"],
    customization: ["Open https://ui.ballmac.com/themes/rose to change hue, intensity, radius, density and font, then copy the CSS or install the result"],
  },
  version: "1.0.0",
  updated: "2026-10-02",
})

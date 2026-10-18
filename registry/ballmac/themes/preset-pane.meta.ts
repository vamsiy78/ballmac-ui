import { defineItem } from "@ballmac-ui/metadata"
import { fontItemName, getFontFace, getSystem, presetRegistryItem } from "@ballmac-ui/theme-engine"

const system = getSystem("pane")!
const item = presetRegistryItem(system.spec, { name: "preset-pane", title: system.title, description: system.description, registry: "" })
const face = getFontFace(system.spec.font)

export default defineItem({
  name: "preset-pane",
  type: "registry:theme",
  title: `${system.title} preset`,
  description: system.description,
  category: "foundation",
  tags: ["preset", "theme", "design system", "tokens", "pane"],
  cssVars: item.cssVars,
  ...(item.css ? { css: item.css } : {}),
  ...(face ? { registryDependencies: [fontItemName(face.id)] } : {}),
  docs: `A complete design system: colour, shape, typeface, platform feel and motion. Its code is ${system.code}; paste it at https://ui.ballmac.com/themes to change anything.`,
  ai: {
    summary: `${system.tagline}. Sets colours, radius, typeface, platform feel and motion together, with contrast checked in light and dark.`,
    whenToUse: system.suits,
    whenNotToUse: ["The project already has a brand theme you want to keep", "You only want part of it: add ?only=colors,font (see the presets guide)"],
    customization: ["Open https://ui.ballmac.com/themes with this preset's code to change any setting, then install the result"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})

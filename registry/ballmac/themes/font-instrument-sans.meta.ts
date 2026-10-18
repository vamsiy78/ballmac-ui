import { defineItem } from "@ballmac-ui/metadata"
import { fontRegistryItem, getFontFace } from "@ballmac-ui/theme-engine"

const face = getFontFace("instrument-sans")!

export default defineItem({
  name: "font-instrument-sans",
  type: "registry:font",
  title: face.label,
  description: `${face.label}: ${face.note} Installed from Fontsource, so the font files are served from your own app.`,
  category: "foundation",
  tags: ["font", "typography", "instrument-sans", face.kind],
  font: fontRegistryItem(face).font,
  docs: "Sets --font-sans. Open https://ui.ballmac.com/themes to preview it on real components, or pick it inside a preset.",
  ai: {
    summary: `${face.label} as the interface font. ${face.note}`,
    whenToUse: [face.note, "A preset or theme that names this font"],
    whenNotToUse: ["The project already has a brand typeface you want to keep"],
    customization: ["Change --font-sans in your global CSS to use another family"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})

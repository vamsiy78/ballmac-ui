import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "color",
  type: "registry:lib",
  title: "Color",
  description:
    "Resolves theme tokens for canvas and WebGL effects: CSS variables to color strings or RGBA numbers, plus a theme-change observer so effects repaint in dark mode.",
  category: "foundation",
  tags: ["color", "canvas", "webgl", "theme"],
  files: [{ path: "lib/color.ts" }],
  ai: {
    summary: "Use resolveCssColor(el, '--primary') for canvas fillStyle and cssColorToRgba for WebGL, and observeTheme to repaint when the theme changes.",
    whenToUse: ["Canvas or WebGL components that must follow the theme tokens"],
    whenNotToUse: ["DOM elements (use Tailwind token classes)"],
    customization: ["Pass any CSS variable name, var() expression or CSS color"],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})

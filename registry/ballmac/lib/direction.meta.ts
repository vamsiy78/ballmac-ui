import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "direction",
  type: "registry:lib",
  title: "Direction Utilities",
  description: "Right-to-left support helpers: useDirection reads the reading direction, DirectionProvider tells Radix-based components, and Dir scopes a region to ltr or rtl.",
  category: "foundation",
  tags: ["rtl", "ltr", "direction", "i18n", "arabic", "hebrew", "persian"],
  files: [{ path: "lib/direction.tsx" }],
  dependencies: ["radix-ui@^1"],
  ai: {
    summary: "Import useDirection, DirectionProvider and Dir from @/lib/ballmac/direction. Set <html dir> and wrap the app in DirectionProvider so keyboard arrows, sliders, menus and tabs follow the reading direction.",
    whenToUse: ["Shipping the app in Arabic, Hebrew, Persian or Urdu", "A region of mixed-direction content", "Code that must know which way is forward"],
    whenNotToUse: ["Layout alone: logical properties (ms-, me-, start-, end-) already follow dir with no JavaScript"],
    customization: ["dir: pass it to useDirection to force a direction", "Dir renders a div with display: contents"],
  },
  version: "1.0.0",
  updated: "2026-10-02",
})

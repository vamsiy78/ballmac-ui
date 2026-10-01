import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "light-rays",
  type: "registry:ui",
  title: "Light Rays",
  description:
    "Soft beams of theme-colored light fanning down from the top edge, each swaying and breathing at its own pace, deterministic so the server and browser match.",
  category: "backgrounds",
  tags: ["light", "rays", "glow", "background", "hero"],
  files: [{ path: "components/light-rays.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "light-rays-demo", title: "Hero spotlight", file: "light-rays-demo.tsx" },
    { name: "light-rays-tones", title: "Tones and count", file: "light-rays-tones.tsx" },
  ],
  ai: {
    summary:
      "<LightRays count tone spread intensity duration /> inside a relative, overflow-hidden parent. Tone is a theme token, so it follows any palette.",
    whenToUse: ["Hero and pricing sections that want warmth", "Behind modals and announcement bars"],
    whenNotToUse: ["Light backgrounds with dark text at high intensity"],
    composesWith: ["aurora-background", "retro-grid", "beams-background"],
    a11y: [
      { keys: "Screen readers", action: "Decorative: aria-hidden and pointer-events-none" },
      { keys: "Reduced motion", action: "The rays are still" },
    ],
    customization: ["count", "tone", "spread", "intensity", "duration"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

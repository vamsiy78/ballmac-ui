import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "glare-hover",
  type: "registry:ui",
  title: "Glare Hover",
  description:
    "Wraps any content so a diagonal band of light sweeps across it on hover or keyboard focus, in white for images and dark surfaces or a soft shadow for light ones.",
  category: "motion",
  tags: ["hover", "glare", "shine", "image", "card"],
  files: [{ path: "components/glare-hover.tsx" }],
  registryDependencies: ["shadcn:utils", "motion-presets"],
  examples: [
    { name: "glare-hover-demo", title: "Image cards", file: "glare-hover-demo.tsx" },
    { name: "glare-hover-tones", title: "Light and dark tone", file: "glare-hover-tones.tsx" },
  ],
  ai: {
    summary:
      "<GlareHover angle duration intensity tone='light|dark'>anything</GlareHover>. The sweep runs once per hover and resets instantly when the pointer leaves. Pure CSS transitions; nothing renders on pointer move.",
    whenToUse: ["Product images, posters and cards", "Anything that deserves a small touch of polish on hover"],
    whenNotToUse: ["Pointer-following lighting (magic-card or spotlight-card)"],
    composesWith: ["tilt-card", "magic-card", "card"],
    a11y: [
      { keys: "Focus", action: "The sweep also plays when something inside gains keyboard focus" },
      { keys: "Screen readers", action: "The glare is aria-hidden" },
      { keys: "Reduced motion", action: "No glare is drawn" },
    ],
    customization: ["angle", "duration", "intensity", "tone"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

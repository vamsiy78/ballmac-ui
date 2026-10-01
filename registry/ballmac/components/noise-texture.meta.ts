import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "noise-texture",
  type: "registry:ui",
  title: "Noise Texture",
  description:
    "A film-grain layer made from an SVG turbulence filter, with strength, fineness, blend mode and an optional shimmer, to take the plastic edge off gradients, cards and photos.",
  category: "backgrounds",
  tags: ["noise", "grain", "texture", "overlay", "gradient"],
  files: [{ path: "components/noise-texture.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "noise-texture-demo", title: "Gradient with grain", file: "noise-texture-demo.tsx" },
    { name: "noise-texture-blends", title: "Blend modes", file: "noise-texture-blends.tsx" },
  ],
  ai: {
    summary:
      "<NoiseTexture opacity frequency tile blend animated /> absolutely fills its relative parent. No image file is needed; the grain is an inline SVG data URI.",
    whenToUse: ["Gradient heroes and cards that band or look flat", "Giving imagery a printed feel"],
    whenNotToUse: ["Text-heavy surfaces at high opacity"],
    composesWith: ["aurora-background", "gradient-text", "card"],
    a11y: [
      { keys: "Screen readers", action: "Decorative: aria-hidden and pointer-events-none" },
      { keys: "Reduced motion", action: "The grain never shimmers" },
    ],
    customization: ["opacity", "frequency", "tile", "blend", "animated"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

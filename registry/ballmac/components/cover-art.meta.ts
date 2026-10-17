import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "cover-art",
  type: "registry:ui",
  title: "Cover Art",
  description:
    "Cover pictures drawn from a seed in your theme's chart colors: color fields, rings, bars, dots or waves. The same seed always draws the same picture, so an item without an image still looks finished.",
  category: "backgrounds",
  tags: ["cover", "artwork", "generative", "placeholder", "avatar", "thumbnail", "gradient", "seed"],
  files: [{ path: "components/cover-art.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "cover-art-demo", title: "Five pictures", file: "cover-art-demo.tsx" },
    { name: "cover-art-seeds", title: "One per name", file: "cover-art-seeds.tsx" },
  ],
  ai: {
    summary:
      "<CoverArt seed={project.id} /> fills its parent with a picture chosen and drawn from the seed; variant: 'mesh' | 'rings' | 'bars' | 'dots' | 'waves' | 'auto'; grid adds a faint grid. Put it in a sized container (an aspect-video div, a size-10 rounded avatar). It is decorative and hidden from screen readers, so keep the item's name as text next to it.",
    whenToUse: ["The fallback for a card, channel, project or agent that has no image", "A profile cover or a thumbnail while images load"],
    whenNotToUse: ["A real photograph or logo (use media)", "An animated hero background (use aurora-background or beams-background)"],
    composesWith: ["media", "card", "avatar"],
    a11y: [{ keys: "None", action: "Decorative: aria-hidden, no focus. Never the only way to tell items apart." }],
    customization: [
      "seed picks the picture and the chart colors it uses, so a theme change recolors every picture",
      "className sets size and corners: <CoverArt seed={id} className=\"aspect-video rounded-xl\" />",
      "Use it as the fallback of Media: <Media media={cover} fallback={<CoverArt seed={id} />} fill />",
    ],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})

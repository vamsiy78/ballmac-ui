import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "media",
  type: "registry:ui",
  title: "Media",
  description: "A picture slot: reserves the space, lazy-loads, takes a URL, an image with required alt text and a dark-mode file, or your own element, and falls back to artwork if there is no image or it fails.",
  category: "primitives",
  tags: ["image", "picture", "slot", "screenshot", "photo", "alt text", "aspect ratio", "dark mode"],
  files: [{ path: "components/media.tsx" }],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "media-demo", title: "Image, element and fallback", file: "media-demo.tsx" },
    { name: "media-dark", title: "A different file in dark mode", file: "media-dark.tsx" },
  ],
  ai: {
    summary: "Pass media as a URL (with alt), an object { src, alt, srcDark? }, or any element such as a next/image. aspect reserves the box (video, photo, square, wide, portrait or '3/2'); fit is cover | contain | fill; priority loads an above-the-fold image eagerly. fallback shows when there is no media or the file fails.",
    whenToUse: ["Any place a product screenshot, photo, cover or avatar goes", "Blocks and templates that ship with generated artwork but should accept the buyer's own image"],
    whenNotToUse: ["Icons (use an icon component)", "Animated or interactive content that is not an image: pass it as an element"],
    composesWith: ["hero-1", "features-5", "blog-1"],
    a11y: [
      { keys: "Screen readers", action: "Informative images need alt text; alt=\"\" marks decoration. A URL without alt logs a warning in development" },
      { keys: "Layout", action: "A fixed aspect ratio reserves the space, so nothing jumps when the file arrives" },
    ],
    customization: ["aspect, fit and priority", "srcDark for a dark-mode file", "position for object-position", "fallback for the artwork shown with no image", "onImageError"],
  },
  version: "1.0.0",
  updated: "2026-10-02",
})

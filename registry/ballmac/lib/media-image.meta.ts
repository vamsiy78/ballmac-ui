import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "media-image",
  type: "registry:lib",
  title: "Media image check",
  description: "The MediaImage type and isMediaImage(), which tells a picture (a URL or { src, alt }) from an element. A plain module, so server components can call it.",
  category: "foundation",
  tags: ["image", "media", "server components"],
  files: [{ path: "lib/media-image.ts" }],
  ai: {
    summary: "isMediaImage(value) is true for an image URL or { src, alt }. Import it from here, not from media.tsx, when a server component needs it.",
    whenToUse: ["A server component that accepts either a picture or your own element in a slot and renders pictures through Media"],
    whenNotToUse: ["Rendering a picture: use the Media component"],
  },
  version: "1.0.0",
  updated: "2026-10-11",
})

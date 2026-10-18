import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "gallery-1",
  type: "registry:block",
  title: "Gallery 1: filterable gallery with lightbox",
  description:
    "A photo gallery: filter chips with counts, a gap-free masonry of tiles that fade in, and a lightbox with caption, counter, thumbnail strip, arrow-key and swipe navigation, and a link to the original.",
  category: "blocks",
  blockCategory: "gallery",
  tags: ["gallery", "photos", "images", "masonry", "lightbox", "portfolio", "filter", "media", "grid", "carousel"],
  files: [{ path: "components/blocks/gallery-1/gallery-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "cover-art", "dialog", "direction", "masonry-grid", "media", "skeleton", "state-view", "return-focus"],
  examples: [
    { name: "gallery-1-demo", title: "Default", file: "gallery-1-demo.tsx" },
    { name: "gallery-1-lightbox", title: "Lightbox open", file: "gallery-1-lightbox.tsx" },
    { name: "gallery-1-team", title: "One category", file: "gallery-1-team.tsx" },
    { name: "gallery-1-loading", title: "Loading", file: "gallery-1-loading.tsx" },
    { name: "gallery-1-empty", title: "No pictures yet", file: "gallery-1-empty.tsx" },
    { name: "gallery-1-error", title: "Could not load", file: "gallery-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "gallery-1-loading", trigger: "state=\"loading\"", note: "Skeleton tiles of different heights under the real heading, announced as loading." },
    { id: "empty", title: "No pictures yet", example: "gallery-1-empty", trigger: "state=\"empty\" (or items={[]})", note: "Says pictures will appear; a category with nothing in it offers Show everything. emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "gallery-1-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "A gallery page. <Gallery1 items={[{ id, title, caption, meta, category, src, alt, ratio: 'square' | 'landscape' | 'portrait' | 'tall', href }]} title description defaultCategory onOpen />. src takes a URL, an image with alt text or any element (a next/image); without it the tile shows art drawn from the id. Categories come from the items.",
    whenToUse: ["A photo, event, studio or portfolio gallery", "Showing work or places with captions and the option to see each larger"],
    whenNotToUse: ["A product image carousel on a store page (use carousel)", "Logos (use logo-cloud-1)", "One hero picture (use media with a frame)"],
    composesWith: ["header-2", "footer-2", "cta-1", "media"],
    a11y: [
      { keys: "Tab, then Enter on a picture", action: "Opens the lightbox (a dialog with a hidden title and \"Picture 3 of 12\"); Escape closes it and focus returns to the tile" },
      { keys: "Left / Right, Home / End in the lightbox", action: "Move between pictures; the arrows swap in right-to-left" },
      { keys: "Filters", action: "Category chips are native radio buttons (arrow keys), with counts in their labels" },
    ],
    customization: [
      "ratio sets the tile shape, which gives the masonry its rhythm; the lightbox shows the whole picture (contain)",
      "defaultOpenId opens a picture at first; defaultCategory starts on a category",
      "Set alt on every real picture; the caption and title are text next to it",
    ],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})

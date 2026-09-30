import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "masonry-grid",
  type: "registry:ui",
  title: "Masonry Grid",
  description:
    "A gap-free multi-column layout for tiles of different heights, built on CSS columns so it never shifts on load, with responsive column counts and optional reveal.",
  category: "layout",
  tags: ["masonry", "grid", "gallery", "columns"],
  files: [{ path: "components/masonry-grid.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils","motion-presets"],
  examples: [
    { name: "masonry-grid-demo", title: "Gallery", file: "masonry-grid-demo.tsx" },
    { name: "masonry-grid-states", title: "Notes", file: "masonry-grid-states.tsx" },
  ],
  ai: {
    summary:
      "<MasonryGrid columns={{base:2, lg:4}} gap reveal><MasonryItem/>…</MasonryGrid>. DOM order is reading order: down the first column, then the next.",
    whenToUse: ["Galleries, portfolios and boards", "Testimonials or notes of uneven length"],
    whenNotToUse: ["Rows that must line up across columns; use CSS grid", "Sortable boards; use kanban-board"],
    composesWith: ["card", "bento-grid"],
    a11y: [
      { keys: "Tab order", action: "Follows DOM order, which matches the visual column flow" },
      { keys: "Reduced motion", action: "Reveal animation is skipped" },
    ],
    customization: ["columns number or per breakpoint", "gap: sm | md | lg", "reveal"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});

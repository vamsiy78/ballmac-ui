import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "bento-grid",
  type: "registry:ui",
  title: "Bento Grid",
  description:
    "A responsive bento layout of feature cards that span columns and rows. Each BentoCard has a background visual slot, icon, title and description, and a link that slides up on hover or focus.",
  category: "layout",
  featured: true,
  tags: ["bento", "grid", "features", "landing", "cards", "layout"],
  files: [{ path: "components/bento-grid.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "media"],
  examples: [
    { name: "bento-grid-demo", title: "Live feature grid", file: "bento-grid-demo.tsx" },
    { name: "bento-grid-features", title: "Two columns", file: "bento-grid-features.tsx" },
  ],
  ai: {
    summary:
      "<BentoGrid columns={3}> with <BentoCard colSpan rowSpan icon title description href background />. The grid responds to its own width (container queries): one column below 36rem. The background slot takes any decorative node, such as animated-grid, marquee or number-ticker visuals.",
    whenToUse: [
      "Landing-page feature sections with 4–7 features of different weight",
      "Product overviews where each tile shows a small live visual",
      "Dashboard home pages with shortcuts",
    ],
    whenNotToUse: [
      "Uniform lists of equal items (use a plain grid of cards)",
      "Long text content; cards hold one or two lines",
    ],
    composesWith: ["animated-grid", "marquee", "number-ticker", "border-beam"],
    a11y: [{ keys: "Tab", action: "Focuses the card's link; the whole card is its click target and shows a focus ring" }],
    customization: [
      "BentoGrid: columns 2 | 3 | 4 (default 3), rowHeight (default 13rem)",
      "BentoCard: colSpan 1–4, rowSpan 1–2, href + cta (default \"Learn more\")",
      "background is aria-hidden and masked to fade toward the text",
      "On touch screens the link is always visible",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})

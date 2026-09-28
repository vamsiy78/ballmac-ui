import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "border-beam",
  type: "registry:ui",
  title: "Border Beam",
  description:
    "A short beam of light that travels around the inside edge of its parent's border at a constant speed. Decorative, token-colored, hidden under reduced motion.",
  category: "motion",
  tags: ["border", "glow", "highlight", "decorative", "motion"],
  files: [{ path: "components/border-beam.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "border-beam-demo", title: "Card", file: "border-beam-demo.tsx" },
    { name: "border-beam-button", title: "Button", file: "border-beam-button.tsx" },
  ],
  ai: {
    summary:
      "Drop <BorderBeam /> as the last child of any element with position: relative and a border radius; it inherits the radius and draws only in a borderWidth-thick ring (aria-hidden, pointer-events-none). Renders a span, so it is valid inside buttons.",
    whenToUse: [
      "Drawing attention to one highlighted card, such as the recommended pricing plan",
      "Marking a live or running state on a panel (an agent working, a deploy in progress)",
      "A featured call-to-action button",
    ],
    whenNotToUse: [
      "Several elements on the same screen; one beam per view",
      "Communicating status on its own (pair it with text; it is hidden under reduced motion)",
    ],
    composesWith: ["spotlight-card", "button", "magnetic-button"],
    customization: [
      "duration (s per lap, default 8), delay, reverse",
      "size: beam length in px (default 80); borderWidth: ring thickness in px (default 1)",
      "colorFrom / colorTo: any CSS color, default var(--ring) fading out; try var(--chart-2)",
      "Two beams with delay={duration / 2} give an opposed pair; className=\"-inset-px\" moves the ring onto a 1px parent border",
      "Needs CSS offset-path rect() (Chrome 116, Firefox 122, Safari 17.2); older browsers simply don't show the beam",
    ],
  },
  source: {
    name: "Magic UI Border Beam",
    url: "https://github.com/magicuidesign/magicui",
    license: "MIT",
    copyright: "Copyright (c) Magic UI",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-28",
})

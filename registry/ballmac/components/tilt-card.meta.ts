import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "tilt-card",
  type: "registry:ui",
  title: "Tilt Card",
  description:
    "A card that tilts in 3D toward the pointer with spring smoothing and a moving glare. TiltCardLayer children float at their own depth for parallax. Keyboard focus shows a gentle tilt.",
  category: "motion",
  featured: true,
  tags: ["card", "3d", "tilt", "parallax", "hover", "glare", "motion"],
  files: [{ path: "components/tilt-card.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "tilt-card-demo", title: "Membership card", file: "tilt-card-demo.tsx" },
    { name: "tilt-card-product", title: "Linked product card", file: "tilt-card-product.tsx" },
  ],
  ai: {
    summary:
      "<TiltCard> is a card surface (rounded-xl, border, bg-card) that rotates toward the pointer; wrap parts in <TiltCardLayer depth={24}> to lift them off the surface. The card sets --tilt-x and --tilt-y (0%–100%) for custom foil or gradient effects.",
    whenToUse: [
      "A single hero object: a membership or gift card, a product box, an app icon",
      "Pricing or product cards on a landing page that should feel physical",
      "Collectible or badge-style achievements",
    ],
    whenNotToUse: [
      "Dense grids of many cards (the motion competes; use spotlight-card)",
      "Cards holding forms or text people need to read while moving the pointer",
    ],
    composesWith: ["spotlight-card", "border-beam"],
    a11y: [{ keys: "Tab", action: "Focusing the card (tabIndex) or a link inside it shows a gentle fixed tilt" }],
    customization: [
      "maxTilt in degrees (default 10), perspective in px (default 900), hoverScale (default 1.02)",
      "glare, glareOpacity (default 0.28)",
      "TiltCardLayer depth in px; parents of layers need transform-3d (the card already has it)",
      "Clip backgrounds in an inner absolute div with overflow-hidden rounded-[inherit]; overflow-hidden on the card itself flattens the 3D layers",
      "Reduced motion and touch input keep the card flat",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})

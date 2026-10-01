import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "spinning-text",
  type: "registry:ui",
  title: "Spinning Text",
  description:
    "Text laid out on a circle that turns slowly, with a center slot for a logo or arrow, pausing on hover.",
  category: "text",
  tags: ["text", "circle", "rotate", "badge", "marketing"],
  files: [{ path: "components/spinning-text.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "spinning-text-demo", title: "Badge with arrow", file: "spinning-text-demo.tsx" },
    { name: "spinning-text-sizes", title: "Sizes and direction", file: "spinning-text-sizes.tsx" },
  ],
  ai: {
    summary:
      "<SpinningText text duration reverse pauseOnHover className='size-40'>{center}</SpinningText>. The string is fitted to the circle, so shorter text spreads wider.",
    whenToUse: ["Scroll-down or 'new' badges", "Decorative seals and stamps"],
    whenNotToUse: ["Information people need to read (rotating text is hard to read)"],
    composesWith: ["orbiting-circles", "gradient-text"],
    a11y: [
      { keys: "Screen readers", action: "The ring is an image named by the text; the center slot is read normally" },
      { keys: "Reduced motion", action: "The ring stays still" },
    ],
    customization: ["text and separator", "duration", "reverse", "size via className"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

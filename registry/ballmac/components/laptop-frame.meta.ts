import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "laptop-frame",
  type: "registry:ui",
  title: "Laptop Frame",
  description:
    "A notched aluminium laptop drawn in CSS that scales with its container. Renders children, an image or a video as the screen, and can open its lid when it scrolls into view.",
  category: "devices",
  featured: true,
  tags: ["mockup", "device", "laptop", "macbook", "screenshot", "hero", "3d", "scroll"],
  files: [{ path: "components/laptop-frame.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils", "media"],
  examples: [
    { name: "laptop-frame-demo", title: "Dashboard", file: "laptop-frame-demo.tsx" },
    { name: "laptop-frame-scroll", title: "Midnight, opens on scroll", file: "laptop-frame-scroll.tsx" },
  ],
  ai: {
    summary:
      "Wrap a product screen in <LaptopFrame>: children become the display. Pass screenWidth (e.g. 1280) to lay the content out at a desktop resolution and scale it down to fit; openAnimation=\"in-view\" or \"scroll\" swings the lid open.",
    whenToUse: [
      "Landing-page heroes that show a desktop or web app in context",
      "Feature sections with a live React screen instead of a static screenshot",
      "Scroll-driven product reveals (openAnimation=\"scroll\")",
    ],
    whenNotToUse: [
      "Showing a website with its URL and browser chrome (use browser-frame)",
      "Mobile app screens (use phone-frame)",
    ],
    composesWith: ["browser-frame", "phone-frame"],
    customization: [
      "variant: auto (silver in light, midnight in dark) | silver | midnight",
      "screenWidth: virtual resolution in CSS px; content is scaled with a CSS transform",
      "src/alt for an image, videoSrc/poster for a muted looping video",
      "openAnimation: none | in-view | scroll; reduced motion always shows it open",
      "Sizes are in container units, so set the width with className (e.g. max-w-3xl)",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})

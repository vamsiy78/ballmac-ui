import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "carousel",
  type: "registry:ui",
  title: "Carousel",
  description:
    "A swipeable, keyboard-operable carousel on Embla with slide labels, dot pagination, vertical mode, loop, and autoplay that pauses on hover, focus and reduced motion.",
  category: "data-display",
  tags: ["slider", "swipe", "slides", "embla"],
  files: [{ path: "components/carousel.tsx" }],
  dependencies: ["embla-carousel-react@^8", "lucide-react"],
  registryDependencies: ["shadcn:utils", "motion-presets", "i18n", "direction"],
  examples: [
    { name: "carousel-demo", title: "Product highlights", file: "carousel-demo.tsx" },
    { name: "carousel-states", title: "Multiple and vertical", file: "carousel-states.tsx" },
  ],
  ai: {
    summary:
      "Compose Carousel, CarouselContent and CarouselItem with CarouselPrevious, CarouselNext, CarouselDots and CarouselPlayPause. Give Carousel a label.",
    whenToUse: ["Feature highlights and testimonials", "Product image galleries", "Horizontal lists that overflow"],
    whenNotToUse: ["Content people must read in full; show it all", "A marquee of logos; use marquee"],
    composesWith: ["card", "button"],
    a11y: [
      { keys: "ArrowLeft / ArrowRight", action: "Previous or next slide (Up / Down when vertical)" },
      { keys: "Tab", action: "Reaches arrows, dots and the pause button" },
      { keys: "Swipe / drag", action: "Moves slides with touch or mouse" },
    ],
    customization: ["opts (loop, align, slidesToScroll)", "orientation", "autoplay in ms", "item basis classes for several visible slides"],
  },
  source: {
    name: "shadcn/ui Carousel",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-30",
});

import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "scroll",
  type: "registry:lib",
  title: "Scroll Utilities",
  description:
    "Small hooks and helpers for scroll-aware UI: scrolled state, scroll direction, a scroll spy for in-page sections, and reduced-motion-aware scrolling to an element below a sticky header.",
  category: "foundation",
  tags: ["scroll", "scrollspy", "sticky header", "reduced motion"],
  files: [{ path: "lib/scroll.ts" }],
  ai: {
    summary:
      "Import useScrolled, useScrollDirection, useScrollSpy, scrollToId, scrollToElement and prefersReducedMotion from @/lib/ballmac/scroll. Pass a container ref to watch an element instead of the page.",
    whenToUse: ["Sticky headers that change on scroll", "Highlighting the current section in a table of contents or tab bar", "Smooth in-page links that respect reduced motion"],
    whenNotToUse: ["Scroll-linked animation values (use Motion's useScroll)", "Virtual lists"],
    customization: ["offset: pixels reserved for a sticky header", "container: a ref to a scrollable element"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})

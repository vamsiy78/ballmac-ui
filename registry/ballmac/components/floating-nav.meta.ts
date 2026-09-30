import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "floating-nav",
  type: "registry:ui",
  title: "Floating Nav",
  description:
    "A pill-shaped navigation that floats over the page, with an indicator that glides between items on a spring and optional hide-on-scroll.",
  category: "navigation",
  tags: ["navigation", "pill", "floating", "mobile"],
  files: [{ path: "components/floating-nav.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils", "scroll", "motion-presets"],
  examples: [
    { name: "floating-nav-demo", title: "Top bar that hides", file: "floating-nav-demo.tsx" },
    { name: "floating-nav-states", title: "Bottom bar", file: "floating-nav-states.tsx" },
  ],
  ai: {
    summary:
      "items: {value,label,href,icon}. position top or bottom; autoHide slides it away on scroll; value/defaultValue/onValueChange pick the active item.",
    whenToUse: ["Landing pages and portfolios", "App-style bottom navigation on small screens"],
    whenNotToUse: ["Sites that need nested menus; use navbar with mega-menu", "Long lists of links"],
    composesWith: ["navbar", "button"],
    a11y: [
      { keys: "Tab", action: "Moves through the links" },
      { keys: "Screen readers", action: "Active item has aria-current; icon-only items keep their label" },
      { keys: "Reduced motion", action: "The indicator jumps instead of gliding; hiding uses no transition" },
    ],
    customization: ["position: top | bottom", "autoHide", "icons (labels collapse on small screens)", "scrollContainer"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});

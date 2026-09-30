import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "back-to-top",
  type: "registry:ui",
  title: "Back To Top",
  description:
    "A floating button that appears after scrolling, draws a progress ring, scrolls smoothly (instantly under reduced motion) and moves focus to the content.",
  category: "navigation",
  tags: ["button", "scroll", "floating", "progress"],
  files: [{ path: "components/back-to-top.tsx" }],
  dependencies: ["lucide-react", "motion@^12"],
  registryDependencies: ["shadcn:utils", "scroll", "motion-presets"],
  examples: [
    { name: "back-to-top-demo", title: "Progress ring", file: "back-to-top-demo.tsx" },
    { name: "back-to-top-states", title: "Labelled", file: "back-to-top-states.tsx" },
  ],
  ai: {
    summary:
      "Render <BackToTop /> once. threshold sets when it appears; container follows a scrollable element; focusTarget chooses where focus lands.",
    whenToUse: ["Long pages, feeds and docs", "Panels with a lot of scrolling"],
    whenNotToUse: ["Short pages", "Infinite feeds where returning to the top loses work"],
    composesWith: ["scroll-progress", "button"],
    a11y: [
      { keys: "Enter / Space", action: "Scrolls to the top and moves focus to the main content so focus is not lost when the button disappears" },
      { keys: "Reduced motion", action: "Jumps instead of scrolling smoothly" },
    ],
    customization: ["threshold", "showProgress", "showLabel", "container and focusTarget"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});

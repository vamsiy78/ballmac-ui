import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "in-view",
  type: "registry:ui",
  title: "In View",
  description:
    "A wrapper that knows when it is on screen: it sets a data attribute for CSS, offers a render function and callbacks, and can run a simple entrance.",
  category: "motion",
  tags: ["viewport", "scroll", "observer", "reveal", "trigger"],
  files: [{ path: "components/in-view.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "in-view-demo", title: "Entrances", file: "in-view-demo.tsx" },
    { name: "in-view-state", title: "Render function and callback", file: "in-view-state.tsx" },
  ],
  ai: {
    summary:
      "<InView effect='fade|slide-up|slide-down|scale|blur|none' amount margin once onInViewChange>{content or (inView)=>content}</InView>. data-in-view is true or false for Tailwind's data-[in-view=true] variants.",
    whenToUse: ["Starting a video, counter or animation only when seen", "Custom reveal styling driven by data-in-view"],
    whenNotToUse: ["Staggered groups (blur-fade or stagger-list)"],
    composesWith: ["blur-fade", "number-ticker", "stagger-list"],
    a11y: [
      { keys: "Screen readers", action: "Content is always in the DOM; only presentation changes" },
      { keys: "Reduced motion", action: "Content is shown with no entrance" },
    ],
    customization: ["effect", "amount and margin", "once", "onInViewChange", "as"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "dynamic-island",
  type: "registry:ui",
  title: "Dynamic Island",
  description:
    "A black pill or MacBook-style notch that morphs between live activities (timers, uploads, an AI thinking state, notifications) with a spring layout animation. Each view is announced politely.",
  category: "macos",
  featured: true,
  tags: ["dynamic island", "notch", "macos", "ios", "live activity", "status", "motion", "morph"],
  files: [{ path: "components/dynamic-island.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "dynamic-island-demo", title: "MacBook notch", file: "dynamic-island-demo.tsx" },
    { name: "dynamic-island-pill", title: "Floating pill", file: "dynamic-island-pill.tsx" },
  ],
  ai: {
    summary:
      "<DynamicIsland view={state}> renders whichever <DynamicIslandView value=\"…\"> child matches and springs its size and corner radius to fit. Size each view with className (h-/w-/padding); set radius per view; label is announced via a polite live region.",
    whenToUse: [
      "Showing one live background activity at a time: an upload, a build, a timer, an AI response in progress",
      "A compact status surface pinned to the top of an app or a product mockup",
      "Landing-page heroes that demo a Mac notch or iPhone app",
    ],
    whenNotToUse: [
      "Several notifications that need to stay visible together (use notification-stack)",
      "Long or critical messages that must not disappear (use a dialog or an inline alert)",
    ],
    composesWith: ["dock"],
    a11y: [
      { keys: "—", action: "The active view's label is announced in a polite live region; interactive content inside a view is reachable with Tab" },
    ],
    customization: [
      "view: the active view value (controlled)",
      "shape: pill | notch (square top corners, hangs from the top edge)",
      "DynamicIslandView: value, radius (px, default 22), label (announced), className for size and layout",
      "Always black like the hardware it imitates; accent content with chart-1..5 tokens",
      "Under reduced motion the island switches views without the morph",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})

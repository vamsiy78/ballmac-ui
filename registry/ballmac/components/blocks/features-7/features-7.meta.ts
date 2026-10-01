import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "features-7",
  type: "registry:block",
  title: "Features 7: menu bar app tour",
  description: "A feature picker for menu bar apps: choose a feature and a miniature desktop shows the app's panel hanging from its menu bar icon, with quick capture, clipboard history, a focus timer and shortcuts drawn from tokens.",
  category: "blocks",
  blockCategory: "features",
  tags: ["features", "menu bar", "mac", "tour", "shortcuts", "panel", "utility"],
  files: [{ path: "components/blocks/features-7/features-7.tsx" }],
  dependencies: ["lucide-react", "motion@^12", "radix-ui"],
  registryDependencies: ["shadcn:utils", "kbd"],
  examples: [
    { name: "features-7-demo", title: "Default", file: "features-7-demo.tsx" },
    { name: "features-7-two", title: "Two features", file: "features-7-two.tsx" },
  ],
  ai: {
    summary: "For menu bar and utility apps. Pass features=[{ id, title, description, keys?, icon?, panel }] where panel is the UI that hangs from the menu bar icon; time sets the clock in the mock menu bar.",
    whenToUse: ["Menu bar utilities and background apps", "Anything the user reaches with a shortcut"],
    whenNotToUse: ["Window-based apps (use features-4 or showcase-1)"],
    composesWith: ["hero-5", "showcase-1", "download-1", "pricing-4"],
    a11y: [
      { keys: "Arrow Up / Down", action: "Moves between features and selects; the list is a radio group" },
      { keys: "Shortcuts", action: "Each feature spells its shortcut out for screen readers; the miniature desktop is hidden from assistive technology" },
      { keys: "Reduced motion", action: "Panels swap without animation" },
    ],
    customization: ["features: panel is any node; keys are shown as keycaps", "defaultValue, time"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

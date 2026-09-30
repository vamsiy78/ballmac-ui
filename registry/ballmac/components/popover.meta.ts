import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "popover",
  type: "registry:ui",
  title: "Popover",
  description:
    "A focus-managed compact surface for controls or details, with collision handling, mobile-safe width, and optional close action.",
  category: "primitives",
  tags: ["overlay", "panel", "editor", "radix"],
  files: [{ path: "components/popover.tsx" }],
  dependencies: ["radix-ui", "lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "popover-demo", title: "Share settings", file: "popover-demo.tsx" },
    {
      name: "popover-states",
      title: "Profile details",
      file: "popover-states.tsx",
    },
  ],
  ai: {
    summary:
      "Displays a small interactive panel anchored to a control, with managed focus and Escape dismissal.",
    whenToUse: [
      "Inline editors and compact preferences",
      "Actions needing more room than a menu",
    ],
    whenNotToUse: [
      "Long or critical forms; use dialog",
      "Noninteractive link previews; use hover-card",
    ],
    composesWith: ["button", "input"],
    a11y: [
      { keys: "Enter / Space", action: "Opens the panel from its trigger" },
      { keys: "Tab / Shift+Tab", action: "Moves among panel controls" },
      { keys: "Escape", action: "Closes and returns focus to the trigger" },
    ],
    customization: [
      "alignment and side offset",
      "optional close button",
      "controlled open state",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});

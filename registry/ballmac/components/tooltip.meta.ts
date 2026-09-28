import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "tooltip",
  type: "registry:ui",
  title: "Tooltip",
  description:
    "A Radix tooltip with an arrow, side offset and fade and zoom transitions that opens on hover and keyboard focus. Works standalone or under a shared provider.",
  category: "primitives",
  tags: ["tooltip", "hint", "popover", "radix"],
  files: [{ path: "components/tooltip.tsx" }],
  dependencies: ["radix-ui"],
  devDependencies: ["tw-animate-css"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "tooltip-demo", title: "Default", file: "tooltip-demo.tsx" },
  ],
  ai: {
    summary:
      "Short text hint for a control, shown on hover and focus. Compose Tooltip > TooltipTrigger (style it with buttonVariants and give icon triggers an aria-label) + TooltipContent. Put Kbd inside the content for shortcut hints.",
    whenToUse: ["Naming icon-only buttons (still give the button an aria-label)", "Shortcut hints next to a label", "Clarifying truncated text"],
    whenNotToUse: ["Essential information or anything interactive (use a popover)", "Touch-first UIs where hover doesn't exist", "Error messages (show them inline)"],
    composesWith: ["button", "kbd", "avatar"],
    a11y: [
      { keys: "Tab (focus trigger)", action: "Opens the tooltip" },
      { keys: "Escape", action: "Closes the tooltip" },
    ],
    customization: ["TooltipProvider delayDuration (default 200 ms) and skipDelayDuration", "TooltipContent side, align, sideOffset (default 6) and arrow (default true)", "Needs the tw-animate-css classes for the open and close animation"],
  },
  source: {
    name: "shadcn/ui Tooltip",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-28",
})

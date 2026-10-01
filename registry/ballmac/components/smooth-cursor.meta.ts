import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "smooth-cursor",
  type: "registry:ui",
  title: "Smooth Cursor",
  description:
    "A custom cursor for one area that glides after the pointer on a spring, leans into the direction of travel, shrinks on press and grows a label over elements marked with data-cursor-label.",
  category: "motion",
  tags: ["cursor", "pointer", "spring", "hover", "label"],
  files: [{ path: "components/smooth-cursor.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "smooth-cursor-demo", title: "Gallery with labels", file: "smooth-cursor-demo.tsx" },
    { name: "smooth-cursor-custom", title: "Custom cursor graphic", file: "smooth-cursor-custom.tsx" },
  ],
  ai: {
    summary:
      "<SmoothCursor cursor hideNative stiffness>area</SmoothCursor>. It only covers its own area, ignores touch, leaves text fields on the normal cursor and sets no global styles. data-cursor-label='View' on any child adds a label.",
    whenToUse: ["Portfolios and galleries", "Product tours with hover storytelling"],
    whenNotToUse: ["Form-heavy or data-dense screens", "Touch-first products"],
    composesWith: ["magnetic-button", "tilt-card"],
    a11y: [
      { keys: "Keyboard", action: "Unaffected: focus rings and tab order do not change" },
      { keys: "Screen readers", action: "The cursor is aria-hidden" },
      { keys: "Reduced motion", action: "The cursor follows the pointer with no spring or lean" },
    ],
    customization: ["cursor", "hideNative", "stiffness", "data-cursor-label", "data-cursor='native'"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

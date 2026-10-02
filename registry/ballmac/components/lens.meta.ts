import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "lens",
  type: "registry:ui",
  title: "Lens",
  description:
    "A magnifying lens that follows the pointer over an image or any content, moves with the arrow keys when focused, hides on Escape and keeps the copy inside it out of the accessibility tree.",
  category: "motion",
  tags: ["zoom", "magnifier", "image", "hover", "lens"],
  files: [{ path: "components/lens.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "lens-demo", title: "Product image", file: "lens-demo.tsx" },
    { name: "lens-text", title: "Magnifying text", file: "lens-text.tsx" },
  ],
  ai: {
    summary:
      "<Lens zoom lensSize label>{image or content}</Lens>. Works with any child. The magnified copy is inert and aria-hidden. Touch pointers are ignored so scrolling is never blocked.",
    whenToUse: ["Product photos and maps", "Inspecting fine detail in diagrams or charts"],
    whenNotToUse: ["Full-screen image viewing (use a dialog)"],
    composesWith: ["card", "tilt-card"],
    a11y: [
      { keys: "Tab", action: "The area is focusable; the lens appears centered" },
      { keys: "ArrowKeys", action: "Move the lens in steps; Escape hides it" },
      { keys: "Screen readers", action: "The group is named and explains the keys; the copy is hidden" },
    ],
    customization: ["zoom", "lensSize", "label"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

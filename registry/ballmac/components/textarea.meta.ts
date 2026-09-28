import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "textarea",
  type: "registry:ui",
  title: "Textarea",
  description:
    "A multi-line text field that can grow with its content between minRows and maxRows, then scroll. Plain resizable mode when autoResize is off.",
  category: "primitives",
  tags: ["textarea", "form", "autosize", "multiline"],
  files: [{ path: "components/textarea.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "textarea-demo", title: "Default", file: "textarea-demo.tsx" },
    { name: "textarea-autosize", title: "Auto-resize", file: "textarea-autosize.tsx" },
  ],
  ai: {
    summary:
      "Multi-line text input. Set autoResize with minRows and maxRows for chat composers and comment boxes; leave it off for a user-resizable box with a fixed rows count.",
    whenToUse: ["Comments, feedback and descriptions", "Chat or prompt composers that grow as the user types (autoResize)", "Notes fields in settings forms"],
    whenNotToUse: ["Single-line values (use input)", "Rich text or markdown editing with formatting controls"],
    composesWith: ["label", "button", "dialog"],
    a11y: [
      { keys: "Tab", action: "Moves focus to the textarea" },
      { keys: "Enter", action: "Inserts a new line" },
    ],
    customization: ["autoResize: grows with content; minRows (default rows or 3) and maxRows cap the height", "aria-invalid=\"true\" switches to destructive styling", "Works controlled (value/onChange) or uncontrolled"],
  },
  source: {
    name: "shadcn/ui Textarea",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-28",
})

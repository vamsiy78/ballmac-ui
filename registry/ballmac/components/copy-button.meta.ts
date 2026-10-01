import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "copy-button",
  type: "registry:ui",
  title: "Copy Button",
  description:
    "A copy-to-clipboard button with a morphing check icon, an optional label, a fallback for blocked clipboards, an error state and a polite announcement.",
  category: "developer",
  tags: ["copy", "clipboard", "button", "developer"],
  files: [{ path: "components/copy-button.tsx" }],
  dependencies: ["motion@^12", "lucide-react", "class-variance-authority"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "copy-button-demo", title: "Icon, label and variants", file: "copy-button-demo.tsx" },
    { name: "copy-button-inline", title: "Inline with a value", file: "copy-button-inline.tsx" },
  ],
  ai: {
    summary:
      "Pass value (or getValue for content read at click time). label adds visible text, variant is ghost | outline | solid, size sm | default | lg. Falls back to execCommand when navigator.clipboard is blocked and shows 'Copy failed' if both fail.",
    whenToUse: ["Any value a developer will paste: keys, URLs, commands, IDs", "Toolbars on code, logs and config"],
    whenNotToUse: ["Copying a whole code block with a header (code-block has its own button)"],
    composesWith: ["code-block", "api-key-field", "terminal"],
    a11y: [
      { keys: "Enter / Space", action: "Copies and confirms" },
      { keys: "Screen readers", action: "Name changes to 'Copied' and a polite status announces it; failures say 'Copy failed'" },
      { keys: "Reduced motion", action: "The icon swaps with a fade only" },
    ],
    customization: ["variant", "size", "label and copiedLabel", "getValue for async or dynamic text", "resetAfter", "onCopied / onError"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

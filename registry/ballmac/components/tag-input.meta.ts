import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "tag-input",
  type: "registry:ui",
  title: "Tag Input",
  description:
    "Enter, paste, and remove text tags with duplicate prevention, limits, and keyboard shortcuts.",
  category: "forms",
  tags: ["tags", "chips", "text-input"],
  files: [{ path: "components/tag-input.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "tag-input-demo", title: "Overview", file: "tag-input-demo.tsx" },
    {
      name: "tag-input-states",
      title: "States and variants",
      file: "tag-input-states.tsx",
    },
  ],
  ai: {
    summary:
      "Enter, paste, and remove text tags with duplicate prevention, limits, and keyboard shortcuts.",
    whenToUse: [
      "Enter free-form labels or skills",
      "Edit a small set of keywords",
    ],
    whenNotToUse: ["Use multi-select for a fixed set of options"],
    composesWith: ["input"],
    a11y: [
      { keys: "Enter / comma", action: "Adds the typed tag" },
      { keys: "Backspace", action: "Removes the last tag when empty" },
      { keys: "Tab / Enter", action: "Focuses and activates remove buttons" },
    ],
    customization: [
      "maxTags, maxLength",
      "value / defaultValue and onValueChange",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})

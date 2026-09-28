import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "checkbox",
  type: "registry:ui",
  title: "Checkbox",
  description:
    "A Radix checkbox with checked and indeterminate (mixed) states, a check or minus icon, focus ring and invalid styling, for forms and select-all lists.",
  category: "primitives",
  tags: ["checkbox", "form", "indeterminate", "radix"],
  files: [{ path: "components/checkbox.tsx" }],
  dependencies: ["radix-ui", "lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "checkbox-demo", title: "Default", file: "checkbox-demo.tsx" },
    { name: "checkbox-indeterminate", title: "Select all", file: "checkbox-indeterminate.tsx" },
  ],
  ai: {
    summary:
      "Binary or tri-state choice. Pass checked=\"indeterminate\" for a parent row whose children are partly selected; aria-checked becomes \"mixed\". Pair with Label via id/htmlFor.",
    whenToUse: ["Agreeing to terms or opting into emails", "Multi-select lists and table row selection", "A select-all control that reflects partial selection"],
    whenNotToUse: ["Settings that apply immediately (use switch)", "Choosing exactly one option from several (use a radio group or select)"],
    composesWith: ["label", "button"],
    a11y: [
      { keys: "Space", action: "Toggles the checkbox" },
      { keys: "Tab", action: "Moves focus to the checkbox" },
    ],
    customization: ["checked: boolean | \"indeterminate\"; onCheckedChange receives the new state", "aria-invalid=\"true\" for errors", "Inherits the peer class so a following Label dims when disabled"],
  },
  source: {
    name: "shadcn/ui Checkbox",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-28",
})

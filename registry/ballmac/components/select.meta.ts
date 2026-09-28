import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "select",
  type: "registry:ui",
  title: "Select",
  description:
    "A Radix select with a sized trigger, popper-positioned menu, scroll buttons, groups, labels, separators and a check indicator on the chosen item.",
  category: "primitives",
  tags: ["select", "dropdown", "form", "radix", "listbox"],
  files: [{ path: "components/select.tsx" }],
  dependencies: ["radix-ui", "lucide-react"],
  devDependencies: ["tw-animate-css"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "select-demo", title: "Default", file: "select-demo.tsx" },
    { name: "select-grouped", title: "Grouped", file: "select-grouped.tsx" },
  ],
  ai: {
    summary:
      "Pick one value from a list. Compose Select > SelectTrigger > SelectValue and SelectContent > SelectItem (group with SelectGroup + SelectLabel). The menu is portalled and keyboard navigable with typeahead.",
    whenToUse: ["Choosing one option from 4 to 20 fixed values (timezone, role, region)", "Compact filters in toolbars (size sm)", "Grouped options such as regions by continent"],
    whenNotToUse: ["Two or three options that should stay visible (use a radio group or segmented control)", "Long searchable lists (use a combobox)", "Actions rather than values (use a dropdown menu)"],
    composesWith: ["label", "button", "dialog"],
    a11y: [
      { keys: "Space / Enter / ArrowDown", action: "Opens the menu" },
      { keys: "ArrowUp / ArrowDown", action: "Moves between items" },
      { keys: "Enter", action: "Selects the focused item" },
      { keys: "Type a letter", action: "Jumps to the matching item" },
      { keys: "Escape", action: "Closes the menu" },
    ],
    customization: ["SelectTrigger size: sm | default", "SelectContent position: popper (default, below the trigger) | item-aligned", "Items accept icons before the text", "Needs the tw-animate-css classes for the open and close animation"],
  },
  source: {
    name: "shadcn/ui Select",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-28",
})

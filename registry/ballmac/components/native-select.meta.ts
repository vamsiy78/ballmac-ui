import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "native-select",
  type: "registry:ui",
  title: "Native Select",
  description:
    "The browser's own select, styled to match the input: three sizes, a placeholder, groups, a leading icon, invalid and disabled states and a loading spinner, so phones keep their picker and forms keep working.",
  category: "forms",
  tags: ["select", "native", "dropdown", "form", "mobile", "picker", "optgroup"],
  files: [{ path: "components/native-select.tsx" }],
  dependencies: ["class-variance-authority", "lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "native-select-demo", title: "With a placeholder", file: "native-select-demo.tsx" },
    { name: "native-select-groups", title: "Groups and an icon", file: "native-select-groups.tsx" },
    { name: "native-select-sizes", title: "Sizes", file: "native-select-sizes.tsx" },
    { name: "native-select-form", title: "In a form, with an error", file: "native-select-form.tsx" },
    { name: "native-select-loading", title: "Options still loading", file: "native-select-loading.tsx" },
    { name: "native-select-disabled", title: "Disabled, invalid and multiple", file: "native-select-disabled.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading options", example: "native-select-loading", trigger: "loading", note: "A spinner takes the arrow's place and the field is marked busy; it can still be opened, and the options appear when they arrive." },
    { id: "disabled", title: "Disabled", example: "native-select-disabled", trigger: "disabled", note: "Dimmed and unavailable to the pointer and keyboard, and left out of the form's data, as a native select is." },
  ],
  ai: {
    summary:
      "<NativeSelect name placeholder> with <NativeSelectOption value> children and <NativeSelectGroup label> for groups. It is a real select: use value and onValueChange, or leave it uncontrolled in a form.",
    whenToUse: [
      "Forms where a short list of choices should use the device's own picker (phones, tablets)",
      "Long lists such as countries or time zones where type-to-jump matters",
      "Anywhere accessibility and autofill should be exactly the browser's",
    ],
    whenNotToUse: [
      "Options with icons, descriptions or search; use select or combobox",
      "Choosing many items with chips; use multi-select",
      "A handful of choices that deserve to be seen at once; use radio-group or segmented-control",
    ],
    composesWith: ["label", "input", "field"],
    a11y: [
      { keys: "Tab / Shift+Tab", action: "Moves to and from the field" },
      { keys: "Space / Alt+Down / Enter", action: "Opens the browser's list; arrow keys and typing choose" },
      { keys: "Screen readers", action: "It is a real select, so name, value, options and groups are read by the browser; give it a label" },
      { keys: "aria-invalid and aria-describedby", action: "Set them with an error message, as on an input" },
    ],
    customization: [
      "size: sm | default | lg, to match input heights",
      "placeholder for a first empty choice (required keeps it from being chosen again)",
      "startIcon, loading, rows for a multiple select",
      "onValueChange as well as onChange",
    ],
  },
  source: {
    name: "shadcn/ui Input",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-10-19",
});

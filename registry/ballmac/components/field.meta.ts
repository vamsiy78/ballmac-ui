import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "field",
  type: "registry:ui",
  title: "Field",
  description:
    "Form field layout with label, description and error that wire their ids to the control automatically, plus fieldset, legend, orientation and invalid/disabled state.",
  category: "forms",
  tags: ["form", "label", "validation", "layout"],
  files: [{ path: "components/field.tsx" }],
  dependencies: ["class-variance-authority"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "field-demo", title: "Invite form", file: "field-demo.tsx" },
    { name: "field-states", title: "Switch rows", file: "field-states.tsx" },
  ],
  ai: {
    summary:
      "Wrap a control in Field, spread useFieldControl() on it, and label, description, error, aria-invalid and disabled are connected for you.",
    whenToUse: ["Any labelled form control", "Forms with validation messages", "Settings rows with a switch or checkbox"],
    whenNotToUse: ["A single unlabeled search box; use search-field", "Complete form state management; combine with your form library"],
    composesWith: ["input", "textarea", "select", "checkbox", "switch", "combobox"],
    a11y: [
      { keys: "Click label", action: "Focuses the control" },
      { keys: "Screen readers", action: "Read the description, and the error when invalid; the error is announced with role alert" },
    ],
    customization: ["orientation: vertical | horizontal | responsive", "invalid and disabled", "FieldError errors array (deduplicated)", "required marker on FieldLabel"],
  },
  source: {
    name: "shadcn/ui Field",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-30",
});

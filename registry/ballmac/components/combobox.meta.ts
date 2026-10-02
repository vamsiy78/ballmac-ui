import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "combobox",
  type: "registry:ui",
  title: "Combobox",
  description:
    "A searchable single-choice select with groups, descriptions, keywords, clearable value, invalid state and hidden-input form submission.",
  category: "forms",
  tags: ["select", "search", "autocomplete", "form"],
  files: [{ path: "components/combobox.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "command", "popover", "i18n"],
  examples: [
    { name: "combobox-demo", title: "Framework picker", file: "combobox-demo.tsx" },
    { name: "combobox-states", title: "Groups and states", file: "combobox-states.tsx" },
  ],
  ai: {
    summary:
      "Pass options with value and label. It opens a filterable list; the trigger is a combobox button that submits through name.",
    whenToUse: ["Choosing from more than about seven options", "Time zones, countries, users and frameworks"],
    whenNotToUse: ["Short lists; use select or radio-group", "Choosing several values; use multi-select"],
    composesWith: ["field", "command", "popover"],
    a11y: [
      { keys: "Enter / Space / ArrowDown", action: "Opens the list from the trigger" },
      { keys: "Type", action: "Filters options; matches value, label and keywords" },
      { keys: "ArrowUp / ArrowDown / Enter", action: "Moves and selects" },
      { keys: "Escape", action: "Closes and returns focus to the trigger" },
    ],
    customization: ["options with group, icon, description and keywords", "clearable", "invalid", "name for native form submission"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});

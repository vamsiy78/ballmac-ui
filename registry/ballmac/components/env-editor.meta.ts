import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "env-editor",
  type: "registry:ui",
  title: "Env Editor",
  description:
    "A .env editor with masked values, show and hide, name validation and duplicate detection, paste-to-import for whole .env files, and copy as .env.",
  category: "developer",
  tags: ["env", "environment", "variables", "secrets", "config"],
  files: [{ path: "components/env-editor.tsx" }],
  dependencies: ["motion@^12", "lucide-react"],
  registryDependencies: ["shadcn:utils", "copy-button", "i18n"],
  examples: [
    { name: "env-editor-demo", title: "Project variables", file: "env-editor-demo.tsx" },
    { name: "env-editor-controlled", title: "Controlled with a live .env preview", file: "env-editor-controlled.tsx" },
  ],
  ai: {
    summary:
      "Uncontrolled with defaultValue [{ key, value }] or controlled with value [{ id, key, value }] and onChange. Pasting KEY=value lines into a name field, or into the Paste .env box, imports them. parseEnv and formatEnv are exported.",
    whenToUse: ["Project or deployment settings pages", "Anywhere people manage secrets as key and value pairs"],
    whenNotToUse: ["Structured settings with types (settings-panel)", "A single secret (api-key-field)"],
    composesWith: ["api-key-field", "settings-panel", "copy-button"],
    a11y: [
      { keys: "Tab", action: "Name, value, show/hide, remove for every row, in order" },
      { keys: "Screen readers", action: "Inputs are named 'Name of variable 2' and 'Value of API_KEY'; problems are linked with aria-describedby; add and remove are announced" },
      { keys: "Focus", action: "A new row focuses its name; removing focuses the row above" },
    ],
    customization: ["maskAll", "disabled", "title and description", "onChange"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

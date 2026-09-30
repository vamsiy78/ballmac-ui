import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "settings-panel",
  type: "registry:ui",
  title: "Settings Panel",
  description:
    "A sectioned settings card with label-and-control rows and a save bar that slides in when something changes, with a status announced to screen readers.",
  category: "saas",
  tags: ["settings", "form", "preferences", "save bar"],
  files: [{ path: "components/settings-panel.tsx" }],
  dependencies: ["motion@^12", "lucide-react"],
  registryDependencies: ["shadcn:utils", "motion-presets"],
  examples: [
    { name: "settings-panel-demo", title: "Workspace settings", file: "settings-panel-demo.tsx" },
    { name: "settings-panel-states", title: "Unsaved changes", file: "settings-panel-states.tsx" },
  ],
  ai: {
    summary:
      "<SettingsPanel status onSave onDiscard><SettingsSection title><SettingsRow label htmlFor>{control}</SettingsRow></SettingsSection></SettingsPanel>. Drive status: idle | dirty | saving | saved.",
    whenToUse: ["Account, workspace and notification settings", "Any form where people expect Save and Discard"],
    whenNotToUse: ["Single-field inline edits", "Wizards; use stepper-form"],
    composesWith: ["switch", "input", "select", "field"],
    a11y: [
      { keys: "Enter", action: "Submits the form from any field" },
      { keys: "Tab", action: "Save bar buttons are in the tab order after the fields" },
      { keys: "Screen readers", action: "Sections are labelled groups; save status is a polite live region" },
    ],
    customization: ["status", "dirtyMessage and saveLabel", "stacked rows for wide controls"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});

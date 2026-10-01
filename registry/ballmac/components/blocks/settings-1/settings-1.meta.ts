import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "settings-1",
  type: "registry:block",
  title: "Settings 1: profile and account",
  description: "An account settings page: profile with username availability, sign-in details with a change-password dialog, language, time zone and appearance, a type-to-confirm delete, and a sticky save bar that appears only when something changed.",
  category: "blocks",
  blockCategory: "settings",
  tags: ["settings", "profile", "account", "preferences", "save bar", "danger zone"],
  files: [{ path: "components/blocks/settings-1/settings-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "alert-dialog", "avatar", "badge", "button", "dialog", "field", "input", "password-input", "segmented-control", "select", "textarea"],
  examples: [
    { name: "settings-1-demo", title: "Default", file: "settings-1-demo.tsx" },
    { name: "settings-1-save", title: "Failing save", file: "settings-1-save.tsx" },
  ],
  ai: {
    summary: "Profile and account settings. Pass defaultValues, email, onSave(values) (throw to show an error) and onDeleteAccount; the dirty-state save bar, validation and availability hint are built in.",
    whenToUse: ["Account and profile pages", "Any settings screen where edits are saved together"],
    whenNotToUse: ["Toggle-style settings that save instantly (use settings-2 or settings-panel)"],
    composesWith: ["app-shell-1", "settings-2", "settings-3", "billing-1"],
    a11y: [
      { keys: "Edit any field", action: "The save bar slides in; its state (unsaved, saving, saved, error) is announced politely" },
      { keys: "Delete account", action: "An alert dialog asks you to type 'delete'; the confirm button stays disabled until you do" },
      { keys: "Invalid name or username", action: "Errors are announced and linked to the field; saving is blocked" },
    ],
    customization: ["defaultValues, email, takenUsernames, languages, timezones", "onSave(values), onDeleteAccount()"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

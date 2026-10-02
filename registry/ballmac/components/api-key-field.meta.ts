import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "api-key-field",
  type: "registry:ui",
  title: "API Key Field",
  description:
    "Displays a secret such as an API key, masked by default (sk-live-••••••••a1b2), with a reveal toggle, a copy button that copies the full key, and an optional regenerate action.",
  category: "developer",
  tags: ["api-key", "secret", "token", "copy", "mask", "settings", "developer"],
  files: [{ path: "components/api-key-field.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [{ name: "api-key-field-demo", title: "Default", file: "api-key-field-demo.tsx" }],
  ai: {
    summary:
      "Show an existing secret: <ApiKeyField value={key} label='Secret key' onRegenerate={confirmThenRotate} />. It is read-only; copy always copies the full value, even while masked.",
    whenToUse: [
      "API keys, webhook signing secrets and access tokens on settings or developer pages",
      "Showing a newly created key once so the user can copy it",
    ],
    whenNotToUse: [
      "Password entry (use an input with type=password)",
      "Secrets you should not send to the browser at all (show only the last four characters from the server)",
    ],
    composesWith: ["button", "dialog"],
    a11y: [
      { keys: "Tab", action: "Moves between reveal, copy and regenerate buttons" },
      { keys: "Enter / Space", action: "Reveal is a toggle button (aria-pressed); copy announces 'Key copied to clipboard'" },
      { keys: "—", action: "While masked, screen readers hear the prefix and last characters, not bullet characters" },
    ],
    customization: [
      "visiblePrefix (default 8) and visibleSuffix (default 4) characters stay visible; the mask length is fixed so it doesn't reveal the key length",
      "revealed/defaultRevealed/onRevealedChange",
      "onRegenerate shows a regenerate button; confirmation is the caller's job (e.g. a dialog); regenerating spins it",
      "onCopy runs after a successful copy; the component never logs the value",
    ],
  },
  version: "1.0.1",
  updated: "2026-09-29",
})

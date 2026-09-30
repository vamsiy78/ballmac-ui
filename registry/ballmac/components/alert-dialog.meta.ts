import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "alert-dialog",
  type: "registry:ui",
  title: "Alert Dialog",
  description:
    "Focus-managed confirmation for consequential actions, with a clear cancel path, optional media, and a token-based destructive action.",
  category: "feedback",
  tags: ["confirmation", "modal", "destructive", "radix"],
  files: [{ path: "components/alert-dialog.tsx" }],
  dependencies: ["radix-ui"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "alert-dialog-demo",
      title: "Remove a project",
      file: "alert-dialog-demo.tsx",
    },
    {
      name: "alert-dialog-states",
      title: "Confirmation styles",
      file: "alert-dialog-states.tsx",
    },
  ],
  ai: {
    summary:
      "Ask for explicit confirmation before a consequential action; cancel remains the safe keyboard path.",
    whenToUse: [
      "Delete or revoke something permanent",
      "Confirm an action with a material consequence",
    ],
    whenNotToUse: [
      "Show information without requiring a choice; use dialog",
      "Confirm a low-risk routine action",
    ],
    composesWith: ["button"],
    a11y: [
      { keys: "Tab / Shift+Tab", action: "Moves within the modal choices" },
      { keys: "Enter / Space", action: "Activates the focused choice" },
      { keys: "Escape", action: "Cancels when the dialog permits dismissal" },
    ],
    customization: [
      "size: default | sm",
      "destructive action state",
      "controlled open state",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});

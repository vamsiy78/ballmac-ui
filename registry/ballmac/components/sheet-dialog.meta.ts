import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "sheet-dialog",
  type: "registry:ui",
  title: "Sheet Dialog",
  description:
    "A macOS sheet: a frosted panel that drops from the top edge of its window and dims only that window, with a default accent button, on Radix Dialog for focus trapping and Escape to cancel.",
  category: "macos",
  tags: ["sheet", "dialog", "macos", "modal", "window"],
  files: [{ path: "components/sheet-dialog.tsx" }],
  dependencies: ["motion@^12", "radix-ui"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "sheet-dialog-demo", title: "Save changes sheet", file: "sheet-dialog-demo.tsx" },
    { name: "sheet-dialog-form", title: "Form sheet in a window", file: "sheet-dialog-form.tsx" },
  ],
  ai: {
    summary:
      "<SheetDialog container={windowRef}> with SheetDialogTrigger and SheetDialogContent (Header, Title, Description, Footer, Button primary). Give it the window element so it attaches there; without it it drops from the page.",
    whenToUse: ["Confirmations and short forms attached to a window", "Mac-style apps and demos"],
    whenNotToUse: ["General modals (dialog)", "Side panels (sheet)"],
    composesWith: ["mac-window", "dialog", "window-manager"],
    a11y: [
      { keys: "Escape", action: "Cancels" },
      { keys: "Focus", action: "Trapped in the sheet and returned to the trigger on close" },
      { keys: "Screen readers", action: "Named dialog with description" },
      { keys: "Reduced motion", action: "The sheet fades in place" },
    ],
    customization: ["container", "primary and destructive buttons", "className on the content"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

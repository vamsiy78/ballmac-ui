import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "toast",
  type: "registry:ui",
  title: "Toast",
  description:
    "Stacked toasts on Sonner styled with theme tokens: status icons, actions, promises, swipe to dismiss, pause on hover and focus, and screen-reader announcements.",
  category: "feedback",
  tags: ["toast", "notification", "sonner", "feedback"],
  files: [{ path: "components/toast.tsx" }],
  dependencies: ["sonner@^2", "lucide-react"],
  registryDependencies: [],
  examples: [
    { name: "toast-demo", title: "Toast types", file: "toast-demo.tsx" },
    { name: "toast-states", title: "Action and warning", file: "toast-states.tsx" },
  ],
  ai: {
    summary:
      "Render <Toaster /> once, then call toast(), toast.success(), toast.error() or toast.promise() from anywhere.",
    whenToUse: ["Confirming an action (saved, copied, archived)", "Undo prompts", "Background task results"],
    whenNotToUse: ["Errors the user must fix in a form; use field errors", "Permanent page messages; use alert or banner", "A macOS-style stack; use toast-stack"],
    composesWith: ["button", "toast-stack"],
    a11y: [
      { keys: "Alt+T", action: "Focuses the notification region" },
      { keys: "Tab", action: "Reaches toast actions and close buttons" },
      { keys: "Screen readers", action: "Toasts are announced politely" },
    ],
    customization: ["position", "duration", "action and cancel buttons", "toasterId for multiple regions"],
  },
  source: {
    name: "shadcn/ui Sonner",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-30",
});

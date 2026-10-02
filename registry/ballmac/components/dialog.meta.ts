import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "dialog",
  type: "registry:ui",
  title: "Dialog",
  description:
    "A Radix modal dialog with a blurred overlay, centered card surface that fits 360 px screens, header and footer parts, optional close button and animations.",
  category: "primitives",
  tags: ["dialog", "modal", "overlay", "radix"],
  files: [{ path: "components/dialog.tsx" }],
  dependencies: ["radix-ui", "lucide-react"],
  devDependencies: ["tw-animate-css"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "dialog-demo", title: "Edit profile", file: "dialog-demo.tsx" },
    { name: "dialog-confirm", title: "Confirm", file: "dialog-confirm.tsx" },
  ],
  ai: {
    summary:
      "Modal window that traps focus. Compose Dialog > DialogTrigger (style it with buttonVariants) + DialogContent with DialogHeader (DialogTitle, DialogDescription) and DialogFooter; use DialogClose with buttonVariants for cancel buttons. Avoid asChild so the files also work in Base UI projects.",
    whenToUse: ["Short forms that shouldn't leave the page (edit profile, rename)", "Confirming destructive actions", "Focused detail views"],
    whenNotToUse: ["Non-blocking messages (use a toast)", "Long multi-step flows (use a page)", "Content tied to a control that should stay visible (use a popover)"],
    composesWith: ["button", "input", "label", "textarea", "select"],
    a11y: [
      { keys: "Escape", action: "Closes the dialog" },
      { keys: "Tab / Shift+Tab", action: "Cycles focus inside the dialog" },
      { keys: "Enter / Space on trigger", action: "Opens the dialog" },
    ],
    customization: ["showCloseButton (default true) and closeLabel for the X button", "DialogContent max-w-lg by default; override with className", "Always include a DialogTitle (use a sr-only class to hide it visually)", "Needs the tw-animate-css classes for the open and close animation"],
  },
  source: {
    name: "shadcn/ui Dialog",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-28",
})

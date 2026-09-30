import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "toast-stack",
  type: "registry:ui",
  title: "Toast Stack",
  description:
    "A token-based notification stack with dismissal, optional actions, and pause-on-interaction timing.",
  category: "feedback",
  tags: ["toast", "notification", "feedback"],
  files: [
    {
      path: "components/toast-stack.tsx",
    },
  ],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "toast-stack-demo",
      title: "Overview",
      file: "toast-stack-demo.tsx",
    },
    {
      name: "toast-stack-states",
      title: "States and variants",
      file: "toast-stack-states.tsx",
    },
  ],
  ai: {
    summary:
      "A token-based notification stack with dismissal, optional actions, and pause-on-interaction timing.",
    whenToUse: [
      "Confirm an asynchronous action",
      "Offer undo or retry after a task",
    ],
    whenNotToUse: ["Use banner for persistent page-wide messages"],
    composesWith: ["button", "notification-stack"],
    a11y: [
      {
        keys: "Tab / Enter / Escape",
        action: "Activate actions or dismiss a focused toast",
      },
    ],
    customization: [
      "Controlled or uncontrolled list",
      "Auto-dismiss duration and pause",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})

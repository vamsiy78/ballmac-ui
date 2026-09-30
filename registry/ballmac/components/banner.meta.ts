import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "banner",
  type: "registry:ui",
  title: "Banner",
  description:
    "A page-wide announcement with semantic tones, optional action, and controlled or local dismissal.",
  category: "feedback",
  tags: ["announcement", "status", "dismissible"],
  files: [
    {
      path: "components/banner.tsx",
    },
  ],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "banner-demo",
      title: "Overview",
      file: "banner-demo.tsx",
    },
    {
      name: "banner-states",
      title: "States and variants",
      file: "banner-states.tsx",
    },
  ],
  ai: {
    summary:
      "A page-wide announcement with semantic tones, optional action, and controlled or local dismissal.",
    whenToUse: [
      "Announce a page-level update",
      "Keep a persistent notice above page content",
    ],
    whenNotToUse: ["Use alert for content scoped to one panel"],
    composesWith: ["alert", "button"],
    a11y: [
      {
        keys: "Tab / Enter",
        action: "Focus and activate the action or dismiss control",
      },
    ],
    customization: [
      "tone: info | success | warning",
      "Controlled or uncontrolled visibility",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})

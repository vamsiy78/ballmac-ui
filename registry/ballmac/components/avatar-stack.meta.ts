import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "avatar-stack",
  type: "registry:ui",
  title: "Avatar Stack",
  description:
    "An accessible compact row of people with initials, image support, and an overflow count.",
  category: "data-display",
  tags: ["people", "avatar", "team"],
  files: [{ path: "components/avatar-stack.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "avatar-stack-demo",
      title: "Overview",
      file: "avatar-stack-demo.tsx",
    },
    {
      name: "avatar-stack-states",
      title: "States and variants",
      file: "avatar-stack-states.tsx",
    },
  ],
  ai: {
    summary:
      "An accessible compact row of people with initials, image support, and an overflow count.",
    whenToUse: ["Show participants or collaborators in limited space"],
    whenNotToUse: ["Use Avatar for one person"],
    composesWith: ["avatar"],
    a11y: [
      {
        keys: "None",
        action: "Static content is announced with semantic structure",
      },
    ],
    customization: ["Content, layout, and token-based className styling"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})

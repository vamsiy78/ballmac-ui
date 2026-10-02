import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "avatar",
  type: "registry:ui",
  title: "Avatar",
  description:
    "A Radix avatar with image and initials fallback, three sizes, an optional presence dot, and AvatarGroup for overlapping stacks with a +N overflow counter.",
  category: "primitives",
  tags: ["avatar", "user", "profile", "presence", "radix"],
  files: [{ path: "components/avatar.tsx" }],
  dependencies: ["radix-ui", "class-variance-authority"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "avatar-demo", title: "Default", file: "avatar-demo.tsx" },
    { name: "avatar-group", title: "Group", file: "avatar-group.tsx" },
  ],
  ai: {
    summary:
      "User or team picture with initials fallback while the image loads or if it fails. Add status for presence, and wrap several in AvatarGroup with max to cap the visible count.",
    whenToUse: ["Showing who owns, edited or is assigned to something", "Account menus and comment threads", "Stacks of collaborators or members with an overflow count"],
    whenNotToUse: ["Logos or product icons (use an img)", "Large profile headers that need a custom shape"],
    composesWith: ["badge", "tooltip", "dialog"],
    a11y: [],
    customization: ["size: sm | default | lg (24 / 32 / 44 px)", "status: online | away | busy | offline, announced as screen reader text (statusLabel to override)", "AvatarGroup: size, max, total (when more members exist than you render)", "Always include an AvatarFallback with initials; the image alt names the person"],
  },
  source: {
    name: "shadcn/ui Avatar",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-28",
})

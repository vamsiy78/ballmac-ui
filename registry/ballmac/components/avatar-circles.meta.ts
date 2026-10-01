import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "avatar-circles",
  type: "registry:ui",
  title: "Avatar Circles",
  description:
    "Overlapping avatars that spread on hover, lift individually with a name and role tooltip, show presence, fall back to initials and end in a +N count that can be a button.",
  category: "data-display",
  tags: ["avatar", "people", "stack", "presence", "team"],
  files: [{ path: "components/avatar-circles.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "avatar-circles-demo", title: "Team with presence", file: "avatar-circles-demo.tsx" },
    { name: "avatar-circles-sizes", title: "Sizes and overflow button", file: "avatar-circles-sizes.tsx" },
  ],
  ai: {
    summary:
      "<AvatarCircles people={[{ name, src, role, status, href }]} max total size onOverflowClick />. Each face is a link or button named with its person (and status). total adds the +N when only some are loaded.",
    whenToUse: ["Showing who is in a project, document or room", "Social proof next to a call to action"],
    whenNotToUse: ["A plain compact row (avatar-stack)", "Large member tables (data-table)"],
    composesWith: ["avatar-stack", "avatar", "tooltip"],
    a11y: [
      { keys: "Tab", action: "Each person is focusable and shows the tooltip on focus" },
      { keys: "Screen readers", action: "Named 'Ada Lovelace, online'; the group announces the people count" },
      { keys: "Reduced motion", action: "No lift; the spread still happens with a plain transition" },
    ],
    customization: ["max and total", "size: sm | default | lg", "status", "href", "onOverflowClick"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

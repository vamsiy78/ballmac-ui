import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "mac-icons",
  type: "registry:ui",
  title: "Mac Icons",
  description:
    "Resolution-independent macOS-style icons drawn in SVG and CSS: folders, documents with extension badges, drives and gradient app icons in eight theme-aware colors.",
  category: "macos",
  tags: ["icons", "folder", "file", "app icon", "macos"],
  files: [{ path: "components/mac-icons.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "mac-icons-demo", title: "The four icon kinds", file: "mac-icons-demo.tsx" },
    { name: "mac-icons-tones", title: "Colors and sizes", file: "mac-icons-tones.tsx" },
  ],
  ai: {
    summary:
      "<FolderIcon size tone />, <FileIcon label='PDF' tone />, <DriveIcon />, <AppIcon tone size>{glyph}</AppIcon>. tone is blue | teal | green | amber | orange | red | purple | graphite. All are decorative (aria-hidden): put the name in text next to them.",
    whenToUse: ["Desktop, Finder and Launchpad recreations", "File lists that want recognisable macOS icons"],
    whenNotToUse: ["Small UI glyphs (use lucide-react icons)"],
    composesWith: ["finder-window", "desktop-icons", "launchpad", "dock"],
    a11y: [
      { keys: "Screen readers", action: "Icons are aria-hidden; always label the item with text" },
    ],
    customization: ["size", "tone", "FileIcon label", "AppIcon glyph"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

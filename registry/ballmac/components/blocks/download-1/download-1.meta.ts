import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "download-1",
  type: "registry:block",
  title: "Download 1: Mac app download with release notes",
  description: "A Mac app download section: app icon and version, an Apple silicon or Intel choice that swaps the file, copyable checksum and Homebrew command, install steps and release notes you can flip between.",
  category: "blocks",
  blockCategory: "download",
  tags: ["download", "mac", "app", "release notes", "homebrew", "checksum", "install"],
  files: [{ path: "components/blocks/download-1/download-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "copy-button", "mac-icons", "segmented-control", "i18n", "media"],
  examples: [
    { name: "download-1-demo", title: "Default", file: "download-1-demo.tsx" },
    { name: "download-1-simple", title: "One build, no notes", file: "download-1-simple.tsx" },
  ],
  ai: {
    summary: "The download page of a Mac app. Pass app, tagline, downloads={ arm64: { href, file, size, sha256? }, x64: {...} }, requirements, brew, steps and releases=[{ version, date, changes: [{ type, text }] }].",
    whenToUse: ["Direct-download Mac apps", "Any desktop app with separate builds per chip"],
    whenNotToUse: ["App Store only apps (link to the store instead)", "Web apps"],
    composesWith: ["hero-5", "showcase-1", "features-7", "pricing-4"],
    a11y: [
      { keys: "Arrow Left / Right", action: "Switches between Apple silicon and Intel, and between release versions" },
      { keys: "Download link", action: "A real link; when activated a polite status confirms the file name" },
      { keys: "Copy buttons", action: "Named 'Copy SHA-256 checksum' and 'Copy Homebrew command'; success is announced" },
    ],
    customization: ["downloads, requirements, brew (null hides), steps ([] hides), releases", "glyph: a letter or short text on the icon"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

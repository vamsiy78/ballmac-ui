import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "package-badge",
  type: "registry:ui",
  title: "Package Badge",
  description:
    "An npm-style package card or inline pill with version, weekly downloads and sparkline, size, license, TypeScript and module formats, and a one-click install command.",
  category: "developer",
  tags: ["npm", "package", "version", "install", "badge"],
  files: [{ path: "components/package-badge.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "copy-button"],
  examples: [
    { name: "package-badge-demo", title: "Card with stats", file: "package-badge-demo.tsx" },
    { name: "package-badge-inline", title: "Inline pills", file: "package-badge-inline.tsx" },
  ],
  ai: {
    summary:
      "Pass the facts you already have: name, version, description, downloads, trend, size, license, types, formats. variant is card | inline. manager picks npm | pnpm | yarn | bun for the copyable install command. Nothing is fetched.",
    whenToUse: ["Library landing pages and docs", "Showing dependencies in a changelog or README-style page"],
    whenNotToUse: ["Live registry lookups (fetch on the server and pass the result)"],
    composesWith: ["install-tabs", "copy-button", "badge"],
    a11y: [
      { keys: "Tab", action: "Reaches the package link and the copy button" },
      { keys: "Screen readers", action: "The trend chart is an image with a text alternative; stats are a description list" },
    ],
    customization: ["variant", "manager", "hideInstall", "trend", "href"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

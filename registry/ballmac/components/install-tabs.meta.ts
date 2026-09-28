import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "install-tabs",
  type: "registry:ui",
  title: "Install Tabs",
  description:
    "Package-manager tabs for a CLI command (pnpm, npm, yarn, bun) with a copy button. Remembers the reader's choice and keeps every instance on the page in sync.",
  category: "developer",
  tags: ["install", "cli", "npm", "pnpm", "yarn", "bun", "tabs", "copy", "docs"],
  files: [{ path: "components/install-tabs.tsx" }],
  dependencies: ["lucide-react", "radix-ui"],
  registryDependencies: ["shadcn:utils"],
  examples: [{ name: "install-tabs-demo", title: "Default", file: "install-tabs-demo.tsx" }],
  ai: {
    summary:
      "<InstallTabs command='shadcn@latest add @ballmac/button' storageKey='pm' /> renders pnpm dlx / npx / yarn dlx / bunx --bun variants. Use commands={{ npm: 'npm i x', pnpm: 'pnpm add x' }} for install (not run) commands.",
    whenToUse: [
      "Install or 'run this CLI' instructions in docs and READMEs",
      "Any page with several install snippets where the reader's package manager should stick",
    ],
    whenNotToUse: [
      "A command with its output (use terminal)",
      "Multi-line source code (use code-block)",
    ],
    composesWith: ["code-block", "terminal"],
    a11y: [
      { keys: "← / →", action: "Moves between package-manager tabs and selects them" },
      { keys: "Home / End", action: "Jumps to the first or last tab" },
      { keys: "Tab", action: "Moves to the copy button and the command panel" },
    ],
    customization: [
      "command: run through each manager's runner; commands: explicit per-manager strings (only those get tabs)",
      "storageKey: remember the choice in localStorage, read after hydration (SSR-safe) and synced across instances and browser tabs",
      "value/onValueChange for controlled use; defaultValue (pnpm by default)",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})

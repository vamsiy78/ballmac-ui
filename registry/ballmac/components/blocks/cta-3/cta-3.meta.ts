import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "cta-3",
  type: "registry:block",
  title: "CTA 3: install command",
  description: "A closing call-to-action for developer products: heading, two buttons and a copyable install command with package-manager tabs, over a soft dotted glow.",
  category: "blocks",
  blockCategory: "cta",
  tags: ["cta", "install", "command", "developer", "copy", "package manager"],
  files: [{ path: "components/blocks/cta-3/cta-3.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "install-tabs"],
  examples: [
    { name: "cta-3-demo", title: "Default", file: "cta-3-demo.tsx" },
    { name: "cta-3-custom", title: "Custom command", file: "cta-3-custom.tsx" },
  ],
  ai: {
    summary: "The last section of a developer landing page. Set command (run through npm, pnpm, yarn and bun) or commands for explicit per-manager strings.",
    whenToUse: ["Libraries, CLIs and APIs", "Docs landing pages"],
    whenNotToUse: ["Consumer products without a command line"],
    composesWith: ["hero-2", "features-6", "faq-2", "footer-2"],
    a11y: [{ keys: "Arrow Left / Right", action: "Switches package manager; the copy button announces success" }],
    customization: ["command or commands for the install tabs", "storageKey: remember the package manager", "notes: short facts under the command"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

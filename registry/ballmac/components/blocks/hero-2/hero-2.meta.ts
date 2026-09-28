import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "hero-2",
  type: "registry:block",
  title: "Hero 2: developer tool with install command",
  description:
    "Centered hero for developer tools: headline, two actions, package-manager install tabs and a terminal window with a light beam tracing its border.",
  category: "blocks",
  blockCategory: "hero",
  tags: ["hero", "developer", "cli", "open source", "install"],
  files: [{ path: "components/blocks/hero-2/hero-2.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "border-beam", "button", "install-tabs", "terminal", "text-reveal"],
  examples: [{ name: "hero-2-demo", title: "Default", file: "hero-2-demo.tsx" }],
  ai: {
    summary: "The top section for a CLI, SDK or library: the install command is the call to action. Set `command` to your package's command without the runner.",
    whenToUse: ["Developer tools, SDKs and open-source libraries", "Pages where installing is the first step"],
    whenNotToUse: ["Consumer or visual products (use hero-1)"],
    composesWith: ["header-1", "features-2", "footer-1"],
    customization: ["command: e.g. \"shadcn@latest add @ballmac/button\"", "eyebrow, title, description and action props", "Replace the terminal lines with your tool's output"],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})

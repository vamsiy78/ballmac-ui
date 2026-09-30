import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "collapsible",
  type: "registry:ui",
  title: "Collapsible",
  description:
    "A single disclosure panel with a generous trigger, visible open state, and reduced-motion-aware content transition.",
  category: "primitives",
  tags: ["disclosure", "details", "radix"],
  files: [{ path: "components/collapsible.tsx" }],
  dependencies: ["radix-ui", "lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "collapsible-demo",
      title: "Release details",
      file: "collapsible-demo.tsx",
    },
    {
      name: "collapsible-states",
      title: "Controlled disclosure",
      file: "collapsible-states.tsx",
    },
  ],
  ai: {
    summary:
      "Reveals one optional section of information with a keyboard-accessible disclosure trigger.",
    whenToUse: ["Advanced settings", "Supporting detail in a dense card"],
    whenNotToUse: [
      "Several related disclosures; use accordion",
      "Primary content that should always be visible",
    ],
    composesWith: ["card"],
    a11y: [
      { keys: "Enter / Space", action: "Opens or closes the disclosure" },
      { keys: "Tab", action: "Moves into visible content" },
    ],
    customization: [
      "controlled or uncontrolled open state",
      "optional trigger chevron",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});

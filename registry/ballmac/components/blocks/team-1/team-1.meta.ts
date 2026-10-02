import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "team-1",
  type: "registry:block",
  title: "Team 1: portrait grid with hover bios",
  description: "A grid of team portraits with name, role, location and links. On hover or keyboard focus a bio slides up over the photo; phones show it inline. Initial tiles when there is no photo.",
  category: "blocks",
  blockCategory: "team",
  tags: ["team", "people", "about", "company", "portraits"],
  files: [{ path: "components/blocks/team-1/team-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "media"],
  examples: [
    { name: "team-1-demo", title: "Default", file: "team-1-demo.tsx" },
    { name: "team-1-small", title: "Four people", file: "team-1-small.tsx" },
  ],
  ai: {
    summary: "An About-page team section. Pass members=[{ name, role, bio?, location?, image?, links? }].",
    whenToUse: ["About and careers pages", "Showing the humans behind a product"],
    whenNotToUse: ["Long staff directories (use a table)"],
    composesWith: ["stats-1", "testimonials-2", "cta-1", "footer-1"],
    a11y: [{ keys: "Tab", action: "Focusing a member's link reveals their bio, like hover" }],
    customization: ["members: { name, role, bio?, location?, image?, links?: { label, href, icon? }[] }[]", "action: link beside the heading (null to hide)"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

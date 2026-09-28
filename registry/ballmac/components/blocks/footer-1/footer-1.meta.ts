import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "footer-1",
  type: "registry:block",
  title: "Footer 1: columns with newsletter",
  description: "Site footer with brand and tagline, an optional newsletter form, up to four link columns and a legal bar.",
  category: "blocks",
  blockCategory: "footer",
  tags: ["footer", "newsletter", "navigation", "links"],
  files: [{ path: "components/blocks/footer-1/footer-1.tsx" }],
  registryDependencies: ["shadcn:utils", "button", "input"],
  examples: [{ name: "footer-1-demo", title: "Default", file: "footer-1-demo.tsx" }],
  ai: {
    summary: "The bottom of every marketing page. Pass groups of links; pass onSubscribe to show the newsletter form (you handle the email).",
    whenToUse: ["Marketing sites and landing pages"],
    whenNotToUse: ["App screens behind login (keep chrome minimal)"],
    composesWith: ["header-1", "cta-1"],
    customization: ["groups: { title, links: { label, href }[] }[]", "brand, tagline, legal props", "onSubscribe(email) shows the newsletter form"],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})

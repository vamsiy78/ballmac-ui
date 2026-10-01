import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "footer-2",
  type: "registry:block",
  title: "Footer 2: giant wordmark",
  description: "Brand, tagline and a live status pill beside three link columns, a legal bar with icon links, and an oversized wordmark that sinks into a fading gradient along the bottom.",
  category: "blocks",
  blockCategory: "footer",
  tags: ["footer", "wordmark", "links", "status", "brand"],
  files: [{ path: "components/blocks/footer-2/footer-2.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "status-dot"],
  examples: [
    { name: "footer-2-demo", title: "Default", file: "footer-2-demo.tsx" },
    { name: "footer-2-long", title: "Long brand name", file: "footer-2-long.tsx" },
  ],
  ai: {
    summary: "A confident site footer. Pass columns, socials, legal and legalLinks; the wordmark scales to the footer width from its length.",
    whenToUse: ["Brand-led marketing sites", "Pages that end with a big visual moment"],
    whenNotToUse: ["Footers that need a newsletter form (use footer-1)"],
    composesWith: ["cta-3", "cta-1", "faq-2", "header-2"],
    customization: ["wordmark: text for the big word (defaults to brand)", "status: null hides the pill", "columns / socials / legalLinks"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

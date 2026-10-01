import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "template-relay",
  type: "registry:block",
  title: "Relay: developer API platform",
  description:
    "A paper-and-ink, terminal-flavoured site for a developer API: a live send console, the life of an event, a delivery map, language-synced docs, usage pricing and a status page.",
  category: "templates",
  templateKind: "marketing",
  templatePages: [
    { title: "Home", example: "template-relay-demo", path: "/relay" },
    { title: "Docs", example: "template-relay-docs", path: "/relay/docs" },
    { title: "Pricing", example: "template-relay-pricing", path: "/relay/pricing" },
    { title: "Status", example: "template-relay-status", path: "/relay/status" },
  ],
  fonts: ["Hanken Grotesk", "IBM Plex Mono"],
  featured: true,
  tags: ["template", "developer", "api", "docs", "devtool", "pricing", "status page", "landing page"],
  files: [
    { path: "components/templates/relay/relay-fonts.ts" },
    { path: "components/templates/relay/relay-theme.tsx" },
    { path: "components/templates/relay/relay-samples.ts" },
    { path: "components/templates/relay/relay-home.tsx" },
    { path: "components/templates/relay/relay-docs.tsx" },
    { path: "components/templates/relay/relay-pricing.tsx" },
    { path: "components/templates/relay/relay-status.tsx" },
    { path: "app/relay/page.tsx" },
    { path: "app/relay/docs/page.tsx" },
    { path: "app/relay/pricing/page.tsx" },
    { path: "app/relay/status/page.tsx" },
  ],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "accordion", "api-endpoint", "dotted-map", "marquee", "number-ticker", "slider", "snippet-tabs", "table-of-contents"],
  examples: [
    { name: "template-relay-demo", title: "Home", file: "template-relay-demo.tsx" },
    { name: "template-relay-docs", title: "Docs", file: "template-relay-docs.tsx" },
    { name: "template-relay-pricing", title: "Pricing", file: "template-relay-pricing.tsx" },
    { name: "template-relay-status", title: "Status", file: "template-relay-status.tsx" },
  ],
  docs: "Pages are at /relay, /relay/docs, /relay/pricing and /relay/status. The light and dark palettes are the relayCss string in relay-theme.tsx; code samples live in relay-samples.ts.",
  ai: {
    summary:
      "Installs a four-page site for a developer API or infrastructure product. Change the palette in relayCss (relay-theme.tsx), the samples in relay-samples.ts, and the copy in each page file.",
    whenToUse: ["Marketing and docs sites for APIs, SDKs and developer infrastructure", "Brands that want a precise, terminal-flavoured look in light and dark"],
    whenNotToUse: ["Consumer apps or soft, editorial brands (use a Northwind-style template)"],
    composesWith: ["api-endpoint", "snippet-tabs", "faq-2"],
    customization: ["Edit relayCss for the light and dark palettes", "Replace relay-samples.ts with your own languages", "Swap fonts in relay-fonts.ts"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "template-pocket",
  type: "registry:block",
  title: "Pocket: mobile money app",
  description:
    "A bold five-page landing site for a money app: a working app inside a phone frame, live feature demos (freeze a card, round-up calculator, bill splitting, currency conversion), pricing with a yearly switch, security and download.",
  category: "templates",
  templateKind: "specialty",
  templatePages: [
    { title: "Home", example: "template-pocket-demo", path: "/pocket" },
    { title: "Features", example: "template-pocket-features", path: "/pocket/features" },
    { title: "Pricing", example: "template-pocket-pricing", path: "/pocket/pricing" },
    { title: "Security", example: "template-pocket-security", path: "/pocket/security" },
    { title: "Download", example: "template-pocket-download", path: "/pocket/download" },
  ],
  fonts: ["Gabarito"],
  featured: true,
  tags: ["template", "mobile app", "fintech", "landing", "pricing", "phone", "download"],
  files: [
    { path: "components/templates/pocket/pocket-fonts.ts" },
    { path: "components/templates/pocket/pocket-data.ts" },
    { path: "components/templates/pocket/pocket-theme.tsx" },
    { path: "components/templates/pocket/pocket-home.tsx" },
    { path: "components/templates/pocket/pocket-features.tsx" },
    { path: "components/templates/pocket/pocket-pricing.tsx" },
    { path: "components/templates/pocket/pocket-security.tsx" },
    { path: "components/templates/pocket/pocket-download.tsx" },
    { path: "app/pocket/page.tsx" },
    { path: "app/pocket/features/page.tsx" },
    { path: "app/pocket/pricing/page.tsx" },
    { path: "app/pocket/security/page.tsx" },
    { path: "app/pocket/download/page.tsx" },
  ],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "phone-frame", "switch", "slider"],
  examples: [
    { name: "template-pocket-demo", title: "Home", file: "template-pocket-demo.tsx" },
    { name: "template-pocket-features", title: "Features", file: "template-pocket-features.tsx" },
    { name: "template-pocket-pricing", title: "Pricing", file: "template-pocket-pricing.tsx" },
    { name: "template-pocket-security", title: "Security", file: "template-pocket-security.tsx" },
    { name: "template-pocket-download", title: "Download", file: "template-pocket-download.tsx" },
  ],
  docs: "Pages are at /pocket, /pocket/features, /pocket/pricing, /pocket/security and /pocket/download. Plans, comparison rows, FAQ and transactions live in pocket-data.ts. PocketApp (in pocket-theme.tsx) is the working app inside the phone; replace its content with your own screens. The palette is pocketCss.",
  ai: {
    summary:
      "Installs a five-page mobile-app landing site with a working app in a phone frame, live feature demos, pricing with a yearly toggle, a security page and a download page. Edit pocket-data.ts and pocketCss.",
    whenToUse: ["Mobile app and fintech landing sites", "Any product that benefits from a live demo inside a phone"],
    whenNotToUse: ["Real banking flows (this is marketing; connect your own auth and APIs)"],
    composesWith: ["phone-frame", "switch", "slider"],
    a11y: [
      { keys: "Bottom tab bar in the phone", action: "Arrow-free tabs: Tab to a button and press Enter to switch screens" },
      { keys: "Freeze card switch", action: "Space toggles it; a polite status message confirms the state" },
      { keys: "Round-up slider", action: "Arrow keys change monthly spending; the result is announced" }
    ],
    customization: ["Replace plans, comparison rows and FAQ in pocket-data.ts", "Rebuild the screens inside PocketApp", "Edit pocketCss for the mint, cobalt and lime palette", "Replace QrArt with a real QR code"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

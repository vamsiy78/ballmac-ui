import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "browser-frame",
  type: "registry:ui",
  title: "Browser Frame",
  description:
    "A Safari-style window with traffic lights, a padlocked address field and optional tabs. Children render as the page, either at natural size or laid out at desktop width and scaled to fit.",
  category: "devices",
  tags: ["mockup", "browser", "safari", "window", "screenshot", "website", "hero"],
  files: [{ path: "components/browser-frame.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n", "media"],
  examples: [
    { name: "browser-frame-demo", title: "Landing page with tabs", file: "browser-frame-demo.tsx" },
    { name: "browser-frame-minimal", title: "Natural size", file: "browser-frame-minimal.tsx" },
  ],
  ai: {
    summary:
      "Wrap web content in <BrowserFrame url=\"acme.com\">. Pass screenWidth={1280} (plus aspectRatio) to render a full desktop layout scaled down, tabs={[\"Home\", \"Docs\"]} for a tab strip, or src for a screenshot. Chrome colors follow the theme tokens.",
    whenToUse: [
      "Showing a website or web app on a landing page or in docs",
      "Template and theme galleries",
      "Before/after comparisons of a web page",
    ],
    whenNotToUse: [
      "Native desktop apps (use laptop-frame, or a plain window)",
      "Mobile layouts (use phone-frame)",
    ],
    composesWith: ["laptop-frame", "phone-frame"],
    customization: [
      "url, secure (padlock), tabs (strings or { title, icon }), activeTab",
      "screenWidth + aspectRatio for a scaled desktop layout; omit both for natural size",
      "Traffic-light colors: override --traffic-close, --traffic-minimize, --traffic-zoom",
      "Parts: [data-slot=browser-frame-toolbar], -address, -tabs, -screen",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})

import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "template-studio",
  type: "registry:block",
  title: "Studio: creative agency",
  description:
    "A loud, typographic five-page agency site: giant wide headlines, a work reel whose poster follows the pointer, numbered services that open, a work index with grid or table, project pages and a brief form.",
  category: "templates",
  templateKind: "content",
  templatePages: [
    { title: "Home", example: "template-studio-demo", path: "/studio" },
    { title: "Work", example: "template-studio-work", path: "/studio/work" },
    { title: "Project", example: "template-studio-project", path: "/studio/work/north-coast" },
    { title: "Services", example: "template-studio-services", path: "/studio/services" },
    { title: "Contact", example: "template-studio-contact", path: "/studio/contact" },
  ],
  fonts: ["Archivo", "Geist Mono"],
  featured: true,
  tags: ["template", "agency", "studio", "branding", "portfolio", "typography", "creative", "contact"],
  files: [
    { path: "components/templates/studio/studio-fonts.ts" },
    { path: "components/templates/studio/studio-data.ts" },
    { path: "components/templates/studio/studio-theme.tsx" },
    { path: "components/templates/studio/studio-home.tsx" },
    { path: "components/templates/studio/studio-work.tsx" },
    { path: "components/templates/studio/studio-project.tsx" },
    { path: "components/templates/studio/studio-services.tsx" },
    { path: "components/templates/studio/studio-contact.tsx" },
    { path: "app/studio/page.tsx" },
    { path: "app/studio/work/page.tsx" },
    { path: "app/studio/work/[slug]/page.tsx" },
    { path: "app/studio/services/page.tsx" },
    { path: "app/studio/contact/page.tsx" },
  ],
  dependencies: ["lucide-react", "motion"],
  registryDependencies: ["shadcn:utils", "copy-button", "marquee"],
  examples: [
    { name: "template-studio-demo", title: "Home", file: "template-studio-demo.tsx" },
    { name: "template-studio-work", title: "Work", file: "template-studio-work.tsx" },
    { name: "template-studio-project", title: "Project", file: "template-studio-project.tsx" },
    { name: "template-studio-services", title: "Services", file: "template-studio-services.tsx" },
    { name: "template-studio-contact", title: "Contact", file: "template-studio-contact.tsx" },
  ],
  docs: "Pages are at /studio, /studio/work, /studio/work/[slug], /studio/services and /studio/contact. Edit projects and services in studio-data.ts; the palette is the studioCss string in studio-theme.tsx.",
  ai: {
    summary:
      "Installs a five-page agency site. Change the content in studio-data.ts, the palette in studioCss, and the painted posters in StudioArt (or swap them for real imagery).",
    whenToUse: ["Agencies, studios and collectives that want a loud, typographic site", "Any site where the work should carry the page"],
    whenNotToUse: ["A personal portfolio with long case studies (use template-portfolio)"],
    composesWith: ["marquee", "copy-button", "faq-2"],
    a11y: [
      { keys: "Tab through the work reel", action: "Shows the poster beside the focused row, the same as hovering it" },
      { keys: "Enter / Space on a service", action: "Opens or closes it" }
    ],
    customization: ["Replace StudioArt with real images", "Edit studioCss for the light and dark palettes", "Tune the headline width in the studioDisplay class"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

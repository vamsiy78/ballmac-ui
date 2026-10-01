import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "template-portfolio",
  type: "registry:block",
  title: "Folio: designer portfolio",
  description:
    "A bold five-page portfolio: a huge intro with inline colour pills, a work grid that reveals each result on hover and focus, an about bento, a case study with a sticky fact sheet and contents list, writing and a uses page.",
  category: "templates",
  templateKind: "content",
  templatePages: [
    { title: "Home", example: "template-portfolio-demo", path: "/portfolio" },
    { title: "Work", example: "template-portfolio-work", path: "/portfolio/work" },
    { title: "Case study", example: "template-portfolio-case", path: "/portfolio/work/fernhill" },
    { title: "Writing", example: "template-portfolio-writing", path: "/portfolio/writing" },
    { title: "Uses", example: "template-portfolio-uses", path: "/portfolio/uses" },
  ],
  fonts: ["Bricolage Grotesque", "Geist Mono"],
  featured: true,
  tags: ["template", "portfolio", "designer", "case study", "personal site", "writing", "bento"],
  files: [
    { path: "components/templates/portfolio/portfolio-fonts.ts" },
    { path: "components/templates/portfolio/portfolio-data.ts" },
    { path: "components/templates/portfolio/portfolio-theme.tsx" },
    { path: "components/templates/portfolio/portfolio-home.tsx" },
    { path: "components/templates/portfolio/portfolio-work.tsx" },
    { path: "components/templates/portfolio/portfolio-case.tsx" },
    { path: "components/templates/portfolio/portfolio-writing.tsx" },
    { path: "components/templates/portfolio/portfolio-uses.tsx" },
    { path: "app/portfolio/page.tsx" },
    { path: "app/portfolio/work/page.tsx" },
    { path: "app/portfolio/work/[slug]/page.tsx" },
    { path: "app/portfolio/writing/page.tsx" },
    { path: "app/portfolio/uses/page.tsx" },
  ],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "blur-fade", "copy-button", "marquee", "table-of-contents"],
  examples: [
    { name: "template-portfolio-demo", title: "Home", file: "template-portfolio-demo.tsx" },
    { name: "template-portfolio-work", title: "Work", file: "template-portfolio-work.tsx" },
    { name: "template-portfolio-case", title: "Case study", file: "template-portfolio-case.tsx" },
    { name: "template-portfolio-writing", title: "Writing", file: "template-portfolio-writing.tsx" },
    { name: "template-portfolio-uses", title: "Uses", file: "template-portfolio-uses.tsx" },
  ],
  docs: "Pages are at /portfolio, /portfolio/work, /portfolio/work/[slug], /portfolio/writing and /portfolio/uses. Edit your projects, posts and kit in portfolio-data.ts; the palette is the portfolioCss string in portfolio-theme.tsx.",
  ai: {
    summary:
      "Installs a five-page personal portfolio. Change the content in portfolio-data.ts, the palette in portfolioCss, and the painted covers in the Cover component (or replace them with images).",
    whenToUse: ["Personal sites for designers, developers and independent consultants", "A bold, typographic portfolio with a real case-study layout"],
    whenNotToUse: ["Agencies with a team and services pages (use template-studio)"],
    composesWith: ["marquee", "table-of-contents", "blur-fade"],
    a11y: [
      { keys: "Tab to a work card", action: "Reveals the result on the card, the same as hovering it" },
      { keys: "Enter / Space on a filter", action: "Filters the list and announces the number shown" }
    ],
    customization: ["Replace Cover with <img> or next/image when you have real screenshots", "Edit portfolioCss for the light and dark palettes", "Swap the font in portfolio-fonts.ts"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "template-publication",
  type: "registry:block",
  title: "Marginalia: magazine",
  description:
    "An editorial five-page magazine: a masthead between double rules, a lead story, an article with reading progress, drop cap and margin notes, section pages with sort and load more, author pages and an issues shelf with subscriptions.",
  category: "templates",
  templateKind: "content",
  templatePages: [
    { title: "Home", example: "template-publication-demo", path: "/publication" },
    { title: "Article", example: "template-publication-article", path: "/publication/essays/the-unfinished-city" },
    { title: "Section", example: "template-publication-section", path: "/publication/essays" },
    { title: "Author", example: "template-publication-author", path: "/publication/authors/ines" },
    { title: "Issues", example: "template-publication-issues", path: "/publication/issues" },
  ],
  fonts: ["DM Serif Display", "Lora", "Public Sans"],
  featured: true,
  tags: ["template", "magazine", "blog", "editorial", "publication", "article", "newsletter", "serif"],
  files: [
    { path: "components/templates/publication/publication-fonts.ts" },
    { path: "components/templates/publication/publication-data.ts" },
    { path: "components/templates/publication/publication-theme.tsx" },
    { path: "components/templates/publication/publication-home.tsx" },
    { path: "components/templates/publication/publication-article.tsx" },
    { path: "components/templates/publication/publication-section.tsx" },
    { path: "components/templates/publication/publication-author.tsx" },
    { path: "components/templates/publication/publication-issues.tsx" },
    { path: "app/publication/page.tsx" },
    { path: "app/publication/essays/[slug]/page.tsx" },
    { path: "app/publication/essays/page.tsx" },
    { path: "app/publication/authors/[id]/page.tsx" },
    { path: "app/publication/issues/page.tsx" },
  ],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "copy-button", "scroll-progress", "media"],
  examples: [
    { name: "template-publication-demo", title: "Home", file: "template-publication-demo.tsx" },
    { name: "template-publication-article", title: "Article", file: "template-publication-article.tsx" },
    { name: "template-publication-section", title: "Section", file: "template-publication-section.tsx" },
    { name: "template-publication-author", title: "Author", file: "template-publication-author.tsx" },
    { name: "template-publication-issues", title: "Issues", file: "template-publication-issues.tsx" },
  ],
  docs: "Pages are at /publication, /publication/essays/[slug], /publication/essays, /publication/authors/[id] and /publication/issues. Edit stories, authors and issues in publication-data.ts; the palette is the publicationCss string in publication-theme.tsx.",
  ai: {
    summary:
      "Installs a five-page magazine. Change stories and authors in publication-data.ts, the palette in publicationCss, and the duotone MagArt illustrations (or swap them for photographs).",
    whenToUse: ["Magazines, long-form blogs and newsletters with an archive", "Reading-first sites with margin notes and a strong masthead"],
    whenNotToUse: ["A product blog inside a SaaS marketing site (use blog-1 and blog-post-1)"],
    composesWith: ["blog-1", "blog-post-1", "newsletter-1"],
    a11y: [
      { keys: "Tab to a note number", action: "Moves to the note; on wide screens it sits in the margin beside the paragraph" },
      { keys: "Enter / Space on a section", action: "Switches the list and announces how many stories are shown" }
    ],
    customization: ["Replace MagArt with photographs", "Edit publicationCss for the light and dark palettes", "Change the masthead name in publication-theme.tsx"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})

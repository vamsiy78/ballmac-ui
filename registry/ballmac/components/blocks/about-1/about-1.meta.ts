import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "about-1",
  type: "registry:block",
  title: "About 1: company story",
  description:
    "A company story page: a large two-tone statement and a wide picture, numbers that count up, the story beside a pull quote, value cards that light up under the pointer, a milestone timeline and a closing call to action.",
  category: "blocks",
  blockCategory: "about",
  tags: ["about", "company", "story", "mission", "values", "timeline", "stats", "culture", "brand", "editorial"],
  files: [{ path: "components/blocks/about-1/about-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "blur-fade", "button", "cover-art", "media", "number-ticker", "spotlight-card"],
  examples: [
    { name: "about-1-demo", title: "Default", file: "about-1-demo.tsx" },
    { name: "about-1-short", title: "Just the story", file: "about-1-short.tsx" },
  ],
  statesNone: "Static content: nothing to load, submit or fail.",
  ai: {
    summary:
      "An About page. <About1 eyebrow headline={['Line one.', 'Softer line two.']} intro media mediaAlt stats={[{ label, value, suffix, plain }]} story={['Larger first paragraph', '…']} quote={{ text, name, role }} values={[{ title, description, icon }]} milestones={[{ year, title, description }]} cta={{ title, description, primary: { label, href }, secondary }} />. Every part is optional: pass [] for stats, values or milestones, or null for quote or cta, and that section disappears. Without media it draws art from the headline.",
    whenToUse: ["The About or Our story page of a company, studio or product", "A manifesto page with numbers, values and history"],
    whenNotToUse: ["A page of people (use team-1)", "A job list (use careers-1)", "A landing page (use the hero blocks)"],
    composesWith: ["header-2", "footer-2", "team-1", "careers-1", "gallery-1"],
    a11y: [
      { keys: "Headings", action: "One h1 for the statement and an h2 for each section; the pull quote is a real blockquote in a figure with a caption" },
      { keys: "Motion", action: "Entrances, the count-up and the card glow are skipped under reduced motion" },
      { keys: "Timeline", action: "An ordered list; the year is text next to each event, so order never depends on the line" },
    ],
    customization: ["headline as one string or two lines", "stats[].plain for years; suffix for \"k+\"", "values[].icon takes any node, usually a lucide icon", "media takes a URL, an image with alt text or an element"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})

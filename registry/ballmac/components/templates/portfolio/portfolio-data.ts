// Ballmac UI: Portfolio sample content. https://ui.ballmac.com/templates/template-portfolio

export type PortfolioProject = {
  slug: string
  title: string
  client: string
  year: string
  discipline: "Product" | "Brand" | "Systems"
  blurb: string
  result: string
  tags: string[]
  /** Which painted cover to draw (0 to 5). */
  cover: number
}

export const projects: PortfolioProject[] = [
  { slug: "fernhill", title: "Rebuilding onboarding", client: "Fernhill", year: "2026", discipline: "Product", blurb: "A first-run flow that gets teams to their first invoice in one sitting.", result: "+34% activation", tags: ["Product design", "Research", "Prototyping"], cover: 0 },
  { slug: "lumen", title: "A design system in six weeks", client: "Lumen Health", year: "2025", discipline: "Systems", blurb: "Tokens, 60 components and the docs that made engineers actually use them.", result: "-40% handoff time", tags: ["Design systems", "Documentation"], cover: 1 },
  { slug: "paddock", title: "Identity for a riding school", client: "Paddock", year: "2025", discipline: "Brand", blurb: "A mark, a typeface pairing and a handbook for a school that outgrew its logo.", result: "3 offices, 1 look", tags: ["Brand", "Print", "Wayfinding"], cover: 2 },
  { slug: "halcyon", title: "A calmer banking app", client: "Halcyon", year: "2024", discipline: "Product", blurb: "Spending insights that read like a sentence, not a spreadsheet.", result: "4.8 App Store rating", tags: ["Mobile", "Data visualisation"], cover: 3 },
  { slug: "tessera", title: "Pricing page, tested", client: "Tessera", year: "2024", discipline: "Product", blurb: "Six experiments, one clear winner and a page the sales team stopped apologising for.", result: "+22% trial starts", tags: ["Experimentation", "Copy"], cover: 4 },
  { slug: "quanta", title: "Tokens that travel", client: "Quanta", year: "2023", discipline: "Systems", blurb: "A theming layer that let one product ship in nine brands.", result: "9 brands, 1 codebase", tags: ["Design systems", "Tokens"], cover: 5 },
]

export type PortfolioPost = { slug: string; title: string; date: string; read: number; tag: "Process" | "Craft" | "Career"; excerpt: string }

export const posts: PortfolioPost[] = [
  { slug: "p1", title: "The first-run checklist nobody wants to ship", date: "2026-08-14", read: 7, tag: "Process", excerpt: "Why the thing that tests best is usually the thing that annoys the team." },
  { slug: "p2", title: "Stop designing empty states last", date: "2026-05-02", read: 5, tag: "Craft", excerpt: "Empty is the first thing every new user sees. Treat it that way." },
  { slug: "p3", title: "What I learned from deleting 40 components", date: "2026-02-19", read: 9, tag: "Process", excerpt: "A design system is a garden. A small, tidy one beats a sprawling one." },
  { slug: "p4", title: "Going independent after nine years", date: "2025-11-07", read: 6, tag: "Career", excerpt: "The money, the loneliness and the three clients that made it work." },
  { slug: "p5", title: "A defence of the boring button", date: "2025-06-23", read: 4, tag: "Craft", excerpt: "Novelty has a cost. Spend it where it pays." },
  { slug: "p6", title: "How I run a design review", date: "2025-03-11", read: 8, tag: "Process", excerpt: "Four questions, one hour and no one defending their pixels." },
]

export const uses: { group: string; items: { name: string; note: string }[] }[] = [
  { group: "Hardware", items: [{ name: "MacBook Pro 14″", note: "M3 Pro, 36 GB. Mostly plugged into a desk shelf in Lisbon." }, { name: "Studio Display", note: "The only monitor I have trusted for colour." }, { name: "Keychron Q1", note: "Brown switches. Loud enough that my partner has opinions." }, { name: "iPad Pro + Pencil", note: "Sketches, critique markup and reading." }] },
  { group: "Software", items: [{ name: "Figma", note: "Design, prototypes and the occasional diagram." }, { name: "Linear", note: "Where projects and promises go to be counted." }, { name: "Things", note: "Personal tasks. Never work tasks." }, { name: "Raycast", note: "Launcher, clipboard history and window layouts." }] },
  { group: "Type", items: [{ name: "Bricolage Grotesque", note: "This site, because I wanted something with a personality." }, { name: "Geist Mono", note: "Small labels and code." }, { name: "Söhne", note: "For client work where budget allows." }] },
  { group: "Reading", items: [{ name: "Refactoring UI", note: "Still the best short book on interface design." }, { name: "The Design of Everyday Things", note: "Reread every two years." }, { name: "Field notebooks", note: "Paper, always. Three at a time." }] },
]


/** What changed and when, newest first. Shown at /changelog and written to CHANGELOG.md by `pnpm changelog`. */
export type ChangelogEntry = { date: string; title: string; items: string[] }

export const changelog: ChangelogEntry[] = [
  {
    date: "2026-10-05",
    title: "Log in to Pro with your licence key",
    items: [
      "A Pro log in page at /pro: paste your licence key once, with no password and no account. The key stays in an encrypted cookie in your browser and is checked again on every request, so a revoked key stops working within minutes",
      "Your Pro library: install commands with your key already filled in (hidden on screen, real on the clipboard) for the shadcn CLI, AI agents through MCP and the starter apps, plus browser downloads of Beacon SaaS, Quire and the Figma tokens",
      "Pro block pages show the real source with copy buttons once you are logged in, while the pages stay public and static for everyone else",
      "A Log in and Get Pro button in the header, which becomes a Pro library link after you log in",
      "Buyers are logged in automatically when they return from checkout, with no key to paste",
      "A support page for bugs, questions, licence and billing help, and suggestions; messages go to a private inbox and you get a confirmation by email",
      "Pricing copy corrected: Pro adds 150 blocks and two starter apps (it has no templates)",
    ],
  },
  {
    date: "2026-10-04",
    title: "Quire, a second Pro starter, and a new look for Beacon",
    items: [
      "Quire: an AI starter that answers from your own documents and shows its sources. Streaming chat with numbered citations that highlight the exact sentence, a document library with full-text search, usage limits per plan, Stripe billing, teams and a public API. It runs without an AI key on a built-in demo model",
      "Beacon SaaS was redesigned: a new landing page, sign-in and onboarding, and app shell",
    ],
  },
  {
    date: "2026-10-03",
    title: "Ballmac UI Pro and the first public release",
    items: [
      "Ballmac UI Pro: 150 premium blocks (heroes, features, pricing, dashboards, app screens, ecommerce, content, sign-in and onboarding, marketing extras), all with light, dark and right-to-left support",
      "A private registry for Pro items, installed with the shadcn CLI and the MCP server using a licence key",
      "Beacon SaaS, the first Pro starter app: sign-in, workspaces with teams and invitations, Stripe billing, a dashboard and API keys",
      "Figma design tokens (W3C format) for all 13 themes, plus capture tooling for building a Figma library",
      "@ballmac/mcp 1.0 on npm: search the catalog, read when to use each item and get the install command from your agent",
      "A designed 404 and error page, tidier page titles and descriptions across the site, and stricter security headers",
    ],
  },
  {
    date: "2026-10-02",
    title: "Themes, right-to-left, translations and image slots",
    items: [
      "Twelve free themes and a live builder: change hue, radius, density and font, check contrast in light and dark, then install",
      "Right-to-left support across components, blocks and templates, with an RTL toggle on every preview",
      "Built-in text moved behind one translation provider, with the full key list available as JSON",
      "Heroes, features, cards, galleries and templates take an image or media prop with required alt text and dark-mode variants",
    ],
  },
  {
    date: "2026-10-01",
    title: "Templates, blocks and a full audit",
    items: [
      "Seventeen templates with their own look, from product sites to admin apps, docs, stores and a podcast",
      "Sixty-three free blocks grouped by purpose, from marketing sections to application screens",
      "Desktop and device components: windows, docks, menu bars, Finder-style browsing, Launchpad, lock screen and device frames",
      "Audit fixes: page weight cut from 7.5 to 11.8 MB of JavaScript down to 1.3 to 2.0 MB, hydration fixes for visitors who prefer reduced motion, focus rings and pinned dependency versions",
    ],
  },
  {
    date: "2026-09-30",
    title: "Forms, data, SaaS patterns and AI interfaces",
    items: [
      "Forms: date and range pickers, currency, phone, tags, multi-select, stepper and signature pad",
      "Data display: calendar, data table, charts, carousel, drawer and resizable panels",
      "SaaS patterns: onboarding checklist, settings panel, usage meter, billing card, plan selector and notification center",
      "AI interfaces: chat messages, reasoning, tool calls, citations, a prompt box, agent plans and approval cards",
    ],
  },
  {
    date: "2026-09-28",
    title: "Ballmac UI preview",
    items: [
      "Registry at ui.ballmac.com/r with the Ballmac theme and motion presets",
      "Primitives, motion, AI interface and developer components",
      "Blocks and a launch-page template",
      "Docs for installation, the CLI and registry, and MCP",
    ],
  },
]

/** The same list as Markdown, for CHANGELOG.md. */
export function changelogMarkdown(entries: ChangelogEntry[] = changelog): string {
  const body = entries.map((e) => `## ${e.date}: ${e.title}\n\n${e.items.map((i) => `- ${i}`).join("\n")}`).join("\n\n")
  return `# Changelog\n\nNew components, blocks and changes, newest first. The same list is at https://ui.ballmac.com/changelog. This file is generated: edit \`apps/www/lib/changelog.ts\` and run \`pnpm changelog\`.\n\n${body}\n`
}

/**
 * Honest comparisons with other places to get shadcn-style UI. Every fact about another product was read from its own public page on `checked`, and is kept with the address it came from;
 * anything the page did not say is left out, never guessed. Facts about Ballmac UI are computed on the page from the registry, so they cannot go stale here.
 * To refresh: reread each `source`, update the fact and `checked`. A test fails when a fact has no source or the date is more than 120 days old.
 */
export type Fact = { label: string; value: string; source: string }

export type Comparison = {
  slug: string
  name: string
  /** The page's h1 and title. */
  title: string
  description: string
  url: string
  checked: string
  /** One plain sentence on what the other product is. */
  what: string
  facts: Fact[]
  /** Who should pick them, said fairly. */
  theirs: string[]
  ours: string[]
  /** What the two have in common. */
  both: string
}

export const CHECKED = "2026-11-24"

export const comparisons: Comparison[] = [
  {
    slug: "shadcn-blocks",
    name: "shadcn/ui blocks",
    title: "Ballmac UI vs shadcn/ui blocks",
    description: "shadcn/ui blocks are free, official starting points. Ballmac UI adds finished app screens with loading, empty and error states. How they differ and when to use which.",
    url: "https://ui.shadcn.com/blocks",
    checked: CHECKED,
    what: "shadcn/ui blocks are the official, free building blocks from the shadcn/ui project: dashboards, sidebars and sign-in pages you copy into your app.",
    facts: [
      { label: "Price", value: "Free (“Open Source. Free forever.”)", source: "https://ui.shadcn.com/blocks" },
      { label: "How you install", value: "The shadcn CLI, for example npx shadcn add dashboard-01", source: "https://ui.shadcn.com/blocks" },
      { label: "What it shows", value: "Featured, sidebar, login and signup blocks, plus a way to browse all", source: "https://ui.shadcn.com/blocks" },
    ],
    theirs: ["You want the official, minimal starting point and plan to design the rest yourself.", "You only need a sidebar, a dashboard shell or a sign-in page."],
    ours: ["You need whole product screens (billing, calendar, mail, kanban, settings) and not only shells.", "You want each screen to come with loading, empty and error states, and a measured quality report for every item."],
    both: "Both are free to start, both install with the shadcn CLI, and both give you source code you own.",
  },
  {
    slug: "magic-ui",
    name: "Magic UI",
    title: "Ballmac UI vs Magic UI",
    description: "Magic UI is known for animated components and landing page sections. Ballmac UI is built around app screens. Their license and price compared with ours, and who each suits.",
    url: "https://magicui.design",
    checked: CHECKED,
    what: "Magic UI is a library of animated React components and effects, with a paid Pro set of landing page sections and templates.",
    facts: [
      { label: "Free library", value: "“150+ free and open-source animated components and effects built with React, Typescript, Tailwind CSS, and Motion”", source: "https://magicui.design" },
      { label: "Pro", value: "“50+ blocks and templates”: 9+ templates and 50+ landing page sections", source: "https://pro.magicui.design" },
      { label: "Pro price", value: "$199 one-time, individual license, lifetime access", source: "https://pro.magicui.design" },
      { label: "Pro license", value: "Commercial use allowed; re-selling of the code is not", source: "https://pro.magicui.design" },
    ],
    theirs: ["Your main need is animated effects and marketing-page polish.", "You want landing page sections and templates, and nothing for the app behind the login."],
    ours: ["You are building the product itself: dashboards, settings, billing, inboxes, boards.", "You want items checked in a real browser in light, dark, phone width, reduced motion and right-to-left, with the results published."],
    both: "Both are React and Tailwind, install with the shadcn CLI, and have a free part and a paid part.",
  },
  {
    slug: "tailark",
    name: "Tailark",
    title: "Ballmac UI vs Tailark",
    description: "Tailark offers free and premium shadcn blocks for marketing pages. Ballmac UI covers marketing and app screens. Prices and what each covers, compared fairly.",
    url: "https://tailark.com",
    checked: CHECKED,
    what: "Tailark is a set of shadcn and Next.js blocks, with a free tier and paid plans for premium blocks and page templates.",
    facts: [
      { label: "Free", value: "$0, lifetime access to free blocks, pages and snippets", source: "https://tailark.com/pricing" },
      { label: "Essentials", value: "$249 one-time payment: hundreds of premium blocks", source: "https://tailark.com/pricing" },
      { label: "Complete", value: "$299 one-time payment: adds page templates", source: "https://tailark.com/pricing" },
      { label: "Team", value: "$499, 10 team members", source: "https://tailark.com/pricing" },
      { label: "Built on", value: "“Built on Shadcn and Next.js”, compatible with Radix UI and Base UI", source: "https://tailark.com" },
    ],
    theirs: ["You want a large set of marketing-page blocks and are happy to pay once for them.", "You work in Next.js and want blocks focused on public pages."],
    ours: ["You also need the screens behind the login, such as dashboards, billing and settings.", "You want to start free with a meaningful set (components, charts, themes and presets) before paying."],
    both: "Both build on shadcn, both sell one-time licenses for the premium part, and both have a free tier.",
  },
  {
    slug: "21st-dev",
    name: "21st.dev",
    title: "Ballmac UI vs 21st.dev",
    description: "21st.dev is a community catalog of React components. Ballmac UI is one maintained library with one design system. Where each fits, and what we measure.",
    url: "https://21st.dev",
    checked: CHECKED,
    what: "21st.dev is a community catalog where design engineers publish React components, templates, shadcn themes and shaders.",
    facts: [
      { label: "Who writes it", value: "“Community design engineers. Anyone can publish to the registry.”", source: "https://21st.dev" },
      { label: "Price", value: "Browsing is free with 2 free component copies a day; membership unlocks unlimited copies and premium templates", source: "https://21st.dev" },
      { label: "How you install", value: "A shadcn CLI command per component, or a copied prompt for an AI agent", source: "https://21st.dev" },
    ],
    theirs: ["You want the widest choice of styles and ideas from many authors.", "You are looking for one unusual component rather than a consistent set."],
    ours: ["You want everything to share one design system, so screens fit together without restyling.", "You want updates that merge into the files you have edited (Pro), and published quality results."],
    both: "Both install through the shadcn CLI and give you the code in your own repository.",
  },
]

export const getComparison = (slug: string) => comparisons.find((c) => c.slug === slug)

/**
 * Alternatives pages (/alternatives/<x>) and "best of" lists (/best/<x>), built from one profile per library so every page says the same thing about each.
 * Every price and limit is copied from a fact on the matching comparison in compare.ts, read from the library's own pages on CHECKED, with the same source.
 * Ballmac UI's own line is computed on the page from the registry and the live offer. Each entry is self-contained (verdict, best for, trade-off, price),
 * so a reader or an AI quoting one entry never picks up another library's drawback.
 */
import { getComparison } from "@/lib/compare"

export type Profile = {
  /** The comparison slug in compare.ts, which holds the sourced facts. */
  slug: string
  name: string
  url: string
  verdict: string
  bestFor: string
  tradeoff: string
  price: string
  priceSource: string
}

export const profiles: Profile[] = [
  {
    slug: "shadcnblocks",
    name: "Shadcnblocks",
    url: "https://www.shadcnblocks.com",
    verdict: "The largest premium shadcn block library, built for Radix UI, Base UI and React Aria.",
    bestFor: "Choosing among hundreds of marketing sections: it lists 746 hero blocks and 398 feature blocks.",
    tradeoff: "Far fewer app screens than marketing sections (31 dashboard blocks on its home page), and a higher one-time price.",
    price: "$149 one-time for Pro; Premium $299 adds templates and a Figma kit",
    priceSource: "https://www.shadcnblocks.com/pricing",
  },
  {
    slug: "shadcn-studio",
    name: "Shadcn Studio",
    url: "https://shadcnstudio.com",
    verdict: "Blocks and templates bundled with a Figma kit, a Figma-to-code plugin, visual builders and an MCP server.",
    bestFor: "Teams that design in Figma and want builders and a big set of blocks in one purchase.",
    tradeoff: "The plans that include everything cost more than most block libraries.",
    price: "Basic $99, Pro $199 one-time; Team $449 for 15 seats",
    priceSource: "https://shadcnstudio.com/pricing",
  },
  {
    slug: "shadcn-io",
    name: "shadcn.io",
    url: "https://www.shadcn.io",
    verdict: "The biggest catalogue, for React, Vue, Svelte and Solid, on a yearly subscription.",
    bestFor: "Projects outside React, or teams that want the widest choice and are happy to subscribe.",
    tradeoff: "It is a subscription, and the Individual plan is for personal and open-source use only; commercial use starts at the Team plan.",
    price: "Individual $389 a year; Team $789 a year for up to 5 seats with commercial use",
    priceSource: "https://www.shadcn.io/pricing",
  },
  {
    slug: "magic-ui",
    name: "Magic UI",
    url: "https://magicui.design",
    verdict: "Free, open-source animated components, with a paid Pro set of landing page sections and templates.",
    bestFor: "Animated effects and polished marketing pages.",
    tradeoff: "Pro is landing page sections and templates, not the screens behind a login.",
    price: "Free library; Pro $199 one-time",
    priceSource: "https://pro.magicui.design",
  },
  {
    slug: "aceternity-ui",
    name: "Aceternity UI",
    url: "https://ui.aceternity.com",
    verdict: "Animated components, blocks and full pages for striking landing pages.",
    bestFor: "A memorable, motion-heavy landing page.",
    tradeoff: "It describes itself as a library for landing pages; app screens are not its focus.",
    price: "Free tier; Pro $169 for a year or $199 lifetime",
    priceSource: "https://ui.aceternity.com/pricing",
  },
  {
    slug: "tailark",
    name: "Tailark",
    url: "https://tailark.com",
    verdict: "Free and premium shadcn blocks and page templates for marketing sites, on Next.js.",
    bestFor: "A large set of marketing-page blocks from one source.",
    tradeoff: "Focused on public pages, and the premium plans start at $249.",
    price: "Free tier; Essentials $249, Complete $299 one-time",
    priceSource: "https://tailark.com/pricing",
  },
  {
    slug: "shadcn-blocks",
    name: "shadcn/ui blocks",
    url: "https://ui.shadcn.com/blocks",
    verdict: "The official, free starting points from the shadcn/ui project.",
    bestFor: "A minimal, official shell (sidebar, dashboard, sign-in) to design the rest yourself.",
    tradeoff: "Shells and starting points, not finished product screens.",
    price: "Free",
    priceSource: "https://ui.shadcn.com/blocks",
  },
  {
    slug: "21st-dev",
    name: "21st.dev",
    url: "https://21st.dev",
    verdict: "A community catalogue where many authors publish React components and templates.",
    bestFor: "Finding one unusual component or idea among many styles.",
    tradeoff: "Components come from many authors, so they don't share one design system.",
    price: "Free browsing with 2 copies a day; membership for unlimited copies",
    priceSource: "https://21st.dev",
  },
  {
    slug: "origin-ui",
    name: "coss ui (formerly Origin UI)",
    url: "https://coss.com/ui",
    verdict: "Free, accessible base components on Base UI, from the team behind Cal.com.",
    bestFor: "A free, accessible component set to compose every screen yourself.",
    tradeoff: "Components, not finished blocks or screens.",
    price: "Free and open source",
    priceSource: "https://coss.com/ui",
  },
]

export const getProfile = (slug: string) => profiles.find((p) => p.slug === slug)

export type AlternativesPage = {
  /** The library people are leaving; also the comparison slug. */
  slug: string
  /** Why people look, in plain words, from the facts on its comparison. */
  why: string
  /** Who to list, best fit first for the reason people look. "ballmac" is us. */
  order: string[]
}

export const alternatives: AlternativesPage[] = [
  {
    slug: "magic-ui",
    why: "Magic UI is great for animated effects, and its Pro set is landing page sections and templates. The usual reason to look elsewhere is that the product behind the landing page also needs screens: dashboards, settings, billing and inboxes.",
    order: ["ballmac", "aceternity-ui", "shadcnblocks", "shadcn-studio", "tailark", "shadcn-blocks"],
  },
  {
    slug: "aceternity-ui",
    why: "Aceternity UI calls itself the component library for beautiful landing pages, and its Pro plan is $169 a year or $199 for life. People look for an alternative when they need app screens as well, or a lower price.",
    order: ["ballmac", "magic-ui", "shadcnblocks", "tailark", "shadcn-studio", "shadcn-blocks"],
  },
  {
    slug: "shadcnblocks",
    why: "Shadcnblocks has the most blocks, mostly marketing sections, and Pro is $149 once. People look elsewhere for more finished app screens, or to pay less.",
    order: ["ballmac", "shadcn-studio", "shadcn-io", "tailark", "magic-ui", "shadcn-blocks"],
  },
  {
    slug: "shadcn-studio",
    why: "Shadcn Studio bundles blocks with Figma tools and builders, from $99 to $199 once for one person. People who don't need the Figma side look for something simpler or cheaper.",
    order: ["ballmac", "shadcnblocks", "shadcn-io", "tailark", "shadcn-blocks", "origin-ui"],
  },
  {
    slug: "shadcn-io",
    why: "shadcn.io is a yearly subscription, and its $389 Individual plan is for personal and open-source use only. People building a commercial product often want to pay once instead.",
    order: ["ballmac", "shadcnblocks", "shadcn-studio", "tailark", "magic-ui", "shadcn-blocks"],
  },
  {
    slug: "tailark",
    why: "Tailark covers marketing pages, with premium plans from $249 once. People look elsewhere when they also need screens inside the app, or a smaller first purchase.",
    order: ["ballmac", "shadcnblocks", "magic-ui", "aceternity-ui", "shadcn-studio", "shadcn-blocks"],
  },
]

export const getAlternatives = (slug: string) => alternatives.find((a) => a.slug === slug)

export type BestList = { slug: string; title: string; description: string; intro: string; criteria: string[]; picks: { label: string; slug: string }[] }

/** "Best of" lists: a pick per need, not one winner, because no library is best at everything. Ballmac UI appears only where it honestly fits. */
export const bestLists: BestList[] = [
  {
    slug: "shadcn-block-libraries",
    title: "Best shadcn block libraries in 2026",
    description: "The best shadcn/ui block libraries for each job: marketing pages, app screens, animation, Figma, other frameworks and free. Prices and licences from each site.",
    intro: "There is no single best shadcn block library: the right one depends on what you are building. For the biggest catalogue of marketing sections, Shadcnblocks. For finished app screens with loading, empty and error states at a low one-time price, Ballmac UI. For animation, Magic UI or Aceternity UI. For a Figma workflow, Shadcn Studio. Outside React, shadcn.io. To start free, the official shadcn/ui blocks.",
    criteria: [
      "What it covers: marketing sections, app screens or base components.",
      "Price and licence: one-time or subscription, and whether commercial use is included.",
      "How it installs: the shadcn CLI, an MCP server for AI agents.",
      "Primitives and frameworks: Radix UI, Base UI, React Aria, and frameworks beyond React.",
    ],
    picks: [
      { label: "Largest catalogue of marketing sections", slug: "shadcnblocks" },
      { label: "Finished app screens with states, lowest one-time price", slug: "ballmac" },
      { label: "Animated components and effects", slug: "magic-ui" },
      { label: "Motion-heavy landing pages", slug: "aceternity-ui" },
      { label: "Figma kit and visual builders", slug: "shadcn-studio" },
      { label: "Vue, Svelte and Solid", slug: "shadcn-io" },
      { label: "Marketing-site blocks and templates", slug: "tailark" },
      { label: "Free, official starting point", slug: "shadcn-blocks" },
    ],
  },
]

export const getBestList = (slug: string) => bestLists.find((b) => b.slug === slug)

/** When the facts behind these libraries were read: "24 November 2026", or a range when they were read on different days. */
export function checkedPhrase(slugs: string[]): string {
  const dates = [...new Set(slugs.map((s) => getComparison(s)?.checked).filter((d): d is string => !!d))].sort()
  const f = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
  if (!dates.length) return ""
  return dates.length === 1 ? `on ${f(dates[0]!)}` : `between ${f(dates[0]!)} and ${f(dates[dates.length - 1]!)}`
}

import { blockCategoryLabels, blockGroups, getBlocks, isPro, type SiteItem } from "@/lib/registry"

/**
 * One landing page per block category ("shadcn pricing blocks"), so the search people type has a page that answers it, not an anchor on /blocks.
 * Only categories with at least MIN blocks get a page: thinner ones would be near-empty pages. Each has its own words, written from what its blocks
 * actually do; counts are computed. `noun` is how a person searching names the category.
 */
export const MIN_CATEGORY_BLOCKS = 3

const COPY: Record<string, { noun: string; intro: string }> = {
  hero: { noun: "hero section", intro: "The first screen of a landing page, in every shape a product needs: a split layout with a product shot, an install command for a developer tool, a live prompt for an AI product, a download button that detects the platform, a waitlist with a referral position, and art-led heroes with particles, aurora and glass." },
  features: { noun: "feature section", intro: "Ways to explain what a product does: bento grids, tabbed showcases, a scrolling product tour, a before-and-after slider, a comparison table against the old way, and cards that light up under the pointer." },
  pricing: { noun: "pricing section", intro: "Pricing pages from a simple two-tier layout to a full plan comparison: billing toggles, seat sliders with volume tiers, usage estimators, credit packs, a one-time licence against a subscription, a currency switch and a plan finder quiz." },
  ecommerce: { noun: "ecommerce", intro: "The screens of a store: product listing with filters, product pages with variants, quick view, cart drawer and cart page, single-page checkout, order tracking, order history, product comparison and a size finder." },
  dashboard: { noun: "dashboard", intro: "Finished dashboards for analytics, sales, revenue, support, storage, infrastructure and project health. Every number is worked out from the data you pass, and each one shows a skeleton while loading, a message when empty and a retry on error." },
  agents: { noun: "AI agent", intro: "Screens for products where AI agents do the work and people stay in charge: a live agent run, an approvals inbox, runs and traces, a prompt playground that compares models, eval results, agent memory and an agent builder." },
  blog: { noun: "blog", intro: "Everything a publication needs: a home page with featured posts and filters, article pages with contents and reading progress, an archive by year, author profiles, topic pages, comments and series navigation." },
  auth: { noun: "login and sign-up", intro: "Sign-in and account screens: email and password with providers, single sign-on, magic link and passkey, one-time codes with resend, sign-up with password strength, and forgot and reset password flows." },
  testimonials: { noun: "testimonial", intro: "Ways to show what customers say: a scrolling wall of quotes, a featured quote with a person picker, result cards with big numbers, a rating summary with reviews and expanding customer stories." },
  cta: { noun: "call to action", intro: "The closing ask of a page: a framed call to action, an install command, a newsletter sign-up, a split card with a picture, and waitlists with a launch countdown." },
  settings: { noun: "settings page", intro: "The settings an app needs: profile and account, team members and roles, notification preferences, security with two-step sign-in, sessions and API tokens, an integrations directory, data and privacy, and an audit log." },
  desktop: { noun: "desktop app", intro: "Windows for a Tauri or Electron app that look native on macOS and Windows: preferences, a menu bar panel, software update, licence activation, permissions setup, an About window and a shortcuts editor." },
  onboarding: { noun: "onboarding", intro: "The first minutes in a product: a workspace setup wizard, a step-by-step setup, picking a goal, a guided product tour, accepting an invitation and inviting teammates." },
  stats: { noun: "stats section", intro: "Numbers that prove a claim: headline metrics with trends, big numbers with trend lines, a ninety-day uptime strip, a return-on-investment slider and a comparison against the average." },
  "logo-cloud": { noun: "logo cloud", intro: "Customer logos as a marquee or a grid, counted rows, logos filtered by industry, notes on hover and logos in orbit." },
  changelog: { noun: "changelog", intro: "Release notes as a timeline, a filterable release history, highlights by version and a public roadmap board with votes." },
  faq: { noun: "FAQ section", intro: "Frequently asked questions as an accordion, a searchable list with topic filters and highlights, and one with helpful votes and a support card." },
  footer: { noun: "footer", intro: "Site footers with link columns and a newsletter form, a giant wordmark, and a rich footer with a letter sign-up." },
  header: { noun: "header and navbar", intro: "Site navigation: a sticky header with a mobile menu, mega menus with a mobile sheet, and a floating pill with an announcement." },
  charts: { noun: "chart dashboard", intro: "Chart layouts built on accessible charts: an analytics overview, a revenue report, small multiples and a scorecard, each with a table view and a written summary." },
  "app-shell": { noun: "app shell and sidebar", intro: "The frame around an app: a collapsible sidebar with a command menu, an icon rail with a second level, and a top bar with search and tabs." },
  billing: { noun: "billing page", intro: "Billing inside a SaaS app: the current plan with usage meters and invoices, and changing plan with proration shown before you confirm." },
  contact: { noun: "contact form", intro: "Contact pages: a form beside your contact methods, a form with company details, and booking a demo with a calendar." },
  "ai-chat": { noun: "AI chat", intro: "Chat interfaces for AI products: a full chat app pane, a conversation beside an artifact panel, and chat beside a document." },
}

export type BlockCategoryPage = { slug: string; label: string; noun: string; intro: string; group: { id: string; label: string }; blocks: SiteItem[] }

export function blockCategoryPages(): BlockCategoryPage[] {
  const blocks = getBlocks()
  return blockGroups.flatMap((g) =>
    g.categories.flatMap((c) => {
      const items = blocks.filter((b) => b.blockCategory === c)
      const copy = COPY[c]
      if (items.length < MIN_CATEGORY_BLOCKS || !copy) return []
      // Free first, so a visitor sees what they can install now before what needs Pro.
      const sorted = [...items.filter((b) => !isPro(b)), ...items.filter(isPro)]
      return [{ slug: c, label: blockCategoryLabels[c] ?? c, ...copy, group: { id: g.id, label: g.label }, blocks: sorted }]
    })
  )
}

export const getBlockCategoryPage = (slug: string) => blockCategoryPages().find((p) => p.slug === slug)

/** The category page for a block, when its category has one: item breadcrumbs link here instead of to an anchor on /blocks. */
export const categoryHref = (category: string | undefined) => (category && getBlockCategoryPage(category) ? `/blocks/category/${category}` : `/blocks#${category ?? ""}`)

/** How a searcher names a block's kind: the category page's noun, else its label ("Status page" -> "status page", "AI chat" stays). */
export function blockNoun(category: string | undefined): string | undefined {
  if (!category) return undefined
  if (COPY[category]) return COPY[category].noun
  const label = blockCategoryLabels[category]
  if (!label) return undefined
  return /^[A-Z]{2}/.test(label) ? label : label.charAt(0).toLowerCase() + label.slice(1)
}

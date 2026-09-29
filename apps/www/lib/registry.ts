import "server-only"

import { createHighlighter, type Highlighter } from "shiki"

import type { ItemMeta } from "@ballmac-ui/metadata"
import rawIndex from "@/lib/generated/index.json"
import sources from "@/lib/generated/sources.json"

export const SITE_URL = "https://ui.ballmac.com"

export type PropDoc = { name: string; type: string; required: boolean; default?: string; description?: string }
export type SiteItem = Omit<ItemMeta, "files" | "examples"> & {
  props: { component: string; props: PropDoc[] }[]
  files: { path: string; source: string; target: string }[]
  examples: { name: string; title: string; file: string; source: string; description?: string }[]
}

const items = rawIndex as unknown as SiteItem[]

/** Items users browse (not the theme or other foundation pieces). */
export function getComponents() {
  return items.filter((i) => i.category !== "foundation" && i.category !== "blocks" && i.category !== "templates")
}
export const getBlocks = () => items.filter((i) => i.category === "blocks")
export const getTemplates = () => items.filter((i) => i.category === "templates")
export const getAllItems = () => items

/** Where an item's page lives on the site. */
export function itemHref(item: Pick<SiteItem, "name" | "category">) {
  if (item.category === "foundation") return item.name === "theme" ? "/docs/theming" : "/docs/theming#motion-tokens"
  if (item.category === "blocks") return `/blocks/${item.name}`
  if (item.category === "templates") return `/templates/${item.name}`
  return `/components/${item.name}`
}
export const getItem = (name: string) => items.find((i) => i.name === name)

export function getRelated(item: SiteItem, limit = 4) {
  const explicit = (item.ai?.composesWith ?? []).map(getItem).filter((i): i is SiteItem => !!i)
  const sameCategory = getComponents().filter((i) => i.category === item.category && i.name !== item.name)
  return [...new Map([...explicit, ...sameCategory].map((i) => [i.name, i])).values()].slice(0, limit)
}

/** Browse order: showpiece categories first. */
export const categoryOrder = ["macos", "backgrounds", "text", "devices", "motion", "ai", "developer", "layout", "navigation", "primitives", "forms", "data-display", "feedback", "marketing", "saas", "dashboards"]
const categoryRank = (c: string) => (categoryOrder.indexOf(c) + 1 || 99)

/** Items from the latest release (updated on the same day as the newest item) count as new. */
const newest = Math.max(...items.map((i) => Date.parse(i.updated)))
export const isNew = (item: Pick<SiteItem, "updated">) => newest - Date.parse(item.updated) < 864e5

export type NavLink = { href: string; label: string; badge?: "new" }
export type NavGroup = { title: string; items: NavLink[] }

/** Components grouped by category, in browse order, for the sidebar and prev/next links. */
export function componentGroups(): NavGroup[] {
  const groups = new Map<string, SiteItem[]>()
  for (const i of getComponents()) groups.set(i.category, [...(groups.get(i.category) ?? []), i])
  return [...groups.entries()]
    .sort(([a], [b]) => categoryRank(a) - categoryRank(b))
    .map(([cat, list]) => ({
      title: categoryLabels[cat] ?? cat,
      items: list
        .sort((a, b) => Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title))
        .map((i) => ({ href: `/components/${i.name}`, label: i.title, badge: isNew(i) ? ("new" as const) : undefined })),
    }))
}

/** Previous and next component in sidebar order. */
export function componentNeighbors(name: string) {
  const flat = componentGroups().flatMap((g) => g.items)
  const at = flat.findIndex((l) => l.href === `/components/${name}`)
  return { prev: at > 0 ? flat[at - 1] : undefined, next: at >= 0 && at < flat.length - 1 ? flat[at + 1] : undefined }
}

/** Source embedded at build time (free items only). Pro items have no entry, so their code stays locked. */
export function readSource(path: string) {
  return (sources as Record<string, string>)[path] ?? ""
}

/** Named exports of a component file, for the usage snippet. */
export function exportsOf(code: string) {
  const m = code.match(/export\s*\{([^}]+)\}/)
  if (!m) return []
  return m[1]
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("type ") && !/Variants$/.test(s))
}

export const packageManagers = ["pnpm", "npm", "yarn", "bun"] as const
export type PackageManager = (typeof packageManagers)[number]

/** One command model, rendered per package manager. */
export function addCommand(names: string[], pm: PackageManager) {
  const args = `shadcn@latest add ${names.map((n) => `@ballmac/${n}`).join(" ")}`
  return { pnpm: `pnpm dlx ${args}`, npm: `npx ${args}`, yarn: `yarn dlx ${args}`, bun: `bunx --bun ${args}` }[pm]
}
export function installCommand(deps: string[], pm: PackageManager) {
  const list = deps.join(" ")
  return { pnpm: `pnpm add ${list}`, npm: `npm install ${list}`, yarn: `yarn add ${list}`, bun: `bun add ${list}` }[pm]
}

let highlighter: Promise<Highlighter> | undefined
export async function highlight(code: string, lang: "tsx" | "bash" | "json" | "css" = "tsx") {
  highlighter ??= createHighlighter({ themes: ["github-light-default", "github-dark-default"], langs: ["tsx", "bash", "json", "css"] })
  return (await highlighter).codeToHtml(code.trimEnd(), {
    lang,
    themes: { light: "github-light-default", dark: "github-dark-default" },
    defaultColor: false,
  })
}

export const blockCategoryLabels: Record<string, string> = {
  hero: "Hero",
  features: "Features",
  pricing: "Pricing",
  testimonials: "Testimonials",
  "logo-cloud": "Logo cloud",
  faq: "FAQ",
  cta: "Call to action",
  footer: "Footer",
  header: "Header",
  auth: "Authentication",
  dashboard: "Dashboard",
  settings: "Settings",
  "ai-chat": "AI chat",
  billing: "Billing",
}

export const categoryLabels: Record<string, string> = {
  primitives: "Primitives",
  macos: "macOS",
  devices: "Device frames",
  backgrounds: "Backgrounds",
  text: "Text effects",
  motion: "Motion",
  layout: "Layout",
  navigation: "Navigation",
  forms: "Forms",
  "data-display": "Data display",
  feedback: "Feedback",
  marketing: "Marketing",
  ai: "AI interfaces",
  developer: "Developer",
  saas: "SaaS",
  dashboards: "Dashboards",
}

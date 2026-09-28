import "server-only"

import { createHighlighter, type Highlighter } from "shiki"

import type { ItemMeta } from "@ballmac-ui/metadata"
import rawIndex from "@/lib/generated/index.json"
import sources from "@/lib/generated/sources.json"

export const SITE_URL = "https://ui.ballmac.com"

export type SiteItem = Omit<ItemMeta, "files" | "examples"> & {
  files: { path: string; source: string; target: string }[]
  examples: { name: string; title: string; file: string; source: string; description?: string }[]
}

const items = rawIndex as unknown as SiteItem[]

/** Items users browse (not the theme or other foundation pieces). */
export function getComponents() {
  return items.filter((i) => i.category !== "foundation" && i.category !== "blocks" && i.category !== "templates")
}
export const getAllItems = () => items
export const getItem = (name: string) => items.find((i) => i.name === name)

export function getRelated(item: SiteItem, limit = 4) {
  const explicit = (item.ai?.composesWith ?? []).map(getItem).filter((i): i is SiteItem => !!i)
  const sameCategory = getComponents().filter((i) => i.category === item.category && i.name !== item.name)
  return [...new Map([...explicit, ...sameCategory].map((i) => [i.name, i])).values()].slice(0, limit)
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

export const categoryLabels: Record<string, string> = {
  primitives: "Primitives",
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

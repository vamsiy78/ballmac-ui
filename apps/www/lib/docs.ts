import "server-only"

import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import type { Root, Node } from "fumadocs-core/page-tree"

import { mdxToMarkdown } from "@/lib/docs-markdown"
import { source } from "@/lib/docs-source"
import { SITE_URL } from "@/lib/site-url"

export const DOCS_ROOT = process.cwd().endsWith("apps/www") ? process.cwd() : join(process.cwd(), "apps/www")
export const REPO = "https://github.com/vamsiy78/ballmac-ui"
/** Pull requests go to preprod (CONTRIBUTING.md), so that is where edits start. */
export const EDIT_BRANCH = "preprod"

export type DocPage = NonNullable<ReturnType<typeof source.getPage>>

export const allDocs = () => source.getPages()
export const docHref = (page: DocPage) => page.url
export const docFile = (page: DocPage) => `apps/www/content/docs/${page.path}`

export function docMarkdown(page: DocPage): string {
  const raw = readFileSync(join(DOCS_ROOT, "content/docs", page.path), "utf8")
  return mdxToMarkdown(raw, { title: page.data.title, description: page.data.description })
}
export const mdHref = (page: DocPage) => (page.url === "/docs" ? "/md/docs/index.md" : `/md${page.url}.md`)

export function editUrl(page: DocPage): string {
  const from = page.data.generatedFrom
  return from ? `${REPO}/blob/${EDIT_BRANCH}/${from}` : `${REPO}/edit/${EDIT_BRANCH}/${docFile(page)}`
}

let shallow: boolean | undefined
const isShallow = () => (shallow ??= (() => {
  try {
    return execFileSync("git", ["rev-parse", "--is-shallow-repository"], { cwd: DOCS_ROOT, encoding: "utf8" }).trim() !== "false"
  } catch {
    return true
  }
})())

/** The day the page's file last changed in git (YYYY-MM-DD), or undefined when history is not available (shallow clone, no git). */
export function lastUpdated(page: DocPage): string | undefined {
  if (isShallow()) return undefined
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", join(DOCS_ROOT, "content/docs", page.path)], { cwd: DOCS_ROOT, encoding: "utf8" }).trim()
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : undefined
  } catch {
    return undefined
  }
}

/** Pages in reading order, for previous and next. */
export function orderedDocs(): DocPage[] {
  const out: DocPage[] = []
  const walk = (nodes: Node[]) => {
    for (const n of nodes) {
      if (n.type === "page") {
        const p = source.getPage(n.url.replace(/^\/docs\/?/, "").split("/").filter(Boolean))
        if (p) out.push(p)
      } else if (n.type === "folder") {
        if (n.index) {
          const p = source.getPage(n.index.url.replace(/^\/docs\/?/, "").split("/").filter(Boolean))
          if (p) out.push(p)
        }
        walk(n.children)
      }
    }
  }
  walk((source.pageTree as Root).children)
  return out
}

export function neighbours(page: DocPage) {
  const all = orderedDocs()
  const i = all.findIndex((p) => p.url === page.url)
  return { prev: all[i - 1], next: all[i + 1] }
}

/** The section a page belongs to (its top folder), for the breadcrumb and the eyebrow. */
export function sectionOf(page: DocPage): { title: string; url?: string } | undefined {
  const first = page.slugs[0]
  if (!first || page.slugs.length < 2) return undefined
  const folder = (source.pageTree as Root).children.find((n) => n.type === "folder" && n.index?.url?.startsWith(`/docs/${first}`)) ?? (source.pageTree as Root).children.find((n) => n.type === "folder" && n.children.some((c) => c.type === "page" && c.url.startsWith(`/docs/${first}/`)))
  return folder && folder.type === "folder" ? { title: String(folder.name) } : undefined
}

/** Each docs page, and each of its headings as its own entry, for the search box. */
export function docSearchEntries() {
  return allDocs().flatMap((p) => {
    const group = `Docs${sectionOf(p) ? ` · ${sectionOf(p)!.title}` : ""}`
    const slug = p.slugs.join("-") || "index"
    const page = { name: `doc-${slug}`, title: p.data.title, description: p.data.description ?? "", group, href: p.url }
    const headings = p.data.toc
      .filter((t) => t.depth === 2)
      .map((t) => ({ name: `doc-${slug}-${t.url.slice(1)}`, title: textOfNode(t.title), description: "", context: `In ${p.data.title}`, group, href: `${p.url}${t.url}` }))
    return [page, ...headings]
  })
}

const textOfNode = (node: unknown): string => {
  if (node == null || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOfNode).join("")
  if (typeof node === "object" && "props" in (node as object)) return textOfNode((node as { props: { children?: unknown } }).props.children)
  return ""
}

export const absolute = (path: string) => `${SITE_URL}${path}`

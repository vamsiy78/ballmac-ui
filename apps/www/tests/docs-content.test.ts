import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

import GithubSlugger from "github-slugger"
import { describe, expect, it } from "vitest"

import { PRESETS } from "../../../packages/theme-engine/src/index"
import redirects from "../content/docs-redirects.json"
import { getChangelog } from "../lib/changelog"
import { proRegistrySnippet } from "../lib/pro-snippets"

const www = join(__dirname, "..")
const docsDir = join(www, "content/docs")

const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]))
const pages = walk(docsDir).filter((f) => f.endsWith(".mdx"))
const urlOf = (file: string) => {
  const rel = relative(docsDir, file).replace(/\.mdx$/, "")
  return rel === "index" ? "/docs" : `/docs/${rel}`
}

/** The ids a page offers as link targets: its headings, with [#custom] ids honoured. */
function anchors(source: string): Set<string> {
  const slugger = new GithubSlugger()
  const ids = new Set<string>()
  let fenced = false
  for (const line of source.replace(/^---\n[\s\S]*?\n---\n/, "").split("\n")) {
    if (/^```/.test(line)) fenced = !fenced
    if (fenced) continue
    const m = line.match(/^#{1,6} (.+)$/)
    if (!m) continue
    const custom = m[1]!.match(/\s*\[#([\w-]+)\]\s*$/)
    if (custom) ids.add(custom[1]!)
    else ids.add(slugger.slug(m[1]!.replace(/`/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")))
  }
  return ids
}

const docs = new Map(pages.map((f) => [urlOf(f), { file: f, source: readFileSync(f, "utf8") }]))
const blocks = new Set<string>()
const components = new Set<string>()
const templates = new Set<string>()
const indexFile = join(www, "lib/generated/index.json")
if (existsSync(indexFile)) {
  for (const i of JSON.parse(readFileSync(indexFile, "utf8")) as { name: string; category: string }[]) {
    if (i.category === "blocks") blocks.add(i.name)
    else if (i.category === "templates") templates.add(i.name)
    else if (i.category !== "foundation") components.add(i.name)
  }
}
const plainRoutes = new Set(["/", "/components", "/blocks", "/templates", "/themes", "/presets", "/feels", "/pricing", "/pro", "/pro/login", "/support", "/founders", "/changelog", "/use-cases", "/use-cases/dashboard", "/quality", "/license", "/license/pro", "/llms.txt", "/llms-full.txt", "/i18n/en.json", "/changelog/rss.xml", "/changelog/atom.xml"])
const changelogSlugs = new Set(getChangelog().map((e) => e.slug))

/** Why an internal link does not resolve, or undefined when it does. */
function broken(href: string): string | undefined {
  const [path, hash] = href.split("#") as [string, string | undefined]
  const clean = path.split("?")[0]!.replace(/\/$/, "") || "/"
  if (docs.has(clean)) {
    if (hash && !anchors(docs.get(clean)!.source).has(hash)) return `no heading "#${hash}" on ${clean}`
    return undefined
  }
  if (plainRoutes.has(clean)) return undefined
  const m = clean.match(/^\/(blocks|components|templates|themes|changelog|md\/docs)\/(.+)$/)
  if (m) {
    const [, kind, name] = m
    const ok =
      kind === "blocks" ? blocks.has(name!) : kind === "components" ? components.has(name!) : kind === "templates" ? templates.has(name!) : kind === "themes" ? PRESETS.some((p) => p.slug === name) : kind === "changelog" ? changelogSlugs.has(name!) : true
    return ok ? undefined : `no ${kind} page named ${name}`
  }
  return `no page at ${clean}`
}

const links = (source: string) => [...source.replace(/```[\s\S]*?```/g, "").matchAll(/\]\((\/[^)\s]*)\)|href="(\/[^"]*)"/g)].map((m) => (m[1] ?? m[2])!)

describe("docs content", () => {
  it("keeps every page at /docs or /docs/<section>/<page>, which is what the share images cover", () => {
    for (const url of docs.keys()) expect(/^\/docs(\/[a-z0-9-]+\/[a-z0-9-]+)?$/.test(url), url).toBe(true)
  })

  it("has a title and a one-sentence description on every page", () => {
    for (const [url, { source }] of docs) {
      const fm = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ""
      const title = fm.match(/^title: "?(.+?)"?$/m)?.[1]
      const description = fm.match(/^description: "?(.+?)"?$/m)?.[1]
      expect(title, `${url} title`).toBeTruthy()
      expect(title!.length, `${url} title length`).toBeLessThanOrEqual(60)
      expect(description, `${url} description`).toBeTruthy()
      expect(description!.length, `${url} description length`).toBeLessThanOrEqual(260)
      expect(/[.!?]$/.test(description!), `${url}: the description ends with a full stop`).toBe(true)
    }
  })

  it("lists every page of a folder in its meta.json, and nothing that is missing", () => {
    for (const dir of walk(docsDir).filter((f) => f.endsWith("meta.json")).map((f) => join(f, ".."))) {
      const meta = JSON.parse(readFileSync(join(dir, "meta.json"), "utf8")) as { pages?: string[] }
      const here = readdirSync(dir)
        .filter((f) => f.endsWith(".mdx") || statSync(join(dir, f)).isDirectory())
        .map((f) => f.replace(/\.mdx$/, ""))
        .sort()
      expect([...(meta.pages ?? [])].sort(), relative(docsDir, dir) || "docs").toEqual(here)
    }
  })

  it("only links to pages, headings, items and routes that exist", () => {
    const problems: string[] = []
    for (const [url, { source }] of docs) for (const href of links(source)) {
      const why = broken(href)
      if (why) problems.push(`${url}: ${href}: ${why}`)
    }
    for (const e of getChangelog()) for (const list of Object.values(e.groups)) for (const line of list!) {
      for (const [, href] of line.matchAll(/\]\((\/[^)\s]*)\)/g)) {
        const why = broken(href!)
        if (why) problems.push(`changelog ${e.slug}: ${href}: ${why}`)
      }
    }
    expect(problems).toEqual([])
  })

  it("redirects every moved page to a page that exists, and does not redirect a page that exists", () => {
    for (const [from, to] of Object.entries(redirects)) {
      expect(broken(to), `${from} -> ${to}`).toBeUndefined()
      expect(docs.has(from), `${from} is still a page`).toBe(false)
    }
  })

  it("keeps the Pro registry snippet in the Pro guide in step with the one the site shows", () => {
    expect(docs.get("/docs/guides/pro")!.source).toContain(proRegistrySnippet())
  })

  it("marks generated pages, and only those, with where they come from", () => {
    for (const [url, { file, source }] of docs) {
      const generated = /^generatedFrom: /m.test(source)
      expect(generated, url).toBe(file.includes("/reference/") && !/\/(registry|theme-tokens)\.mdx$/.test(file))
    }
  })
})

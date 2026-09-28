/** Reads the Ballmac UI metadata API and answers catalog questions. No MCP here, so it's easy to test. */

export type Summary = {
  name: string
  kind: "component" | "block" | "template" | "foundation"
  type: string
  title: string
  description: string
  category: string
  blockCategory?: string
  tier: "free" | "pro"
  tags: string[]
  url: string
  registryUrl: string
  install: string
  summary?: string
  whenToUse: string[]
  whenNotToUse: string[]
  composesWith: string[]
  dependencies: string[]
  registryDependencies: string[]
  examples: string[]
}
export type Detail = Summary & {
  exports: string[]
  import?: string
  props: { component: string; props: { name: string; type: string; required: boolean; default?: string; description?: string }[] }[]
  a11y: { keys: string; action: string }[]
  customization: string[]
  files: { path: string; target: string; content?: string }[]
  exampleCode: { name: string; title: string; code?: string }[]
}
export type Index = { version: number; setup: string; namespace: string; items: Summary[] }

export class Catalog {
  private index?: Promise<Index>
  private details = new Map<string, Promise<Detail>>()

  constructor(
    readonly baseUrl = process.env.BALLMAC_UI_URL ?? "https://ui.ballmac.com",
    private readonly fetchImpl: typeof fetch = fetch
  ) {}

  private async get<T>(path: string): Promise<T> {
    const res = await this.fetchImpl(`${this.baseUrl.replace(/\/$/, "")}${path}`, { headers: { accept: "application/json" } })
    if (!res.ok) throw new Error(`Ballmac UI API ${path} returned ${res.status}`)
    return (await res.json()) as T
  }

  load() {
    this.index ??= this.get<Index>("/api/v1/index.json").catch((e) => {
      this.index = undefined
      throw e
    })
    return this.index
  }

  async list(filter: { kind?: string; category?: string; tier?: string } = {}) {
    const { items } = await this.load()
    return items.filter(
      (i) =>
        i.kind !== "foundation" &&
        (!filter.kind || i.kind === filter.kind) &&
        (!filter.category || i.category === filter.category || i.blockCategory === filter.category) &&
        (!filter.tier || i.tier === filter.tier)
    )
  }

  async search(query: string, filter: { kind?: string } = {}, limit = 10) {
    const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1)
    const items = await this.list(filter)
    return items
      .map((i) => ({ item: i, score: score(i, terms) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((r) => r.item)
  }

  detail(name: string) {
    let d = this.details.get(name)
    if (!d) {
      d = this.get<Detail>(`/api/v1/items/${encodeURIComponent(name)}.json`)
      d.catch(() => this.details.delete(name))
      this.details.set(name, d)
    }
    return d
  }
}

export function score(i: Summary, terms: string[]) {
  let s = 0
  const fields: [string, number][] = [
    [i.name, 6],
    [i.title.toLowerCase(), 5],
    [i.tags.join(" ").toLowerCase(), 4],
    [(i.blockCategory ?? i.category).toLowerCase(), 3],
    [i.description.toLowerCase(), 2],
    [[i.summary ?? "", ...i.whenToUse].join(" ").toLowerCase(), 2],
  ]
  for (const t of terms) for (const [text, w] of fields) if (text.includes(t)) s += w
  return s
}

const runners = {
  pnpm: "pnpm dlx",
  npm: "npx",
  yarn: "yarn dlx",
  bun: "bunx --bun",
} as const
export type PackageManager = keyof typeof runners

export function installCommands(names: string[], pm: PackageManager = "npm") {
  const run = runners[pm]
  return {
    setup: `${run} shadcn@latest registry add @ballmac=https://ui.ballmac.com/r/{name}.json`,
    add: `${run} shadcn@latest add ${names.map((n) => `@ballmac/${n}`).join(" ")}`,
    byUrl: `${run} shadcn@latest add ${names.map((n) => `https://ui.ballmac.com/r/${n}.json`).join(" ")}`,
  }
}

// Landing-page order and the words that ask for each section.
const SECTION_ORDER = ["header", "hero", "logo-cloud", "features", "testimonials", "pricing", "faq", "cta", "footer", "auth", "dashboard", "settings", "billing", "ai-chat"]
const SECTION_WORDS: Record<string, RegExp> = {
  header: /\b(header|navbar|nav|navigation|menu)\b/,
  hero: /\b(hero|headline|above the fold)\b/,
  "logo-cloud": /\b(logos?|customers|trusted by|social proof)\b/,
  features: /\b(features?|benefits|bento|capabilities)\b/,
  testimonials: /\b(testimonials?|reviews|quotes)\b/,
  pricing: /\b(pricing|plans?|price|tiers?)\b/,
  faq: /\b(faq|questions|q&a)\b/,
  cta: /\b(cta|call to action|signup banner|get started)\b/,
  footer: /\b(footer)\b/,
  auth: /\b(login|log in|sign in|sign up|signup|auth|register)\b/,
  dashboard: /\b(dashboard|analytics|kpis?|metrics)\b/,
  settings: /\b(settings|preferences|account)\b/,
  billing: /\b(billing|invoices?|subscription)\b/,
  "ai-chat": /\b(chat|assistant|chatbot|copilot|ai)\b/,
}
const LANDING = ["header", "hero", "features", "pricing", "faq", "cta", "footer"]
const PAGE_WORDS = /\b(landing|homepage|home page|marketing|launch|website|site|saas)\b/

/** Picks one block per requested section, in page order, and writes a page scaffold. */
export async function composePage(catalog: Catalog, intent: string, opts: { pm?: PackageManager; includePro?: boolean } = {}) {
  const text = intent.toLowerCase()
  let sections = SECTION_ORDER.filter((s) => SECTION_WORDS[s].test(text))
  if (PAGE_WORDS.test(text)) sections = [...new Set([...LANDING, ...sections])].sort((a, b) => SECTION_ORDER.indexOf(a) - SECTION_ORDER.indexOf(b))
  if (!sections.length) sections = LANDING
  const blocks = await catalog.list({ kind: "block" })
  const terms = text.split(/[^a-z0-9]+/).filter((t) => t.length > 2)
  const picked: { section: string; block: Summary }[] = []
  const missing: string[] = []
  for (const section of sections) {
    const candidates = blocks
      .filter((b) => b.blockCategory === section && (opts.includePro || b.tier === "free"))
      .sort((a, b) => score(b, terms) - score(a, terms) || a.name.localeCompare(b.name, undefined, { numeric: true }))
    if (candidates[0]) picked.push({ section, block: candidates[0] })
    else missing.push(section)
  }
  const details = await Promise.all(picked.map((p) => catalog.detail(p.block.name)))
  const imports = details.map((d) => d.import).filter(Boolean)
  const components = details.map((d) => d.exports[0]).filter(Boolean)
  const scaffold = [
    ...imports,
    "",
    "export default function Page() {",
    "  return (",
    "    <main>",
    ...components.map((c) => `      <${c} />`),
    "    </main>",
    "  )",
    "}",
    "",
  ].join("\n")
  return {
    sections: picked.map((p) => ({ section: p.section, block: p.block.name, title: p.block.title, description: p.block.description, tier: p.block.tier })),
    missing,
    commands: installCommands(picked.map((p) => p.block.name), opts.pm),
    scaffold,
  }
}

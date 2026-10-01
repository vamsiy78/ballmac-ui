/** Reads the Ballmac UI metadata API and answers catalog questions. No MCP here, so it's easy to test. */

export type Kind = "component" | "block" | "template" | "foundation"

export type Summary = {
  name: string
  kind: Kind
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
  preview?: string
  templateKind?: string
  pages?: { title: string; path?: string; preview: string }[]
  fonts?: string[]
}
export type Detail = Summary & {
  exports: string[]
  import?: string
  props: { component: string; props: { name: string; type: string; required: boolean; default?: string; description?: string }[] }[]
  a11y: { keys: string; action: string }[]
  customization: string[]
  docs?: string
  files: { path: string; target: string; content?: string }[]
  exampleCode: { name: string; title: string; code?: string }[]
}
export type Index = { version: number; setup: string; namespace: string; items: Summary[] }

const INDEX_TTL = 10 * 60 * 1000
const TIMEOUT = 15_000

export class Catalog {
  private index?: { at: number; data: Promise<Index> }
  private details = new Map<string, Promise<Detail>>()

  constructor(
    readonly baseUrl = process.env.BALLMAC_UI_URL ?? "https://ui.ballmac.com",
    private readonly fetchImpl: typeof fetch = fetch,
    private readonly now: () => number = Date.now
  ) {}

  private async get<T>(path: string): Promise<T> {
    const url = `${this.baseUrl.replace(/\/$/, "")}${path}`
    let lastError: unknown
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await this.fetchImpl(url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(TIMEOUT) })
        if (res.status === 404) throw new NotFoundError(path)
        if (!res.ok) throw new Error(`Ballmac UI API ${path} returned ${res.status}`)
        return (await res.json()) as T
      } catch (e) {
        if (e instanceof NotFoundError) throw e
        lastError = e
      }
    }
    throw new Error(`Could not reach Ballmac UI at ${this.baseUrl} (${lastError instanceof Error ? lastError.message : String(lastError)}).`)
  }

  /** The item index, cached for ten minutes so a long session sees new releases. */
  load() {
    if (!this.index || this.now() - this.index.at > INDEX_TTL) {
      const data = this.get<Index>("/api/v1/index.json")
      this.index = { at: this.now(), data }
      data.catch(() => {
        if (this.index?.data === data) this.index = undefined
      })
      this.details.clear()
    }
    return this.index.data
  }

  async list(filter: { kind?: string; category?: string; tier?: string } = {}) {
    const { items } = await this.load()
    return items.filter(
      (i) =>
        i.kind !== "foundation" &&
        (!filter.kind || i.kind === filter.kind) &&
        (!filter.category || i.category === filter.category || i.blockCategory === filter.category || i.templateKind === filter.category) &&
        (!filter.tier || i.tier === filter.tier)
    )
  }

  /** Counts per kind and category, so an agent knows what to filter by. */
  async categories() {
    const items = await this.list()
    const count = (key: (i: Summary) => string | undefined, kind: Kind) => {
      const m = new Map<string, number>()
      for (const i of items) if (i.kind === kind) { const k = key(i); if (k) m.set(k, (m.get(k) ?? 0) + 1) }
      return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([name, n]) => ({ name, items: n }))
    }
    return {
      totals: { components: items.filter((i) => i.kind === "component").length, blocks: items.filter((i) => i.kind === "block").length, templates: items.filter((i) => i.kind === "template").length },
      components: count((i) => i.category, "component"),
      blocks: count((i) => i.blockCategory, "block"),
      templates: count((i) => i.templateKind, "template"),
    }
  }

  async search(query: string, filter: { kind?: string } = {}, limit = 10) {
    const terms = expand(query)
    const items = await this.list(filter)
    const q = query.trim().toLowerCase()
    return items
      .map((i) => ({ item: i, score: score(i, terms) + (i.name === q || i.title.toLowerCase() === q ? 20 : 0) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name, undefined, { numeric: true }))
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

  /** Names close to a mistyped one, for helpful errors. */
  async suggest(name: string, limit = 3) {
    const items = await this.list()
    return items
      .map((i) => ({ name: i.name, d: distance(i.name, name.toLowerCase()) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, limit)
      .filter((r) => r.d <= Math.max(3, name.length / 2))
      .map((r) => r.name)
  }
}

export class NotFoundError extends Error {
  constructor(path: string) {
    super(`Not found: ${path}`)
  }
}

// Words people use for things the catalog names differently.
const SYNONYMS: Record<string, string[]> = {
  modal: ["dialog"], popup: ["dialog", "popover"], toast: ["toast", "notification"], snackbar: ["toast"],
  navbar: ["header", "navigation"], nav: ["navigation", "header"], menu: ["dropdown", "menu"], dropdown: ["dropdown", "select"],
  table: ["table", "data"], grid: ["grid", "table"], upload: ["dropzone", "file"], date: ["calendar", "date"],
  login: ["auth", "login", "sign"], signin: ["auth", "login"], signup: ["auth", "signup"], register: ["signup"],
  chart: ["chart", "graph"], graph: ["chart"], stat: ["stat", "kpi", "number"], metric: ["kpi", "stat"],
  shop: ["store", "ecommerce", "goods"], store: ["store", "ecommerce", "goods"], ecommerce: ["store", "goods"], cart: ["cart", "store"],
  docs: ["documentation", "docs"], documentation: ["docs"], blog: ["blog", "publication", "article"], magazine: ["publication"],
  event: ["conference", "summit", "event"], conference: ["summit", "event"], podcast: ["podcast", "audio"],
  portfolio: ["portfolio"], agency: ["studio", "agency"], dashboard: ["dashboard", "admin", "analytics"], admin: ["admin", "dashboard"],
  chat: ["chat", "message", "ai"], assistant: ["ai", "chat"], llm: ["ai"], mac: ["macos", "mac"], phone: ["phone", "mobile", "devices"],
  animation: ["motion", "animated"], animated: ["motion", "animated"], loader: ["spinner", "loading"], loading: ["spinner", "skeleton", "loading"],
}

// Phrases that name one thing better than their words do.
const PHRASES: [RegExp, string[]][] = [
  [/\b(chat|message|ai) (input|box|composer|field)\b|\bcomposer\b/, ["prompt", "prompt-input"]],
  [/\bcommand (palette|menu)\b|\bcmd ?k\b/, ["command"]],
  [/\bdate (picker|range)\b/, ["date-picker", "date-range-picker"]],
  [/\bfile upload\b|\bdrag and drop\b/, ["file-dropzone"]],
  [/\blanding page\b/, ["hero", "landing"]],
]

/** Lower-cases, splits, drops short words, adds singular forms, synonyms and phrase hints. */
export function expand(query: string) {
  const lower = query.toLowerCase()
  const base = lower.split(/[^a-z0-9]+/).filter((t) => t.length > 1)
  const out = new Set<string>()
  for (const [re, add] of PHRASES) if (re.test(lower)) for (const a of add) out.add(a)
  for (const t of base) {
    const forms = [t]
    if (t.length > 4 && t.endsWith("ies")) forms.push(t.slice(0, -3) + "y")
    else if (t.length > 3 && t.endsWith("s") && !t.endsWith("ss")) forms.push(t.slice(0, -1))
    if (t.length > 5 && t.endsWith("ing")) forms.push(t.slice(0, -3))
    for (const f of forms) {
      out.add(f)
      for (const s of SYNONYMS[f] ?? []) out.add(s)
    }
  }
  return [...out]
}

export function score(i: Summary, terms: string[]) {
  let s = 0
  const fields: [string, number][] = [
    [i.name, 6],
    [i.title.toLowerCase(), 5],
    [i.tags.join(" ").toLowerCase(), 4],
    [[i.blockCategory ?? i.category, i.templateKind ?? ""].join(" ").toLowerCase(), 3],
    [i.description.toLowerCase(), 2],
    [[i.summary ?? "", ...i.whenToUse].join(" ").toLowerCase(), 2],
  ]
  for (const t of terms) {
    const word = wordPattern(t)
    for (const [text, w] of fields) if (word.test(text)) s += w
  }
  return s
}

const patterns = new Map<string, RegExp>()
/** Matches a whole word or hyphenated part, allowing a plural ending, so "mode" does not match "model". */
function wordPattern(term: string) {
  let re = patterns.get(term)
  if (!re) {
    re = new RegExp(`(^|[^a-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(s|es)?($|[^a-z0-9])`)
    patterns.set(term, re)
  }
  return re
}

function distance(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0]![j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i]![j] = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length]![b.length]!
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
const SECTION_ORDER = ["header", "hero", "logo-cloud", "features", "stats", "testimonials", "team", "pricing", "comparison", "faq", "newsletter", "cta", "footer", "auth", "onboarding", "dashboard", "settings", "billing", "ai-chat"]
const SECTION_WORDS: Record<string, RegExp> = {
  header: /\b(header|navbar|nav|navigation|menu)\b/,
  hero: /\b(hero|headline|above the fold)\b/,
  "logo-cloud": /\b(logos?|customers|trusted by|social proof)\b/,
  features: /\b(features?|benefits|bento|capabilities)\b/,
  stats: /\b(stats?|numbers|metrics section)\b/,
  testimonials: /\b(testimonials?|reviews|quotes)\b/,
  team: /\b(team|people|about us)\b/,
  pricing: /\b(pricing|plans?|price|tiers?)\b/,
  comparison: /\b(compare|comparison|vs\.?|versus)\b/,
  faq: /\b(faq|questions|q&a)\b/,
  newsletter: /\b(newsletter|subscribe|mailing list)\b/,
  cta: /\b(cta|call to action|signup banner|get started)\b/,
  footer: /\b(footer)\b/,
  auth: /\b(login|log in|sign in|sign up|signup|auth|register)\b/,
  onboarding: /\b(onboarding|welcome flow|setup wizard)\b/,
  dashboard: /\b(dashboard|analytics|kpis?)\b/,
  settings: /\b(settings|preferences|account)\b/,
  billing: /\b(billing|invoices?|subscription)\b/,
  "ai-chat": /\b(chat|assistant|chatbot|copilot)\b/,
}
const LANDING = ["header", "hero", "features", "pricing", "faq", "cta", "footer"]
const PAGE_WORDS = /\b(landing|homepage|home page|marketing|launch|website|site|saas)\b/

/** Picks one block per requested section, in page order, writes a page scaffold, and points at whole templates that fit. */
export async function composePage(catalog: Catalog, intent: string, opts: { pm?: PackageManager; includePro?: boolean } = {}) {
  const text = intent.toLowerCase()
  let sections = SECTION_ORDER.filter((s) => SECTION_WORDS[s]!.test(text))
  if (PAGE_WORDS.test(text)) sections = [...new Set([...LANDING, ...sections])].sort((a, b) => SECTION_ORDER.indexOf(a) - SECTION_ORDER.indexOf(b))
  if (!sections.length) sections = LANDING
  const [blocks, templates] = await Promise.all([catalog.list({ kind: "block" }), catalog.list({ kind: "template" })])
  const terms = expand(text).filter((t) => t.length > 2)
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
  const templateMatches = templates
    .filter((t) => opts.includePro || t.tier === "free")
    .map((t) => ({ t, s: score(t, terms) }))
    .filter((r) => r.s >= 6)
    .sort((a, b) => b.s - a.s)
    .slice(0, 2)
    .map(({ t }) => ({ name: t.name, title: t.title, description: t.description, pages: t.pages?.map((p) => p.path ?? p.title) ?? [], install: installCommands([t.name], opts.pm).add }))
  return {
    sections: picked.map((p) => ({ section: p.section, block: p.block.name, title: p.block.title, description: p.block.description, tier: p.block.tier })),
    missing,
    commands: installCommands(picked.map((p) => p.block.name), opts.pm),
    scaffold,
    templates: templateMatches,
  }
}

/** One item as Markdown, for MCP resources. */
export function toMarkdown(d: Detail) {
  const lines = [`# ${d.title} (${d.name})`, "", d.description, "", `Install: \`${d.install}\``]
  if (d.import) lines.push("", "```tsx", d.import, "```")
  if (d.whenToUse.length) lines.push("", "## When to use", ...d.whenToUse.map((w) => `- ${w}`))
  if (d.whenNotToUse.length) lines.push("", "## When not to use", ...d.whenNotToUse.map((w) => `- ${w}`))
  if (d.pages?.length) lines.push("", "## Pages", ...d.pages.map((p) => `- ${p.title}${p.path ? ` (${p.path})` : ""}`))
  for (const c of d.props) {
    if (!c.props.length) continue
    lines.push("", `## ${c.component} props`, "", "| Prop | Type | Default | Description |", "| --- | --- | --- | --- |")
    for (const p of c.props) lines.push(`| ${p.name}${p.required ? "" : "?"} | \`${p.type.replace(/\|/g, "\\|")}\` | ${p.default ?? ""} | ${p.description ?? ""} |`)
  }
  if (d.a11y.length) lines.push("", "## Keyboard and accessibility", ...d.a11y.map((a) => `- ${a.keys}: ${a.action}`))
  if (d.composesWith.length) lines.push("", `Works well with: ${d.composesWith.join(", ")}`)
  lines.push("", `Docs: ${d.url}`)
  return lines.join("\n")
}

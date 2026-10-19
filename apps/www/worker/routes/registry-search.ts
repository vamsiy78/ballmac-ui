/**
 * `/r/registry.json?q=…&type=…&limit=…&offset=…`: the shadcn CLI's dynamic search (`shadcn search @ballmac`). With any of those parameters the catalog is
 * filtered and ranked here and answered with a `pagination` object, which is what tells the CLI to trust the results instead of filtering 1,600 items
 * itself. Without them the full static catalog is served as before, so older CLIs and every other client are unchanged.
 */
const HEADERS = { "access-control-allow-origin": "*", "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400", "content-type": "application/json; charset=utf-8" }

/** What the route needs of the Worker's environment: the static files. */
export type SearchEnv = { ASSETS: { fetch: (request: Request) => Promise<Response> } }

type CatalogItem = { name: string; type: string; title?: string; description?: string; categories?: string[]; meta?: { tags?: string[] } }
type Catalog = { name?: string; homepage?: string; items: CatalogItem[] }

export const MAX_LIMIT = 500
export const DEFAULT_LIMIT = 100

/** What a result needs, and no more: the CLI fetches the full item when someone runs `add`. */
const slim = ({ name, type, title, description, categories }: CatalogItem) => ({ name, type, title, description, categories })

const words = (text: string) => text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)

/** Components first, then blocks: a search for "button" should not open with the 30 button examples. */
const TYPE_BIAS: Record<string, number> = { "registry:ui": 20, "registry:block": 10, "registry:example": -30 }

/** Zero when any word of the query matches nothing in the item; otherwise higher is better. */
export function score(item: CatalogItem, query: string): number {
  const terms = words(query)
  if (terms.length === 0) return 1
  const name = item.name.toLowerCase()
  const nameWords = words(item.name)
  const titleWords = words(item.title ?? "")
  const tags = (item.meta?.tags ?? []).map((t) => t.toLowerCase())
  const categories = (item.categories ?? []).map((c) => c.toLowerCase())
  const description = (item.description ?? "").toLowerCase()
  let total = 0
  for (const term of terms) {
    let best = 0
    if (name === term) best = 100
    else if (name.startsWith(term)) best = 60
    else if (nameWords.includes(term)) best = 50
    else if (name.includes(term)) best = 40
    else if (titleWords.some((w) => w.startsWith(term))) best = 35
    else if (tags.includes(term)) best = 30
    else if (tags.some((t) => t.includes(term))) best = 15
    else if (categories.some((c) => c.includes(term))) best = 10
    else if (description.includes(term)) best = 5
    if (best === 0) return 0
    total += best
  }
  return total + (TYPE_BIAS[item.type] ?? 0)
}

/** The page of results for a search, best first. */
export function search(catalog: Catalog, params: { q?: string; types?: string[]; limit: number; offset: number }) {
  const matches = catalog.items
    .filter((item) => !params.types?.length || params.types.includes(item.type))
    .map((item, index) => ({ item, index, score: score(item, params.q ?? "") }))
    .filter((m) => m.score > 0)
    // Equal scores keep the catalog's own order.
    .sort((a, b) => b.score - a.score || a.index - b.index)
  const items = matches.slice(params.offset, params.offset + params.limit).map((m) => slim(m.item))
  return { items, pagination: { total: matches.length, offset: params.offset, limit: params.limit, hasMore: params.offset + params.limit < matches.length } }
}

const int = (value: string | null, fallback: number, min: number, max: number) => {
  const n = Number(value)
  return value !== null && value !== "" && Number.isFinite(n) ? Math.min(max, Math.max(min, Math.trunc(n))) : fallback
}

let cached: Promise<Catalog> | undefined

export async function GET(request: Request, ctx: { env: SearchEnv }) {
  const url = new URL(request.url)
  const p = url.searchParams
  // No search parameters: the plain catalog, from the static files.
  if (!["q", "type", "limit", "offset"].some((key) => p.has(key))) return undefined

  const load = (cached ??= ctx.env.ASSETS.fetch(new Request(new URL("/r/registry.json", url))).then(async (res) => {
    if (!res.ok) throw new Error(`registry.json ${res.status}`)
    return (await res.json()) as Catalog
  }))
  let catalog: Catalog
  try {
    catalog = await load
  } catch {
    cached = undefined
    return undefined
  }

  const result = search(catalog, {
    q: p.get("q") ?? undefined,
    types: p.get("type")?.split(",").map((t) => t.trim()).filter(Boolean),
    limit: int(p.get("limit"), DEFAULT_LIMIT, 1, MAX_LIMIT),
    offset: int(p.get("offset"), 0, 0, Number.MAX_SAFE_INTEGER),
  })
  return new Response(JSON.stringify({ name: catalog.name, homepage: catalog.homepage, ...result }), { status: 200, headers: HEADERS })
}

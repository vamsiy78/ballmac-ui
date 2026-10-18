import { decodeCode, getSystem, isCode, parseParts, presetRegistryItem, type ThemeSpec } from "@ballmac-ui/theme-engine"

/**
 * A preset, installed by its 16-character code or its name: `npx shadcn@latest add @ballmac/preset-k3m9-w0tz-4hqd-bv7e`
 * (the CLI asks for /r/preset-<code>.json). `?only=colors,font` installs just those parts. Every value is clamped by the theme engine, so any code
 * produces a safe theme; nothing is stored. A name that is not a preset or a code is handed back to the static files.
 */
const HEADERS = { "access-control-allow-origin": "*", "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" }

const fail = (status: number, message: string) => Response.json({ error: message }, { status, headers: { "access-control-allow-origin": "*", "cache-control": "no-store" } })

export async function GET(request: Request, ctx: { params: Promise<Record<string, string>> }) {
  const { file } = await ctx.params
  const m = file?.match(/^preset-(.+)\.json$/)
  if (!m) return undefined
  const key = m[1]!
  const url = new URL(request.url)

  let spec: ThemeSpec | null = null
  let title: string
  let description: string
  let docs: string
  const system = getSystem(key)
  if (system) {
    spec = system.spec
    title = `${system.title} preset`
    description = system.description
    docs = `Its code is ${system.code}. Paste it at ${url.origin}/themes to change anything.`
  } else if (isCode(key)) {
    spec = decodeCode(key)
    if (!spec) return fail(400, "That preset code is not valid. Check it for typos, or make a new one at https://ui.ballmac.com/themes.")
    const dashed = key.replace(/[\s-]/g, "").match(/.{4}/g)!.join("-")
    title = `Ballmac preset ${dashed}`
    description = `A complete design system (colour, shape, typeface, platform feel and motion) made with the Ballmac UI theme builder. Code ${dashed}.`
    docs = `Keep tuning it: ${url.origin}/themes?code=${dashed}`
  } else {
    return undefined
  }

  let parts
  try {
    parts = parseParts(url.searchParams.get("only"))
  } catch (e) {
    return fail(400, e instanceof Error ? e.message : "Bad only parameter.")
  }
  const item = presetRegistryItem(spec, { name: `preset-${key}`, title, description, docs, registry: url.origin, parts })
  return Response.json(item, { headers: HEADERS })
}

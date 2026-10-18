import * as preset from "./preset"

/**
 * `/r/{style}/<name>.json`: the shadcn CLI replaces `{style}` in a registry URL with the project's style (`base-nova`, `radix-nova`, `new-york-v4`...).
 * A Base UI style gets the item's Base UI variant (`/r/base/<name>.json`) when it has one, and the Radix UI item otherwise; every other style gets the
 * Radix UI item. `/r/<name>.json`, which the CLI asks for without a style, is unchanged.
 */
const HEADERS = { "access-control-allow-origin": "*", "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400", "content-type": "application/json; charset=utf-8" }

/** What the route needs of the Worker's environment: the static files. */
export type StyleEnv = { ASSETS: { fetch: (request: Request) => Promise<Response> } }

/** Folders under /r that hold files, not styles. */
const FOLDERS = new Set(["pro", "tests", "base"])

/** The static files to try, best first, for a style and a file name. Undefined when the path is not a style at all. */
export function stylePaths(style: string, file: string): string[] | undefined {
  if (FOLDERS.has(style) || !/^[a-z0-9][a-z0-9-]*$/.test(style) || !/^[a-z0-9][a-z0-9-]*\.json$/.test(file)) return undefined
  return style.startsWith("base-") ? [`/r/base/${file}`, `/r/${file}`] : [`/r/${file}`]
}

export async function GET(request: Request, ctx: { params: Promise<Record<string, string>>; env: StyleEnv }) {
  const { style, file } = await ctx.params
  const paths = style && file ? stylePaths(style, file) : undefined
  if (!paths) return undefined
  const url = new URL(request.url)

  // Presets are made on request, not built: hand them to the preset route.
  if (file!.startsWith("preset-")) return preset.GET(new Request(new URL(`/r/${file}${url.search}`, url), { headers: request.headers }), { params: Promise.resolve({ file: file! }) })

  for (const path of paths) {
    const res = await ctx.env.ASSETS.fetch(new Request(new URL(path, url), { headers: request.headers }))
    if (res.ok) return new Response(res.body, { status: 200, headers: { ...HEADERS, "x-ballmac-variant": path.startsWith("/r/base/") ? "base" : "radix" } })
  }
  return undefined
}

import { fetchStars } from "../../lib/github-stars"

/**
 * `GET /api/stars` -> `{ "stars": 1234 }`. The star count of the GitHub repository, read through Cloudflare's cache for ten minutes so that every visitor
 * shares one request to GitHub. When GitHub cannot be reached the answer is `{ "stars": null }` and the page keeps the number it was built with.
 */
const KEY = "https://ui.ballmac.com/internal/github-stars"

export async function GET() {
  const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default
  const hit = await cache?.match(KEY)
  if (hit) return hit
  const stars = await fetchStars(fetch, process.env.GITHUB_TOKEN)
  const res = Response.json(
    { stars },
    {
      headers: {
        "access-control-allow-origin": "*",
        // A failure is retried soon; a count is shared by every visitor for ten minutes.
        "cache-control": stars === null ? "public, max-age=30" : "public, max-age=300, s-maxage=600",
      },
    }
  )
  if (stars !== null) await cache?.put(KEY, res.clone())
  return res
}

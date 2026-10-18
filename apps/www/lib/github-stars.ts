/**
 * The GitHub star count shown in the header and on the home page.
 *
 * The page carries the count from build time, and the browser asks /api/stars (a Worker route that caches GitHub's answer for ten minutes, so
 * visitors never hit GitHub's rate limit) to bring it up to date. Below STARS_MIN_VISIBLE the number is left out and only the "Star on GitHub" call
 * stays: a small count reads as a lack of interest, not as proof.
 */
export const REPO = "vamsiy78/ballmac-ui"
export const REPO_URL = `https://github.com/${REPO}`
export const STARS_MIN_VISIBLE = 50

/** 842 -> "842", 1234 -> "1.2k", 12000 -> "12k". */
export function formatStars(n: number): string {
  if (n < 1000) return String(n)
  const k = n / 1000
  return `${k >= 10 ? Math.round(k) : Math.round(k * 10) / 10}k`
}

export const showStars = (n: number | null | undefined): n is number => typeof n === "number" && Number.isFinite(n) && n >= STARS_MIN_VISIBLE

/** The star count from GitHub's API, or null when it cannot be read. A token (optional) only raises the rate limit. */
export async function fetchStars(fetcher: typeof fetch = fetch, token?: string): Promise<number | null> {
  try {
    const res = await fetcher(`https://api.github.com/repos/${REPO}`, {
      headers: { accept: "application/vnd.github+json", "user-agent": "ballmac-ui-site", ...(token ? { authorization: `Bearer ${token}` } : {}) },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const stars = ((await res.json()) as { stargazers_count?: unknown }).stargazers_count
    return typeof stars === "number" && Number.isFinite(stars) && stars >= 0 ? stars : null
  } catch {
    return null
  }
}

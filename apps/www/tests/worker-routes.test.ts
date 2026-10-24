import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const root = join(import.meta.dirname, "..")
const read = (p: string) => readFileSync(join(root, p), "utf8")

/**
 * Static files are served without running the Worker, so every route in worker/index.ts needs its path in `run_worker_first` (wrangler.jsonc) and in the
 * development proxy list (next.config.ts). A route missing from either answers 404 in production or in `next dev` and nothing in the Worker ever runs.
 */
describe("Worker routes are listed where they must be", () => {
  const index = read("worker/index.ts")
  const routes = [...index.matchAll(/^\s*\["(\/api\/[^"]+)",/gm)].map((m) => m[1])
  const wrangler = read("wrangler.jsonc")
  const next = read("next.config.ts")
  const covered = (list: string, path: string) => {
    // "/api/affiliates/admin" is covered by "/api/affiliates/*" and "/api/affiliates/:path*"; "/api/pro/items/:name" by "/api/pro/*"
    const base = path.split("/:")[0]
    const parts = base.split("/")
    for (let i = parts.length; i >= 3; i--) {
      const prefix = parts.slice(0, i).join("/")
      if (list.includes(`"${prefix}"`) || list.includes(`"${prefix}/*"`) || list.includes(`"${prefix}/:path*"`)) return true
    }
    return false
  }

  it("finds the API routes", () => {
    expect(routes.length).toBeGreaterThan(10)
    expect(routes).toContain("/api/checkout-click")
  })
  for (const route of ["/api/checkout-click", ...routes]) {
    it(`${route} is in run_worker_first and in the dev proxy`, () => {
      expect(covered(wrangler, route), `${route} missing from wrangler.jsonc run_worker_first`).toBe(true)
      expect(covered(next, route), `${route} missing from next.config.ts workerRoutes`).toBe(true)
    })
  }
})

/**
 * Lighthouse on the key pages of a running site, mobile and desktop, with a score floor per page.
 *
 *   pnpm lighthouse --base-url http://localhost:3700 [--only mobile|desktop] [--pages /,/templates] [--out .lighthouse]
 *
 * Start the production build first (`pnpm --filter www build && pnpm --filter www start -p 3700`). Numbers from a laptop or CI runner are
 * lab numbers (simulated slow 4G, 4x CPU slowdown on mobile) and move by a few points between runs, so the floors below sit under the
 * scores we measured. Accessibility, best practices and SEO must be 100 everywhere. Exits 1 when any page misses its floor.
 *
 * Needs Lighthouse (`npx --yes lighthouse`, or set LIGHTHOUSE_BIN) and a Chrome (CHROME_PATH, or the Playwright Chromium if installed).
 * Pro pages are included when the Pro checkout is mounted, because the build then contains them.
 */
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

const arg = (n: string, d?: string) => {
  const i = process.argv.indexOf(`--${n}`)
  return i > -1 ? process.argv[i + 1] : d
}
const base = (arg("base-url") ?? "http://localhost:3700").replace(/\/$/, "")
const only = arg("only")
const out = arg("out") ?? join(process.cwd(), ".lighthouse")

/** Performance floors (0 to 100) per page. Mobile is the strict one; the list is the pages people land on. */
export const PAGES: { path: string; mobile: number; desktop: number; pro?: boolean }[] = [
  { path: "/", mobile: 80, desktop: 90 },
  { path: "/components", mobile: 70, desktop: 90 },
  { path: "/components/button", mobile: 80, desktop: 95 },
  { path: "/blocks", mobile: 70, desktop: 90 },
  { path: "/blocks/hero-1", mobile: 80, desktop: 95 },
  { path: "/blocks/hero-pro-1", mobile: 80, desktop: 95, pro: true },
  { path: "/templates", mobile: 70, desktop: 90 },
  { path: "/templates/template-orbit", mobile: 60, desktop: 85 },
  { path: "/themes", mobile: 70, desktop: 90 },
  { path: "/pricing", mobile: 85, desktop: 95 },
  { path: "/docs/installation", mobile: 85, desktop: 95 },
  { path: "/changelog", mobile: 85, desktop: 95 },
]

function chrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? join(process.env.HOME ?? "", ".cache/ms-playwright")
  if (!existsSync(root)) return undefined
  const dir = readdirSync(root).find((d) => d.startsWith("chromium-"))
  const exe = dir && ["chrome-linux/chrome", "chrome-mac/Chromium.app/Contents/MacOS/Chromium"].map((p) => join(root, dir, p)).find(existsSync)
  return exe
}

const run = (path: string, mode: "mobile" | "desktop") => {
  mkdirSync(out, { recursive: true })
  const file = join(out, `${path.replace(/\W+/g, "_") || "home"}-${mode}.json`)
  const bin = process.env.LIGHTHOUSE_BIN
  const args = [
    ...(bin ? [] : ["--yes", "lighthouse"]),
    base + path,
    "--output=json",
    `--output-path=${file}`,
    "--quiet",
    "--chrome-flags=--headless=new --no-sandbox",
    "--only-categories=performance,accessibility,best-practices,seo",
    ...(mode === "desktop" ? ["--preset=desktop"] : []),
  ]
  const r = spawnSync(bin ?? "npx", args, { env: { ...process.env, CHROME_PATH: chrome() ?? process.env.CHROME_PATH ?? "" }, encoding: "utf8" })
  if (!existsSync(file)) throw new Error(`Lighthouse failed for ${path} (${mode}): ${r.stderr?.slice(0, 300)}`)
  const j = JSON.parse(readFileSync(file, "utf8"))
  const score = (c: string) => Math.round(j.categories[c].score * 100)
  const num = (a: string) => j.audits[a].numericValue as number
  return { perf: score("performance"), a11y: score("accessibility"), bp: score("best-practices"), seo: score("seo"), fcp: num("first-contentful-paint"), lcp: num("largest-contentful-paint"), tbt: num("total-blocking-time"), cls: num("cumulative-layout-shift") }
}

async function main() {
  const wanted = arg("pages")?.split(",")
  const live = await fetch(`${base}/`).then((r) => r.ok).catch(() => false)
  if (!live) {
    console.error(`Nothing is answering at ${base}. Start the production server first.`)
    process.exit(1)
  }
  let failed = 0
  for (const p of PAGES) {
    if (wanted && !wanted.includes(p.path)) continue
    if (p.pro && (await fetch(base + p.path).then((r) => r.status).catch(() => 0)) === 404) {
      console.log(`skip     ${p.path} (not in this build: Pro is not mounted)`)
      continue
    }
    for (const mode of ["mobile", "desktop"] as const) {
      if (only && only !== mode) continue
      const r = run(p.path, mode)
      const problems = [r.perf < p[mode] ? `performance ${r.perf} < ${p[mode]}` : "", ...(["a11y", "bp", "seo"] as const).filter((k) => r[k] < 100).map((k) => `${k} ${r[k]} < 100`)].filter(Boolean)
      if (problems.length) failed++
      console.log(`${problems.length ? "FAIL" : "ok  "} ${mode.padEnd(7)} ${p.path.padEnd(28)} perf ${String(r.perf).padStart(3)} a11y ${r.a11y} bp ${r.bp} seo ${r.seo} | FCP ${Math.round(r.fcp)} LCP ${Math.round(r.lcp)} TBT ${Math.round(r.tbt)} CLS ${r.cls.toFixed(3)}${problems.length ? `  <- ${problems.join(", ")}` : ""}`)
    }
  }
  if (failed) {
    console.error(`\n${failed} run(s) missed their floor.`)
    process.exit(1)
  }
  console.log("\nAll pages meet their floors.")
}

void main()

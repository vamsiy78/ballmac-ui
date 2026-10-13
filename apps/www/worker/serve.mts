/**
 * Serves the Cloudflare build locally, as Cloudflare would: static files plus the Worker. `pnpm cf:preview` (after `pnpm cf:build`).
 *
 * Wrangler's local server cannot start with the full ~15,000 files of out/ on macOS (spawn EBADF, from about 10,000 files; deploys are not affected), so it
 * serves every page except the per-item preview, component and block pages, of which it keeps a sample. Hard links, so nothing is copied.
 */
import { existsSync, linkSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
import { dirname, join, relative } from "node:path"

import { unstable_dev } from "wrangler"

const www = join(import.meta.dirname, "..")
const out = join(www, "out")
const local = join(www, ".wrangler/local-assets")
if (!existsSync(out)) throw new Error("out/ is missing: run pnpm cf:build first")

const SAMPLE = /^(preview|components|blocks|templates)\/((button|hero-1|hero-pro-1|dashboard-pro-1|template-ledger|citation)\b|[^/]+\.(html|txt)$)/
rmSync(local, { recursive: true, force: true })
let kept = 0
const walk = (dir: string) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const rel = relative(out, p)
    if (statSync(p).isDirectory()) walk(p)
    else if (!/^(preview|components|blocks|templates)\//.test(rel) || SAMPLE.test(rel)) {
      mkdirSync(dirname(join(local, rel)), { recursive: true })
      linkSync(p, join(local, rel))
      kept++
    }
  }
}
walk(out)

// Secrets for local runs live in .dev.vars, which wrangler reads next to the config.
if (existsSync(join(www, ".dev.vars"))) writeFileSync(join(www, ".wrangler/.dev.vars"), readFileSync(join(www, ".dev.vars")))
const config = join(www, ".wrangler/local.jsonc")
writeFileSync(config, readFileSync(join(www, "wrangler.jsonc"), "utf8").replace('"directory": "out"', `"directory": ${JSON.stringify(local)}`).replace('"main": "worker/index.ts"', `"main": ${JSON.stringify(join(www, "worker/index.ts"))}`).replace('"./worker/server-only.ts"', JSON.stringify(join(www, "worker/server-only.ts"))))

const port = Number(process.env.PORT ?? 8788)
const worker = await unstable_dev(join(www, "worker/index.ts"), { config, port, experimental: { watch: false, disableExperimentalWarning: true, showInteractiveDevSession: false, liveReload: false } })
console.log(`Serving the Cloudflare build on http://127.0.0.1:${worker.port} with ${kept.toLocaleString("en-US")} of its files (Ctrl-C to stop)`)
await worker.waitUntilExit()

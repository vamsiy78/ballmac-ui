/**
 * Finishes out/ after `next build` with BALLMAC_EXPORT=1: adds Cloudflare's _headers and _redirects, and fails when the build would not fit or would
 * leak. Run by `pnpm cf:build`.
 */
import { copyFileSync, existsSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const www = join(import.meta.dirname, "..")
const out = join(www, "out")
if (!existsSync(out)) throw new Error("out/ is missing: run next build with BALLMAC_EXPORT=1 first")

for (const f of ["_headers", "_redirects"]) copyFileSync(join(www, "cloudflare", f), join(out, f))

const files: string[] = []
let dirs = 0
const walk = (dir: string) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      dirs++
      walk(p)
    } else files.push(p)
  }
}
walk(out)

// Workers static assets: at most 20,000 per deploy on the Free plan, and 25 MiB per file. Wrangler counts folders as well as files, so this does too.
const LIMIT = 20_000
const entries = files.length + dirs
const big = files.filter((f) => statSync(f).size > 25 * 1024 * 1024)
if (big.length) throw new Error(`Files over 25 MiB cannot be deployed: ${big.map((f) => relative(out, f)).join(", ")}`)
if (entries > LIMIT) throw new Error(`out/ has ${entries} files and folders; the Workers Free plan allows ${LIMIT} per deploy`)

// The private Pro build must never become a public file. It belongs in the Worker (worker/build-data.mts), not here.
const leaked = files.filter((f) => /\.registry-pro|[\\/]r[\\/]pro[\\/]/.test(relative(out, f)))
if (leaked.length) throw new Error(`Pro files in the public output: ${leaked.slice(0, 5).map((f) => relative(out, f)).join(", ")}`)

console.log(`✓ out/: ${entries.toLocaleString("en-US")} files and folders (Free plan limit ${LIMIT.toLocaleString("en-US")}), _headers and _redirects added`)

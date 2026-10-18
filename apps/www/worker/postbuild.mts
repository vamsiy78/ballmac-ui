/**
 * Finishes out/ after `next build` with BALLMAC_EXPORT=1: adds Cloudflare's _headers and _redirects, and fails when the build would not fit or would
 * leak. Run by `pnpm cf:build`.
 */
import { appendFileSync, copyFileSync, existsSync, readdirSync, readFileSync, rmdirSync, rmSync, statSync } from "node:fs"
import { join, relative } from "node:path"

import docsRedirects from "../content/docs-redirects.json" with { type: "json" }

const www = join(import.meta.dirname, "..")
const out = join(www, "out")
if (!existsSync(out)) throw new Error("out/ is missing: run next build with BALLMAC_EXPORT=1 first")

for (const f of ["_headers", "_redirects"]) copyFileSync(join(www, "cloudflare", f), join(out, f))
// Docs pages that moved: permanent redirects, because published packages and other sites still link to the old addresses. Same list as next.config.ts.
appendFileSync(join(out, "_redirects"), `\n# Docs reorganised by what the reader needs (content/docs-redirects.json)\n${Object.entries(docsRedirects).map(([from, to]) => `${from} ${to} 301`).join("\n")}\n`)
// A preview build (DEPLOY_ENV=preview) must never be indexed: every file it serves says so.
if (process.env.DEPLOY_ENV && process.env.DEPLOY_ENV !== "production") appendFileSync(join(out, "_headers"), "\n# Preview build: keep it out of search engines.\n/*\n  X-Robots-Tag: noindex\n")

/**
 * Previews are only ever loaded in iframes and plain links, so nothing asks for their segment-prefetch payloads (`__next.*.txt`, four per page and
 * about 5,400 files in all). Dropping them, and the folders that only held them, keeps the export well under the Workers asset limit. Each preview's
 * HTML must then carry its own data, so every page is read back to prove it does.
 */
const previewDir = join(out, "preview")
if (existsSync(previewDir)) {
  const prune = (dir: string): number => {
    let left = 0
    for (const name of readdirSync(dir)) {
      const p = join(dir, name)
      if (statSync(p).isDirectory()) {
        if (prune(p) === 0) rmdirSync(p)
        else left++
      } else if (/^__next\..*\.txt$/.test(name)) rmSync(p)
      else left++
    }
    return left
  }
  prune(previewDir)
  const pages = readdirSync(previewDir).filter((f) => f.endsWith(".html"))
  if (pages.length === 0) throw new Error("out/preview has no pages: the previews did not export")
  const broken = pages.filter((f) => {
    const html = readFileSync(join(previewDir, f), "utf8")
    // The route params and the page payload travel inside the HTML (self.__next_f), so no second request is needed.
    return !html.includes("self.__next_f.push") || !html.includes(f.slice(0, -".html".length))
  })
  if (broken.length) throw new Error(`Preview pages that no longer carry their own data (pruning out/preview/**/__next.*.txt is only safe when they do): ${broken.slice(0, 5).join(", ")}${broken.length > 5 ? ` and ${broken.length - 5} more` : ""}`)
}

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

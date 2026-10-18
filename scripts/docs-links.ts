/**
 * Checks every link and #fragment on the built docs and changelog pages with lychee (lychee.toml).
 *
 *   pnpm --filter @ballmac-ui/www cf:build
 *   pnpm docs:links        needs `lychee` on your PATH (brew install lychee, or the release binary)
 *
 * The built site is served on a local port the way Cloudflare serves it (clean URLs, the _redirects file), and lychee loads each page by URL, so a
 * link such as #where-files-go is looked up on its own page. Absolute addresses of the live site are skipped (see lychee.toml): they only
 * exist once the build is deployed.
 */
import { spawn, spawnSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { createServer } from "node:http"
import { extname, join, relative } from "node:path"

const out = join(import.meta.dirname, "..", "apps/www/out")
if (!existsSync(out)) throw new Error("apps/www/out is missing: run `pnpm --filter @ballmac-ui/www cf:build` first")
if (spawnSync("lychee", ["--version"], { stdio: "ignore" }).status !== 0) throw new Error("lychee is not installed (https://lychee.cli.rs/installation/)")

const redirects = Object.fromEntries(
  readFileSync(join(out, "_redirects"), "utf8").split("\n").filter((l) => /^\/\S+ \/\S+ 301/.test(l)).map((l) => l.split(" ") as [string, string])
)
const types: Record<string, string> = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".xml": "application/xml", ".md": "text/markdown", ".txt": "text/plain; charset=utf-8", ".ico": "image/x-icon" }
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname).replace(/\/$/, "") || "/"
  if (redirects[path]) {
    res.writeHead(301, { location: redirects[path] })
    return res.end()
  }
  const file = [path, `${path}.html`, join(path, "index.html")].map((c) => join(out, c)).find((c) => existsSync(c) && statSync(c).isFile())
  if (!file) {
    res.writeHead(404, { "content-type": "text/plain" })
    return res.end("Not found")
  }
  res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" })
  res.end(readFileSync(file))
})
await new Promise<void>((r) => server.listen(0, "127.0.0.1", r))
const port = (server.address() as { port: number }).port

const pages = (dir: string): string[] =>
  readdirSync(join(out, dir)).flatMap((f) => (statSync(join(out, dir, f)).isDirectory() ? pages(join(dir, f)) : f.endsWith(".html") ? [join(dir, f)] : []))
const urls = [...pages("docs"), ...pages("changelog"), "docs.html", "changelog.html"].map((f) => `http://localhost:${port}/${relative("", f).replace(/\.html$/, "")}`)

const code = await new Promise<number>((resolve) => {
  const child = spawn("lychee", ["--config", join(import.meta.dirname, "..", "lychee.toml"), "--no-progress", ...urls], { stdio: "inherit" })
  child.on("exit", (c) => resolve(c ?? 1))
})
server.close()
process.exit(code)

/**
 * Proves Pro source does not leak into anything public.
 *
 *   pnpm verify:pro                                   static scan (run after a build)
 *   pnpm verify:pro --base-url https://host --key K   also probes a running site
 *
 * Static: scans apps/www/public, .next/static and prerendered .next/server/app for fingerprints
 * (long, distinctive Pro source lines that are not present in free sources), and checks git
 * history for Pro paths. Runtime: licence gating on /r/pro, 404 on public Pro names, and no
 * fingerprints in public API/pages.
 */
import { execFileSync, spawnSync } from "node:child_process"
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, relative } from "node:path"

const ROOT = join(import.meta.dirname, "..")
const PRO = join(ROOT, "registry/pro/ballmac")
const arg = (n: string) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : undefined }

function walk(dir: string, skip = (_: string) => false): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    if (skip(p)) return []
    return statSync(p).isDirectory() ? walk(p, skip) : [p]
  })
}

const lines = (f: string) => readFileSync(f, "utf8").split("\n").map((l) => l.trim())
const distinctive = (l: string) => l.length >= 70 && !l.startsWith("//") && !l.startsWith("*") && !l.startsWith("import ") && /[a-z]{3}/.test(l)

let failures = 0
const fail = (m: string) => { failures++; console.error(`✗ ${m}`) }
const ok = (m: string) => console.log(`✓ ${m}`)

function fingerprints() {
  if (!existsSync(PRO)) return null
  const free: string[] = []
  for (const dir of ["registry/ballmac", "registry/examples", "apps/www/app", "apps/www/components", "apps/www/lib", "packages"]) {
    for (const f of walk(join(ROOT, dir), (p) => p.includes("node_modules") || p.includes("/dist/")).filter((f) => /\.(tsx?|css|json)$/.test(f))) free.push(readFileSync(f, "utf8"))
  }
  const corpus = free.join("\n")
  const fp = new Set<string>()
  for (const f of walk(PRO).filter((f) => /\.tsx?$/.test(f) && !f.endsWith(".meta.ts"))) {
    // The longest distinctive lines per file are enough to detect a copied file, and keep the scan fast.
    const cand = lines(f).filter((l) => distinctive(l) && !/^["'`][^"'`]*["'`][,;]?$/.test(l)).sort((a, b) => b.length - a.length)
    let taken = 0
    for (const l of cand.slice(0, 40)) {
      if (corpus.includes(l.replace(/[,;]+$/, ""))) continue
      fp.add(l)
      if (++taken === 6) break
    }
  }
  // Props tables are public documentation, so default values (shown on item pages and in the API) are not leaks.
  const dir = join(ROOT, "apps/www/.next/server/app/api/v1/items")
  for (const f of walk(dir).filter((f) => f.endsWith(".body"))) {
    try {
      const body = JSON.parse(readFileSync(f, "utf8")) as { props?: { default?: unknown }[] }
      for (const p of body.props ?? []) if (typeof p.default === "string") for (const l of p.default.split("\n")) fp.delete(l.trim())
    } catch {}
  }
  return [...fp]
}

function scanTargets(fp: string[]) {
  const www = join(ROOT, "apps/www")
  const dirs = [join(www, "public"), join(www, ".next/static"), join(www, ".next/server/app")].filter(existsSync)
  // JS chunks escape quotes, so search for both forms. grep -F uses Aho-Corasick, which keeps this fast on large builds.
  const patterns = fp.flatMap((l) => [l, l.replace(/"/g, '\\"')])
  const file = join(tmpdir(), `verify-pro-${process.pid}.txt`)
  writeFileSync(file, [...new Set(patterns)].join("\n") + "\n")
  try {
    const r = spawnSync("grep", ["-rlF", "--exclude-dir=pro", "-f", file, ...dirs], { encoding: "utf8", maxBuffer: 1 << 26 })
    if (r.status === 2) throw new Error(r.stderr)
    for (const f of r.stdout.split("\n").filter(Boolean).slice(0, 10)) fail(`Pro source lines found in ${relative(ROOT, f)}`)
  } finally {
    rmSync(file, { force: true })
  }
  return dirs.length
}

function history() {
  try {
    const out = execFileSync("git", ["log", "--all", "--name-only", "--pretty=format:"], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28 })
    const bad = [...new Set(out.split("\n").filter((p) => /^(registry\/pro\/|apps\/www\/\.registry-pro|registry-pro\.json)/.test(p)))]
    if (bad.length) fail(`git history contains Pro paths: ${bad.slice(0, 5).join(", ")}`)
    else ok("git history has no Pro paths")
  } catch (e) {
    console.warn(`! could not read git history: ${(e as Error).message}`)
  }
}

async function runtime(base: string, key: string | undefined, names: string[], fp: string[]) {
  const get = (path: string, k?: string) => fetch(base + path, { headers: k ? { authorization: `Bearer ${k}` } : {} })
  const probe = names[0]
  if (probe) {
    const no = await get(`/r/pro/${probe}.json`)
    no.status === 401 ? ok("/r/pro without key → 401") : fail(`/r/pro without key → ${no.status} (want 401)`)
    const bad = await get(`/r/pro/${probe}.json`, "definitely-not-a-real-key-0000")
    bad.status === 403 ? ok("/r/pro with bad key → 403") : fail(`/r/pro with bad key → ${bad.status} (want 403)`)
    if (key) {
      const good = await get(`/r/pro/${probe}.json`, key)
      const body = good.status === 200 ? ((await good.json()) as { files?: { content?: string }[] }) : null
      body?.files?.length && body.files.every((f) => f.content) ? ok("/r/pro with key → 200 with file contents") : fail(`/r/pro with key → ${good.status} or empty files`)
    }
    const pub = await get(`/r/${probe}.json`)
    pub.status === 404 ? ok("/r/<pro-name> is not public") : fail(`/r/${probe}.json → ${pub.status} (want 404)`)
  }
  const startersDir = join(ROOT, "registry/pro/starters")
  const starters = existsSync(startersDir) ? readdirSync(startersDir).filter((n) => existsSync(join(startersDir, n, "package.json"))) : []
  const downloads = [...starters.map((s) => ({ path: `/r/pro/starters/${s}.tar.gz`, openPath: `/starters/${s}.tar.gz` })), { path: "/r/pro/kits/ballmac-figma-tokens.tar.gz", openPath: "/kits/ballmac-figma-tokens.tar.gz" }]
  for (const { path, openPath } of downloads) {
    if (!existsSync(join(ROOT, "apps/www/.registry-pro"))) break
    const anon = await get(path)
    anon.status === 401 ? ok(`${path} without key → 401`) : fail(`${path} without key → ${anon.status} (want 401)`)
    const wrong = await get(path, "definitely-not-a-real-key-0000")
    wrong.status === 403 ? ok(`${path} with bad key → 403`) : fail(`${path} with bad key → ${wrong.status} (want 403)`)
    if (key) {
      const good = await get(path, key)
      const bytes = good.status === 200 ? new Uint8Array(await good.arrayBuffer()) : null
      bytes && bytes[0] === 0x1f && bytes[1] === 0x8b && bytes.length > 1_000 ? ok(`${path} with key → ${Math.round(bytes.length / 1024)} KB archive`) : fail(`${path} with key → ${good.status} or not a gzip archive`)
    }
    const open = await get(openPath)
    open.status === 404 ? ok(`${openPath} is not public`) : fail(`${openPath} → ${open.status} (want 404)`)
  }
  for (const path of ["/api/v1/index.json", "/llms.txt", ...names.slice(0, 5).flatMap((n) => [`/api/v1/items/${n}.json`, `/components/${n}`, `/preview/${n}`])]) {
    const res = await get(path)
    if (!res.ok) { if (!path.startsWith("/preview") && !path.startsWith("/components")) fail(`${path} → ${res.status}`); continue }
    const text = await res.text()
    const hit = fp.find((l) => text.includes(l))
    hit ? fail(`Pro source line served at ${path}: ${hit.slice(0, 60)}…`) : ok(`${path} clean`)
  }
}

const fp = fingerprints()
if (!fp) {
  console.warn("! registry/pro is absent: skipping fingerprint scan (nothing to leak)")
} else {
  const n = scanTargets(fp)
  if (!failures) ok(`public build output (${n} folders) contains none of ${fp.length} Pro fingerprints`)
}
history()
const base = arg("base-url")
if (base) {
  const names = existsSync(PRO)
    ? walk(PRO).filter((f) => f.endsWith(".meta.ts")).map((f) => f.split("/").pop()!.replace(".meta.ts", ""))
    : []
  await runtime(base.replace(/\/$/, ""), arg("key") ?? process.env.BALLMAC_VERIFY_KEY, names, fp ?? [])
}
if (failures) {
  console.error(`\nverify:pro failed with ${failures} problem(s)`)
  process.exit(1)
}
console.log("\nverify:pro passed")

/**
 * Packs a Pro starter into an archive customers can download, and proves a fresh copy works.
 *
 *   pnpm starter:pack beacon-saas                 writes dist/starters/beacon-saas-<version>.tar.gz (and .zip when `zip` exists)
 *   --out <dir>                                   write somewhere else; --latest also writes <name>.tar.gz (the site build uses both)
 *   pnpm starter:pack beacon-saas --verify        also extracts it to a temp folder, installs from the lockfile,
 *                                                 then runs lint, typecheck, tests and a production build
 *
 * The archive never contains node_modules, build output, local data, test output or any .env file.
 */
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, relative } from "node:path"

const ROOT = join(import.meta.dirname, "..")
const name = process.argv[2]
const verify = process.argv.includes("--verify")
const latest = process.argv.includes("--latest")
const outFlag = process.argv.indexOf("--out")
const dir = name ? join(ROOT, "registry/pro/starters", name) : ""

if (!name || !existsSync(join(dir, "package.json"))) {
  console.error(`Usage: pnpm starter:pack <name> [--verify]   (looked in registry/pro/starters/${name ?? "<name>"})`)
  process.exit(1)
}

export const EXCLUDE = ["ballmac.vendor.json", "ballmac.vendor.lock.json", "node_modules", ".next", ".data", "test-results", "playwright-report", "coverage", ".turbo", "next-env.d.ts"]
const isExcluded = (rel: string) => EXCLUDE.some((e) => rel === e || rel.startsWith(`${e}/`) || rel.endsWith(".tsbuildinfo")) || /(^|\/)\.env($|\.)/.test(rel) && !rel.endsWith(".env.example")

function walk(d: string): string[] {
  return readdirSync(d).flatMap((n) => {
    const p = join(d, n)
    const rel = relative(dir, p)
    if (isExcluded(rel)) return []
    return statSync(p).isDirectory() ? walk(p) : [rel]
  })
}

const sh = (cmd: string, args: string[], cwd: string, env: NodeJS.ProcessEnv = {}) => {
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit", env: { ...process.env, ...env } })
  if (r.status !== 0) {
    console.error(`✗ ${cmd} ${args.join(" ")} failed`)
    process.exit(r.status ?? 1)
  }
}

const files = walk(dir).sort()
const secrets = files.filter((f) => /(^|\/)\.env(\..+)?$/.test(f) && !f.endsWith(".env.example"))
if (secrets.length) {
  console.error(`✗ refusing to pack: ${secrets.join(", ")}`)
  process.exit(1)
}
if (!files.includes("pnpm-lock.yaml")) {
  console.error("✗ pnpm-lock.yaml is missing: customers install from the lockfile")
  process.exit(1)
}

const version = (JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as { version: string }).version
const out = outFlag > -1 ? join(ROOT, process.argv[outFlag + 1]!) : join(ROOT, "dist/starters")
mkdirSync(out, { recursive: true })
const base = `${name}-${version}`
const stage = mkdtempSync(join(tmpdir(), "starter-pack-"))
const root = join(stage, base)
mkdirSync(root)
for (const f of files) {
  const dest = join(root, f)
  mkdirSync(join(dest, ".."), { recursive: true })
  sh("cp", ["-p", join(dir, f), dest], ROOT)
}
const tgz = join(out, `${base}.tar.gz`)
sh("tar", ["-czf", tgz, "-C", stage, base], ROOT)
if (spawnSync("zip", ["-v"], { stdio: "ignore" }).status === 0) sh("zip", ["-qr", join(out, `${base}.zip`), base], stage)
if (latest) sh("cp", [tgz, join(out, `${name}.tar.gz`)], ROOT)
console.log(`✓ packed ${files.length} files → ${relative(ROOT, tgz)}`)

if (verify) {
  console.log("\nVerifying a fresh copy (install, lint, typecheck, test, build)…")
  const check = join(stage, "fresh")
  mkdirSync(check)
  sh("tar", ["-xzf", tgz, "-C", check], ROOT)
  const app = join(check, base)
  const env = { PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: "1", CI: "1" }
  sh("npx", ["-y", "pnpm@10", "install", "--frozen-lockfile", "--ignore-workspace"], app, env)
  sh("npx", ["-y", "pnpm@10", "lint"], app, env)
  sh("npx", ["-y", "pnpm@10", "typecheck"], app, env)
  sh("npx", ["-y", "pnpm@10", "test"], app, env)
  sh("npx", ["-y", "pnpm@10", "build"], app, env)
  console.log("✓ a fresh copy installs, passes lint, typecheck and tests, and builds")
}
rmSync(stage, { recursive: true, force: true })

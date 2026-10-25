/**
 * Sends the staged Pro data (worker/generated/r2-manifest.json, from `pnpm worker:data`) to the R2 bucket the Worker reads.
 *
 *   pnpm --filter @ballmac-ui/www cf:upload --env production|preview     the real bucket (needs R2 access on the Cloudflare token)
 *   pnpm --filter @ballmac-ui/www cf:upload --local [--persist-to <dir>]   the local simulation `pnpm cf:preview` uses
 *
 * Run it after `cf:build` and BEFORE `wrangler deploy`: the data goes under a folder named for its contents (the Worker is built with that name), so the Worker that is
 * serving now keeps reading its own folder until the new one is deployed. Uploading the same folder twice is harmless. Older folders stay until removed by
 * hand (each folder is about 80 MB and the free tier holds 10 GB; do not use a lifecycle rule, which would also expire the live folder).
 */
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

const www = join(import.meta.dirname, "..")
const manifest = join(www, "worker/generated/r2-manifest.json")
const arg = (n: string) => {
  const i = process.argv.indexOf(`--${n}`)
  return i > -1 ? process.argv[i + 1] : undefined
}

export const BUCKETS = { production: "ballmac-pro-data", preview: "ballmac-pro-data-preview", local: "ballmac-pro-data-dev" } as const

const local = process.argv.includes("--local")
const env = (local ? "local" : arg("env")) as keyof typeof BUCKETS | undefined
if (!env || !(env in BUCKETS)) {
  console.error("usage: cf:upload --env production|preview   or   cf:upload --local [--persist-to <dir>]")
  process.exit(2)
}
if (!existsSync(manifest)) {
  console.error("cf:upload · worker/generated/r2-manifest.json is missing: run pnpm cf:build (or worker:data) first")
  process.exit(1)
}
const entries = JSON.parse(readFileSync(manifest, "utf8")) as { key: string; file: string }[]
if (entries.length === 0) {
  console.log("cf:upload · nothing to upload: this build has no Pro data")
  process.exit(0)
}
const args = ["exec", "wrangler", "r2", "bulk", "put", BUCKETS[env], "--filename", manifest, "--concurrency", "20", "--force", local ? "--local" : "--remote"]
if (local && arg("persist-to")) args.push("--persist-to", arg("persist-to")!)
// The first deploy of an environment creates its bucket. An existing one is fine.
if (!local) {
  const made = spawnSync("pnpm", ["exec", "wrangler", "r2", "bucket", "create", BUCKETS[env]], { cwd: www, encoding: "utf8" })
  const out = `${made.stdout}${made.stderr}`
  if (made.status !== 0 && !/already exists|10004/i.test(out)) {
    console.error(out.split("\n").filter((l) => !l.includes("npm warn")).join("\n"))
    console.error("cf:upload · could not create or reach the bucket. R2 must be enabled on the account, and the token needs R2 edit access (internal/CLOUDFLARE.md).")
    process.exit(1)
  }
}
console.log(`cf:upload · ${entries.length} object(s) → ${BUCKETS[env]}${local ? " (local)" : ""}`)
const r = spawnSync("pnpm", args, { cwd: www, stdio: "inherit" })
process.exit(r.status ?? 1)

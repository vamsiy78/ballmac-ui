/**
 * Scores Ballmac UI's own registry with `ballmac verify`, the same command anyone can run on theirs, and writes the result the /verified page shows:
 *
 *   apps/www/content/verified/ballmac.json    the scorecard (committed; the page reads it)
 *   apps/www/public/verified/ballmac.json     the same file, served for anyone to compare
 *   apps/www/public/verified/ballmac.svg      the badge
 *
 *   pnpm verified:generate           write them
 *   pnpm verified:generate --check   fail when the committed scorecard is out of date (runs in `pnpm check`)
 *
 * Needs the registry build (`pnpm build:registry`), which has to run first.
 */
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const ROOT = join(import.meta.dirname, "..")
const CLI = join(ROOT, "packages/cli")
const REGISTRY = join(ROOT, "apps/www/public/r/registry.json")
const CONTENT = join(ROOT, "apps/www/content/verified/ballmac.json")
const PUBLIC = join(ROOT, "apps/www/public/verified")
const check = process.argv.includes("--check")

if (!existsSync(REGISTRY)) {
  console.error("✗ apps/www/public/r/registry.json is missing. Run pnpm build:registry first.")
  process.exit(1)
}
// The audit engine is copied into the CLI at build time; make sure the copy is there.
if (!existsSync(join(CLI, "src/vendor/audit/index.ts"))) {
  const r = spawnSync("node", ["../audit/scripts/vendor.mjs", "src/vendor/audit"], { cwd: CLI, stdio: "inherit" })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

const { badgeSvg, loadRegistry, verifyRegistry } = await import("../packages/cli/src/verify")
const source = await loadRegistry(REGISTRY)
const card = await verifyRegistry(source, { cwd: CLI, tool: "ballmac verify" })
// The registry was read from a file; say where anyone can read the same one.
card.registry = { name: "Ballmac UI", homepage: "https://ui.ballmac.com", source: "https://ui.ballmac.com/r/registry.json" }

/** What the scorecard says, without the time it was written. */
const body = (c: typeof card) => JSON.stringify({ ...c, generated: undefined })

if (check) {
  if (!existsSync(CONTENT)) {
    console.error("✗ apps/www/content/verified/ballmac.json is missing. Run pnpm verified:generate.")
    process.exit(1)
  }
  const committed = JSON.parse(readFileSync(CONTENT, "utf8")) as typeof card
  if (body(committed) !== body(card)) {
    console.error(`✗ The Ballmac Verified scorecard is out of date (committed ${committed.score}, now ${card.score}). Run pnpm verified:generate and commit the result.`)
    process.exit(1)
  }
  console.log(`✓ Ballmac Verified scorecard is current: ${card.score}/100, grade ${card.grade}`)
} else {
  mkdirSync(join(CONTENT, ".."), { recursive: true })
  mkdirSync(PUBLIC, { recursive: true })
  const json = JSON.stringify(card, null, 2) + "\n"
  writeFileSync(CONTENT, json)
  writeFileSync(join(PUBLIC, "ballmac.json"), json)
  writeFileSync(join(PUBLIC, "ballmac.svg"), badgeSvg(card))
  console.log(`Wrote the Ballmac Verified scorecard: ${card.score}/100, grade ${card.grade} (${card.items.scored} items)`)
}

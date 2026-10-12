#!/usr/bin/env node
/**
 * Copies the audit engine's source into a package that ships it (the CLI and the MCP server), so each published package is self-contained and
 * no extra npm package has to exist. Usage (from the consuming package): node ../audit/scripts/vendor.mjs src/vendor/audit
 * The copy is generated: it is git-ignored, rebuilt before every build, typecheck and test, and never edited by hand.
 */
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const target = resolve(process.cwd(), process.argv[2] ?? "")
if (!process.argv[2]) {
  console.error("Usage: node vendor.mjs <target folder>")
  process.exit(1)
}
const source = join(dirname(fileURLToPath(import.meta.url)), "..", "src")

rmSync(target, { recursive: true, force: true })
mkdirSync(target, { recursive: true })
cpSync(source, target, { recursive: true })

const mark = "// Generated from packages/audit/src by packages/audit/scripts/vendor.mjs. Do not edit: change the source there.\n"
const stamp = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) stamp(p)
    else if (p.endsWith(".ts")) writeFileSync(p, mark + readFileSync(p, "utf8"))
  }
}
stamp(target)

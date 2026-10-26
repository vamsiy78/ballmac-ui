import "server-only"

import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

/**
 * Build prompts for Pro items: a long, exact description of an item that an AI builder (Claude, Cursor, Lovable, v0) can recreate it from. They live in the private Pro
 * repository (registry/pro/prompts/<name>.md) and are never part of the public site: the item page only learns that a prompt exists, and the text itself ships through
 * the licence-checked API with the item's source (worker/build-data.mts).
 */
const dir = () => join(process.cwd(), "..", "..", "registry", "pro", "prompts")

let names: Set<string> | undefined
/** The names of the items that have a prompt. Empty when the Pro repository is not checked out. */
export function promptNames(): ReadonlySet<string> {
  if (!names) {
    const d = dir()
    names = new Set(existsSync(d) ? readdirSync(d).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")) : [])
  }
  return names
}

export const hasPrompt = (name: string) => promptNames().has(name)

/** The prompt text for an item, or undefined. */
export function readPrompt(name: string): string | undefined {
  return hasPrompt(name) ? readFileSync(join(dir(), `${name}.md`), "utf8").trim() : undefined
}

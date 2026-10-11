/**
 * Feel discipline: a platform feel restyles the focus ring through one rule over shadcn's standard classes
 * (`focus-visible:ring-[3px]`, `focus-within:ring-[3px]`). An item that writes its own ring width (`focus-visible:ring-2`)
 * would quietly opt out, so it has to be listed in scripts/feel-custom-focus.json. The list is kept honest the other way too:
 * an entry whose file no longer has a custom ring is an error, so migrating an item shrinks the list.
 */
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

import { ROOT } from "./lib"

const CUSTOM = /focus(?:-visible|-within)?:ring-(?:[1-9]|\d{2,})\b(?!px)/

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".tsx") ? [p] : []
  })
}

export function feelProblems(files: Record<string, string>, listed: Record<string, string>) {
  const problems: string[] = []
  for (const [file, source] of Object.entries(files)) {
    const custom = CUSTOM.test(source)
    if (custom && !(file in listed)) problems.push(`${file}: draws its own focus ring width, which the platform feels cannot restyle. Use focus-visible:ring-[3px] focus-visible:ring-ring/50, or list it in scripts/feel-custom-focus.json.`)
    if (!custom && file in listed) problems.push(`${file}: is listed in scripts/feel-custom-focus.json but no longer has a custom focus ring. Remove the entry.`)
  }
  for (const file of Object.keys(listed)) if (!(file in files)) problems.push(`${file}: is listed in scripts/feel-custom-focus.json but does not exist. Remove the entry.`)
  return problems
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = Object.fromEntries(walk(join(ROOT, "registry/ballmac")).map((f) => [relative(ROOT, f), readFileSync(f, "utf8")]))
  const listed = JSON.parse(readFileSync(join(ROOT, "scripts/feel-custom-focus.json"), "utf8")) as Record<string, string>
  const problems = feelProblems(files, listed)
  if (problems.length) {
    console.error(`✗ Feel check failed:\n  - ${problems.join("\n  - ")}`)
    process.exit(1)
  }
  const standard = Object.values(files).filter((s) => /focus-(visible|within):ring-\[3px\]/.test(s)).length
  console.log(`✓ Feel: ${standard} file(s) follow the platform focus ring, ${Object.keys(listed).length} draw their own (listed)`)
}

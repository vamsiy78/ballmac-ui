/**
 * Extra registry outputs that `ballmac outdated`, `ballmac update` and `ballmac add --with-tests` read:
 *
 *   r/versions.json          every item: version, changelog, files, Ballmac dependencies, whether it ships tests
 *   r/tests/<item>.json      the item's test file, ready to install next to it
 *   r/tests/_setup.json      the shared test setup (jest-dom, cleanup, jsdom stubs)
 *
 * Pro items get a versions.json in the private build (apps/www/.registry-pro), served with the licence key. Pro tests cover whole
 * batches of blocks in one file, so no per-item Pro tests ship yet.
 */
import { mkdirSync, readFileSync, existsSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { importPathFor, ROOT, targetFor, type LoadedItem } from "./lib"

/**
 * Packages every shipped test needs in the project that runs it, pinned to the majors the tests run on here.
 * Unpinned, `npm install` picks a newer @vitejs/plugin-react whose peers conflict with a stock Next.js app.
 */
export const TEST_DEV_DEPENDENCIES = [
  "vitest@^4",
  "jsdom@^27",
  "@vitejs/plugin-react@^5",
  "@testing-library/react@^16",
  "@testing-library/dom@^10",
  "@testing-library/user-event@^14",
  "@testing-library/jest-dom@^6",
]

/** A test that needs more than this many other Ballmac items is not shipped (it is a test of the whole system, not of the item). */
const MAX_REQUIRES = 1

export type TestFile = { name: string; version: string; tier: "free" | "pro"; file: string; content: string; requires: string[] }

const testPath = (item: LoadedItem) => join(ROOT, item.tier === "pro" ? "registry/pro/tests" : "registry/tests", `${item.name}.test.tsx`)

/**
 * The test that belongs to an item is `tests/<item>.test.tsx`. Files that cover a whole batch of items (blocks-batch-*, templates-batch-*)
 * are not split up, so those items have no shipped test. A test must only import the item, its own dependencies and at most
 * MAX_REQUIRES other Ballmac item: anything else could not run in a project that installed just this item.
 */
export function planTests(items: LoadedItem[]): Map<string, TestFile> {
  const byName = new Map(items.map((i) => [i.name, i]))
  const owners = new Map<string, string>()
  for (const i of items) for (const f of i.files) {
    const p = importPathFor(f.path)
    if (p) owners.set(p, i.name)
  }
  const closure = (name: string, seen = new Set<string>()): Set<string> => {
    if (seen.has(name)) return seen
    seen.add(name)
    for (const d of byName.get(name)?.registryDependencies ?? []) if (!d.startsWith("shadcn:")) closure(d, seen)
    return seen
  }
  const plan = new Map<string, TestFile>()
  for (const item of items) {
    const path = testPath(item)
    if (!existsSync(path)) continue
    const code = readFileSync(path, "utf8")
    const imported = [...code.matchAll(/(?:from|mock\()\s*"(@\/(?:components|hooks|lib)\/ballmac\/[^"]+)"/g)].map((m) => m[1]!)
    const needed = new Set<string>()
    let unknown = false
    for (const spec of imported) {
      const owner = owners.get(spec) ?? owners.get(`${spec}/index`)
      if (owner) needed.add(owner)
      else unknown = true
    }
    if (unknown) continue
    const own = closure(item.name)
    const requires = [...needed].filter((n) => !own.has(n)).sort()
    if (requires.length > MAX_REQUIRES) continue
    const content =
      `// @vitest-environment jsdom\n// Ballmac UI test for ${item.title}. Run it with: npx vitest run ${item.name}\nimport "./setup"\n\n` + code
    plan.set(item.name, { name: item.name, version: item.version, tier: item.tier, file: `${item.name}.test.tsx`, content, requires })
  }
  return plan
}

export function writeVersions(items: LoadedItem[], registry: string, outDir: string) {
  mkdirSync(outDir, { recursive: true })
  const plan = planTests(items)
  const manifest = {
    schema: 1,
    registry,
    items: Object.fromEntries(
      items
        .map((i) => [
          i.name,
          {
            title: i.title,
            type: i.type,
            version: i.version,
            updated: i.updated,
            tier: i.tier,
            files: i.files.map((f) => targetFor(f.path)),
            requires: i.registryDependencies.filter((d) => !d.startsWith("shadcn:")),
            tests: plan.has(i.name),
            changelog: i.changelog,
          },
        ] as const)
        .sort(([a], [b]) => a.localeCompare(b))
    ),
  }
  writeFileSync(join(outDir, "versions.json"), JSON.stringify(manifest, null, 2) + "\n")
  return Object.keys(manifest.items).length
}

export function writeTests(items: LoadedItem[], outDir: string) {
  // Free items only. Planned over every item so a test's imports are recognised either way.
  const plan = new Map([...planTests(items)].filter(([, t]) => t.tier === "free"))
  mkdirSync(outDir, { recursive: true })
  for (const t of plan.values()) {
    writeFileSync(
      join(outDir, `${t.name}.json`),
      JSON.stringify({ schema: 1, name: t.name, version: t.version, file: t.file, content: t.content, requires: t.requires, devDependencies: TEST_DEV_DEPENDENCIES }, null, 2) + "\n"
    )
  }
  const content = readFileSync(join(ROOT, "registry/tests/setup.ts"), "utf8")
  writeFileSync(join(outDir, "_setup.json"), JSON.stringify({ schema: 1, file: "setup.ts", content, devDependencies: TEST_DEV_DEPENDENCIES }, null, 2) + "\n")
  return plan.size
}

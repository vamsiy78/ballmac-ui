import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import type { LoadedItem } from "../../../scripts/lib"
import { planTests, TEST_DEV_DEPENDENCIES, writeVersions } from "../../../scripts/registry-extras"
import { itemHash, nextLock, versionProblems } from "../../../scripts/versions"

// Just enough of an item for the build helpers; they read item files from baseDir.
function item(name: string, over: Partial<LoadedItem> & { content?: string } = {}): LoadedItem {
  const dir = mkdtempSync(join(tmpdir(), "item-"))
  const path = `components/${name}.tsx`
  mkdirSync(join(dir, "components"), { recursive: true })
  writeFileSync(join(dir, path), over.content ?? `export const ${name} = 1\n`)
  return {
    name,
    type: "registry:ui",
    title: name,
    description: `${name} description long enough`,
    category: "primitives",
    tier: "free",
    version: "1.0.0",
    updated: "2026-10-11",
    changelog: [],
    files: [{ path }],
    registryDependencies: [],
    dependencies: [],
    examples: [],
    baseDir: dir,
    examplesDir: dir,
    metaPath: "",
    ...over,
  } as unknown as LoadedItem
}

describe("version guard", () => {
  const locked = (i: LoadedItem) => ({ [i.name]: { version: i.version, hash: itemHash(i) } })

  it("passes when nothing changed", () => {
    const a = item("a")
    expect(versionProblems([a], locked(a))).toEqual([])
  })

  it("fails when files changed but the version did not", () => {
    const a = item("a")
    const lock = locked(a)
    writeFileSync(join(a.baseDir, "components/a.tsx"), "export const a = 2\n")
    expect(versionProblems([a], lock)[0]).toMatch(/a: its files changed but the version is still 1\.0\.0/)
  })

  it("fails when the version is bumped without a changelog entry for it", () => {
    const a = item("a")
    const lock = locked(a)
    const bumped = { ...a, version: "1.1.0" } as LoadedItem
    expect(versionProblems([bumped], lock)[0]).toMatch(/changelog has no entry for it/)
    const noted = { ...bumped, changelog: [{ version: "1.1.0", date: "2026-10-12", note: "A real change.", breaking: false }] } as LoadedItem
    expect(versionProblems([noted], lock)).toEqual([])
  })

  it("fails when a version goes backwards", () => {
    const a = item("a", { version: "1.2.0" })
    expect(versionProblems([{ ...a, version: "1.1.0" } as LoadedItem], locked(a))[0]).toMatch(/went back/)
  })

  it("ignores items it has never seen and works without a lock", () => {
    const a = item("a")
    expect(versionProblems([a], { other: { version: "1.0.0", hash: "x" } })).toEqual([])
    expect(versionProblems([a], null)).toEqual([])
  })

  it("hashes content, not file order or timestamps", () => {
    const a = item("a", { content: "same\n" })
    const b = item("a", { content: "same\n" })
    expect(itemHash(a)).toBe(itemHash(b))
    expect(itemHash(a)).not.toBe(itemHash(item("a", { content: "different\n" })))
    expect(Object.keys(nextLock([item("z"), item("m")]))).toEqual(["m", "z"])
  })
})

describe("shipped tests", () => {
  // These use the real test files in registry/tests (button.test.tsx, switch.test.tsx).
  it("packages the test that belongs to an item, with a standalone header", () => {
    const button = item("button", { registryDependencies: ["shadcn:utils"] })
    ;(button as { files: { path: string }[] }).files = [{ path: "components/button.tsx" }]
    const plan = planTests([button])
    const t = plan.get("button")!
    expect(t.file).toBe("button.test.tsx")
    expect(t.requires).toEqual([])
    expect(t.content.startsWith("// @vitest-environment jsdom\n")).toBe(true)
    expect(t.content).toContain('import "./setup"')
    expect(t.content).toContain('from "@/components/ballmac/button"')
    expect(t.content).not.toMatch(/\b1\.0\.0\b/) // no version in the header: the file only changes when the test does
  })

  it("lists the one other item a test needs, and skips a test that needs more or imports unknown code", () => {
    const label = item("label")
    const sw = item("switch")
    expect(planTests([sw, label]).get("switch")!.requires).toEqual(["label"])
    expect(planTests([sw]).has("switch")).toBe(false) // imports @/components/ballmac/label, which is not an item here
  })

  it("pins the test packages to the majors the tests run on", () => {
    expect(TEST_DEV_DEPENDENCIES.every((d) => /@\^\d+$/.test(d))).toBe(true)
    expect(TEST_DEV_DEPENDENCIES).toContain("@vitejs/plugin-react@^5")
  })

  it("writes a manifest with files, dependencies, test flag and changelog", () => {
    const out = mkdtempSync(join(tmpdir(), "manifest-"))
    const button = item("button", { changelog: [{ version: "1.0.0", date: "2026-10-11", note: "First version here.", breaking: false }] })
    expect(writeVersions([button], "https://x.test", out)).toBe(1)
    const m = JSON.parse(readFileSync(join(out, "versions.json"), "utf8"))
    expect(m.items.button).toMatchObject({ version: "1.0.0", tier: "free", files: ["@components/ballmac/button.tsx"], requires: [], tests: true })
    expect(m.items.button.changelog).toHaveLength(1)
  })
})

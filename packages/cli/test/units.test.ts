import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { hasGit, merge3, unifiedDiff } from "../src/merge.js"
import { aliasToDir, findRoot, loadProject, resolveTarget } from "../src/project.js"
import { parsePreview, shadcnCommand } from "../src/shadcn.js"
import { rewriteImports } from "../src/tests.js"
import { compareVersions, parseJsonc, suggest } from "../src/util.js"
import { planFile } from "../src/update.js"
import { makeProject } from "./helpers.js"

const labels = { ours: "yours", base: "ballmac 1.0.0", theirs: "ballmac 1.1.0" }

describe("util", () => {
  it("reads JSON with comments and trailing commas but keeps strings intact", () => {
    expect(parseJsonc('{ // c\n "a": "x // not a comment", /* b */ "b": [1, 2,], }')).toEqual({ a: "x // not a comment", b: [1, 2] })
  })
  it("compares versions numerically", () => {
    expect(compareVersions("1.10.0", "1.9.0")).toBeGreaterThan(0)
    expect(compareVersions("1.0.0", "1.0.0")).toBe(0)
    expect(compareVersions("0.9.9", "1.0.0")).toBeLessThan(0)
  })
  it("suggests close names", () => {
    expect(suggest("buton", ["button", "badge", "dialog"])).toEqual(["button"])
    expect(suggest("zzzzzz", ["button"])).toEqual([])
  })
})

describe("project aliases", () => {
  it("maps @/ through tsconfig paths", () => {
    const ts = { compilerOptions: { paths: { "@/*": ["./src/*"] } } }
    expect(aliasToDir("/x", "@/components", ts)).toBe("src/components")
    expect(aliasToDir("/x", "@/lib/ballmac", ts)).toBe("src/lib/ballmac")
  })
  it("uses the project root when there is no mapping", () => {
    expect(aliasToDir("/x", "@/components", {})).toBe("components")
  })
  it("honours baseUrl and an exact alias", () => {
    expect(aliasToDir("/x", "~/ui", { compilerOptions: { baseUrl: "app", paths: { "~/*": ["./*"] } } })).toBe("app/ui")
  })
  it("resolves registry targets to project paths", () => {
    const project = loadProject(makeProject())
    expect(resolveTarget(project, "@components/ballmac/button.tsx")).toBe("src/components/ballmac/button.tsx")
    expect(resolveTarget(project, "@lib/ballmac/i18n.tsx")).toBe("src/lib/ballmac/i18n.tsx")
    expect(resolveTarget(project, "~/vitest.config.mts")).toBe("vitest.config.mts")
  })
  it("puts template pages in src/app when there is a src folder", () => {
    const root = makeProject()
    mkdirSync(join(root, "src"))
    expect(resolveTarget(loadProject(root), "app/launch/page.tsx")).toBe("src/app/launch/page.tsx")
  })
  it("uses the project's own alias prefix", () => {
    expect(loadProject(makeProject({ prefix: "~" })).importPrefix).toBe("~")
  })
  it("finds the project root from a subfolder and fails clearly outside one", () => {
    const root = makeProject()
    mkdirSync(join(root, "src/deep"), { recursive: true })
    expect(findRoot(join(root, "src/deep"))).toBe(root)
    expect(() => findRoot(mkdtempSync(join(tmpdir(), "no-project-")))).toThrow(/components\.json/)
  })
  it("detects the package manager from the lockfile", () => {
    const root = makeProject()
    writeFileSync(join(root, "pnpm-lock.yaml"), "")
    expect(loadProject(root).packageManager).toBe("pnpm")
  })
})

describe("shadcn preview parsing", () => {
  const box = (path: string, status: string, body: string[]) => [`├ ${path} (${status}) ${body.length} lines`, "│ ┌──────", ...body.map((l) => (l ? `│ │ ${l}` : "│ │")), "│ └──────", ""].join("\n")

  it("reads every file with its status and exact content", () => {
    const out = ["┌ shadcn add x (dry run)", "│", box("src/a.tsx", "create", ["const a = 1", "", "export { a }", ""]), box("src/b.ts", "skip", ["x"]), "└ Run without --dry-run to apply."].join("\n")
    const files = parsePreview(out)
    expect(files.get("src/a.tsx")).toEqual({ status: "create", content: "const a = 1\n\nexport { a }\n" })
    expect(files.get("src/b.ts")).toEqual({ status: "skip", content: "x" })
  })
  it("keeps indentation and trailing spaces", () => {
    expect(parsePreview(box("a.ts", "create", ["  indented  ", "\tTab"])).get("a.ts")!.content).toBe("  indented  \n\tTab")
  })
  it("ignores colour codes", () => {
    expect(parsePreview("\u001b[2m" + box("a.ts", "create", ["x"]) + "\u001b[0m").get("a.ts")!.content).toBe("x")
  })
  it("refuses output whose line count does not match, instead of guessing", () => {
    const bad = box("a.ts", "create", ["one", "two"]).replace("2 lines", "5 lines")
    expect(() => parsePreview(bad)).toThrow(/expected 5 lines, read 2/)
  })
  it("returns nothing for output with no files", () => {
    expect(parsePreview("- Resolving items.\n").size).toBe(0)
  })
  it("runs shadcn through the package manager unless told otherwise", () => {
    const project = loadProject(makeProject())
    expect(shadcnCommand(project)).toEqual(["npx", "-y", "shadcn@latest"])
    process.env.BALLMAC_SHADCN = "pnpm dlx shadcn@4.21.0"
    expect(shadcnCommand(project)).toEqual(["pnpm", "dlx", "shadcn@4.21.0"])
    delete process.env.BALLMAC_SHADCN
  })
})

describe("test imports", () => {
  it("leaves the default @ prefix alone and rewrites other prefixes", () => {
    const code = `import { Button } from "@/components/ballmac/button"\nvi.mock("@/lib/ballmac/color", () => ({}))\nimport x from "motion/react"\n`
    expect(rewriteImports(code, "@")).toBe(code)
    expect(rewriteImports(code, "~")).toBe(`import { Button } from "~/components/ballmac/button"\nvi.mock("~/lib/ballmac/color", () => ({}))\nimport x from "motion/react"\n`)
  })
})

describe.skipIf(!hasGit())("merge", () => {
  const base = "a\nb\nc\nd\ne\n"
  it("merges edits in different places", () => {
    const r = merge3("a\nB-mine\nc\nd\ne\n", base, "a\nb\nc\nd\nE-theirs\n", labels)
    expect(r).toEqual({ merged: "a\nB-mine\nc\nd\nE-theirs\n", conflicts: 0 })
  })
  it("marks overlapping edits as conflicts with readable labels", () => {
    const r = merge3("a\nmine\nc\nd\ne\n", base, "a\ntheirs\nc\nd\ne\n", labels)
    expect(r.conflicts).toBe(1)
    expect(r.merged).toContain("<<<<<<< yours\nmine\n=======\ntheirs\n>>>>>>> ballmac 1.1.0")
  })
  it("diffs with our own labels and says nothing for equal text", () => {
    expect(unifiedDiff("a\nb\n", "a\nc\n", "base", "yours")).toContain("--- base\n+++ yours")
    expect(unifiedDiff("same\n", "same\n", "base", "yours")).toBe("")
  })
})

describe.skipIf(!hasGit())("planFile", () => {
  const base = "line1\nline2\nline3\nline4\n"
  const theirs = "line1\nline2\nline3\nLINE4\n"
  it("leaves a file you deleted alone", () => expect(planFile(null, base, theirs, labels).action).toBe("deleted"))
  it("does nothing when you already have the new content", () => expect(planFile(theirs, base, theirs, labels).action).toBe("same"))
  it("keeps your file when upstream did not change it", () => expect(planFile("mine\n", base, base, labels).action).toBe("keep"))
  it("replaces a file you never touched", () => expect(planFile(base, base, theirs, labels)).toEqual({ action: "replace", content: theirs }))
  it("merges when you edited elsewhere", () => {
    const p = planFile("MINE1\nline2\nline3\nline4\n", base, theirs, labels)
    expect(p).toEqual({ action: "merge", content: "MINE1\nline2\nline3\nLINE4\n" })
  })
  it("reports conflicts", () => {
    const p = planFile("line1\nline2\nline3\nmine4\n", base, theirs, labels)
    expect(p.action).toBe("conflict")
    expect(p.conflicts).toBe(1)
  })
  it("never merges without a base: the new version goes beside your file", () => {
    expect(planFile("mine\n", null, theirs, labels)).toEqual({ action: "side-file", content: theirs })
  })
  it("falls back to a side file when git is unavailable", () => {
    expect(planFile("mine\n", base, theirs, labels, false).action).toBe("side-file")
  })
})

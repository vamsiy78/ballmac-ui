import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { homedir, tmpdir } from "node:os"
import { dirname, join } from "node:path"

import { describe, expect, it } from "vitest"

import { Catalog } from "../src/catalog.js"
import { auditProject, projectRoot, qualityRules } from "../src/quality.js"

const versions = {
  schema: 1,
  items: {
    "dashboard-pro-1": { title: "Dashboard", type: "registry:block", version: "1.0.0", updated: "2026-10-01", tier: "free", files: [], requires: [], tests: false, changelog: [], exports: ["DashboardPro1"], states: ["loading", "empty", "error"] },
    button: { title: "Button", type: "registry:ui", version: "1.0.0", updated: "2026-10-01", tier: "free", files: [], requires: [], tests: false, changelog: [], exports: ["Button"] },
  },
}
const fakeFetch = (async (url: string) => (String(url).endsWith("/r/versions.json") ? new Response(JSON.stringify(versions), { headers: { "content-type": "application/json" } }) : new Response("", { status: 404 }))) as unknown as typeof fetch
const catalog = () => new Catalog("http://registry.test", fakeFetch)

function project(files: Record<string, string>, withPackageJson = true) {
  const root = mkdtempSync(join(tmpdir(), "ballmac-mcp-"))
  if (withPackageJson) writeFileSync(join(root, "package.json"), JSON.stringify({ name: "app" }))
  for (const [path, content] of Object.entries(files)) {
    const abs = join(root, path)
    mkdirSync(dirname(abs), { recursive: true })
    writeFileSync(abs, content)
  }
  return root
}
const jsx = (body: string, head = "") => `${head}\nexport const Page = () => (\n  <>\n${body}\n  </>\n)\n`

describe("get_quality_rules", () => {
  it("lists every rule with a reason, a fix and a link, and tells the agent how to use them", () => {
    const q = qualityRules()
    expect(q.rules.length).toBeGreaterThan(10)
    for (const r of q.rules) {
      expect(r.why.length).toBeGreaterThan(20)
      expect(r.fix.length).toBeGreaterThan(10)
      expect(r.docs).toMatch(/^https:\/\/ui\.ballmac\.com\/docs\/check#/)
    }
    expect(q.rules.find((r) => r.id === "states/ballmac-state-prop")?.example?.good).toContain("state=")
    expect(q.howToUse.join(" ")).toMatch(/audit_project/)
  })
})

describe("projectRoot", () => {
  it("finds the project from a folder inside it", () => {
    const root = project({ "src/a/b.tsx": "" })
    expect(projectRoot(join(root, "src/a"))).toBe(root)
  })
  it("refuses what is not clearly a project", () => {
    expect(() => projectRoot(project({}, false))).toThrow(/no package.json/)
    expect(() => projectRoot("/")).toThrow(/home folder or the filesystem root/)
    expect(() => projectRoot(homedir())).toThrow(/home folder or the filesystem root/)
    expect(() => projectRoot("/definitely/not/here")).toThrow(/not a folder/)
  })
})

describe("audit_project", () => {
  it("reports findings worst first, with the line and the fix", async () => {
    const root = project({ "src/page.tsx": jsx(`<input placeholder="Email" />\n<img src="/a.png" />`) })
    const r = await auditProject({ path: root }, catalog())
    expect(r.verdict).toMatch(/1 error to fix, plus 1 warning/)
    expect(r.findings[0]).toMatchObject({ rule: "a11y/img-alt", severity: "error", file: "src/page.tsx" })
    expect(r.findings[0]!.fix).toMatch(/alt/)
    expect(r.findings[1]).toMatchObject({ rule: "a11y/input-label", severity: "warn" })
    expect(r.summary).toMatchObject({ errors: 1, warnings: 1 })
    expect(r.next[0]).toMatch(/again until it is clean/)
  })

  it("says clearly when the code is clean", async () => {
    const root = project({ "src/page.tsx": jsx(`<img src="/a.png" alt="A chart" />`) })
    const r = await auditProject({ path: root }, catalog())
    expect(r.verdict).toBe("Clean: no findings.")
    expect(r.findings).toEqual([])
  })

  it("uses the catalogue to find a component used without its state prop", async () => {
    const head = `import { DashboardPro1 } from "@/components/ballmac/blocks/dashboard-pro-1/dashboard-pro-1"`
    const root = project({ "src/page.tsx": jsx(`<DashboardPro1 />`, head) })
    const r = await auditProject({ path: root }, catalog())
    expect(r.findings.some((f) => f.rule === "states/ballmac-state-prop" && /loading, empty, error/.test(f.message))).toBe(true)
  })

  it("carries on, and says so, when the catalogue is unreachable", async () => {
    const down = new Catalog("http://registry.test", (async () => { throw new Error("offline") }) as unknown as typeof fetch)
    const root = project({ "src/page.tsx": jsx(`<img src="/a.png" />`) })
    const r = await auditProject({ path: root }, down)
    expect(r.summary.errors).toBe(1)
    expect(r.notes.join(" ")).toMatch(/catalogue/)
  })

  it("limits the list, hides notes by default and can show them", async () => {
    const many = Array.from({ length: 30 }, (_, i) => `<img src="/${i}.png" />`).join("\n")
    const root = project({ "src/page.tsx": jsx(many + `\n<main className="h-screen" />`) })
    const limited = await auditProject({ path: root, limit: 5 }, catalog())
    expect(limited.findings).toHaveLength(5)
    expect(limited.truncated).toBe(true)
    expect(limited.totalShown).toBe(30)
    expect(limited.summary.notes).toBe(1)
    const all = await auditProject({ path: root, minSeverity: "info", limit: 200 }, catalog())
    expect(all.findings.some((f) => f.severity === "info")).toBe(true)
  })

  it("audits only the paths asked for", async () => {
    const bad = jsx(`<img src="/a.png" />`)
    const root = project({ "src/a.tsx": bad, "src/b.tsx": bad })
    const r = await auditProject({ path: root, paths: ["src/b.tsx"] }, catalog())
    expect(r.findings.map((f) => f.file)).toEqual(["src/b.tsx"])
  })

  it("never writes: the project is unchanged", async () => {
    const root = project({ "src/page.tsx": jsx(`<img src="/a.png" />`) })
    const { readdirSync } = await import("node:fs")
    const before = readdirSync(root, { recursive: true }).sort().join(",")
    await auditProject({ path: root }, catalog())
    expect(readdirSync(root, { recursive: true }).sort().join(",")).toBe(before)
  })
})

import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { createServer, type Server } from "node:http"
import { tmpdir } from "node:os"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"

import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { auditRoot, checkCommand, formatRules, type CheckOptions } from "../src/check.js"
import { Registry } from "../src/registry.js"
import { loadRuntimeDeps, runtimeCheck } from "../src/runtime.js"

function project(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), "ballmac-check-"))
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "app" }))
  for (const [path, content] of Object.entries(files)) {
    const abs = join(root, path)
    mkdirSync(dirname(abs), { recursive: true })
    writeFileSync(abs, content)
  }
  return root
}
const page = (body: string, head = "") => `${head}\nexport const Page = () => (\n  <>\n${body}\n  </>\n)\n`

/** Runs the command and returns what it printed. */
async function check(root: string, over: Partial<CheckOptions> = {}) {
  const lines: string[] = []
  const result = await checkCommand({ cwd: root, paths: [], format: "pretty", failOn: "error", all: false, rules: false, includeLibrary: false, offline: true, routes: [], out: (l) => lines.push(l), ...over })
  return { ...result, text: lines.join("\n") }
}

describe("ballmac check", () => {
  it("works in a project that has no components.json", async () => {
    const root = project({ "src/page.tsx": page(`<img src="/a.png" />`) })
    const r = await check(root)
    expect(r.report.counts.error).toBe(1)
    expect(r.failed).toBe(true)
    expect(r.text).toContain("a11y/img-alt")
    expect(r.text).toContain("fix:")
  })

  it("finds the project folder from a sub-folder, and takes paths relative to where it runs", async () => {
    const root = project({ "src/a/page.tsx": page(`<img src="/a.png" />`), "src/b/page.tsx": page(`<img src="/b.png" />`) })
    expect(auditRoot(join(root, "src/a"))).toBe(root)
    const r = await check(join(root, "src/a"), { paths: ["."] })
    expect(r.report.findings.map((f) => f.file)).toEqual(["src/a/page.tsx"])
  })

  it("exits with success when there are only warnings, unless asked to fail on them", async () => {
    const root = project({ "src/page.tsx": page(`<input placeholder="Email" />`) })
    expect((await check(root)).failed).toBe(false)
    expect((await check(root, { failOn: "warn" })).failed).toBe(true)
    const bad = project({ "src/page.tsx": page(`<img src="/a.png" />`) })
    expect((await check(bad, { failOn: "never" })).failed).toBe(false)
  })

  it("prints JSON and GitHub annotations", async () => {
    const root = project({ "src/page.tsx": page(`<img src="/a.png" />`) })
    const j = JSON.parse((await check(root, { format: "json" })).text)
    expect(j.findings[0]).toMatchObject({ rule: "a11y/img-alt", file: "src/page.tsx" })
    expect(j.counts.error).toBe(1)
    expect((await check(root, { format: "github" })).text).toMatch(/^::error file=src\/page\.tsx,line=\d+,col=\d+,title=a11y\/img-alt::/)
  })

  it("lists the rules", async () => {
    const root = project({})
    const text = (await check(root, { rules: true })).text
    expect(text).toContain("states/ballmac-state-prop")
    expect(text).toContain("a11y/control-name")
    expect(JSON.parse(formatRules(true)).length).toBeGreaterThan(10)
  })

  it("uses the registry's catalogue to find a component used without its state prop", async () => {
    const manifest = { schema: 1, registry: "http://r.test", items: { "dashboard-pro-1": { title: "D", type: "registry:block", version: "1.0.0", updated: "2026-10-01", tier: "free", files: [], requires: [], tests: false, changelog: [], exports: ["DashboardPro1"], states: ["loading", "empty", "error"] } } }
    const registry = new Registry("http://r.test", undefined, (async () => new Response(JSON.stringify(manifest), { headers: { "content-type": "application/json" } })) as typeof fetch)
    const head = `import { DashboardPro1 } from "@/components/ballmac/blocks/dashboard-pro-1/dashboard-pro-1"`
    const root = project({ "src/page.tsx": page(`<DashboardPro1 />`, head) })
    const online = await check(root, { offline: false, registry })
    expect(online.report.byRule["states/ballmac-state-prop"]).toBe(1)
    expect(online.text).toContain("loading, empty, error")
    const offline = await check(root, { offline: true })
    expect(offline.report.byRule["states/ballmac-state-prop"]).toBeUndefined()
    expect(offline.text).toMatch(/catalogue/)
  })

  it("carries on without the catalogue when the registry cannot be reached", async () => {
    const registry = new Registry("http://r.test", undefined, (async () => { throw new Error("offline") }) as typeof fetch)
    const root = project({ "src/page.tsx": page(`<img src="/a.png" />`) })
    const r = await check(root, { offline: false, registry })
    expect(r.report.counts.error).toBe(1)
  })
})

describe("ballmac check --url (a real browser)", () => {
  let server: Server
  let base = ""
  let deps: ReturnType<typeof loadRuntimeDeps> | undefined
  let canLaunch = false

  beforeAll(async () => {
    server = createServer((req, res) => {
      res.setHeader("content-type", "text/html")
      if (req.url === "/bad")
        res.end(`<!doctype html><html lang="en"><title>Bad</title><body><img src="data:image/gif;base64,R0lGODlhAQABAAAAACw="><div style="width:1400px;height:20px;background:#ccc">wide</div><script>console.error("boom")</script></body></html>`)
      else res.end(`<!doctype html><html lang="en"><head><title>Good</title><meta name="viewport" content="width=device-width"></head><body><main><h1>Hello</h1><img alt="A pixel" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="><p style="max-width:100%">Fine</p></main></body></html>`)
    })
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
    base = `http://127.0.0.1:${(server.address() as { port: number }).port}`
    try {
      deps = loadRuntimeDeps(process.cwd())
      const b = await deps.playwright.chromium.launch({ headless: true })
      await b.close()
      canLaunch = true
    } catch {
      canLaunch = false
    }
  }, 60_000)
  afterAll(() => void server?.close())

  it("passes a clean page", async (ctx) => {
    if (!canLaunch) return ctx.skip()
    const r = await runtimeCheck({ root: process.cwd(), url: base, routes: ["/"], deps })
    expect(r.findings).toEqual([])
    expect(r.pages).toBe(4)
  }, 90_000)

  it("finds a missing alt, sideways scrolling and a console error", async (ctx) => {
    if (!canLaunch) return ctx.skip()
    const r = await runtimeCheck({ root: process.cwd(), url: base, routes: ["/bad"], deps, widths: [390] })
    const rules = new Set(r.findings.map((f) => f.rule))
    expect(rules.has("runtime/axe")).toBe(true)
    expect(rules.has("runtime/overflow")).toBe(true)
    expect(rules.has("runtime/console-error")).toBe(true)
    expect(r.findings.some((f) => f.rule === "runtime/axe" && /image-alt/.test(f.message))).toBe(true)
  }, 90_000)

  it("fails the command when the browser finds a problem", async (ctx) => {
    if (!canLaunch) return ctx.skip()
    const root = project({ "src/ok.tsx": page(`<p>fine</p>`) })
    const r = await check(root, { url: base, routes: ["/bad"], runtime: (o) => runtimeCheck({ ...o, deps, widths: [390] }) })
    expect(r.failed).toBe(true)
    expect(r.text).toContain("browser check")
  }, 90_000)

  it("explains what to install when the tools are missing", () => {
    const empty = mkdtempSync(join(tmpdir(), "nodeps-"))
    // pnpm's shims set NODE_PATH, which Node treats as a global fallback; clear it so only the project's own folders are searched.
    const saved = process.env.NODE_PATH
    process.env.NODE_PATH = ""
    const Module = createRequire(import.meta.url)("node:module") as { _initPaths?: () => void }
    Module._initPaths?.()
    try {
      expect(() => loadRuntimeDeps(empty, [join(empty, "package.json")])).toThrow(/needs playwright and axe-core.*npm i -D playwright axe-core/s)
    } finally {
      if (saved === undefined) delete process.env.NODE_PATH
      else process.env.NODE_PATH = saved
      Module._initPaths?.()
    }
  })
})

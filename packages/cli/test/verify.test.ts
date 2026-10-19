import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import { badgeSvg, formatScorecard, gradeOf, importsOf, loadRegistry, packageOf, verifyRegistry, type RegistryItem } from "../src/verify.js"
import { verifyCommand } from "../src/verify-command.js"

const good: RegistryItem = {
  name: "greeting",
  type: "registry:ui",
  title: "Greeting",
  description: "A friendly greeting that follows the theme.",
  author: "Acme <https://acme.test>",
  dependencies: ["lucide-react"],
  registryDependencies: ["button"],
  files: [
    {
      path: "registry/greeting.tsx",
      type: "registry:ui",
      content: `import { Hand } from "lucide-react"\nimport { Button } from "@/components/ui/button"\nexport function Greeting() { return <Button className="ms-2 bg-primary text-primary-foreground"><Hand aria-hidden="true" />Hi</Button> }\n`,
    },
  ],
}
const bad: RegistryItem = {
  name: "Bad Item",
  type: "registry:ui",
  description: "short",
  files: [
    {
      path: "registry/bad.tsx",
      type: "registry:ui",
      content: `import confetti from "canvas-confetti"\nimport { Button } from "@/components/ui/button"\nexport const Bad = () => <div onClick={() => confetti()} className="ml-2 bg-[#ff0000]"><img src="/a.png" /><Button /></div>\n`,
    },
  ],
}
const example: RegistryItem = { name: "greeting-demo", type: "registry:example", files: [{ path: "registry/greeting-demo.tsx", content: "export default function D() { return null }" }] }

function folder(items: RegistryItem[], inline = false) {
  const dir = mkdtempSync(join(tmpdir(), "ballmac-verify-test-"))
  writeFileSync(join(dir, "registry.json"), JSON.stringify({ name: "acme", homepage: "https://acme.test", items: inline ? items : items.map(({ files: _f, ...rest }) => rest) }))
  if (!inline) for (const item of items) writeFileSync(join(dir, `${item.name}.json`), JSON.stringify(item))
  return dir
}

describe("helpers", () => {
  it("finds the package an import names", () => {
    expect(packageOf("lucide-react")).toBe("lucide-react")
    expect(packageOf("@radix-ui/react-slot/dist")).toBe("@radix-ui/react-slot")
    expect(packageOf("@/lib/utils")).toBeUndefined()
    expect(packageOf("./x")).toBeUndefined()
    expect(packageOf("node:fs")).toBeUndefined()
  })
  it("reads runtime imports and skips type-only ones", () => {
    const code = `import a from "a"\nimport type { T } from "t"\nimport { b } from 'b'\nexport * from "c"\nconst x = import("d")\nimport "e"\n`
    expect(importsOf(code)).toEqual(["a", "b", "c", "d", "e"])
  })
  it("grades", () => {
    expect([95, 85, 75, 65, 10].map(gradeOf)).toEqual(["A", "B", "C", "D", "F"])
  })
})

describe("verifyRegistry", () => {
  it("scores a clean item at 100 and a flawed one far lower, naming what is wrong", async () => {
    const card = await verifyRegistry(await loadRegistry(folder([good, bad, example])), { cwd: process.cwd() })
    expect(card.items).toEqual({ total: 3, scored: 2 })
    const weakest = card.weakest.find((r) => r.name === "Bad Item")!
    expect(weakest.score).toBeLessThan(50)
    expect(card.weakest.some((r) => r.name === "greeting")).toBe(false)
    const text = weakest.problems.join("\n")
    expect(text).toContain("canvas-confetti")
    expect(text).toContain("registryDependencies")
    expect(text).toContain("a11y/img-alt")
    expect(text).toContain("kebab-case")
    expect(card.checks.find((k) => k.id === "docs")).toMatchObject({ pass: 1, fail: 1 })
    expect(card.checks.find((k) => k.id === "a11y")).toMatchObject({ pass: 1, fail: 1 })
    expect(card.score).toBeGreaterThan(30)
    expect(card.score).toBeLessThan(80)
  })

  it("reads items that are inline in the catalog", async () => {
    const card = await verifyRegistry(await loadRegistry(folder([good, example], true)), { cwd: process.cwd() })
    expect(card.score).toBe(100)
    expect(card.grade).toBe("A")
  })

  it("leaves a check out when it does not apply, instead of counting a pass", async () => {
    const lib: RegistryItem = { name: "math", type: "registry:lib", title: "Math", description: "Small helpers for arithmetic.", author: "Acme", files: [{ path: "lib/math.ts", content: "export const add = (a: number, b: number) => a + b" }] }
    const card = await verifyRegistry(await loadRegistry(folder([lib], true)), { cwd: process.cwd() })
    for (const id of ["a11y", "tokens", "states", "docs"]) expect(card.checks.find((k) => k.id === id)).toMatchObject({ pass: 0, fail: 0, na: 1 })
    expect(card.score).toBe(100)
  })

  it("fetches an item by URL when the catalog lists none of its files", async () => {
    const seen: string[] = []
    const fetchImpl = (async (url: string) => {
      seen.push(url)
      if (url.endsWith("/r/registry.json")) return Response.json({ name: "acme", items: [{ name: good.name, type: good.type, title: good.title, description: good.description }, example] })
      if (url === "https://acme.test/r/greeting.json") return Response.json(good)
      return new Response("nope", { status: 404 })
    }) as typeof fetch
    const card = await verifyRegistry(await loadRegistry("https://acme.test", { fetchImpl }), { cwd: process.cwd() })
    expect(seen).toContain("https://acme.test/r/greeting.json")
    expect(card.score).toBe(100)
  })

  it("counts an item that cannot be fetched as invalid", async () => {
    const fetchImpl = (async (url: string) => (url.endsWith("registry.json") ? Response.json({ items: [{ name: "ghost", type: "registry:ui", title: "Ghost", description: "Not there at all." }] }) : new Response("", { status: 404 }))) as typeof fetch
    const card = await verifyRegistry(await loadRegistry("https://acme.test/r/registry.json", { fetchImpl }), { cwd: process.cwd() })
    expect(card.checks.find((k) => k.id === "schema")).toMatchObject({ fail: 1 })
  })

  it("rejects something that is not a registry", async () => {
    const dir = mkdtempSync(join(tmpdir(), "ballmac-verify-test-"))
    writeFileSync(join(dir, "registry.json"), JSON.stringify({ hello: 1 }))
    await expect(loadRegistry(dir)).rejects.toThrow(/no "items"/)
    await expect(loadRegistry(join(dir, "missing"))).rejects.toThrow(/does not exist/)
  })
})

describe("output", () => {
  it("makes a badge that says the score in words, and a text report", async () => {
    const card = await verifyRegistry(await loadRegistry(folder([good, example], true)), { cwd: process.cwd() })
    const svg = badgeSvg(card)
    expect(svg).toContain('aria-label="Ballmac Verified: 100 out of 100, grade A"')
    expect(svg).toContain("100 · A")
    const text = formatScorecard(card, { green: (s) => s, yellow: (s) => s, red: (s) => s, dim: (s) => s, bold: (s) => s })
    expect(text).toContain("acme  100/100  grade A")
    expect(text).toContain("Static checks on the source")
  })
})

describe("ballmac verify", () => {
  it("writes the scorecard and badge, and fails under --min-score", async () => {
    const dir = folder([good, bad, example])
    const lines: string[] = []
    const run = (minScore?: number) => verifyCommand({ cwd: process.cwd(), target: dir, format: "json", minScore, out: join(dir, "out", "card.json"), badge: join(dir, "out", "badge.svg"), print: (l) => lines.push(l) })
    const ok = await run(10)
    expect(ok.failed).toBe(false)
    expect(JSON.parse(readFileSync(join(dir, "out", "card.json"), "utf8")).registry.name).toBe("acme")
    expect(readFileSync(join(dir, "out", "badge.svg"), "utf8")).toContain("<svg")
    expect((await run(99)).failed).toBe(true)
    expect(JSON.parse(lines[0]!).schema).toBe(1)
  })
  it("asks for a registry", async () => {
    await expect(verifyCommand({ cwd: process.cwd(), target: undefined, format: "pretty", print: () => {} })).rejects.toThrow(/Name a registry/)
  })
})

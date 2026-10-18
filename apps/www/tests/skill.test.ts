import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"

import { describe, expect, it } from "vitest"

const skill = join(__dirname, "../../../skills/ballmac-ui")
const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]))

describe("the agent skill", () => {
  const text = readFileSync(join(skill, "SKILL.md"), "utf8")
  const front = text.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? ""

  it("has the frontmatter the skills CLI needs", () => {
    expect(front).toMatch(/^name: ballmac-ui$/m)
    const description = front.match(/^description: (.+)$/m)?.[1] ?? ""
    expect(description.length).toBeGreaterThan(80)
    expect(description.length).toBeLessThan(1024)
  })

  it("links only to files that exist", () => {
    for (const file of walk(skill).filter((f) => f.endsWith(".md"))) {
      const body = readFileSync(file, "utf8")
      for (const m of body.matchAll(/\]\((?!https?:|#|mailto:)([^)\s#]+)(?:#[^)]*)?\)/g)) {
        expect(existsSync(resolve(dirname(file), m[1]!)), `${file.slice(skill.length)} links to ${m[1]}`).toBe(true)
      }
    }
  })

  it("keeps SKILL.md short enough to load in full", () => {
    expect(text.split("\n").length).toBeLessThan(140)
  })

  it("says which command to run to verify, and it is a real one", () => {
    expect(text).toContain("npx @ballmac/cli check")
    const cli = readFileSync(join(__dirname, "../../../packages/cli/src/index.ts"), "utf8")
    expect(cli).toContain("check")
  })
})

describe("context.mjs", () => {
  const script = join(skill, "scripts/context.mjs")
  const run = (dir: string) => JSON.parse(execFileSync("node", [script, dir], { encoding: "utf8" })) as Record<string, any>

  it("reads the style, base library, stack and installed items of a project", () => {
    const dir = mkdtempSync(join(tmpdir(), "skill-"))
    mkdirSync(join(dir, "components/ballmac/blocks/hero-1"), { recursive: true })
    writeFileSync(join(dir, "components/ballmac/button.tsx"), "export {}")
    writeFileSync(join(dir, "components/ballmac/blocks/hero-1/hero-1.tsx"), "export {}")
    writeFileSync(join(dir, "package.json"), JSON.stringify({ dependencies: { next: "16.4.0", react: "19.2.0", tailwindcss: "^4.1.0", recharts: "^3" } }))
    writeFileSync(join(dir, "components.json"), JSON.stringify({ style: "base-nova", tailwind: { css: "app/globals.css" }, aliases: { components: "@/components" }, registries: { "@ballmac": "https://ui.ballmac.com/r/{name}.json" } }))
    writeFileSync(join(dir, "next.config.ts"), "export default { cacheComponents: true }")
    const out = run(dir)
    expect(out.shadcn.base).toBe("base-ui")
    expect(out.stack.cacheComponents).toBe(true)
    expect(out.stack.charts).toBe(true)
    expect(out.ballmac.installed).toEqual(["button", "hero-1"])
    expect(out.notes.join(" ")).not.toContain("@ballmac is not in components.json")
    expect(out.notes.join(" ")).toContain("Cache Components")
  })

  it("tells you to run shadcn init when there is no components.json, and does not crash outside a project", () => {
    const dir = mkdtempSync(join(tmpdir(), "skill-"))
    writeFileSync(join(dir, "package.json"), "{}")
    expect(run(dir).next_steps.join(" ")).toContain("shadcn@latest init")
  })

  it("reports Radix for a Radix style", () => {
    const dir = mkdtempSync(join(tmpdir(), "skill-"))
    writeFileSync(join(dir, "package.json"), "{}")
    writeFileSync(join(dir, "components.json"), JSON.stringify({ style: "radix-nova", tailwind: { css: "a.css" }, aliases: {} }))
    expect(run(dir).shadcn.base).toBe("radix")
  })
})

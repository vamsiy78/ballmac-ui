import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"

import type { Ctx } from "../src/ctx.js"
import { loadProject, resolveTarget } from "../src/project.js"
import { Registry, type ChangelogEntry, type ManifestItem } from "../src/registry.js"
import type { Preview, Shadcn } from "../src/shadcn.js"

export type FakeVersion = {
  version: string
  /** target such as "@components/ballmac/button.tsx" -> file content */
  files: Record<string, string>
  requires?: string[]
  changelog?: ChangelogEntry[]
  test?: string
}

export const BASE = "http://registry.test"

/** A registry that can be edited between calls, standing in for ui.ballmac.com. */
export class FakeWorld {
  items: Record<string, FakeVersion> = {}

  set(name: string, v: FakeVersion) {
    this.items[name] = v
  }

  manifest() {
    return {
      schema: 1,
      registry: BASE,
      items: Object.fromEntries(
        Object.entries(this.items).map(([name, v]) => [
          name,
          { title: name, type: "registry:ui", version: v.version, updated: "2026-10-11", tier: "free", files: Object.keys(v.files), requires: v.requires ?? [], tests: v.test !== undefined, changelog: v.changelog ?? [] } satisfies ManifestItem,
        ])
      ),
    }
  }

  fetch: typeof fetch = async (input) => {
    const url = String(input)
    const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } })
    if (url === `${BASE}/r/versions.json`) return json(this.manifest())
    const t = /\/r\/tests\/([a-z0-9_-]+)\.json$/.exec(url)
    if (t?.[1] === "_setup") return json({ schema: 1, file: "setup.ts", content: "// setup\n", devDependencies: ["vitest@^4"] })
    if (t?.[1] && this.items[t[1]]?.test !== undefined) {
      const v = this.items[t[1]]!
      return json({ schema: 1, name: t[1], version: v.version, file: `${t[1]}.test.tsx`, content: v.test, requires: [], devDependencies: ["vitest@^4"] })
    }
    return json({ error: "not_found" }, 404)
  }

  registry() {
    return new Registry(BASE, undefined, this.fetch)
  }
}

/** Writes what the real shadcn CLI would, without transforms, and previews the same way. */
export class FakeShadcn implements Shadcn {
  adds: { addresses: string[]; overwrite: boolean }[] = []
  previews = 0
  constructor(private world: FakeWorld, private root: string) {}

  private names(addresses: string[]) {
    const out: string[] = []
    const visit = (n: string) => {
      if (out.includes(n) || !this.world.items[n]) return
      out.push(n)
      for (const d of this.world.items[n]!.requires ?? []) visit(d)
    }
    for (const a of addresses) visit(/\/r\/([a-z0-9-]+)\.json$/.exec(a)![1]!)
    return out
  }

  private files(addresses: string[]) {
    const project = loadProject(this.root)
    return this.names(addresses).flatMap((n) => Object.entries(this.world.items[n]!.files).map(([target, content]) => [resolveTarget(project, target), content] as const))
  }

  async add(addresses: string[], opts: { overwrite?: boolean } = {}) {
    this.adds.push({ addresses, overwrite: Boolean(opts.overwrite) })
    for (const [path, content] of this.files(addresses)) {
      const abs = join(this.root, path)
      if (existsSync(abs) && !opts.overwrite) continue
      mkdirSync(dirname(abs), { recursive: true })
      writeFileSync(abs, content)
    }
  }

  async preview(address: string | string[]): Promise<Preview> {
    this.previews++
    const out: Preview = new Map()
    for (const [path, content] of this.files(Array.isArray(address) ? address : [address])) {
      const abs = join(this.root, path)
      out.set(path, { status: !existsSync(abs) ? "create" : readFileSync(abs, "utf8") === content ? "skip" : "overwrite", content })
    }
    return out
  }
}

/** A project folder like `create-next-app` + `shadcn init` leave behind. */
export function makeProject(opts: { prefix?: string } = {}) {
  const root = mkdtempSync(join(tmpdir(), "ballmac-cli-"))
  const prefix = opts.prefix ?? "@"
  writeFileSync(join(root, "components.json"), JSON.stringify({ aliases: { components: `${prefix}/components`, utils: `${prefix}/lib/utils`, ui: `${prefix}/components/ui`, lib: `${prefix}/lib`, hooks: `${prefix}/hooks` } }))
  writeFileSync(join(root, "tsconfig.json"), `{ // comments are allowed\n "compilerOptions": { "paths": { "${prefix}/*": ["./src/*"], }, }, }`)
  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({ devDependencies: { vitest: "^4", jsdom: "^27", "@vitejs/plugin-react": "^5", "@testing-library/react": "^16", "@testing-library/dom": "^10", "@testing-library/user-event": "^14", "@testing-library/jest-dom": "^6" } })
  )
  writeFileSync(join(root, "vitest.config.ts"), "export default {}\n")
  return root
}

export function makeCtx(root: string, world: FakeWorld, extra: Partial<Ctx> = {}) {
  const lines: string[] = []
  const warnings: string[] = []
  const shadcn = new FakeShadcn(world, root)
  const ctx: Ctx = { project: loadProject(root), registry: world.registry(), shadcn, out: (l) => lines.push(l), warn: (l) => warnings.push(l), now: () => new Date("2026-10-11T10:00:00Z"), ...extra }
  return { ctx, lines, warnings, shadcn, text: () => lines.join("\n") }
}

export const read = (root: string, rel: string) => readFileSync(join(root, rel), "utf8")
export const write = (root: string, rel: string, content: string) => {
  mkdirSync(dirname(join(root, rel)), { recursive: true })
  writeFileSync(join(root, rel), content)
}
export const has = (root: string, rel: string) => existsSync(join(root, rel))

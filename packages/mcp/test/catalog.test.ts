import { describe, expect, it } from "vitest"

import { Catalog, composePage, expand, installCommands, toMarkdown, type Detail, type Summary } from "../src/catalog"

const item = (p: Partial<Summary>): Summary => ({
  name: "x", kind: "component", type: "registry:ui", title: "X", description: "", category: "primitives", tier: "free", tags: [],
  url: "", registryUrl: "", install: "", whenToUse: [], whenNotToUse: [], composesWith: [], dependencies: [], registryDependencies: [], examples: [],
  ...p,
})
const items = [
  item({ name: "prompt-input", title: "Prompt Input", category: "ai", tags: ["chat", "textarea", "attachments"], description: "Chat composer with attachments." }),
  item({ name: "button", title: "Button", tags: ["cta"], description: "A button." }),
  item({ name: "hero-1", kind: "block", category: "blocks", blockCategory: "hero", title: "Hero 1", description: "Split hero." }),
  item({ name: "pricing-1", kind: "block", category: "blocks", blockCategory: "pricing", title: "Pricing 1", description: "Two tiers." }),
  item({ name: "faq-1", kind: "block", category: "blocks", blockCategory: "faq", title: "FAQ 1", description: "Accordion FAQ." }),
  item({ name: "login-1", kind: "block", category: "blocks", blockCategory: "auth", title: "Login 1", description: "Sign in." }),
  item({ name: "dialog", title: "Dialog", tags: ["overlay"], description: "A window over the page." }),
  item({ name: "template-goods", kind: "template", category: "templates", templateKind: "specialty", title: "Kiln & Co: online store", tags: ["template", "ecommerce", "store", "shop", "cart"], description: "A five-page store.", pages: [{ title: "Home", path: "/goods", preview: "" }] }),
]
const fakeFetch = (async (url: string) => {
  const u = String(url)
  if (u.endsWith("/api/v1/index.json")) return new Response(JSON.stringify({ version: 1, setup: "", namespace: "@ballmac", items }))
  const name = decodeURIComponent(u.split("/").pop()!.replace(/\.json$/, ""))
  const Comp = name.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase())
  return new Response(JSON.stringify({ ...items.find((i) => i.name === name), exports: [Comp], import: `import { ${Comp} } from "@/components/ballmac/blocks/${name}/${name}"` }))
}) as typeof fetch

describe("catalog", () => {
  const catalog = new Catalog("https://ui.test", fakeFetch)

  it("ranks search results by relevance", async () => {
    const results = await catalog.search("chat input with attachments")
    expect(results[0].name).toBe("prompt-input")
  })

  it("filters by kind", async () => {
    expect((await catalog.list({ kind: "block" })).map((i) => i.name)).toEqual(["hero-1", "pricing-1", "faq-1", "login-1"])
    expect((await catalog.list({ category: "specialty" })).map((i) => i.name)).toEqual(["template-goods"])
  })

  it("builds install commands per package manager", () => {
    expect(installCommands(["button"], "pnpm").add).toBe("pnpm dlx shadcn@latest add @ballmac/button")
    expect(installCommands(["button"], "bun").byUrl).toBe("bunx --bun shadcn@latest add https://ui.ballmac.com/r/button.json")
  })

  it("composes a landing page in section order and reports missing sections", async () => {
    const plan = await composePage(catalog, "SaaS landing page with pricing and FAQ")
    expect(plan.sections.map((s) => s.block)).toEqual(["hero-1", "pricing-1", "faq-1"])
    expect(plan.missing).toContain("header")
    expect(plan.scaffold).toContain("<Hero1 />")
    expect(plan.commands.add).toBe("npx shadcn@latest add @ballmac/hero-1 @ballmac/pricing-1 @ballmac/faq-1")
  })

  it("composes an auth screen", async () => {
    const plan = await composePage(catalog, "a login screen")
    expect(plan.sections.map((s) => s.block)).toEqual(["login-1"])
  })

  it("understands synonyms and plurals", async () => {
    expect(expand("modals")).toEqual(expect.arrayContaining(["modal", "dialog"]))
    expect((await catalog.search("a modal"))[0]!.name).toBe("dialog")
    expect((await catalog.search("ecommerce shop", { kind: "template" }))[0]!.name).toBe("template-goods")
  })

  it("counts categories per kind", async () => {
    const c = await catalog.categories()
    expect(c.totals).toEqual({ components: 3, blocks: 4, templates: 1 })
    expect(c.blocks.map((b) => b.name)).toContain("pricing")
    expect(c.templates).toEqual([{ name: "specialty", items: 1 }])
  })

  it("suggests close names for a typo", async () => {
    expect(await catalog.suggest("promt-input")).toContain("prompt-input")
  })

  it("suggests a whole template when one fits the intent", async () => {
    const plan = await composePage(catalog, "an online store with a cart")
    expect(plan.templates.map((t) => t.name)).toEqual(["template-goods"])
  })

  it("refreshes the index after ten minutes", async () => {
    let calls = 0
    let t = 0
    const counting = (async (url: string) => { if (String(url).endsWith("index.json")) calls++; return fakeFetch(url) }) as typeof fetch
    const c = new Catalog("https://ui.test", counting, () => t)
    await c.list(); await c.list()
    expect(calls).toBe(1)
    t = 11 * 60 * 1000
    await c.list()
    expect(calls).toBe(2)
  })

  it("explains an unreachable site instead of throwing a bare error", async () => {
    const down = (async () => { throw new TypeError("fetch failed") }) as typeof fetch
    await expect(new Catalog("https://down.test", down).list()).rejects.toThrow(/Could not reach Ballmac UI at https:\/\/down.test/)
  })

  it("renders an item as Markdown", () => {
    const d = { ...items[0]!, exports: ["PromptInput"], import: 'import { PromptInput } from "@/components/ballmac/prompt-input"', props: [{ component: "PromptInput", props: [{ name: "value", type: "string", required: false, description: "Text." }] }], a11y: [{ keys: "Enter", action: "Sends" }], customization: [], files: [], exampleCode: [] } as Detail
    const md = toMarkdown(d)
    expect(md).toContain("# Prompt Input (prompt-input)")
    expect(md).toContain("| value? | `string` |")
    expect(md).toContain("- Enter: Sends")
  })
})

describe("pro items", () => {
  const proItem = item({ name: "hero-pro-1", kind: "block", category: "blocks", blockCategory: "hero", tier: "pro", title: "Hero Pro 1", examples: ["hero-pro-1-demo"] })
  const detail = { ...proItem, exports: ["HeroPro1"], props: [], a11y: [], customization: [], files: [{ path: "components/blocks/hero-pro-1/hero-pro-1.tsx", target: "x" }], exampleCode: [{ name: "hero-pro-1-demo", title: "Demo" }] }
  const calls: { url: string; auth?: string }[] = []
  const proFetch = (async (url: string, init?: RequestInit) => {
    const u = String(url)
    const auth = (init?.headers as Record<string, string> | undefined)?.authorization
    calls.push({ url: u, auth })
    if (u.endsWith("/api/v1/items/hero-pro-1.json")) return new Response(JSON.stringify(detail))
    if (u.includes("/r/pro/")) {
      if (!auth) return new Response("", { status: 401 })
      if (auth !== "Bearer good") return new Response("", { status: 403 })
      const file = u.includes("demo") ? "demo source" : "main source"
      return new Response(JSON.stringify({ files: [{ path: u.includes("demo") ? "registry/pro/examples/hero-pro-1-demo.tsx" : `registry/pro/ballmac/${detail.files[0]!.path}`, content: file }] }))
    }
    return new Response("", { status: 404 })
  }) as typeof fetch

  it("installs Pro items through the @ballmac-pro namespace", () => {
    const c = installCommands(["button", "hero-pro-1"], "npm", new Set(["hero-pro-1"]))
    expect(c.add).toBe("npx shadcn@latest add @ballmac/button @ballmac-pro/hero-pro-1")
    expect(c.byUrl).toBe("npx shadcn@latest add https://ui.ballmac.com/r/button.json @ballmac-pro/hero-pro-1")
    expect(c.proSetup).toContain("BALLMAC_LICENSE_KEY")
    expect(installCommands(["button"]).proSetup).toBeUndefined()
  })

  it("returns no Pro source without a key", async () => {
    const d = await new Catalog("https://ui.test", proFetch, Date.now, undefined).detail("hero-pro-1")
    expect(d.files[0]!.content).toBeUndefined()
    expect(d.licence).toContain("BALLMAC_LICENSE_KEY")
    expect(calls.some((c) => c.url.includes("/r/pro/"))).toBe(false)
  })

  it("reads Pro source from the private registry with a key", async () => {
    const d = await new Catalog("https://ui.test", proFetch, Date.now, "good").detail("hero-pro-1")
    expect(d.files[0]!.content).toBe("main source")
    expect(d.exampleCode[0]!.code).toBe("demo source")
    expect(calls.filter((c) => c.url.includes("/r/pro/")).every((c) => c.auth === "Bearer good")).toBe(true)
  })

  it("explains a rejected key", async () => {
    const d = await new Catalog("https://ui.test", proFetch, Date.now, "bad").detail("hero-pro-1")
    expect(d.files[0]!.content).toBeUndefined()
    expect(d.licence).toContain("not accepted")
  })
})

import { describe, expect, it } from "vitest"

import { Catalog, composePage, expand, installCommands, planFeel, toMarkdown, type Detail, type Summary } from "../src/catalog"

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

describe("changes and tests", () => {
  const versions = {
    schema: 1,
    items: {
      button: {
        title: "Button", type: "registry:ui", version: "1.2.0", updated: "2026-10-12", tier: "free", files: ["@components/ballmac/button.tsx"], requires: [], tests: true,
        changelog: [
          { version: "1.2.0", date: "2026-10-12", note: "Icon size is 40px." },
          { version: "1.1.0", date: "2026-10-11", note: "The lg size is taller.", breaking: true },
        ],
      },
      badge: { title: "Badge", type: "registry:ui", version: "1.0.0", updated: "2026-10-01", tier: "free", files: ["@components/ballmac/badge.tsx"], requires: [], tests: false, changelog: [] },
    },
  }
  const calls: string[] = []
  const f = (async (url: string) => {
    const u = String(url)
    calls.push(u)
    if (u.endsWith("/r/versions.json")) return new Response(JSON.stringify(versions))
    if (u.endsWith("/r/tests/button.json")) return new Response(JSON.stringify({ name: "button", version: "1.2.0", file: "button.test.tsx", content: "// test", requires: [], devDependencies: ["vitest@^4"] }))
    return new Response("", { status: 404 })
  }) as typeof fetch
  const catalog = new Catalog("https://ui.test", f)

  it("lists every change, newest first, and flags breaking ones", async () => {
    const c = await catalog.changes("button")
    expect(c.changes.map((e) => e.version)).toEqual(["1.2.0", "1.1.0"])
    expect(c).toMatchObject({ version: "1.2.0", breaking: true, upToDate: false, tests: true, update: "npx @ballmac/cli update button" })
  })

  it("shows only what is newer than the version the user has", async () => {
    expect((await catalog.changes("button", "1.1.0")).changes.map((e) => e.version)).toEqual(["1.2.0"])
    expect(await catalog.changes("button", "1.1.0")).toMatchObject({ breaking: false, upToDate: false })
    expect(await catalog.changes("button", "1.2.0")).toMatchObject({ changes: [], upToDate: true })
  })

  it("fetches the versions manifest once", async () => {
    const before = calls.filter((u) => u.endsWith("/r/versions.json")).length
    await catalog.changes("badge")
    await catalog.changes("button")
    expect(calls.filter((u) => u.endsWith("/r/versions.json")).length).toBe(before)
  })

  it("returns the shipped test, or null when the item has none, or throws for an unknown item", async () => {
    expect((await catalog.tests("button"))!.content).toBe("// test")
    expect(await catalog.tests("badge")).toBeNull()
    await expect(catalog.tests("nope")).rejects.toThrow(/Not found/)
    await expect(catalog.changes("nope")).rejects.toThrow(/Not found/)
  })

  it("includes Pro items only with a licence key", async () => {
    const seen: (string | undefined)[] = []
    const pf = (async (url: string, init?: RequestInit) => {
      const u = String(url)
      seen.push((init?.headers as Record<string, string> | undefined)?.authorization)
      if (u.endsWith("/r/pro/versions.json")) return new Response(JSON.stringify({ schema: 1, items: { "hero-pro-1": { ...versions.items.badge, title: "Hero", tier: "pro", version: "1.3.0" } } }))
      return new Response(JSON.stringify(versions))
    }) as typeof fetch
    expect((await new Catalog("https://ui.test", pf, Date.now, undefined).changes("badge")).version).toBe("1.0.0")
    await expect(new Catalog("https://ui.test", pf, Date.now, undefined).changes("hero-pro-1")).rejects.toThrow(/Not found/)
    expect((await new Catalog("https://ui.test", pf, Date.now, "good").changes("hero-pro-1")).version).toBe("1.3.0")
    expect(seen).toContain("Bearer good")
  })
})

describe("platform feel", () => {
  it("picks the feel a request names", () => {
    expect(planFeel("a notes app for macOS")).toMatchObject({ id: "macos", items: ["feel-macos", "app-window"] })
    expect(planFeel("settings screen for the Windows app")).toMatchObject({ id: "windows", items: ["feel-windows", "app-window"] })
    expect(planFeel("a checkout for iPhone users")).toMatchObject({ id: "ios", items: ["feel-ios"] })
  })

  it("lets the device pick when several platforms or a desktop shell are named", () => {
    expect(planFeel("a Tauri app for Mac and Windows")).toMatchObject({ id: "auto", items: ["feel-auto", "app-window"] })
    expect(planFeel("an Electron notes app")).toMatchObject({ id: "auto", items: ["feel-auto", "app-window"] })
    expect(planFeel("a macOS and iOS companion")).toMatchObject({ id: "auto", items: ["feel-auto"] })
  })

  it("suggests nothing for an ordinary web request", () => {
    expect(planFeel("SaaS landing page with pricing and FAQ")).toBeNull()
    expect(planFeel("a login screen")).toBeNull()
  })

  it("lets an explicit feel win, and says what to wire", () => {
    const plan = planFeel("an Electron app for macOS", "windows", "pnpm")!
    expect(plan.id).toBe("windows")
    expect(plan.install).toBe("pnpm dlx shadcn@latest add @ballmac/feel-windows @ballmac/app-window")
    expect(plan.notes.join(" ")).toContain("decorations")
    expect(planFeel("a Tauri app", "ios")!.items).toEqual(["feel-ios"])
    expect(planFeel("anything", "web")!.items).toEqual(["feel-web"])
    expect(planFeel("a Tauri app")!.notes.join(" ")).toContain("FeelScript")
  })

  it("is part of a composed page", async () => {
    const catalog = new Catalog("https://ui.test", fakeFetch)
    expect((await composePage(catalog, "a login screen for a Mac app")).feel).toMatchObject({ id: "macos" })
    expect((await composePage(catalog, "a login screen")).feel).toBeNull()
    expect((await composePage(catalog, "a login screen", { feel: "ios" })).feel).toMatchObject({ id: "ios" })
  })
})


describe("states", () => {
  const withStates = [
    item({
      name: "dashboard-1", kind: "block", category: "blocks", blockCategory: "dashboard", title: "Dashboard 1", description: "Store overview.",
      states: [
        { id: "loading", title: "Loading", example: "dashboard-1-loading", trigger: 'state="loading"', note: "A skeleton of the cards.", preview: "https://ui.test/preview/dashboard-1-loading" },
        { id: "error", title: "Could not load", example: "dashboard-1-error", trigger: 'state="error"' },
      ],
    }),
    item({
      name: "login-1", kind: "block", category: "blocks", blockCategory: "auth", title: "Login 1", description: "Sign in.",
      states: [{ id: "submitting", title: "Signing in", example: "login-1-submitting", trigger: 'state="submitting"' }],
    }),
    item({ name: "hero-1", kind: "block", category: "blocks", blockCategory: "hero", title: "Hero 1", description: "Split hero.", statesNone: "Static content: nothing to load, submit or fail." }),
  ]
  const fetchStates = (async (url: string) => {
    const u = String(url)
    if (u.endsWith("/api/v1/index.json")) return new Response(JSON.stringify({ version: 1, setup: "", namespace: "@ballmac", items: withStates }))
    const name = decodeURIComponent(u.split("/").pop()!.replace(/\.json$/, ""))
    const Comp = name.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase())
    return new Response(JSON.stringify({ ...withStates.find((i) => i.name === name), exports: [Comp], import: `import { ${Comp} } from "@/components/ballmac/blocks/${name}/${name}"`, props: [], a11y: [], customization: [], files: [], exampleCode: [] }))
  }) as typeof fetch
  const catalog = new Catalog("https://ui.test", fetchStates)

  it("lists each section's states, and why a block has none", async () => {
    const plan = await composePage(catalog, "a hero, a dashboard and a login screen")
    const by = Object.fromEntries(plan.sections.map((s) => [s.block, s as { states: { id: string; trigger: string }[]; statesNone?: string }]))
    expect(by["dashboard-1"]!.states.map((s) => s.id)).toEqual(["loading", "error"])
    expect(by["dashboard-1"]!.states[0]!.trigger).toBe('state="loading"')
    expect(by["login-1"]!.states.map((s) => s.id)).toEqual(["submitting"])
    expect(by["hero-1"]!.states).toEqual([])
    expect(by["hero-1"]!.statesNone).toContain("Static")
  })

  it("wires a data block to useResource and a form block to a phase, and leaves a static block alone", async () => {
    const { scaffold } = await composePage(catalog, "a hero, a dashboard and a login screen")
    expect(scaffold.startsWith('"use client"')).toBe(true)
    expect(scaffold).toContain('import { useResource } from "@/lib/ballmac/use-resource"')
    expect(scaffold).toContain("const dashboard1 = useResource(")
    expect(scaffold).toContain("<Dashboard1 state={dashboard1.state} onRetry={dashboard1.retry} />")
    expect(scaffold).toContain('const [login1, setLogin1] = React.useState<BlockState>("ready")')
    expect(scaffold).toContain("<Login1 state={login1} />")
    expect(scaffold).toContain("<Hero1 />")
  })

  it("keeps a page of static blocks exactly as it was", async () => {
    const { scaffold } = await composePage(catalog, "a hero")
    expect(scaffold).not.toContain("use client")
    expect(scaffold).not.toContain("useResource")
    expect(scaffold).toContain("<Hero1 />")
  })

  it("shows states, or why there are none, in an item's markdown", async () => {
    const d = await catalog.detail("dashboard-1")
    const md = toMarkdown(d)
    expect(md).toContain("## States")
    expect(md).toContain('**Loading** (`state="loading"`): A skeleton of the cards. Preview: https://ui.test/preview/dashboard-1-loading')
    expect(toMarkdown(await catalog.detail("hero-1"))).toContain("None. Static content")
  })
})

describe("makePreset", () => {
  it("passes the settings to the site and returns its answer", async () => {
    const seen: string[] = []
    const fetchImpl = (async (url: string) => {
      seen.push(String(url))
      return new Response(JSON.stringify({ code: "aaaa-bbbb-cccc-dddd", install: "npx shadcn@latest add @ballmac/preset-aaaa-bbbb-cccc-dddd" }))
    }) as typeof fetch
    const result = await new Catalog("https://ui.test/", fetchImpl).makePreset({ from: "ink", hue: 150, paper: true, font: undefined, feel: "" })
    expect(seen).toEqual(["https://ui.test/api/v1/preset?from=ink&hue=150&paper=true"])
    expect(result.code).toBe("aaaa-bbbb-cccc-dddd")
  })

  it("turns a rejected value into a message that says what is valid", async () => {
    const fetchImpl = (async () => new Response(JSON.stringify({ error: '"font" must be one of keep, system.' }), { status: 400 })) as typeof fetch
    await expect(new Catalog("https://ui.test", fetchImpl).makePreset({ font: "comic" })).rejects.toThrow('"font" must be one of keep, system.')
  })

  it("says so when the site cannot be reached", async () => {
    const fetchImpl = (async () => {
      throw new Error("offline")
    }) as typeof fetch
    await expect(new Catalog("https://ui.test", fetchImpl).makePreset({})).rejects.toThrow(/Could not reach Ballmac UI/)
  })
})

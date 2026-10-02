#!/usr/bin/env node
/**
 * @ballmac/mcp: an MCP server for Ballmac UI.
 * Read-only: it answers questions and returns install commands; it never writes files or runs commands.
 * Env: BALLMAC_UI_URL (default https://ui.ballmac.com).
 */
import { createRequire } from "node:module"

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"

import { Catalog, composePage, installCommands, NotFoundError, PRO_REGISTRY, toMarkdown, type Summary } from "./catalog.js"

const { version } = createRequire(import.meta.url)("../package.json") as { version: string }

const args = process.argv.slice(2)
if (args.includes("--version") || args.includes("-v")) {
  console.log(version)
  process.exit(0)
}
if (args.includes("--help") || args.includes("-h")) {
  console.log(`@ballmac/mcp ${version}: an MCP server for Ballmac UI (https://ui.ballmac.com).

Run it from your MCP client over stdio:
  npx -y @ballmac/mcp

Environment:
  BALLMAC_UI_URL   Catalog to read (default https://ui.ballmac.com)

Docs: https://ui.ballmac.com/docs/mcp`)
  process.exit(0)
}

const catalog = new Catalog()
const proNames = async () => new Set((await catalog.list()).filter((i) => i.tier === "pro").map((i) => i.name))
const kinds = z.enum(["component", "block", "template"])
const pms = z.enum(["pnpm", "npm", "yarn", "bun"])
const readOnly = { readOnlyHint: true, openWorldHint: true } as const

/** Text for every client, plus structured content for clients that read it. */
const result = <T extends Record<string, unknown>>(data: T) => ({ content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }], structuredContent: data })
const message = (text: string, isError = false) => ({ content: [{ type: "text" as const, text }], ...(isError ? { isError: true } : {}) })
const brief = (i: Summary) => ({
  name: i.name,
  kind: i.kind,
  title: i.title,
  description: i.description,
  category: i.templateKind ?? i.blockCategory ?? i.category,
  tier: i.tier,
  whenToUse: i.whenToUse,
  install: i.install,
  ...(i.pages ? { pages: i.pages.map((p) => p.path ?? p.title) } : {}),
})

async function notFound(name: string) {
  const near = await catalog.suggest(name).catch(() => [])
  return message(`No Ballmac UI item named "${name}".${near.length ? ` Did you mean ${near.map((n) => `"${n}"`).join(", ")}?` : " Use search_items to find the right name."}`, true)
}
const failure = (e: unknown) => message(e instanceof Error ? e.message : String(e), true)

const itemList = { items: z.array(z.record(z.string(), z.unknown())) }

const server = new McpServer(
  { name: "ballmac-ui", title: "Ballmac UI", version },
  {
    instructions:
      "Ballmac UI is a shadcn registry (namespace @ballmac) of accessible React 19 + Tailwind CSS v4 components, page blocks and multi-page templates. " +
      "Use search_items or list_items to find candidates (list_categories shows what exists), get_item to read an item's API, props, keyboard behaviour and source, " +
      "and get_install_command for the exact CLI command, which you run in the user's project. For a whole page use compose_page; it also suggests full templates. " +
      "Items install into components/ballmac and never overwrite components/ui. Follow each item's whenToUse and whenNotToUse guidance when choosing.",
  }
)

server.registerTool(
  "list_items",
  {
    title: "List Ballmac UI items",
    description: "List components, blocks or templates, optionally filtered by kind, category (a component category such as primitives, motion or ai; a block section such as hero or pricing; or a template kind such as marketing) or tier. Call list_categories for the valid names.",
    inputSchema: { kind: kinds.optional(), category: z.string().optional(), tier: z.enum(["free", "pro"]).optional() },
    outputSchema: itemList,
    annotations: readOnly,
  },
  async (input) => {
    try {
      return result({ items: (await catalog.list(input)).map(brief) })
    } catch (e) {
      return failure(e)
    }
  }
)

server.registerTool(
  "list_categories",
  {
    title: "List categories",
    description: "How many components, blocks and templates there are, and the categories each is grouped into, with counts. Use the names as the category filter of list_items.",
    inputSchema: {},
    outputSchema: { totals: z.record(z.string(), z.number()), components: z.array(z.record(z.string(), z.unknown())), blocks: z.array(z.record(z.string(), z.unknown())), templates: z.array(z.record(z.string(), z.unknown())) },
    annotations: readOnly,
  },
  async () => {
    try {
      return result(await catalog.categories())
    } catch (e) {
      return failure(e)
    }
  }
)

server.registerTool(
  "search_items",
  {
    title: "Search Ballmac UI",
    description: "Search by what the user needs (for example 'chat input with attachments', 'animated stat', 'pricing section', 'online store'). Understands common synonyms such as modal, navbar or ecommerce. Returns the best matches with when-to-use guidance.",
    inputSchema: { query: z.string().min(1), kind: kinds.optional(), limit: z.number().int().min(1).max(30).optional() },
    outputSchema: itemList,
    annotations: readOnly,
  },
  async ({ query, kind, limit }) => {
    try {
      const results = await catalog.search(query, { kind }, limit ?? 8)
      if (!results.length) return message(`No Ballmac UI items match "${query}". Try fewer words, or list_categories to browse.`)
      return result({ items: results.map(brief) })
    } catch (e) {
      return failure(e)
    }
  }
)

server.registerTool(
  "get_item",
  {
    title: "Get a Ballmac UI item",
    description: "Everything about one item: description, when to use and not, import line, props, keyboard behaviour, dependencies, composition hints, template pages and the full source (for Pro items only when the server has BALLMAC_LICENSE_KEY; see the `licence` field). Set includeSource to false for a shorter answer.",
    inputSchema: { name: z.string().min(1), includeSource: z.boolean().optional() },
    annotations: readOnly,
  },
  async ({ name, includeSource }) => {
    try {
      const d = await catalog.detail(name)
      const data = includeSource === false ? { ...d, files: d.files.map((f) => ({ path: f.path, target: f.target })), exampleCode: d.exampleCode.map((e) => ({ name: e.name, title: e.title })) } : d
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] }
    } catch (e) {
      return e instanceof NotFoundError ? notFound(name) : failure(e)
    }
  }
)

server.registerTool(
  "get_examples",
  {
    title: "Get usage examples",
    description: "Working example code for an item (the same examples shown on its page).",
    inputSchema: { name: z.string().min(1) },
    annotations: readOnly,
  },
  async ({ name }) => {
    try {
      return { content: [{ type: "text" as const, text: JSON.stringify((await catalog.detail(name)).exampleCode, null, 2) }] }
    } catch (e) {
      return e instanceof NotFoundError ? notFound(name) : failure(e)
    }
  }
)

server.registerTool(
  "get_install_command",
  {
    title: "Get install commands",
    description: "The shadcn CLI commands to add one or more items to the user's project. Run `setup` once if components.json has no @ballmac registry, then `add`. `byUrl` works without setup for free items. Pro items install as @ballmac-pro/<name> and need `proSetup` once.",
    inputSchema: { names: z.array(z.string().min(1)).min(1), packageManager: pms.optional() },
    outputSchema: { setup: z.string(), add: z.string(), byUrl: z.string(), proSetup: z.string().optional() },
    annotations: readOnly,
  },
  async ({ names, packageManager }) => {
    try {
      return result(installCommands(names, packageManager, await proNames()))
    } catch (e) {
      return failure(e)
    }
  }
)

server.registerTool(
  "compose_page",
  {
    title: "Compose a page from blocks",
    description: "Plan a page from Ballmac UI blocks for an intent such as 'SaaS landing page with pricing and FAQ' or 'login screen'. Returns the chosen blocks in page order, install commands, a page.tsx scaffold that renders them, and any complete templates that already fit the intent.",
    inputSchema: { intent: z.string().min(3), packageManager: pms.optional(), includePro: z.boolean().optional() },
    outputSchema: {
      sections: z.array(z.record(z.string(), z.unknown())),
      missing: z.array(z.string()),
      commands: z.object({ setup: z.string(), add: z.string(), byUrl: z.string(), proSetup: z.string().optional() }),
      scaffold: z.string(),
      templates: z.array(z.record(z.string(), z.unknown())),
    },
    annotations: readOnly,
  },
  async ({ intent, packageManager, includePro }) => {
    try {
      return result(await composePage(catalog, intent, { pm: packageManager, includePro }))
    } catch (e) {
      return failure(e)
    }
  }
)

server.registerTool(
  "get_setup",
  {
    title: "Project setup",
    description: "How to prepare a project for Ballmac UI (shadcn init, registry entry, optional theme) and its requirements.",
    inputSchema: { packageManager: pms.optional() },
    outputSchema: { requirements: z.array(z.string()), steps: z.array(z.string()), installLocation: z.string() },
    annotations: readOnly,
  },
  async ({ packageManager }) => {
    const cmds = installCommands(["theme"], packageManager)
    return result({
      requirements: ["React 19", "Tailwind CSS v4", "a shadcn-initialized project (components.json and lib/utils)"],
      steps: [
        `${cmds.setup.split(" shadcn@latest")[0]} shadcn@latest init   # only if components.json is missing`,
        cmds.setup,
        `${cmds.add}   # optional: the Ballmac theme tokens`,
        "Or pick one of 12 themes (graphite, ocean, indigo, violet, rose, ember, amber, forest, teal, sand, mono, midnight): add @ballmac/theme-<name>. Preview and tune them at https://ui.ballmac.com/themes",
        `For Pro items (tier "pro"), add to components.json "registries": ${JSON.stringify(PRO_REGISTRY)} and put BALLMAC_LICENSE_KEY=<key> in .env.local${catalog.hasLicense ? " (this MCP server has a licence key, so get_item returns Pro source)" : ""}. Guide: https://ui.ballmac.com/docs/pro`,
      ],
      installLocation: "components/ballmac (blocks in components/ballmac/blocks, templates in components/ballmac/templates plus app routes)",
    })
  }
)

server.registerResource(
  "catalog",
  "ballmac://catalog",
  { title: "Ballmac UI catalog", description: "Every component, block and template with a one-line description.", mimeType: "text/markdown" },
  async (uri) => {
    const items = await catalog.list()
    const section = (kind: string, title: string) => [`## ${title}`, ...items.filter((i) => i.kind === kind).map((i) => `- **${i.name}**: ${i.description}`)].join("\n")
    const text = ["# Ballmac UI", "", section("component", "Components"), "", section("block", "Blocks"), "", section("template", "Templates")].join("\n")
    return { contents: [{ uri: uri.href, mimeType: "text/markdown", text }] }
  }
)

server.registerResource(
  "item",
  new ResourceTemplate("ballmac://items/{name}", {
    list: undefined,
    complete: {
      name: async (value) => (await catalog.list()).map((i) => i.name).filter((n) => n.startsWith(value)).slice(0, 50),
    },
  }),
  { title: "Ballmac UI item", description: "One item as Markdown: install, import, props, keyboard behaviour and when to use it.", mimeType: "text/markdown" },
  async (uri, { name }) => {
    const d = await catalog.detail(String(name))
    return { contents: [{ uri: uri.href, mimeType: "text/markdown", text: toMarkdown(d) }] }
  }
)

server.registerPrompt(
  "build_page",
  {
    title: "Build a page with Ballmac UI",
    description: "Plan and build a page from Ballmac UI blocks, or start from a template that fits.",
    argsSchema: { intent: z.string().describe("What the page is for, such as 'SaaS landing page with pricing'") },
  },
  ({ intent }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Build this with Ballmac UI: ${intent}\n\n1. Call compose_page with that intent. If it suggests a template that fits, prefer installing the template.\n2. Run get_setup's steps if the project has no @ballmac registry yet, then the add command.\n3. Create the page from the scaffold, then replace each block's default copy through its props (read get_item for the props).\n4. Keep the blocks' accessibility behaviour; do not remove labels or keyboard handling.`,
        },
      },
    ],
  })
)

server.registerPrompt(
  "choose_component",
  {
    title: "Choose a Ballmac UI component",
    description: "Find the right component for a need and wire it up correctly.",
    argsSchema: { need: z.string().describe("What the UI should do, such as 'animated number for revenue'") },
  },
  ({ need }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `I need: ${need}\n\nUse search_items to find two or three candidates, compare their whenToUse and whenNotToUse, pick one, then call get_item and get_examples for it and show me the install command and a minimal usage that follows its props and keyboard notes.`,
        },
      },
    ],
  })
)

await server.connect(new StdioServerTransport())

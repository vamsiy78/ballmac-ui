#!/usr/bin/env node
/**
 * @ballmac/mcp: an MCP server for Ballmac UI.
 * Read-only: it answers questions and returns install commands; it never writes files or runs commands.
 * Env: BALLMAC_UI_URL (default https://ui.ballmac.com).
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"

import { Catalog, composePage, installCommands, type Summary } from "./catalog.js"

const catalog = new Catalog()
const kinds = z.enum(["component", "block", "template"])
const pms = z.enum(["pnpm", "npm", "yarn", "bun"])
const readOnly = { readOnlyHint: true, openWorldHint: true } as const

const text = (value: unknown) => ({ content: [{ type: "text" as const, text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }] })
const brief = (i: Summary) => ({ name: i.name, kind: i.kind, title: i.title, description: i.description, category: i.blockCategory ?? i.category, tier: i.tier, whenToUse: i.whenToUse, install: i.install })

const server = new McpServer(
  { name: "ballmac-ui", version: "0.1.0" },
  {
    instructions:
      "Ballmac UI is a shadcn registry (namespace @ballmac) of accessible React + Tailwind v4 components, page blocks and templates. " +
      "Use search_items or list_items to find candidates, get_item to read an item's API, props, accessibility notes and source, " +
      "and get_install_command for the exact CLI command (run it in the user's project). For whole pages, use compose_page. " +
      "Items install into components/ballmac and never overwrite components/ui. Prefer an item's whenToUse/whenNotToUse guidance when choosing.",
  }
)

server.registerTool(
  "list_items",
  {
    title: "List Ballmac UI items",
    description: "List components, blocks or templates, optionally filtered by kind, category (e.g. primitives, motion, ai, developer, or a block section like hero or pricing) or tier.",
    inputSchema: { kind: kinds.optional(), category: z.string().optional(), tier: z.enum(["free", "pro"]).optional() },
    annotations: readOnly,
  },
  async (args) => text((await catalog.list(args)).map(brief))
)

server.registerTool(
  "search_items",
  {
    title: "Search Ballmac UI",
    description: "Search by what the user needs (e.g. 'chat input with attachments', 'animated stat', 'pricing section'). Returns the best matches with when-to-use guidance.",
    inputSchema: { query: z.string().min(1), kind: kinds.optional(), limit: z.number().int().min(1).max(30).optional() },
    annotations: readOnly,
  },
  async ({ query, kind, limit }) => {
    const results = await catalog.search(query, { kind }, limit ?? 8)
    return text(results.length ? results.map(brief) : `No Ballmac UI items match "${query}". Try list_items to browse.`)
  }
)

server.registerTool(
  "get_item",
  {
    title: "Get a Ballmac UI item",
    description: "Everything about one item: description, when to use and not, import line, props, variants, keyboard behavior, dependencies, composition hints and (for free items) the full source.",
    inputSchema: { name: z.string().min(1), includeSource: z.boolean().optional() },
    annotations: readOnly,
  },
  async ({ name, includeSource }) => {
    try {
      const d = await catalog.detail(name)
      return text(includeSource === false ? { ...d, files: d.files.map((f) => ({ path: f.path, target: f.target })) } : d)
    } catch {
      return { ...text(`No Ballmac UI item named "${name}". Use search_items to find the right name.`), isError: true }
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
      return text((await catalog.detail(name)).exampleCode)
    } catch {
      return { ...text(`No Ballmac UI item named "${name}".`), isError: true }
    }
  }
)

server.registerTool(
  "get_install_command",
  {
    title: "Get install commands",
    description: "The shadcn CLI commands to add one or more items to the user's project. Run `setup` once if components.json has no @ballmac registry, then `add`. `byUrl` works without setup.",
    inputSchema: { names: z.array(z.string().min(1)).min(1), packageManager: pms.optional() },
    annotations: readOnly,
  },
  async ({ names, packageManager }) => text(installCommands(names, packageManager))
)

server.registerTool(
  "compose_page",
  {
    title: "Compose a page from blocks",
    description: "Plan a page from Ballmac UI blocks for an intent such as 'SaaS landing page with pricing and FAQ' or 'login screen'. Returns the chosen blocks in page order, install commands and a page.tsx scaffold that renders them.",
    inputSchema: { intent: z.string().min(3), packageManager: pms.optional(), includePro: z.boolean().optional() },
    annotations: readOnly,
  },
  async ({ intent, packageManager, includePro }) => text(await composePage(catalog, intent, { pm: packageManager, includePro }))
)

server.registerTool(
  "get_setup",
  {
    title: "Project setup",
    description: "How to prepare a project for Ballmac UI (shadcn init, registry entry, optional theme) and its requirements.",
    inputSchema: { packageManager: pms.optional() },
    annotations: readOnly,
  },
  async ({ packageManager }) => {
    const cmds = installCommands(["theme"], packageManager)
    return text({
      requirements: ["React 19", "Tailwind CSS v4", "a shadcn-initialized project (components.json and lib/utils)"],
      steps: [
        `${cmds.setup.split(" shadcn@latest")[0]} shadcn@latest init   # only if components.json is missing`,
        cmds.setup,
        `${cmds.add}   # optional: the Ballmac theme tokens`,
      ],
      installLocation: "components/ballmac (blocks in components/ballmac/blocks)",
    })
  }
)

await server.connect(new StdioServerTransport())

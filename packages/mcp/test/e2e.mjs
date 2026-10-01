// End-to-end: start the built server over stdio against a running site and call every tool.
// Usage: BALLMAC_UI_URL=http://localhost:3200 node test/e2e.mjs
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [new URL("../dist/index.js", import.meta.url).pathname],
  env: { ...process.env, BALLMAC_UI_URL: process.env.BALLMAC_UI_URL ?? "http://localhost:3200" },
})
const client = new Client({ name: "e2e", version: "0.0.0" })
await client.connect(transport)
const text = (r) => r.content[0].text
const json = (r) => JSON.parse(text(r))
const check = (label, ok, detail = "") => {
  console.log(`${ok ? "✓" : "✗"} ${label}${detail ? `: ${detail}` : ""}`)
  if (!ok) process.exitCode = 1
}

const { tools } = await client.listTools()
check("lists 8 tools", tools.length === 8, tools.map((t) => t.name).join(", "))

const blocksRes = await client.callTool({ name: "list_items", arguments: { kind: "block" } })
const blocks = json(blocksRes).items
check("list_items kind=block", blocks.length >= 60, `${blocks.length} blocks`)
check("list_items returns structured content", Array.isArray(blocksRes.structuredContent?.items))

const cats = json(await client.callTool({ name: "list_categories", arguments: {} }))
check("list_categories counts", cats.totals.components > 200 && cats.totals.templates >= 17, JSON.stringify(cats.totals))

const templates = json(await client.callTool({ name: "list_items", arguments: { kind: "template" } })).items
check("templates list their pages", templates.every((t) => t.pages?.length >= 1), `${templates.length} templates`)

const found = json(await client.callTool({ name: "search_items", arguments: { query: "chat input with file attachments" } })).items
check("search_items ranks prompt-input first", found[0]?.name === "prompt-input", found.slice(0, 3).map((i) => i.name).join(", "))

const item = json(await client.callTool({ name: "get_item", arguments: { name: "button" } }))
check("get_item returns props and source", item.props?.length > 0 && item.files?.[0]?.content?.includes("function Button"), item.import)

const examples = json(await client.callTool({ name: "get_examples", arguments: { name: "dialog" } }))
check("get_examples returns code", examples.length >= 1 && examples[0].code?.includes("Dialog"))

const cmds = json(await client.callTool({ name: "get_install_command", arguments: { names: ["button", "badge"], packageManager: "pnpm" } }))
check("get_install_command", cmds.add === "pnpm dlx shadcn@latest add @ballmac/button @ballmac/badge", cmds.add)

const modal = json(await client.callTool({ name: "search_items", arguments: { query: "modal", limit: 3 } })).items
check("search_items understands synonyms", modal.some((i) => i.name === "dialog"), modal.map((i) => i.name).join(", "))

const typo = await client.callTool({ name: "get_item", arguments: { name: "promt-input" } })
check("get_item suggests a close name", typo.isError && text(typo).includes("prompt-input"), text(typo))

const store = json(await client.callTool({ name: "compose_page", arguments: { intent: "online store with a cart and checkout" } }))
check("compose_page suggests a template", store.templates.some((t) => t.name === "template-goods"), store.templates.map((t) => t.name).join(", "))

const { resources } = await client.listResources()
check("lists the catalog resource", resources.some((r) => r.uri === "ballmac://catalog"))
const md = await client.readResource({ uri: "ballmac://items/button" })
check("reads an item resource", md.contents[0].text.startsWith("# Button (button)"))

const { prompts } = await client.listPrompts()
check("lists 2 prompts", prompts.length === 2, prompts.map((p) => p.name).join(", "))

const plan = json(await client.callTool({ name: "compose_page", arguments: { intent: "SaaS landing page with pricing and FAQ" } }))
check("compose_page orders sections", plan.sections.map((s) => s.section).join(",") === "header,hero,features,pricing,faq,cta,footer", plan.sections.map((s) => s.block).join(" → "))
check("compose_page scaffold imports blocks", plan.scaffold.includes('from "@/components/ballmac/blocks/hero-1/hero-1"'))

const missing = await client.callTool({ name: "get_item", arguments: { name: "does-not-exist" } })
check("unknown item is an error", missing.isError === true)

await client.close()

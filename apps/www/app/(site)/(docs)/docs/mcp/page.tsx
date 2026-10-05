import type { Metadata } from "next"

import Link from "@/components/site/link"

import { CodePanel } from "@/components/site/code-panel"
import { DocsPage } from "@/components/site/docs-page"

export const metadata: Metadata = {
  title: "MCP & AI agents",
  description: "Connect Claude, Cursor, VS Code, Windsurf or Codex to Ballmac UI with the @ballmac/mcp server: search components, blocks and templates, read their props and install them.",
  alternates: { canonical: "/docs/mcp" },
}

const ballmacClients = [
  { name: "Claude Code", lang: "bash", code: "claude mcp add ballmac -- npx -y @ballmac/mcp" },
  { name: "Cursor (.cursor/mcp.json) · Claude Desktop · Windsurf", lang: "json", code: `{\n  "mcpServers": {\n    "ballmac": {\n      "command": "npx",\n      "args": ["-y", "@ballmac/mcp"]\n    }\n  }\n}` },
  { name: "VS Code (.vscode/mcp.json)", lang: "json", code: `{\n  "servers": {\n    "ballmac": {\n      "type": "stdio",\n      "command": "npx",\n      "args": ["-y", "@ballmac/mcp"]\n    }\n  }\n}` },
  { name: "Codex (~/.codex/config.toml)", lang: "bash", code: `[mcp_servers.ballmac]\ncommand = "npx"\nargs = ["-y", "@ballmac/mcp"]` },
] as const

const tools = [
  ["search_items", "Best matches for a need, such as “chat input with attachments” or “online store”."],
  ["list_items · list_categories", "Browse components, blocks and templates by kind, category or tier."],
  ["get_item · get_examples", "Props, keyboard behaviour, import line, template pages, full source and working examples."],
  ["get_install_command", "The exact shadcn CLI commands for pnpm, npm, yarn or bun."],
  ["get_setup", "How to prepare a project: shadcn init, the registry entry and the optional theme."],
  ["compose_page", "A page plan from blocks in order, with a page.tsx scaffold, and any template that already fits."],
]

const clients = [
  { name: "Claude Code", cmd: "npx shadcn@latest mcp init --client claude" },
  { name: "Cursor", cmd: "npx shadcn@latest mcp init --client cursor" },
  { name: "VS Code", cmd: "npx shadcn@latest mcp init --client vscode" },
  { name: "Codex", cmd: "npx shadcn@latest mcp init --client codex" },
  { name: "OpenCode", cmd: "npx shadcn@latest mcp init --client opencode" },
]

const prompts = [
  "Show me the Ballmac UI components for AI chat interfaces",
  "Add @ballmac/prompt-input and @ballmac/ai-message and build a chat panel with them",
  "Which Ballmac UI component should I use for an animated stat, and how do I install it?",
  "Build a pricing section using Ballmac UI blocks",
  "Is there a Ballmac template for an online store? Install it",
]

export default function McpPage() {
  return (
    <DocsPage
      title="MCP & AI agents"
      lead="Connect your AI coding assistant to Ballmac UI. It can search components, blocks and templates, read their props and examples, install them, and plan pages, with no account or key."
    >
      <h2>Ballmac MCP server</h2>
      <p>
        <code>@ballmac/mcp</code> knows the whole catalog, including blocks and multi-page templates, and can plan a page
        from blocks. It is read-only and needs no account. Node.js 20 or later.
      </p>
      <div className="space-y-3">
        {ballmacClients.map((c) => (
          <CodePanel key={c.name} lang={c.lang} code={c.code} title={c.name} />
        ))}
      </div>
      <h3>Tools</h3>
      <ul>
        {tools.map(([name, what]) => (
          <li key={name}>
            <code>{name}</code>: {what}
          </li>
        ))}
      </ul>
      <p>
        It also offers the resources <code>ballmac://catalog</code> and <code>ballmac://items/{"{name}"}</code>, and the
        prompts <code>build_page</code> and <code>choose_component</code>.
      </p>
      <h3>Options</h3>
      <p>Both are environment variables of the server. Neither is needed for the free catalog.</p>
      <ul>
        <li>
          <code>BALLMAC_UI_URL</code> (default <code>https://ui.ballmac.com</code>): the catalog to read, for example a local copy of the
          site.
        </li>
        <li>
          <code>BALLMAC_LICENSE_KEY</code>: your <Link href="/docs/pro">Ballmac UI Pro</Link> licence key. With it, <code>get_item</code> and{" "}
          <code>get_examples</code> also return the source of Pro items. The key is only sent to the Ballmac UI site.
        </li>
      </ul>
      <p>
        <code>npx @ballmac/mcp --help</code> and <code>--version</code> work from a terminal.
      </p>
      <h3>Pro items</h3>
      <p>
        Pro items show up in search with <code>tier: &quot;pro&quot;</code> and install from the <code>@ballmac-pro</code> namespace. Without a key the agent
        still sees their description, props and install command, but not the source. To let it read the source, give the server your key:
      </p>
      <CodePanel lang="bash" title="Claude Code" code="claude mcp add ballmac --env BALLMAC_LICENSE_KEY=your-licence-key -- npx -y @ballmac/mcp" />
      <p>
        In a JSON config, add <code>&quot;env&quot;: {"{"} &quot;BALLMAC_LICENSE_KEY&quot;: &quot;your-licence-key&quot; {"}"}</code> next to <code>args</code>. Your{" "}
        <Link href="/pro">Pro library</Link> shows these commands with your own key filled in.
      </p>
      <h2>Or use the shadcn MCP server</h2>
      <p>Ballmac UI is a standard shadcn registry, so the official server works too once the registry is in your project.</p>
      <h3>1. Add the registry to your project</h3>
      <p>The MCP server reads the registries in <code>components.json</code>:</p>
      <CodePanel lang="bash" code="npx shadcn@latest registry add @ballmac=https://ui.ballmac.com/r/{name}.json" />
      <h3>2. Connect your client</h3>
      <div className="space-y-3">
        {clients.map((c) => (
          <CodePanel key={c.name} lang="bash" code={c.cmd} title={c.name} />
        ))}
      </div>
      <h4>Windsurf and other clients</h4>
      <p>Add the server to your client&apos;s MCP configuration:</p>
      <CodePanel
        lang="json"
        code={`{\n  "mcpServers": {\n    "shadcn": {\n      "command": "npx",\n      "args": ["shadcn@latest", "mcp"]\n    }\n  }\n}`}
      />
      <h2>Things to ask</h2>
      <ul>
        {prompts.map((p) => (
          <li key={p}>&ldquo;{p}&rdquo;</li>
        ))}
      </ul>
      <h2>What the agent sees</h2>
      <p>
        The shadcn MCP server exposes tools to list, search and view registry items, fetch examples, and get the add
        command. Each Ballmac item includes a description written for agents, when to use it and when not to, the items
        it composes with, keyboard notes and working examples, so the agent can pick the right component and wire it up
        correctly.
      </p>
      <h2>Without MCP</h2>
      <p>
        Point any assistant at <a href="/llms.txt">ui.ballmac.com/llms.txt</a>. It lists every component with its purpose
        and install command.
      </p>
    </DocsPage>
  )
}

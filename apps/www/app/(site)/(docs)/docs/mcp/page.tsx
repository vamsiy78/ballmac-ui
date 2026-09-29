import type { Metadata } from "next"

import { CodePanel } from "@/components/site/code-panel"
import { DocsPage } from "@/components/site/docs-page"

export const metadata: Metadata = {
  title: "MCP & AI agents",
  description: "Let Claude Code, Cursor, VS Code, Codex or Windsurf browse, search and install Ballmac UI components through the shadcn MCP server.",
  alternates: { canonical: "/docs/mcp" },
}

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
]

export default function McpPage() {
  return (
    <DocsPage
      title="MCP & AI agents"
      lead="Ballmac UI works with the official shadcn MCP server. Your agent can list, search and read components, see their examples and install them, with no extra accounts or keys."
    >
      <h2>1. Add the registry to your project</h2>
      <p>The MCP server reads the registries in <code>components.json</code>:</p>
      <CodePanel lang="bash" code="npx shadcn@latest registry add @ballmac=https://ui.ballmac.com/r/{name}.json" />
      <h2>2. Connect your client</h2>
      <div className="space-y-3">
        {clients.map((c) => (
          <CodePanel key={c.name} lang="bash" code={c.cmd} title={c.name} />
        ))}
      </div>
      <h3>Windsurf and other clients</h3>
      <p>Add the server to your client&apos;s MCP configuration:</p>
      <CodePanel
        lang="json"
        code={`{\n  "mcpServers": {\n    "shadcn": {\n      "command": "npx",\n      "args": ["shadcn@latest", "mcp"]\n    }\n  }\n}`}
      />
      <h2>3. Ask for components</h2>
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

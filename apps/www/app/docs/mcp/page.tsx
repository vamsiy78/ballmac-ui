import type { Metadata } from "next"

import { CodePanel } from "@/components/site/code-panel"
import { Eyebrow } from "@/components/site/section-heading"

export const metadata: Metadata = {
  title: "MCP",
  description: "Let Claude Code, Cursor, VS Code, Windsurf or Codex browse, search and install Ballmac UI components through the shadcn MCP server.",
  alternates: { canonical: "/docs/mcp" },
}

const clients = [
  { name: "Claude Code", cmd: "npx shadcn@latest mcp init --client claude" },
  { name: "Cursor", cmd: "npx shadcn@latest mcp init --client cursor" },
  { name: "VS Code", cmd: "npx shadcn@latest mcp init --client vscode" },
  { name: "Codex", cmd: "npx shadcn@latest mcp init --client codex" },
]

const prompts = [
  "Show me the Ballmac UI components for AI chat interfaces",
  "Add @ballmac/button and @ballmac/number-ticker, then build a stats section with them",
  "Which Ballmac UI component should I use for a live KPI, and how do I install it?",
]

export default function McpPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6">
      <header className="space-y-4">
        <Eyebrow>Docs</Eyebrow>
        <h1 className="text-4xl font-semibold tracking-[-0.03em]">Use Ballmac UI from your AI agent</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Ballmac UI works with the official shadcn MCP server, so your agent can list, search and view components,
          read their examples, and get the exact install command. No extra accounts or keys.
        </p>
      </header>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">1. Add the registry</h2>
        <CodePanel lang="json" code={`{\n  "registries": {\n    "@ballmac": "https://ui.ballmac.com/r/{name}.json"\n  }\n}`} title="components.json" />
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">2. Connect your client</h2>
        <div className="space-y-3">
          {clients.map((c) => (
            <CodePanel key={c.name} lang="bash" code={c.cmd} title={c.name} />
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">3. Ask for components</h2>
        <ul className="divide-y rounded-xl border">
          {prompts.map((p) => (
            <li key={p} className="px-4 py-3 text-sm">&ldquo;{p}&rdquo;</li>
          ))}
        </ul>
      </section>
    </article>
  )
}

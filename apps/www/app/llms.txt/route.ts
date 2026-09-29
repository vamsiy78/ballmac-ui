import { getComponents, SITE_URL } from "@/lib/registry"

export const dynamic = "force-static"

export function GET() {
  const lines = [
    "# Ballmac UI",
    "",
    "> Mac-grade, accessible React + Tailwind v4 components (macOS interface pieces, backgrounds, text effects, device frames, AI interfaces) in one design language, distributed as a shadcn registry (namespace @ballmac). Install with `npx shadcn@latest add @ballmac/<name>`; files go to components/ballmac.",
    "",
    "## Docs",
    `- [Installation](${SITE_URL}/docs/installation): set up and add components`,
    `- [MCP](${SITE_URL}/docs/mcp): use Ballmac UI from Claude Code, Cursor, VS Code and Codex`,
    `- [Registry index](${SITE_URL}/r/registry.json): every item in shadcn registry format`,
    "",
    "## Components",
    ...getComponents().map((i) => `- [${i.title}](${SITE_URL}/components/${i.name}): ${i.description} Install: @ballmac/${i.name}`),
    "",
  ]
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}

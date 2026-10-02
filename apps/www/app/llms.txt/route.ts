import { PRESETS } from "@ballmac-ui/theme-engine"

import { getComponents, SITE_URL } from "@/lib/registry"

export const dynamic = "force-static"

export function GET() {
  const lines = [
    "# Ballmac UI",
    "",
    "> Polished, accessible React + Tailwind v4 components (desktop-style app surfaces, backgrounds, text effects, device frames, AI interfaces) in one design language, distributed as a shadcn registry (namespace @ballmac). Install with `npx shadcn@latest add @ballmac/<name>`; files go to components/ballmac.",
    "",
    "## Docs",
    `- [Installation](${SITE_URL}/docs/installation): set up and add components`,
    `- [MCP](${SITE_URL}/docs/mcp): use Ballmac UI from Claude Code, Cursor, VS Code and Codex (npx -y @ballmac/mcp)`,
    `- [Registry index](${SITE_URL}/r/registry.json): every item in shadcn registry format`,
    "",
    "## Themes",
    `- [Theme builder](${SITE_URL}/themes): twelve free themes and a live builder with contrast checks`,
    ...PRESETS.map((p) => `- [${p.title}](${SITE_URL}/themes/${p.slug}): ${p.tagline}. Install: @ballmac/theme-${p.slug}`),
    "",
    "## Components",
    ...getComponents().map((i) => `- [${i.title}](${SITE_URL}/components/${i.name}): ${i.description} Install: @ballmac/${i.name}`),
    "",
  ]
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}

import { PRESETS } from "@ballmac-ui/theme-engine"

import { getBlocks, getComponents, getTemplates, isPro, SITE_URL } from "@/lib/registry"

export const dynamic = "force-static"

export function GET() {
  const blocks = getBlocks().filter((i) => !isPro(i))
  const templates = getTemplates().filter((i) => !isPro(i))
  const lines = [
    "# Ballmac UI",
    "",
    "> Accessible React + Tailwind v4 components, blocks, templates and themes with native-app motion (desktop-style app surfaces, backgrounds, text effects, device frames, AI interfaces), in one design language. A shadcn registry (namespace @ballmac) listed in the official shadcn registry directory: install with `npx shadcn@latest add @ballmac/<name>`, no registry setup needed. Files go to components/ballmac and you own the code. Free and MIT licensed; Ballmac UI Pro adds premium blocks and starter apps.",
    "",
    "## Docs",
    `- [Installation](${SITE_URL}/docs/installation): add components by name; a registry entry is only for older CLIs`,
    `- [MCP](${SITE_URL}/docs/mcp): use Ballmac UI from Claude Code, Cursor, VS Code and Codex (npx -y @ballmac/mcp)`,
    `- [Updates and tests](${SITE_URL}/docs/cli): npx @ballmac/cli keeps installed components up to date without losing your edits (three-way merge) and installs the tests that ship with them`,
    `- [Quality check](${SITE_URL}/docs/check): npx @ballmac/cli check audits your app for missing states, accessibility gaps, hard-coded colors and layout problems; the MCP tool audit_project does the same for agents`,
    `- [Quality, measured](${SITE_URL}/quality): every item loaded in a real browser in light, dark, phone width, reduced motion and right to left; results published including failures`,
    `- [CLI and registry](${SITE_URL}/docs/registry): namespaces, direct URLs, search, view and update`,
    `- [Motion](${SITE_URL}/docs/motion): speed, bounce, travel, hover and stagger as theme tokens that Tailwind's duration and ease classes and every component follow; five feels (@ballmac/motion-native, -calm, -snappy, -playful, -still); reduced-motion fallback`,
    `- [States](${SITE_URL}/docs/states): every data block takes state ("loading" | "ready" | "empty" | "error") with onRetry, emptyState and errorState, and every form block can show submitting, success and error; useResource and stateOf map fetches and TanStack Query or SWR onto it; StateView for your own views`,
    `- [Platform feels](${SITE_URL}/docs/feels): one switch makes every component handle like macOS, iOS or Windows (sizes, corners, focus ring, shadows, menus, sidebars, window chrome); @ballmac/feel-macos, -ios, -windows, -web and -auto (device detection before first paint); app-window for Tauri and Electron apps`,
    `- [Right-to-left](${SITE_URL}/docs/rtl): every component mirrors for Arabic, Hebrew, Persian and Urdu`,
    `- [Translations](${SITE_URL}/docs/i18n): translate all built-in strings with one provider; keys at ${SITE_URL}/i18n/en.json`,
    `- [Your own images](${SITE_URL}/docs/images): pass media/image props to heroes, cards and templates; alt text, aspect ratios, lazy loading, dark variants`,
    `- [Registry index](${SITE_URL}/r/registry.json): every free item in shadcn registry format`,
    `- [JSON API](${SITE_URL}/api/v1/index.json): every item with its description, when to use it and install command`,
    "",
    "## Pro",
    `- [Pricing](${SITE_URL}/pricing): free versus Pro`,
    `- [Pro setup](${SITE_URL}/docs/pro): Pro blocks and starter apps install through the private @ballmac-pro registry with a licence key`,
    "",
    "## Themes",
    `- [Theme builder](${SITE_URL}/themes): twelve free themes and a live builder with contrast checks and a motion lab`,
    ...PRESETS.map((p) => `- [${p.title}](${SITE_URL}/themes/${p.slug}): ${p.tagline}. Install: @ballmac/theme-${p.slug}`),
    "",
    "## Templates",
    ...templates.map((i) => `- [${i.title}](${SITE_URL}/templates/${i.name}): ${i.description} Install: @ballmac/${i.name}`),
    "",
    "## Blocks",
    ...blocks.map((i) => `- [${i.title}](${SITE_URL}/blocks/${i.name}): ${i.description} Install: @ballmac/${i.name}`),
    "",
    "## Components",
    ...getComponents().map((i) => `- [${i.title}](${SITE_URL}/components/${i.name}): ${i.description} Install: @ballmac/${i.name}`),
    "",
  ]
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}

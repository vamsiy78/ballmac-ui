import { PRESETS, SYSTEMS } from "@ballmac-ui/theme-engine"

import { mdHref, orderedDocs } from "@/lib/docs"
import { useCases } from "@/lib/use-cases"
import { getBlocks, getComponents, getTemplates, isPro, SITE_URL } from "@/lib/registry"

export const dynamic = "force-static"

export function GET() {
  const blocks = getBlocks().filter((i) => !isPro(i))
  const templates = getTemplates().filter((i) => !isPro(i))
  const docs = orderedDocs()
  const lines = [
    "# Ballmac UI",
    "",
    "> Accessible React + Tailwind v4 components, blocks, templates and themes with native-app motion (desktop-style app surfaces, backgrounds, text effects, device frames, AI interfaces), in one design language. A shadcn registry (namespace @ballmac) listed in the official shadcn registry directory: install with `npx shadcn@latest add @ballmac/<name>`, no registry setup needed. Files go to components/ballmac and you own the code. Free and MIT licensed; Ballmac UI Pro adds premium blocks and starter apps. Documentation is organised as get started (tutorials), guides (how-to), reference and concepts.",
    "",
    "## Docs",
    `- [Full documentation in one file](${SITE_URL}/llms-full.txt): every docs page below as Markdown`,
    ...docs.map((p) => `- [${p.data.title}](${SITE_URL}${p.url}): ${p.data.description ?? ""} Markdown: ${SITE_URL}${mdHref(p)}`),
    `- [Quality, measured](${SITE_URL}/quality): every item loaded in a real browser in light, dark, phone width, reduced motion and right to left; results published including failures`,
    `- [Platform feels showcase](${SITE_URL}/feels): one app in macOS, iOS, Windows and web feels, live`,
    `- [Changelog](${SITE_URL}/changelog): what is new, newest first. Feeds: ${SITE_URL}/changelog/rss.xml and ${SITE_URL}/changelog/atom.xml`,
    `- [Registry index](${SITE_URL}/r/registry.json): every free item in shadcn registry format`,
    `- [JSON API](${SITE_URL}/api/v1/index.json): every item with its description, when to use it and install command`,
    "",
    "## Use cases",
    ...useCases.map((u) => `- [${u.name}](${SITE_URL}/use-cases/${u.slug}): ${u.description}`),
    "",
    "## Pro",
    `- [Pricing](${SITE_URL}/pricing): free versus Pro`,
    `- [Pro setup](${SITE_URL}/docs/guides/pro): Pro blocks and starter apps install through the private @ballmac-pro registry with a licence key`,
    "",
    "## Presets",
    `- [Presets](${SITE_URL}/presets): ${SYSTEMS.length} complete design systems (colour, shape, typeface, platform feel, motion). Install one with the shadcn CLI, or make your own at ${SITE_URL}/themes and install it by its 16-character code: npx shadcn@latest add @ballmac/preset-<code>`,
    ...SYSTEMS.map((p) => `- [${p.title}](${SITE_URL}/presets/${p.slug}): ${p.tagline}. Install: @ballmac/preset-${p.slug}`),
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

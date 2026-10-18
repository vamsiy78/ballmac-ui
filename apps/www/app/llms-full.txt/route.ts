import { docMarkdown, orderedDocs } from "@/lib/docs"
import { SITE_URL } from "@/lib/site-url"

export const dynamic = "force-static"

/** All the documentation as one Markdown file, for assistants that read a whole site at once. Built from the same files as the pages, so they cannot disagree. */
export function GET() {
  const parts = orderedDocs().map((p) => `<!-- Source: ${SITE_URL}${p.url} -->\n\n${docMarkdown(p).trimEnd()}`)
  const text = `# Ballmac UI documentation\n\n> The full documentation of Ballmac UI (${SITE_URL}/docs) as Markdown. The index of everything else, including every component, block and template, is at ${SITE_URL}/llms.txt.\n\n${parts.join("\n\n---\n\n")}\n`
  return new Response(text, { headers: { "Content-Type": "text/markdown; charset=utf-8" } })
}

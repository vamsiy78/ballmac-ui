import { docMarkdown } from "@/lib/docs"
import { source } from "@/lib/docs-source"

export const dynamic = "force-static"
export const dynamicParams = false

/** Every docs page as Markdown at /md/docs/<page>.md, for agents and the Copy page button. */
export function generateStaticParams() {
  return source.getPages().map((p) => ({ slug: [...(p.slugs.length ? p.slugs : ["index"]).slice(0, -1), `${p.slugs.at(-1) ?? "index"}.md`] }))
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const parts = (await params).slug
  const last = parts.at(-1)!.replace(/\.md$/, "")
  const slugs = [...parts.slice(0, -1), last].filter((s) => s !== "index" || parts.length > 1)
  const page = source.getPage(slugs)
  if (!page) return new Response("Not found", { status: 404 })
  return new Response(docMarkdown(page), { headers: { "Content-Type": "text/markdown; charset=utf-8" } })
}

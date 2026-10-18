import { sectionOf } from "@/lib/docs"
import { source } from "@/lib/docs-source"
import { ogImage } from "@/lib/og"

// The share image of a docs page, at /og/docs/<section>/<page>.png, made when the site is built (the Cloudflare build is static). The file convention
// (opengraph-image) cannot be used here because the docs route ends in an optional catch-all.
export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return source.getPages().filter((p) => p.slugs.length === 2).map((p) => ({ section: p.slugs[0]!, page: `${p.slugs[1]}.png` }))
}

export async function GET(_req: Request, { params }: { params: Promise<{ section: string; page: string }> }) {
  const { section, page } = await params
  const doc = source.getPage([section, page.replace(/\.png$/, "")])
  return ogImage({
    eyebrow: doc ? `Docs${sectionOf(doc) ? ` · ${sectionOf(doc)!.title}` : ""}` : "Docs",
    title: doc?.data.title ?? "Ballmac UI documentation",
    subtitle: doc?.data.description,
  })
}

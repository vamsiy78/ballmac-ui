import { dateLabel, getChangelog, getEntry } from "@/lib/changelog"
import { ogImage, ogSize } from "@/lib/og"

export const size = ogSize
export const contentType = "image/png"
export const alt = "Ballmac UI changelog"

// One share image per entry, made when the site is built (the Cloudflare build is static).
export const dynamic = "force-static"
export const dynamicParams = false
export function generateStaticParams() {
  return getChangelog().map((e) => ({ slug: e.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const entry = getEntry((await params).slug)
  return ogImage({
    eyebrow: entry ? `Changelog · ${dateLabel(entry.date)}` : "Changelog",
    title: entry?.title ?? "What's new in Ballmac UI",
    subtitle: entry?.summary,
  })
}

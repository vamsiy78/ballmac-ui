import { ogImage, ogItemImage, ogSize } from "@/lib/og"
import { getBlocks, getItem, namespaceOf } from "@/lib/registry"

export const size = ogSize
export const contentType = "image/png"
export const alt = "Ballmac UI"

// One image per item, made when the site is built (the Cloudflare build is static).
export const dynamic = "force-static"
export const dynamicParams = false
export function generateStaticParams() {
  return getBlocks().map((i) => ({ slug: i.name }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const item = getItem((await params).slug)
  if (!item) return ogImage({ eyebrow: "block", title: "Ballmac UI" })
  return ogItemImage({
    kind: "block",
    name: item.name,
    title: item.title,
    subtitle: item.description,
    command: `npx shadcn add ${namespaceOf(item.name)}/${item.name}`,
    pro: item.tier === "pro",
  })
}

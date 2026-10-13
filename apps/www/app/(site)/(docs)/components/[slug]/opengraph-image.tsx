import { ogImage, ogSize } from "@/lib/og"
import { getComponents, getItem, namespaceOf } from "@/lib/registry"

export const size = ogSize
export const contentType = "image/png"
export const alt = "Ballmac UI"

// One image per item, made when the site is built (the Cloudflare build is static).
export const dynamic = "force-static"
export const dynamicParams = false
export function generateStaticParams() {
  return getComponents().map((i) => ({ slug: i.name }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const item = getItem((await params).slug)
  return ogImage({
    eyebrow: "components".replace(/s$/, ""),
    title: item?.title ?? "Ballmac UI",
    subtitle: item?.description,
    command: item ? `npx shadcn add ${namespaceOf(item.name)}/${item.name}` : undefined,
  })
}

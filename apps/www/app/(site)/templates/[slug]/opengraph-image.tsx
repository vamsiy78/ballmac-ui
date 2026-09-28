import { ogImage, ogSize } from "@/lib/og"
import { getItem } from "@/lib/registry"

export const size = ogSize
export const contentType = "image/png"
export const alt = "Ballmac UI"

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const item = getItem((await params).slug)
  return ogImage({
    eyebrow: "templates".replace(/s$/, ""),
    title: item?.title ?? "Ballmac UI",
    subtitle: item?.description,
    command: item ? `npx shadcn add @ballmac/${item.name}` : undefined,
  })
}

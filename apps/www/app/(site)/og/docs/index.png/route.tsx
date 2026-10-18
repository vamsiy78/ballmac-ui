import { source } from "@/lib/docs-source"
import { ogImage } from "@/lib/og"

export const dynamic = "force-static"

export function GET() {
  const home = source.getPage([])
  return ogImage({ eyebrow: "Docs", title: home?.data.title ?? "Ballmac UI documentation", subtitle: home?.data.description })
}

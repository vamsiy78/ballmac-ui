import type { Metadata } from "next"
import { AffiliateDashboard } from "@/components/affiliates/affiliate-dashboard"
import { getItem, itemHref } from "@/lib/registry"
import { thumbFor } from "@/lib/thumbs"
export const metadata: Metadata = {
  title: "Partner dashboard",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
}
export default function PartnerDashboardPage() {
  const names = ["dashboard-pro-1", "billing-pro-1", "settings-pro-1"]
  const resources = names
    .map((name) => getItem(name))
    .filter((b) => b !== undefined)
    .flatMap((b) => {
      const thumb = thumbFor(b.name, "pro")
      return thumb ? [{ name: b.name, title: b.title, href: itemHref(b), image: `${thumb}.light.webp` }] : []
    })
  return <AffiliateDashboard resources={resources} />
}

import type { Metadata } from "next"
import { AffiliateAdmin } from "@/components/affiliates/affiliate-admin"

export const metadata: Metadata = {
  title: "Partner program administration",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
}
export default function PartnerAdminPage() {
  return <AffiliateAdmin />
}

import type { Metadata } from "next"
import { Suspense } from "react"

import { ProLogin } from "@/components/pro/pro-hub"

export const metadata: Metadata = {
  title: "Log in to Ballmac UI Pro",
  description: "Paste your licence key to open your Ballmac UI Pro library: read and copy every Pro block, download the starter apps and get install commands with your key filled in.",
  alternates: { canonical: "/pro/login" },
  // A login page: useful to buyers, not something to rank.
  robots: { index: false, follow: true },
}

const portalUrl = process.env.NEXT_PUBLIC_PRO_PORTAL_URL || undefined

export default function ProLoginPage() {
  return (
    <Suspense fallback={null}>
      <ProLogin portalUrl={portalUrl} />
    </Suspense>
  )
}

// Ballmac UI: Orbit template route. https://ui.ballmac.com/templates/template-orbit
import type { Metadata } from "next"

import { OrbitPricing } from "@/components/ballmac/templates/orbit/orbit-pricing"

export const metadata: Metadata = {
  title: "Orbit pricing",
  description: "Pay for runs, not for hope. Start free and grow into seats and volume.",
}

export default function Page() {
  return <OrbitPricing />
}

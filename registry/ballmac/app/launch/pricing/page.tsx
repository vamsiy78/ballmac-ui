// Ballmac UI: Launch template route. https://ui.ballmac.com/templates/template-launch
import type { Metadata } from "next"

import { LaunchPricing } from "@/components/ballmac/templates/launch/launch-pricing"

export const metadata: Metadata = {
  title: "Pricing · Beacon",
  description: "Start free. Upgrade when your team grows.",
}

export default function Page() {
  return <LaunchPricing />
}

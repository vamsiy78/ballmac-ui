// Ballmac UI: Launch template page. https://ui.ballmac.com/templates/template-launch
import type { Metadata } from "next"

import { LaunchPage } from "@/components/ballmac/templates/launch/launch-page"

export const metadata: Metadata = {
  title: "Acme: Ship with confidence",
  description: "Deploy previews, performance budgets and one-click rollbacks for every branch.",
}

export default function Page() {
  return <LaunchPage />
}

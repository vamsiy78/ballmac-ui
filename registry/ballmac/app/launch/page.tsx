// Ballmac UI: Launch template route. https://ui.ballmac.com/templates/template-launch
import type { Metadata } from "next"

import { LaunchPage } from "@/components/ballmac/templates/launch/launch-page"

export const metadata: Metadata = {
  title: "Beacon: ship every branch with nothing to fear",
  description: "Preview URLs, performance budgets and one-click rollbacks for every pull request.",
}

export default function Page() {
  return <LaunchPage />
}

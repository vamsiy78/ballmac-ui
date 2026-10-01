// Ballmac UI: Orbit template route. https://ui.ballmac.com/templates/template-orbit
import type { Metadata } from "next"

import { OrbitChangelog } from "@/components/ballmac/templates/orbit/orbit-changelog"

export const metadata: Metadata = {
  title: "Orbit changelog",
  description: "Everything we shipped, month by month.",
}

export default function Page() {
  return <OrbitChangelog />
}

// Ballmac UI: Pocket template route. https://ui.ballmac.com/templates/template-pocket
import type { Metadata } from "next"

import { PocketFeatures } from "@/components/ballmac/templates/pocket/pocket-features"

export const metadata: Metadata = {
  title: "Features · Pocket",
  description: "Freeze a card, tune round-ups, split a bill and convert money, live.",
}

export default function Page() {
  return <PocketFeatures />
}

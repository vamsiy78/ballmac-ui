// Ballmac UI: Pocket template route. https://ui.ballmac.com/templates/template-pocket
import type { Metadata } from "next"

import { PocketHome } from "@/components/ballmac/templates/pocket/pocket-home"

export const metadata: Metadata = {
  title: "Pocket: money that keeps up",
  description: "One app for spending, saving and splitting. No fees to open or to leave.",
}

export default function Page() {
  return <PocketHome />
}

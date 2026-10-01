// Ballmac UI: Pocket template route. https://ui.ballmac.com/templates/template-pocket
import type { Metadata } from "next"

import { PocketSecurity } from "@/components/ballmac/templates/pocket/pocket-security"

export const metadata: Metadata = {
  title: "Security · Pocket",
  description: "How Pocket keeps your money safe, and what happens if you lose your phone.",
}

export default function Page() {
  return <PocketSecurity />
}

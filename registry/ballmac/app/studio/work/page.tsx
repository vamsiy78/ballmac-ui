// Ballmac UI: Studio template route. https://ui.ballmac.com/templates/template-studio
import type { Metadata } from "next"

import { StudioWork } from "@/components/ballmac/templates/studio/studio-work"

export const metadata: Metadata = {
  title: "Work · Hollis & Vane",
  description: "Identities, websites and campaigns.",
}

export default function Page() {
  return <StudioWork />
}

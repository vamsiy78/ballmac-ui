// Ballmac UI: Studio template route. https://ui.ballmac.com/templates/template-studio
import type { Metadata } from "next"

import { StudioContact } from "@/components/ballmac/templates/studio/studio-contact"

export const metadata: Metadata = {
  title: "Contact · Hollis & Vane",
  description: "Send us a brief. We reply within two working days.",
}

export default function Page() {
  return <StudioContact />
}

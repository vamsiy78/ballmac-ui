// Ballmac UI: Studio template route. https://ui.ballmac.com/templates/template-studio
import type { Metadata } from "next"

import { StudioHome } from "@/components/ballmac/templates/studio/studio-home"

export const metadata: Metadata = {
  title: "Hollis & Vane: brands that move people",
  description: "An independent branding and digital studio in Lisbon and Berlin.",
}

export default function Page() {
  return <StudioHome />
}

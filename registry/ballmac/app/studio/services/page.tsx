// Ballmac UI: Studio template route. https://ui.ballmac.com/templates/template-studio
import type { Metadata } from "next"

import { StudioServices } from "@/components/ballmac/templates/studio/studio-services"

export const metadata: Metadata = {
  title: "Services · Hollis & Vane",
  description: "Brand identity, digital design, campaigns and a retained studio.",
}

export default function Page() {
  return <StudioServices />
}

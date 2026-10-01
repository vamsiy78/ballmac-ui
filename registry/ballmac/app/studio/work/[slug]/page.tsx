// Ballmac UI: Studio template route. https://ui.ballmac.com/templates/template-studio
import type { Metadata } from "next"

import { StudioProject } from "@/components/ballmac/templates/studio/studio-project"

export const metadata: Metadata = {
  title: "North Coast Rail · Hollis & Vane",
  description: "A railway identity that moves.",
}

// One layout for every project. Load the project by params.slug from your data when you add more.
export default function Page() {
  return <StudioProject />
}

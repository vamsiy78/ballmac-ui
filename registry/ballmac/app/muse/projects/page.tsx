// Ballmac UI: Muse template route. https://ui.ballmac.com/templates/template-muse
import type { Metadata } from "next"

import { MuseProjects } from "@/components/ballmac/templates/muse/muse-projects"

export const metadata: Metadata = {
  title: "Projects · Muse",
  description: "Instructions, files and chats for each project.",
}

export default function Page() {
  return <MuseProjects />
}

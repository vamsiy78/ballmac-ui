// Ballmac UI: Muse template route. https://ui.ballmac.com/templates/template-muse
import type { Metadata } from "next"

import { MuseChat } from "@/components/ballmac/templates/muse/muse-chat"

export const metadata: Metadata = {
  title: "Muse",
  description: "A calm place to think with an AI.",
}

export default function Page() {
  return <MuseChat start="conversation" />
}

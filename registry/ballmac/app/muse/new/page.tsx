// Ballmac UI: Muse template route. https://ui.ballmac.com/templates/template-muse
import type { Metadata } from "next"

import { MuseChat } from "@/components/ballmac/templates/muse/muse-chat"

export const metadata: Metadata = {
  title: "New chat · Muse",
  description: "Start a new conversation.",
}

export default function Page() {
  return <MuseChat start="empty" />
}

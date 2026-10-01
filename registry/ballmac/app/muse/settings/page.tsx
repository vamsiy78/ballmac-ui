// Ballmac UI: Muse template route. https://ui.ballmac.com/templates/template-muse
import type { Metadata } from "next"

import { MuseSettings } from "@/components/ballmac/templates/muse/muse-settings"

export const metadata: Metadata = {
  title: "Settings · Muse",
  description: "Reading, models, memory and data.",
}

export default function Page() {
  return <MuseSettings />
}

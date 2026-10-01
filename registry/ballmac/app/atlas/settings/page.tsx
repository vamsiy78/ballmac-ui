// Ballmac UI: Atlas template route. https://ui.ballmac.com/templates/template-atlas
import type { Metadata } from "next"

import { AtlasSettings } from "@/components/ballmac/templates/atlas/atlas-settings"

export const metadata: Metadata = {
  title: "Settings · Atlas",
  description: "Store profile, shipping and notifications.",
}

export default function Page() {
  return <AtlasSettings />
}

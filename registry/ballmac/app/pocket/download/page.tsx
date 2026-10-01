// Ballmac UI: Pocket template route. https://ui.ballmac.com/templates/template-pocket
import type { Metadata } from "next"

import { PocketDownload } from "@/components/ballmac/templates/pocket/pocket-download"

export const metadata: Metadata = {
  title: "Download · Pocket",
  description: "Free on iPhone and Android.",
}

export default function Page() {
  return <PocketDownload />
}

// Ballmac UI: Muse template route. https://ui.ballmac.com/templates/template-muse
import type { Metadata } from "next"

import { MuseLibrary } from "@/components/ballmac/templates/muse/muse-library"

export const metadata: Metadata = {
  title: "Library · Muse",
  description: "Everything Muse has made for you.",
}

export default function Page() {
  return <MuseLibrary />
}

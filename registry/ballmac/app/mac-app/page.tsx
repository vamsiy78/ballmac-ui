// Ballmac UI: Mac app template page. https://ui.ballmac.com/templates/template-mac-app
import type { Metadata } from "next"

import { MacAppPage } from "@/components/ballmac/templates/mac-app/mac-app-page"

export const metadata: Metadata = {
  title: "Acme Tasks: your day, planned in one calm place",
  description: "A fast, native to-do app for the Mac with a menu bar companion, iCloud sync and no account.",
}

export default function Page() {
  return <MacAppPage />
}

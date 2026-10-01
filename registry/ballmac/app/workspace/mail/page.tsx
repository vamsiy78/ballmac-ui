// Ballmac UI: Workspace template route. https://ui.ballmac.com/templates/template-workspace
import type { Metadata } from "next"

import { WorkspaceMail } from "@/components/ballmac/templates/workspace/workspace-mail"

export const metadata: Metadata = {
  title: "Mail · Parcel",
  description: "A fast three-pane inbox.",
}

export default function Page() {
  return <WorkspaceMail />
}

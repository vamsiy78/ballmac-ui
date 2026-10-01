// Ballmac UI: Workspace template route. https://ui.ballmac.com/templates/template-workspace
import type { Metadata } from "next"

import { WorkspaceToday } from "@/components/ballmac/templates/workspace/workspace-today"

export const metadata: Metadata = {
  title: "Parcel",
  description: "Mail, calendar and tasks in one calm place.",
}

export default function Page() {
  return <WorkspaceToday />
}

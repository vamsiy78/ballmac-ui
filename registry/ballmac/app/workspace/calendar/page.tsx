// Ballmac UI: Workspace template route. https://ui.ballmac.com/templates/template-workspace
import type { Metadata } from "next"

import { WorkspaceCalendar } from "@/components/ballmac/templates/workspace/workspace-calendar"

export const metadata: Metadata = {
  title: "Calendar · Parcel",
  description: "Your week at a glance.",
}

export default function Page() {
  return <WorkspaceCalendar />
}

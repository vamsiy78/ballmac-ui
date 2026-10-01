// Ballmac UI: Workspace template route. https://ui.ballmac.com/templates/template-workspace
import type { Metadata } from "next"

import { WorkspaceBoard } from "@/components/ballmac/templates/workspace/workspace-board"

export const metadata: Metadata = {
  title: "Board · Parcel",
  description: "Tasks on a board you can drag.",
}

export default function Page() {
  return <WorkspaceBoard />
}

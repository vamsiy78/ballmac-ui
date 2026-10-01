// Ballmac UI: Workspace template route. https://ui.ballmac.com/templates/template-workspace
import type { Metadata } from "next"

import { WorkspaceSettings } from "@/components/ballmac/templates/workspace/workspace-settings"

export const metadata: Metadata = {
  title: "Settings · Parcel",
  description: "Profile and preferences.",
}

export default function Page() {
  return <WorkspaceSettings />
}

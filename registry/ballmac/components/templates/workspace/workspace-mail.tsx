// Ballmac UI: Parcel mail page. https://ui.ballmac.com/templates/template-workspace
import * as React from "react"

import { Mail1 } from "@/components/ballmac/blocks/mail-1/mail-1"
import { WorkspaceShell, type WorkspaceHrefs } from "@/components/ballmac/templates/workspace/workspace-theme"

type WorkspaceMailProps = React.ComponentProps<"div"> & { hrefs?: Partial<WorkspaceHrefs> }

/** Parcel mail: the three-pane inbox with search, compose and keyboard shortcuts, filling the window. */
function WorkspaceMail({ hrefs, ...props }: WorkspaceMailProps) {
  return (
    <WorkspaceShell page="mail" hrefs={hrefs} fill {...props}>
      <Mail1 height="100%" className="rounded-none border-0" />
    </WorkspaceShell>
  )
}

export { WorkspaceMail, type WorkspaceMailProps }

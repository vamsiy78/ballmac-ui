// Ballmac UI: Parcel board page. https://ui.ballmac.com/templates/template-workspace
import * as React from "react"

import { Kanban1 } from "@/components/ballmac/blocks/kanban-1/kanban-1"
import { WorkspaceShell, type WorkspaceHrefs } from "@/components/ballmac/templates/workspace/workspace-theme"

type WorkspaceBoardProps = React.ComponentProps<"div"> & { hrefs?: Partial<WorkspaceHrefs> }

/** Parcel board: drag cards between columns, move with the keyboard, add and filter by person. */
function WorkspaceBoard({ hrefs, ...props }: WorkspaceBoardProps) {
  return (
    <WorkspaceShell page="board" hrefs={hrefs} {...props}>
      <Kanban1 title="Q4 launch" description="Drag cards between columns, or use the Move to menu on any card." height="calc(100dvh - 15rem)" />
    </WorkspaceShell>
  )
}

export { WorkspaceBoard, type WorkspaceBoardProps }

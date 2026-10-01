// Ballmac UI: Parcel calendar page. https://ui.ballmac.com/templates/template-workspace
import * as React from "react"

import { Calendar1 } from "@/components/ballmac/blocks/calendar-1/calendar-1"
import { WorkspaceShell, type WorkspaceHrefs } from "@/components/ballmac/templates/workspace/workspace-theme"

type WorkspaceCalendarProps = React.ComponentProps<"div"> & { hrefs?: Partial<WorkspaceHrefs> }

/** Parcel calendar: the week view with overlapping events, a now line and a new-event dialog, filling the window. */
function WorkspaceCalendar({ hrefs, ...props }: WorkspaceCalendarProps) {
  return (
    <WorkspaceShell page="calendar" hrefs={hrefs} fill {...props}>
      <Calendar1 height="100%" today="2026-10-01" now="09:41" className="rounded-none border-0" />
    </WorkspaceShell>
  )
}

export { WorkspaceCalendar, type WorkspaceCalendarProps }

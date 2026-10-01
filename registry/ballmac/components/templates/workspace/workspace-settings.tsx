// Ballmac UI: Parcel settings page. https://ui.ballmac.com/templates/template-workspace
import * as React from "react"

import { Settings1 } from "@/components/ballmac/blocks/settings-1/settings-1"
import { WorkspaceShell, type WorkspaceHrefs } from "@/components/ballmac/templates/workspace/workspace-theme"

type WorkspaceSettingsProps = React.ComponentProps<"div"> & { hrefs?: Partial<WorkspaceHrefs> }

/** Parcel settings: profile, preferences and account actions with a save bar that appears only when something changed. */
function WorkspaceSettings({ hrefs, ...props }: WorkspaceSettingsProps) {
  return (
    <WorkspaceShell page="settings" hrefs={hrefs} {...props}>
      <Settings1 title="Your account" description="Manage your profile and how Parcel works for you." />
    </WorkspaceShell>
  )
}

export { WorkspaceSettings, type WorkspaceSettingsProps }

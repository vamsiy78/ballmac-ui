import { WorkspaceSettings } from "@/components/ballmac/templates/workspace/workspace-settings"

export default function TemplateWorkspaceSettings() {
  return (
    <WorkspaceSettings
      hrefs={{ today: "/preview/template-workspace-demo", mail: "/preview/template-workspace-mail", calendar: "/preview/template-workspace-calendar", board: "/preview/template-workspace-board", settings: "/preview/template-workspace-settings" }}
    />
  )
}

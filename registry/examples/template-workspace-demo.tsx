import { WorkspaceToday } from "@/components/ballmac/templates/workspace/workspace-today"

export default function TemplateWorkspaceDemo() {
  return (
    <WorkspaceToday
      hrefs={{ today: "/preview/template-workspace-demo", mail: "/preview/template-workspace-mail", calendar: "/preview/template-workspace-calendar", board: "/preview/template-workspace-board", settings: "/preview/template-workspace-settings" }}
    />
  )
}

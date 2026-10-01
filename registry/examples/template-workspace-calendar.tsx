import { WorkspaceCalendar } from "@/components/ballmac/templates/workspace/workspace-calendar"

export default function TemplateWorkspaceCalendar() {
  return (
    <WorkspaceCalendar
      hrefs={{ today: "/preview/template-workspace-demo", mail: "/preview/template-workspace-mail", calendar: "/preview/template-workspace-calendar", board: "/preview/template-workspace-board", settings: "/preview/template-workspace-settings" }}
    />
  )
}

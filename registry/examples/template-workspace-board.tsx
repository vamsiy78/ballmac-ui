import { WorkspaceBoard } from "@/components/ballmac/templates/workspace/workspace-board"

export default function TemplateWorkspaceBoard() {
  return (
    <WorkspaceBoard
      hrefs={{ today: "/preview/template-workspace-demo", mail: "/preview/template-workspace-mail", calendar: "/preview/template-workspace-calendar", board: "/preview/template-workspace-board", settings: "/preview/template-workspace-settings" }}
    />
  )
}

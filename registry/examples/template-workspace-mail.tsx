import { WorkspaceMail } from "@/components/ballmac/templates/workspace/workspace-mail"

export default function TemplateWorkspaceMail() {
  return (
    <WorkspaceMail
      hrefs={{ today: "/preview/template-workspace-demo", mail: "/preview/template-workspace-mail", calendar: "/preview/template-workspace-calendar", board: "/preview/template-workspace-board", settings: "/preview/template-workspace-settings" }}
    />
  )
}

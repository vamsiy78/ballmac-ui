import { MuseProjects } from "@/components/ballmac/templates/muse/muse-projects"

export default function TemplateMuseProjects() {
  return (
    <MuseProjects
      hrefs={{ chat: "/preview/template-muse-demo", new: "/preview/template-muse-new", projects: "/preview/template-muse-projects", library: "/preview/template-muse-library", settings: "/preview/template-muse-settings" }}
    />
  )
}

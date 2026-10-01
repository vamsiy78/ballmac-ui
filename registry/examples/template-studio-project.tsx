import { StudioProject } from "@/components/ballmac/templates/studio/studio-project"

export default function TemplateStudioProject() {
  return (
    <StudioProject
      hrefs={{ home: "/preview/template-studio-demo", work: "/preview/template-studio-work", project: "/preview/template-studio-project", services: "/preview/template-studio-services", contact: "/preview/template-studio-contact" }}
    />
  )
}

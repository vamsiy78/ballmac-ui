import { MuseLibrary } from "@/components/ballmac/templates/muse/muse-library"

export default function TemplateMuseLibrary() {
  return (
    <MuseLibrary
      hrefs={{ chat: "/preview/template-muse-demo", new: "/preview/template-muse-new", projects: "/preview/template-muse-projects", library: "/preview/template-muse-library", settings: "/preview/template-muse-settings" }}
    />
  )
}

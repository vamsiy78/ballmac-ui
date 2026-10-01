import { MuseSettings } from "@/components/ballmac/templates/muse/muse-settings"

export default function TemplateMuseSettings() {
  return (
    <MuseSettings
      hrefs={{ chat: "/preview/template-muse-demo", new: "/preview/template-muse-new", projects: "/preview/template-muse-projects", library: "/preview/template-muse-library", settings: "/preview/template-muse-settings" }}
    />
  )
}

import { MuseChat } from "@/components/ballmac/templates/muse/muse-chat"

export default function TemplateMuseDemo() {
  return (
    <MuseChat start="conversation"
      hrefs={{ chat: "/preview/template-muse-demo", new: "/preview/template-muse-new", projects: "/preview/template-muse-projects", library: "/preview/template-muse-library", settings: "/preview/template-muse-settings" }}
    />
  )
}

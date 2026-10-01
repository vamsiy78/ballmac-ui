import { PublicationHome } from "@/components/ballmac/templates/publication/publication-home"

export default function TemplatePublicationDemo() {
  return (
    <PublicationHome
      hrefs={{ home: "/preview/template-publication-demo", article: "/preview/template-publication-article", section: "/preview/template-publication-section", author: "/preview/template-publication-author", issues: "/preview/template-publication-issues" }}
    />
  )
}

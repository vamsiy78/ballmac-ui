import { PublicationSection } from "@/components/ballmac/templates/publication/publication-section"

export default function TemplatePublicationSection() {
  return (
    <PublicationSection
      hrefs={{ home: "/preview/template-publication-demo", article: "/preview/template-publication-article", section: "/preview/template-publication-section", author: "/preview/template-publication-author", issues: "/preview/template-publication-issues" }}
    />
  )
}

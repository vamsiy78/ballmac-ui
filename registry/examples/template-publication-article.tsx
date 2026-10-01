import { PublicationArticle } from "@/components/ballmac/templates/publication/publication-article"

export default function TemplatePublicationArticle() {
  return (
    <PublicationArticle
      hrefs={{ home: "/preview/template-publication-demo", article: "/preview/template-publication-article", section: "/preview/template-publication-section", author: "/preview/template-publication-author", issues: "/preview/template-publication-issues" }}
    />
  )
}

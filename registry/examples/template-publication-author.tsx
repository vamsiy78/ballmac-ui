import { PublicationAuthor } from "@/components/ballmac/templates/publication/publication-author"

export default function TemplatePublicationAuthor() {
  return (
    <PublicationAuthor
      hrefs={{ home: "/preview/template-publication-demo", article: "/preview/template-publication-article", section: "/preview/template-publication-section", author: "/preview/template-publication-author", issues: "/preview/template-publication-issues" }}
    />
  )
}

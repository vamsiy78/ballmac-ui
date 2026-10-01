import { PublicationIssues } from "@/components/ballmac/templates/publication/publication-issues"

export default function TemplatePublicationIssues() {
  return (
    <PublicationIssues
      hrefs={{ home: "/preview/template-publication-demo", article: "/preview/template-publication-article", section: "/preview/template-publication-section", author: "/preview/template-publication-author", issues: "/preview/template-publication-issues" }}
    />
  )
}

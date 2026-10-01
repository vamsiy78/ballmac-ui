import { DocsGuide } from "@/components/ballmac/templates/docs/docs-guide"

export default function TemplateDocsGuide() {
  return (
    <DocsGuide
      hrefs={{ home: "/preview/template-docs-demo", guide: "/preview/template-docs-guide", reference: "/preview/template-docs-reference", search: "/preview/template-docs-search", changelog: "/preview/template-docs-changelog" }}
    />
  )
}

import { DocsSearch } from "@/components/ballmac/templates/docs/docs-search"

export default function TemplateDocsSearch() {
  return (
    <DocsSearch
      hrefs={{ home: "/preview/template-docs-demo", guide: "/preview/template-docs-guide", reference: "/preview/template-docs-reference", search: "/preview/template-docs-search", changelog: "/preview/template-docs-changelog" }}
    />
  )
}

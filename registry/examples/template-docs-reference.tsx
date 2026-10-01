import { DocsReference } from "@/components/ballmac/templates/docs/docs-reference"

export default function TemplateDocsReference() {
  return (
    <DocsReference
      hrefs={{ home: "/preview/template-docs-demo", guide: "/preview/template-docs-guide", reference: "/preview/template-docs-reference", search: "/preview/template-docs-search", changelog: "/preview/template-docs-changelog" }}
    />
  )
}

import { DocsHome } from "@/components/ballmac/templates/docs/docs-home"

export default function TemplateDocsDemo() {
  return (
    <DocsHome
      hrefs={{ home: "/preview/template-docs-demo", guide: "/preview/template-docs-guide", reference: "/preview/template-docs-reference", search: "/preview/template-docs-search", changelog: "/preview/template-docs-changelog" }}
    />
  )
}

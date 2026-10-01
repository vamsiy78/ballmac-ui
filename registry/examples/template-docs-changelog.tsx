import { DocsChangelog } from "@/components/ballmac/templates/docs/docs-changelog"

export default function TemplateDocsChangelog() {
  return (
    <DocsChangelog
      hrefs={{ home: "/preview/template-docs-demo", guide: "/preview/template-docs-guide", reference: "/preview/template-docs-reference", search: "/preview/template-docs-search", changelog: "/preview/template-docs-changelog" }}
    />
  )
}

import { RelayDocs } from "@/components/ballmac/templates/relay/relay-docs"

export default function TemplateRelayDocs() {
  return (
    <RelayDocs
      hrefs={{ home: "/preview/template-relay-demo", docs: "/preview/template-relay-docs", pricing: "/preview/template-relay-pricing", status: "/preview/template-relay-status" }}
    />
  )
}

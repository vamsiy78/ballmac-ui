import { RelayHome } from "@/components/ballmac/templates/relay/relay-home"

export default function TemplateRelayDemo() {
  return (
    <RelayHome
      hrefs={{ home: "/preview/template-relay-demo", docs: "/preview/template-relay-docs", pricing: "/preview/template-relay-pricing", status: "/preview/template-relay-status" }}
    />
  )
}

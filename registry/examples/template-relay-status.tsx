import { RelayStatus } from "@/components/ballmac/templates/relay/relay-status"

export default function TemplateRelayStatus() {
  return (
    <RelayStatus
      hrefs={{ home: "/preview/template-relay-demo", docs: "/preview/template-relay-docs", pricing: "/preview/template-relay-pricing", status: "/preview/template-relay-status" }}
    />
  )
}

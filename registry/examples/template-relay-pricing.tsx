import { RelayPricing } from "@/components/ballmac/templates/relay/relay-pricing"

export default function TemplateRelayPricing() {
  return (
    <RelayPricing
      hrefs={{ home: "/preview/template-relay-demo", docs: "/preview/template-relay-docs", pricing: "/preview/template-relay-pricing", status: "/preview/template-relay-status" }}
    />
  )
}

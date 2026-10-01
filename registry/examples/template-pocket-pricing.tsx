import { PocketPricing } from "@/components/ballmac/templates/pocket/pocket-pricing"

export default function TemplatePocketPricing() {
  return (
    <PocketPricing
      hrefs={{ home: "/preview/template-pocket-demo", features: "/preview/template-pocket-features", pricing: "/preview/template-pocket-pricing", security: "/preview/template-pocket-security", download: "/preview/template-pocket-download" }}
    />
  )
}

import { PocketFeatures } from "@/components/ballmac/templates/pocket/pocket-features"

export default function TemplatePocketFeatures() {
  return (
    <PocketFeatures
      hrefs={{ home: "/preview/template-pocket-demo", features: "/preview/template-pocket-features", pricing: "/preview/template-pocket-pricing", security: "/preview/template-pocket-security", download: "/preview/template-pocket-download" }}
    />
  )
}

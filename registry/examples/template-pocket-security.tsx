import { PocketSecurity } from "@/components/ballmac/templates/pocket/pocket-security"

export default function TemplatePocketSecurity() {
  return (
    <PocketSecurity
      hrefs={{ home: "/preview/template-pocket-demo", features: "/preview/template-pocket-features", pricing: "/preview/template-pocket-pricing", security: "/preview/template-pocket-security", download: "/preview/template-pocket-download" }}
    />
  )
}

import { PocketHome } from "@/components/ballmac/templates/pocket/pocket-home"

export default function TemplatePocketDemo() {
  return (
    <PocketHome
      hrefs={{ home: "/preview/template-pocket-demo", features: "/preview/template-pocket-features", pricing: "/preview/template-pocket-pricing", security: "/preview/template-pocket-security", download: "/preview/template-pocket-download" }}
    />
  )
}

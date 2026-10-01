import { PocketDownload } from "@/components/ballmac/templates/pocket/pocket-download"

export default function TemplatePocketDownload() {
  return (
    <PocketDownload
      hrefs={{ home: "/preview/template-pocket-demo", features: "/preview/template-pocket-features", pricing: "/preview/template-pocket-pricing", security: "/preview/template-pocket-security", download: "/preview/template-pocket-download" }}
    />
  )
}

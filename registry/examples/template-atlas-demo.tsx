import { AtlasDashboard } from "@/components/ballmac/templates/atlas/atlas-dashboard"

export default function TemplateAtlasDemo() {
  return (
    <AtlasDashboard
      hrefs={{ dashboard: "/preview/template-atlas-demo", orders: "/preview/template-atlas-orders", order: "/preview/template-atlas-order", products: "/preview/template-atlas-products", customers: "/preview/template-atlas-customers", settings: "/preview/template-atlas-settings" }}
    />
  )
}

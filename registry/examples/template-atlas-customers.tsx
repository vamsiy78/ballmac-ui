import { AtlasCustomers } from "@/components/ballmac/templates/atlas/atlas-customers"

export default function TemplateAtlasCustomers() {
  return (
    <AtlasCustomers
      hrefs={{ dashboard: "/preview/template-atlas-demo", orders: "/preview/template-atlas-orders", order: "/preview/template-atlas-order", products: "/preview/template-atlas-products", customers: "/preview/template-atlas-customers", settings: "/preview/template-atlas-settings" }}
    />
  )
}

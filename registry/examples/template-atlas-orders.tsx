import { AtlasOrders } from "@/components/ballmac/templates/atlas/atlas-orders"

export default function TemplateAtlasOrders() {
  return (
    <AtlasOrders
      hrefs={{ dashboard: "/preview/template-atlas-demo", orders: "/preview/template-atlas-orders", order: "/preview/template-atlas-order", products: "/preview/template-atlas-products", customers: "/preview/template-atlas-customers", settings: "/preview/template-atlas-settings" }}
    />
  )
}

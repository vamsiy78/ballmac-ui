import { AtlasProducts } from "@/components/ballmac/templates/atlas/atlas-products"

export default function TemplateAtlasProducts() {
  return (
    <AtlasProducts
      hrefs={{ dashboard: "/preview/template-atlas-demo", orders: "/preview/template-atlas-orders", order: "/preview/template-atlas-order", products: "/preview/template-atlas-products", customers: "/preview/template-atlas-customers", settings: "/preview/template-atlas-settings" }}
    />
  )
}

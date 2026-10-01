import { NorthwindPricing } from "@/components/ballmac/templates/northwind/northwind-pricing"

export default function TemplateNorthwindPricing() {
  return (
    <NorthwindPricing
      hrefs={{ home: "/preview/template-northwind-demo", pricing: "/preview/template-northwind-pricing", customers: "/preview/template-northwind-customers", about: "/preview/template-northwind-about", contact: "/preview/template-northwind-contact" }}
    />
  )
}

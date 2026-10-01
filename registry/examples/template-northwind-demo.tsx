import { NorthwindHome } from "@/components/ballmac/templates/northwind/northwind-home"

export default function TemplateNorthwindDemo() {
  return (
    <NorthwindHome
      hrefs={{ home: "/preview/template-northwind-demo", pricing: "/preview/template-northwind-pricing", customers: "/preview/template-northwind-customers", about: "/preview/template-northwind-about", contact: "/preview/template-northwind-contact" }}
    />
  )
}

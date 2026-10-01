import { NorthwindCustomers } from "@/components/ballmac/templates/northwind/northwind-customers"

export default function TemplateNorthwindCustomers() {
  return (
    <NorthwindCustomers
      hrefs={{ home: "/preview/template-northwind-demo", pricing: "/preview/template-northwind-pricing", customers: "/preview/template-northwind-customers", about: "/preview/template-northwind-about", contact: "/preview/template-northwind-contact" }}
    />
  )
}

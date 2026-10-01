import { NorthwindContact } from "@/components/ballmac/templates/northwind/northwind-contact"

export default function TemplateNorthwindContact() {
  return (
    <NorthwindContact
      hrefs={{ home: "/preview/template-northwind-demo", pricing: "/preview/template-northwind-pricing", customers: "/preview/template-northwind-customers", about: "/preview/template-northwind-about", contact: "/preview/template-northwind-contact" }}
    />
  )
}

import { NorthwindAbout } from "@/components/ballmac/templates/northwind/northwind-about"

export default function TemplateNorthwindAbout() {
  return (
    <NorthwindAbout
      hrefs={{ home: "/preview/template-northwind-demo", pricing: "/preview/template-northwind-pricing", customers: "/preview/template-northwind-customers", about: "/preview/template-northwind-about", contact: "/preview/template-northwind-contact" }}
    />
  )
}

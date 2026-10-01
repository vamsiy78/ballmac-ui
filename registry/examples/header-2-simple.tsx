import { Header2 } from "@/components/ballmac/blocks/header-2/header-2"

export default function Header2Simple() {
  return (
    <Header2
      sticky={false}
      brand="Northwind"
      items={[
        { label: "Features", href: "#" },
        { label: "Customers", href: "#" },
        { label: "Pricing", href: "#" },
        {
          label: "Learn",
          columns: [
            {
              links: [
                { title: "Blog", href: "#", description: "Product updates and essays." },
                { title: "Guides", href: "#", description: "Step-by-step walkthroughs." },
              ],
            },
          ],
        },
      ]}
      secondaryAction={{ label: "Log in", href: "#" }}
      primaryAction={{ label: "Try free", href: "#" }}
    />
  )
}

import { Footer2 } from "@/components/ballmac/blocks/footer-2/footer-2"

export default function Footer2Long() {
  return (
    <Footer2
      brand="Northwind Labs"
      tagline="Open tools for people who build."
      wordmark="northwind"
      status={null}
      legal="© 2026 Northwind Labs"
      columns={[
        { title: "Projects", links: [{ label: "Atlas", href: "#" }, { label: "Compass", href: "#" }, { label: "Harbor", href: "#" }] },
        { title: "Community", links: [{ label: "Discord", href: "#" }, { label: "Forum", href: "#" }, { label: "Contribute", href: "#" }] },
      ]}
    />
  )
}
